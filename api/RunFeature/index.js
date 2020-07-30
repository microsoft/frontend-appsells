var feesSchedule = require('../SharedCode/feesSchedule.js');
var overhide = require('../SharedCode/overhide.js');

const MULTIPLIER = {
  'dollars': 100,
  'ethers': 1000000000000000000
}

module.exports = async function (context, req) {

  let featureUsed = false;

  const featureName = req.query.featureName;
  const currency = req.query.currency;
  const address = req.query.address;
  const message = Buffer.from(req.query.message, 'base64').toString();
  const signature = req.query.signature;
  const to = feesSchedule[featureName][currency].address;
  const cost = +feesSchedule[featureName][currency].cost * MULTIPLIER[currency];
  const expiryMinutes = +feesSchedule[featureName].expiryMinutes || null;

  const uri = currency === 'ethers' ? 'https://rinkeby.ethereum.overhide.io' : 'https://test.ohledger.com/v1'

  try {
    if (await overhide.isValidOnLedger(uri, address, message, signature)
        && (cost === 0 
          || await overhide.isCostCovered(uri, address, to, cost, expiryMinutes))) {
      featureUsed = true;
    }
  } catch (e) {
    console.log(e);
  }

  if (featureUsed) {
    context.res = {
      body: {
        featureUsed: true
      },
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.IS_DEVELOPMENT ? { 'Access-Control-Allow-Origin': '*' } : {})
      }
    };
  }
  else {
    context.res = {
      status: 401,
      body: "Unauthorized by Ledger-Based AuthZ"
    };
  }
};