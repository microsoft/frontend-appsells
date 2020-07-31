import oh$ from "ledgers.js";
import { makePretendChallenge, delay } from './Utils.js'

// Map of oh$ imparter tags to allowed networks
//
// see https://overhide.github.io/ledgers.js/docs/ledgers.js-rendered-docs/index.html#getimpartertags
const NETWORKS_BY_IMPARTER = {
  'test': {
    'eth-web3': 'rinkeby',
    'ohledger': 'USD:test',
    'ohledger-web3': 'USD:test'
  },
  'prod': {
    'eth-web3': 'main',
    'ohledger': 'USD:prod',
    'ohledger-web3': 'USD:prod'
  }
};

const CENTS_IN_DOLLAR = 100;
const WEI_IN_ETHER = 1000000000000000000;

class PaymentsService {

  /**
   * Payments info object signalled out by this service via `updateApplicationStateFn` passed into constructor.
   * 
   * The format of this object is:
   * 
   * {
   *   updateApplicationStateFn: (info) => {},   // function provided by application to update application state with this object
   *   setErrorFn: (text) => {},                 // function provided by application to feed back errors, clears error with null
   * 
   *   getInfo = () => {}                        // public function: returns an object with currency ('dollars' or 'ethers'), address, message, signature, ledgerUri
   *   isAuthenticated = () => {},               // public function: is current crednetial authenticatd against the current currency's ledger? 
   *   getOutstanding = (amount, to, since) => {}// public function: does current currency ledger have 'amount' or more paid 
   *                                             //                  'to' recepient 'since' (or all if 'since' null)?
   *                                             //                  Differnce in dollars or ethers, $0 if authorized. 
   *                                             //                  Null if not yet known: will update application state.
   *   topUp = async (amount, to) => {}          // public function: top-up payments 'to' recepient on the current currency ledger with 'amount'
   * 
   *   enabled: {},                              // keyed by (currentCurrency || defaultCurrency); informs if currency available, e.g. wallet availble
   *   wallet: {},                               // keyed by (currentCurrency || defaultCurrency); informs of currently used wallet, or null
   *   isOnLedger: {},                           // keyed by (currentCurrency || defaultCurrency); informs if currently used credentials are on ledger
   *   pendingTransaction: {},                   // keyed by (currentCurrency || defaultCurrency); informs amount of currently pending transaction or null
   *   defaultCurrency: `dollars`,               // default payment currency, either 'dollars' or 'ethers'
   *   currentCurrency: null,                    // chosen payment currency, either 'dollars', 'ethers', or null
   *   payerAddress: null,                       // (out only) payer's public address as set by service
   *   payerPrivateKey: null,                    // payer's private key (receipt code) iff not using wallet, null if using wallet
   *   payerSignature: null,                     // signed `messageToSign` by payer
   *   messageToSign: null,                      // message to sign into `payerSignature`
   *   service: this,                            // this service instance, for working with exposed public methods
   * }
   * 
   */
  #paymentsInfo;

  #updateApplicationStateFn;
  #setError;
  #allowNetworkType;

  // @param {(info) => ()} updateApplicationStateFn - function called with updated payments object, see #paymentsInfo comment above.
  // @param {(text) => ()} setErrorFn - fn to set error if any
  // @param {string} defaultCurrency - default currency, one of 'dollars' or 'ethers'
  // @param {bool} allowTestOnly - if only test networks should be allowed
  constructor(updateApplicationStateFn, setErrorFn, defaultCurrency = 'dollars', allowTestOnly = true) {
    if (!updateApplicationStateFn) throw new Error(`No 'updateApplicationStateFn provided.  Ensure your App.js has a 'LedgersWidgetPaymentsInfoContext.Provider' with a state value containing a 'updateApplicationStateFn' function of type (info) => ().`);
    if (!setErrorFn) throw new Error(`No 'setErrorFn provided.  Ensure your App.js has a 'LedgersWidgetPaymentsInfoContext.Provider' with a state value containing a 'setErrorFn' function of type (text) => ().`);

    this.#updateApplicationStateFn = updateApplicationStateFn;
    this.#setError = setErrorFn;

    this.#paymentsInfo = {
      getInfo: this.#getInfo,                   // public function: returns an object with currency ('dollars' or 'ethers'), address, message, signature, ledgerUri
      isAuthenticated: this.#isAuthenticated,       // public function: is current crednetial authenticatd against the current currency's ledger? 
      getOutstanding: this.#getOutstanding,         // public function: does current currency ledger have 'amount' or more paid 
                                                    //                  'to' recepient 'since' (or all if 'since' null)?
                                                    //                  Differnce in dollars or ethers, $0 if authorized.
                                                    //                  Null if not yet known: will update application state.
      topUp: this.#topUp,                           // public function: top-up payments 'to' recepient on the current currency ledger with 'amount'

      enabled: {},                              // keyed by (currentCurrency || defaultCurrency); informs if currency available, e.g. wallet availble
      wallet: {},                               // keyed by (currentCurrency || defaultCurrency); informs of currently used wallet, or null
      isOnLedger: {},                           // keyed by (currentCurrency || defaultCurrency); informs if currently used credentials are on ledger
      pendingTransaction: {},                   // keyed by (currentCurrency || defaultCurrency); informs amount of currently pending transaction or null
      defaultCurrency: defaultCurrency,         // default payment currency, either 'dollars' or 'ethers'
      currentCurrency: null,                    // chosen payment currency, either 'dollars', 'ethers', or null
      payerAddress: null,                       // (out only) payer's public address as set by service
      payerPrivateKey: null,                    // payer's private key (receipt code) iff not using wallet, null if using wallet
      payerSignature: null,                     // signed `messageToSign` by payer
      messageToSign: null,                      // message to sign into `payerSignature`
      service: this,                            // this service instance, for working with exposed public methods
      time: new Date()                          // just a timestamp for refresh
    };

    this.#allowNetworkType = allowTestOnly ? 'test' : 'prod';
    this.#init();
  }

  // Set current currency
  // @param {string} currency - to set (allowed values: 'dollars' or 'ethers')
  setCurrentCurrency = async (currency) => {
    this.#outstandingCache = {}; // reset outstanding cache
    let newInfo = this.#paymentsInfo;
    newInfo.currentCurrency = currency;
    if (!this.#isAuthenticated()) {
      await this.#authenticate(currency);
    }
    this.#updateApplicationStateFn(newInfo);
  }

  // Sets credentials secret key for non-wallet workflow
  // @param {string} new key - to set
  setSecretKey = async (newKey) => {
    try {
      this.#setError(null);
      const currency = this.#getCurrentCurrency();
      const imparter = this.#getImparter();
      if (!this.#paymentsInfo.wallet[currency]) {
        await oh$.setCredentials(imparter, {secret: newKey});
      }
    } catch (error) {
      this.#setError(`Paste or generate a key.`);
    }
  }

  // Generates new PKI keys for non-wallet workflows.
  // Updates paymentsInfo provided by service.
  // No-op if current currency has a wallet set.
  generateNewKeys = async () => {
    try {
      const currency = this.#getCurrentCurrency();
      const imparter = this.#getImparter();
      if (!this.#paymentsInfo.wallet[currency]) {
        await oh$.generateCredentials(imparter,null);
      }
    } catch (error) {
      this.#setError(`${typeof error === 'object' && 'message' in error ? error.message : error}`);
    }
  }

  #getInfo = () => {
    return {
      currency: this.#getCurrentCurrency(),
      address: this.#paymentsInfo.payerAddress,
      message: this.#paymentsInfo.messageToSign,
      signature: this.#paymentsInfo.payerSignature,
      ledgerUri: oh$.getOverhideRemunerationAPIUri()
    };
  }

  // @returns {string} 'dollars' or 'ethers'.
  #getCurrentCurrency = () => {
    return this.#paymentsInfo.currentCurrency || this.#paymentsInfo.defaultCurrency;
  }

  // Is current crednetial authenticatd against the current currency's ledger? 
  // @returns {bool} after checking signature and whether ledger has any transactions (to anyone)
  #isAuthenticated = () => {
    const currency = this.#getCurrentCurrency();
    return this.#paymentsInfo.isOnLedger[currency];
  }

  #authenticate = async (currency) => {
    if (currency !== this.#getCurrentCurrency()) return;
    this.#outstandingCache = {}; // reset outstanding cache
    if ((!this.#paymentsInfo.payerSignature 
         || !this.#paymentsInfo.messageToSign)) {
      await this.#sign();
    }
    await this.#isOnLedger()
  }

  // cache of outstanding results
  #outstandingCache = {};

  // Get balance outstanding for authorization as per current currency.
  // @param {number} cost - amount expected to tally (in dollars or ethers)
  // @param {string} to - address of recepient
  // @param {number} minutes - number of minutes to look back (since) on the ledger
  // @returns {number} differnce in dollars or ethers, $0 if authorized, null if not yet known.
  #getOutstanding = (cost, to, tallyMinutes) => {
    const currency = this.#getCurrentCurrency();
    const key = `${currency}_${cost}_${to}_${tallyMinutes}`;
    console.log(`#getOutstanding(${key}) = ${this.#outstandingCache[key]}`);
    if (key in this.#outstandingCache) {
      return this.#outstandingCache[key];
    }
    this.#outstandingCache[key] = null; // for re-requests
    (async () => {
      try {
        const imparter = this.#getImparter();
        let tally;
        const creds = await oh$.getCredentials(imparter);
        if (!creds || !creds.address) {
          this.#outstandingCache[key] = cost;
          this.#pingApplicationState();
          return;
        };
        if (tallyMinutes) {
          let since = new Date();
          since.setMinutes(since.getMinutes() - tallyMinutes);
          tally = await oh$.getTally(imparter, { address: to }, since);
        } else {
          tally = await oh$.getTally(imparter, { address: to }, null);
        }
        switch (currency) {
          case 'dollars':
            cost = cost * CENTS_IN_DOLLAR; // need cents
            break;
          case 'ethers':
            cost = cost * WEI_IN_ETHER; // need wei
            break;
          default:
        }      
        var delta = cost - tally;
        delta = delta < 0 ? 0 : delta;
        switch (currency) {
          case 'dollars':
            this.#outstandingCache[key] = delta / CENTS_IN_DOLLAR; // need dollars
            this.#pingApplicationState();
            return;
          case 'ethers':
            this.#outstandingCache[key] = delta / WEI_IN_ETHER; // need cents
            this.#pingApplicationState();
            return;
          default:
        }      
      } catch (error) {
        this.#setError(`${typeof error === 'object' && 'message' in error ? error.message : error}`);
      }  
    })();
    return null;
  }

  // Do the actual topup to authorize
  // @param {number} amount - amount to topup (in dollars or ethers), can be 0 to just create a free transaction for getting on ledger
  // @param {} toAddress - to pay
  #topUp = async (amount, toAddress) => {
    const currency = this.#getCurrentCurrency();
    const wallet = this.#paymentsInfo.wallet[currency];
    const imparter = this.#getImparter();
    switch (currency) {
      case 'dollars':
        amount = amount * CENTS_IN_DOLLAR; // need cents
        if (!wallet) {
          await oh$.setCredentials(imparter, {secret: this.#paymentsInfo.payerPrivateKey});
        }
        break;
      case 'ethers':
        amount = amount * WEI_IN_ETHER; // need wei
        break;
      default:
    }
    try {
      this.#paymentsInfo.pendingTransaction[currency] = amount;
      let aDayAgo = new Date((new Date()).getTime() - 24*60*60*1000);     // we compare tallies...
      let before = await oh$.getTally(imparter, {address: toAddress}, aDayAgo);  // ... by taking a sample before
      let options = this.#paymentsInfo.payerSignature && this.#paymentsInfo.messageToSign && {
          message: this.#paymentsInfo.messageToSign, 
          signature: this.#paymentsInfo.payerSignature
        };
      await oh$.createTransaction(imparter, amount, toAddress, options);
      if (amount > 0) {
        for (var i = 0; i < 12; i++) {
          let now = await oh$.getTally(imparter, { address: toAddress }, aDayAgo); // ... we take a sample now
          if (now > before) break;                                          // ... and exit out as soon as decentralized
                                                                            //     ledger is consistent between the wallet's
                                                                            //     node and ledgers.js node
          await delay(5000);                                                // ... else wait 5 seconds
        }  
      }
      this.#paymentsInfo.pendingTransaction[currency] = null;
      this.#paymentsInfo.isOnLedger[currency] = true;      
      this.#outstandingCache = {}; // reset outstanding cache
      this.#pingApplicationState();
    } catch (error) {
      this.#paymentsInfo.pendingTransaction[currency] = null;
      this.#setError(`${typeof error === 'object' && 'message' in error ? error.message : error}`);
    }
  }

  // Trigger redraw via application state update
  #pingApplicationState = () => {
    let newInfo = this.#paymentsInfo;
    newInfo.time = new Date();
    this.#updateApplicationStateFn(newInfo);
  }
  
  // Check current credentials for any transactions on current ledger.
  #isOnLedger = async () => {
    try {
      const currency = this.#getCurrentCurrency();
      const imparter = this.#getImparter();
      this.#paymentsInfo.isOnLedger[currency] = false;
      if (await oh$.isOnLedger(imparter)) {
        this.#paymentsInfo.isOnLedger[currency] = true;
      }
    } catch (error) {
      this.#setError(`${typeof error === 'object' && 'message' in error ? error.message : error}`);
    }
  }

  // Sign a challenge with current credentials and set to the payments info.
  #sign = async () => {
    try {
      const challenge = makePretendChallenge();
      const imparter = this.#getImparter();
      var signature = await oh$.sign(imparter, challenge);
      this.#setSignature(challenge, signature);
    } catch (error) {
      this.#setSignature(null, null);
      this.#setError(`${typeof error === 'object' && 'message' in error ? error.message : error}`);
    }
  }

  // Get imparter based on currently tracked info
  #getImparter = () => {
    const currency = this.#getCurrentCurrency();
    const wallet = this.#paymentsInfo.wallet[currency];
    switch (currency) {
      case 'dollars':
        return wallet ? 'ohledger-web3' : 'ohledger';
      case 'ethers':
        return 'eth-web3';
      default:
    }
  }

  // Set currency enabled status
  // @param {string} currency - to set 
  // @para {bool} value - to set
  #setCurrencyEnabled = (currency, value) => {
    let newInfo = this.#paymentsInfo;
    newInfo.enabled[currency] = value;
    this.#updateApplicationStateFn(newInfo);
  }

  // Set signature
  // @param {string} currency - to set 
  // @param {string} walletKey - or null
  #setWallet = (currency, walletKey) => {
    let newInfo = this.#paymentsInfo;
    newInfo.wallet[currency] = walletKey;
    this.#updateApplicationStateFn(newInfo);
  }

  // Set signature
  // @param {string} messageToSign - message to sign
  // @param {string} payerSignature - signed message
  #setSignature = (messageToSign, payerSignature) => {
    let newInfo = this.#paymentsInfo;
    newInfo.messageToSign = messageToSign;
    newInfo.payerSignature = payerSignature;
    this.#updateApplicationStateFn(newInfo);
  }

  // Set credentials
  // @param {} currency - setting credentials for
  // @param {} payerAddress - (out only) payer's public address as set by service
  // @param {} payerPrivateKey - payer's private key (receipt code) iff not using wallet, null if using wallet
  #setCredentials = async (currency, payerAddress, payerPrivateKey) => {
    let newInfo = this.#paymentsInfo;
    newInfo.payerAddress = payerAddress;
    newInfo.payerPrivateKey = payerPrivateKey;
    newInfo.messageToSign = null;
    newInfo.payerSignature = null;    
    await this.#authenticate(currency);
    this.#updateApplicationStateFn(newInfo);
  }

  // Clear credentials and wallet if problem
  #clear = (currency) => {
    let newInfo = this.#paymentsInfo;
    newInfo.enabled[currency] = false;
    newInfo.wallet[currency] = null;
    newInfo.payerAddress = null;
    newInfo.payerPrivateKey = null;
    newInfo.messageToSign = null;
    newInfo.payerSignature = null;    
    this.#updateApplicationStateFn(newInfo);
  }

  // Initialize oh$ listeners.
  #init = () => {

    // Determine if ethers should be enabled based on uri from wallet (versus admin)
    // Ethers only enabled if wallet, so do everything in 'onWalletChange'
    oh$.addEventListener('onWalletChange', async (e) => {
      const network = await oh$.getNetwork(e.imparterTag);
      const credentials = await oh$.getCredentials(e.imparterTag);
      switch (e.imparterTag) {
        case 'eth-web3':
          if (e.isPresent) {
            if (NETWORKS_BY_IMPARTER[this.#allowNetworkType][e.imparterTag] === network.name) {
              this.#setCurrencyEnabled('ethers', true);
              this.#setWallet('ethers', e.isPresent ? 'web3' : null);
              await this.#setCredentials('ethers', credentials.address, null);
            } else {
              // wrong network
              this.#clear('ethers');
              this.#setError(`Network misconfiguration: (expected:${NETWORKS_BY_IMPARTER[this.#allowNetworkType][e.imparterTag]}) (seen:${network.name})`);
              return;
            }
          } else {
            // no wallet no ether payments
            this.#clear('ethers');
          }
          // dollars always available, ethers enabled when network detected below  
          break;
        case 'ohledger-web3':
          this.#setWallet('dollars', e.isPresent ? 'web3' : null);
          await this.#setCredentials('dollars', credentials.address, null);
          console.log(`overhide-ledger wallet set for network ${network.currency}:${network.mode}`); // no network misconfigs for ohledger as explicitly set
          break;
        default:
      }
    });

    // Determine if dollars should be enabled.  Since we enable dollars test network at end below, we know this will trigger..
    // No wallet for dollars in this example.
    oh$.addEventListener('onNetworkChange', async (e) => {
      switch (e.imparterTag) {
        case 'eth-web3':
          if (e && e.name && NETWORKS_BY_IMPARTER[this.#allowNetworkType][e.imparterTag] !== e.name) {
            // wrong network
            this.#clear('ethers');
            this.#setError(`Network misconfiguration: (expected:${NETWORKS_BY_IMPARTER[this.#allowNetworkType][e.imparterTag]}) (seen:${e.name})`);
            return;
          }
          break;
        case 'ohledger':
        case 'ohledger-web3':
          if ('currency' in e
              && 'mode' in e
              && `${e.currency}:${e.mode}` === NETWORKS_BY_IMPARTER[this.#allowNetworkType][e.imparterTag]) {
            this.#setCurrencyEnabled('dollars', true);
            break;
          }
          // wrong network
          this.#clear('dollars');
          this.#setError(`overhide-ledger network misconfig: (expected:${NETWORKS_BY_IMPARTER[this.#allowNetworkType][e.imparterTag]}) (seen: ${e.currency}:${e.mode})`);
          return;
        default:
      }
    });

    // Update current payer
    oh$.addEventListener('onCredentialsUpdate', async (e) => {
      // don't update if wallet not set/unset:  perhaps network error above.
      if (e.imparterTag === 'eth-web3' && !this.#paymentsInfo.wallet['ethers']) return;
      if (e.imparterTag === 'ohledger-web3' && !this.#paymentsInfo.wallet['dollars']) return;      

      await this.#setCredentials(e.imparterTag === 'eth-web3' ? 'ethers' : 'dollars', e.address, 'secret' in e ? e.secret : null);
    });

    oh$.addEventListener('onWalletChange', async (e) => {
      this.#outstandingCache = {};
      this.#pingApplicationState();
    });

    oh$.setNetwork('ohledger', { currency: 'USD', mode: this.#allowNetworkType ? 'test' : 'prod' }); 
    oh$.setNetwork('ohledger-web3', { currency: 'USD', mode: this.#allowNetworkType ? 'test' : 'prod' });
  }
}

export default PaymentsService;