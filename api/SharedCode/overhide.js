const fetch = require('node-fetch');

/**
 * Call overhide remuneration API to get transaction tally for determining authority tiers
 * 
 * @param {string} uri - of overhide remuneration provider API
 * @param {string} from - tally transactions from this address 
 * @param {string} to - tally transactions to this address
 * @param {Date} date - 'null' for all-time, or date since when to tally transactions
 * @returns {string} tally in remuneration provider's denomination
 */ 
async function getTally(uri, from, to, date) {
  let since = '';
  if (date) {
    since = `&since=${date.toISOString()}`;
  }

  uri = `${uri}/get-transactions/${from}/${to}?tally-only=true${since}`;
  console.log(`remunaration API >> getTally call (${uri})`);

  return await fetch(uri)
    .then(res => res.json())
    .then(res => {
      console.log('remunaration API >> getTally call OK');
      return res.tally;
    })
    .catch(e => {
      console.log('remunaration API >> getTally call ERROR');
      throw String(e)
    });
}


module.exports = {
  /**
   * Determine if cost is covered withing the number of days on the ledger
   * 
   * @param {string} uri - of overhide remuneration provider API
   * @param {string} from - tally transactions from this address
   * @param {string} to - tally transactions to this address
   * @param {number} cost - in currency of the ledger
   * @param {number} tallyMinutes - if null, all time, else number of minutes since now
   */
  isCostCovered: async (uri, from, to, cost, tallyMinutes) => {
    if (tallyMinutes) {
      let since = new Date();
      since.setMinutes(since.getMinutes() - tallyMinutes);
      var tally = await getTally(uri, from, to, since);
    } else {
      var tally = await getTally(uri, from, to, null);
    }
    var delta = cost - tally;
    return delta <= 0;
  },

  /**
   * Call overhide remuneration API to check validity of signature for address
   * 
   * @param {string} uri - of overhide remuneration provider API
   * @param {string} address - to check
   * @param {string} message - that's signed in signature
   * @param {string} signature - to check for address
   * @returns {boolean}
   */
  isValidOnLedger: async (uri, address, message, signature) => {
    const body = JSON.stringify({
      signature: Buffer.from(signature).toString('base64'),
      message: Buffer.from(message).toString('base64'),
      address: address
    });
    uri = `${uri}/is-signature-valid`

    console.log(`remunaration API >> isValidOnLedger call (uri: ${uri}) (body: ${body})`);

    return await fetch(uri, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: body
    })
    .then((result) => {
      if (result.status == 200) {
        console.log('remunaration API >> isValidOnLedger OK');
        return true;
      } else {
        console.log('remunaration API >> isValidOnLedger NOTOK');
        return false;
      }
    })
    .catch(e => {
      console.log('remunaration API >> isValidOnLedger ERROR');
      throw String(e)
    });
  },
}