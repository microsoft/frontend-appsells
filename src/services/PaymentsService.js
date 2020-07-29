import oh$ from "ledgers.js";
import React from "react";
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

// Expose a context as a convenience.
export const PaymentsContext = React.createContext();

class PaymentsService {

  /**
   * Payments info object signalled out by this service via `setPaymentsFn` passed into constructor.
   * 
   * The format of this object is:
   * 
   * {
   *   enabled: {},                              // keyed by (currentCurrency || defaultCurrency); informs if currency available, e.g. wallet availble
   *   wallet: {},                               // keyed by (currentCurrency || defaultCurrency); informs of currently used wallet, or null
   *   defaultCurrency: `dollars`,               // default payment currency, either 'dollars' or 'ethers'
   *   currentCurrency: null,                    // chosen payment currency, either 'dollars', 'ethers', or null
   *   payerAddress: null,                       // (out only) payer's public address as set by service
   *   payerPrivateKey: null,                    // payer's private key (receipt code) iff not using wallet, null if using wallet
   *   payerSignature: null,                     // signed `messageToSign` by payer
   *   messageToSign: null,                      // message to sign into `payerSignature`
   *   service: this,                            // this service instance, for working with exposed public methods
   * }
   */
  #paymentsInfo;

  #setPaymentsFn;
  #setError;
  #allowNetworkType;

  // @param {(info) => ()} setPaymentsFn - function called with updated payments object, see #paymentsInfo comment above.
  // @param {(text) => ()} setError - fn to set error if any
  // @param {string} defaultCurrency - default currency, one of 'dollars' or 'ethers'
  // @param {bool} allowTestOnly - if only test networks should be allowed
  constructor(setPaymentsFn, setError, defaultCurrency = 'dollars', allowTestOnly = true) {
    this.#setPaymentsFn = setPaymentsFn;
    this.#setError = setError;

    this.#paymentsInfo = {
      enabled: {},                              // keyed by (currentCurrency || defaultCurrency); informs if currency available, e.g. wallet availble
      wallet: {},                               // keyed by (currentCurrency || defaultCurrency); informs of currently used wallet, or null
      defaultCurrency: defaultCurrency,         // default payment currency, either 'dollars' or 'ethers'
      currentCurrency: null,                    // chosen payment currency, either 'dollars', 'ethers', or null
      payerAddress: null,                       // (out only) payer's public address as set by service
      payerPrivateKey: null,                    // payer's private key (receipt code) iff not using wallet, null if using wallet
      payerSignature: null,                     // signed `messageToSign` by payer
      messageToSign: null,                      // message to sign into `payerSignature`
      service: this,                            // this service instance, for working with exposed public methods
    };

    this.#allowNetworkType = allowTestOnly ? 'test' : 'prod';
    this.#init();
  }

  // Set current currency
  // @param {string} currency - to set (allowed values: 'dollars' or 'ethers')
  setCurrentCurrency = (currency) => {
    let newInfo = this.#paymentsInfo;
    newInfo.currentCurrency = currency;
    this.#setPaymentsFn(newInfo);
  }

  // Sets credentials secret key for non-wallet workflow
  // @param {string} new key - to set
  setSecretKey = async (newKey) => {
    try {
      this.#setError(null);
      const currency = this.#paymentsInfo.currentCurrency || this.#paymentsInfo.defaultCurrency;
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
      const currency = this.#paymentsInfo.currentCurrency || this.#paymentsInfo.defaultCurrency;
      const imparter = this.#getImparter();
      if (!this.#paymentsInfo.wallet[currency]) {
        await await oh$.generateCredentials(imparter,null);
      }
    } catch (error) {
      this.#setError(`${error}`);
    }
  }

  // Authenticate current credentials by checking for any transactions on current ledger.
  // @returns {bool} `true` if authenticated
  isOnLedger = async () => {
    try {
      const imparter = this.#getImparter();
      return await oh$.isOnLedger(imparter);
    } catch (error) {
      this.#setError(`${error}`);
    }
  }

  // Sign a challenge with current credentials and set to the payments info.
  sign = async () => {
    try {
      const challenge = makePretendChallenge();
      const imparter = this.#getImparter();
      var signature = await oh$.sign(imparter, challenge);
      this.#setSignature(challenge, signature);
    } catch (error) {
      this.#setError(`${error}`);
    }
  }

  // Get balance outstanding for authorization as per current currency.
  // @param {number} cost - amount expected to tally (in dollars or ethers)
  // @param {number} minutes - number of minutes to look back (since) on the ledger
  // @returns {number} balance in dollars or ethers
  getBalanceDue = async (cost, tallyMinutes) => {
    try {
      const currency = this.#paymentsInfo.currentCurrency || this.#paymentsInfo.defaultCurrency;
      const imparter = this.#getImparter();
      let tally;
      if (tallyMinutes) {
        let since = new Date();
        since.setMinutes(since.getMinutes() - tallyMinutes);
        tally = await oh$.getTally(imparter, { address: this.#paymentsInfo.payerAddress }, since);
      } else {
        tally = await oh$.getTally(imparter, { address: this.#paymentsInfo.payerAddress }, null);
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
          return delta / CENTS_IN_DOLLAR; // need dollars
        case 'ethers':
          return delta / WEI_IN_ETHER; // need cents
        default:
      }      
    } catch (error) {
      this.#setError(`${error}`);
    }
  }

  // Do the actual topup to authorize
  // @param {number} amount - amount to topup (in dollars or ethers), can be 0 to just create a free transaction for getting on ledger
  // @param {} toAddress - to pay
  topUp = async (amount, toAddress) => {
    const currency = this.#paymentsInfo.currentCurrency || this.#paymentsInfo.defaultCurrency;
    const wallet = this.#paymentsInfo.wallet[currency];
    const imparter = this.#getImparter();
    switch (currency) {
      case 'dollars':
        amount = amount * CENTS_IN_DOLLAR; // need cents
        if (!wallet) {
          await oh$.setCredentials(imparter, {secret: this.props.privateKey});
        }
        break;
      case 'ethers':
        amount = amount * WEI_IN_ETHER; // need wei
        break;
      default:
    }
    try {
      let aDayAgo = new Date((new Date()).getTime() - 24*60*60*1000);     // we compare tallies...
      let before = await oh$.getTally(imparter, {address: toAddress}, aDayAgo);  // ... by taking a sample before
      await oh$.createTransaction(imparter, amount, toAddress);
      this.props.doHint('topupWalletConsistent');
      if (this.state.chosenCurrency === 'dollars') this.props.shouldVisaHintShow(false);
      for (var i = 0; i < 12; i++) {
        let now = await oh$.getTally(imparter, { address: toAddress }, aDayAgo); // ... we take a sample now
        if (now > before) break;                                          // ... and exit out as soon as decentralized
                                                                          //     ledger is consistent between the wallet's
                                                                          //     node and ledgers.js node
        await delay(5000);                                                // ... else wait 5 seconds
      }
    } catch (error) {
      this.#setError(`${error}`);
      if (this.chosenCurrency === 'dollars') this.props.shouldVisaHintShow(false);
    }
  }

  // Get imparter based on currently tracked info
  #getImparter = () => {
    const currency = this.#paymentsInfo.currentCurrency || this.#paymentsInfo.defaultCurrency;
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
    this.#setPaymentsFn(newInfo);
  }

  // Set signature
  // @param {string} currency - to set 
  // @param {string} walletKey - or null
  #setWallet = (currency, walletKey) => {
    let newInfo = this.#paymentsInfo;
    newInfo.wallet[currency] = walletKey;
    this.#setPaymentsFn(newInfo);
  }

  // Set signature
  // @param {string} messageToSign - message to sign
  // @param {string} payerSignature - signed message
  #setSignature = (messageToSign, payerSignature) => {
    let newInfo = this.#paymentsInfo;
    newInfo.messageToSign = messageToSign;
    newInfo.payerSignature = payerSignature;
    this.#setPaymentsFn(newInfo);
  }

  // Set credentials
  // @param {} payerAddress - (out only) payer's public address as set by service
  // @param {} payerPrivateKey - payer's private key (receipt code) iff not using wallet, null if using wallet
  #setCredentials = (payerAddress, payerPrivateKey) => {
    let newInfo = this.#paymentsInfo;
    newInfo.payerAddress = payerAddress;
    newInfo.payerPrivateKey = payerPrivateKey;
    newInfo.messageToSign = null;
    newInfo.payerSignature = null;
    this.#setPaymentsFn(newInfo);
  }

  // Initialize oh$ listeners.
  #init = () => {

    // Determine if ethers should be enabled based on uri from wallet (versus admin)
    // Ethers only enabled if wallet, so do everything in 'onWalletChange'
    oh$.addEventListener('onWalletChange', async (e) => {
      const currentCurrency = this.#paymentsInfo.currentCurrency;
      switch (e.imparterTag) {
        case 'eth-web3':
          if (e.isPresent) {
            this.#setCurrencyEnabled('ethers', true);
          } else {
            // no wallet no ether payments
            this.#setCurrencyEnabled('ethers', false);
            this.setCurrentCurrency(currentCurrency === 'ethers' ? null : currentCurrency);
          }
          // dollars always available, ethers enabled when network detected below  
          this.#setWallet('ethers', e.isPresent ? 'web3' : null);
          break;
        case 'ohledger-web3':
          this.#setWallet('dollars', e.isPresent ? 'web3' : null);
          break;
        default:
      }
    });

    // Determine if dollars should be enabled.  Since we enable dollars test network at end below, we know this will trigger..
    // No wallet for dollars in this example.
    oh$.addEventListener('onNetworkChange', async (e) => {
      const currentCurrency = this.#paymentsInfo.currentCurrency;
      switch (e.imparterTag) {
        case 'eth-web3':
          if (e && e.name && NETWORKS_BY_IMPARTER[this.#allowNetworkType][e.imparterTag] !== e.name) {
            // wrong network
            this.#setCurrencyEnabled('ethers', false);
            this.setCurrentCurrency(currentCurrency === 'ethers' ? null : currentCurrency);
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
          this.#setCurrencyEnabled('dollars', false);
          this.#setError(`overhide-ledger network misconfig: (expected:${NETWORKS_BY_IMPARTER[this.#allowNetworkType][e.imparterTag]}) (seen: ${e.currency}:${e.mode})`);
          return;
        default:
      }
    });

    // Update current payer
    oh$.addEventListener('onCredentialsUpdate', async (e) => {
      this.#setCredentials(e.address, 'secret' in e ? e.secret : null);
    });

    oh$.setNetwork('ohledger', { currency: 'USD', mode: this.#allowNetworkType ? 'test' : 'prod' }); 
    oh$.setNetwork('ohledger-web3', { currency: 'USD', mode: this.#allowNetworkType ? 'test' : 'prod' });
  }
}

export default PaymentsService;