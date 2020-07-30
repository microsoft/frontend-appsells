var feesSchedule = require('../SharedCode/feesSchedule.js');

module.exports = async function (context, req) {
  context.res = {
    body: {
      schedule: feesSchedule
    },
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.IS_DEVELOPMENT ? { 'Access-Control-Allow-Origin': '*' } : {})
    }
  };
};