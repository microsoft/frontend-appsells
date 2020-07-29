module.exports = async function (context, req) {
  context.res = {
    body: {
      schedule: {
        'free': {
          'expiryMinutes': process.env.FREE_FEATURE_EXPIRY_MINUTES,
          'dollars': {
            'cost': process.env.FREE_FEATURE_DOLLARS_COST,
            'address': process.env.FREE_FEATURE_DOLLARS_LEDGER_ADDRESS
          },
          'ethers': {
            'cost': process.env.FREE_FEATURE_ETHERS_COST,
            'address': process.env.FREE_FEATURE_ETHERS_LEDGER_ADDRESS
          }
        },
        'paid': {
          'expiryMinutes': process.env.PAID_FEATURE_EXPIRY_MINUTES,
          'dollars': {
            'cost': process.env.PAID_FEATURE_DOLLARS_COST,    
            'address': process.env.PAID_FEATURE_DOLLARS_LEDGER_ADDRESS
          },
          'ethers': {
            'cost': process.env.PAID_FEATURE_ETHERS_COST,    
            'address': process.env.PAID_FEATURE_ETHERS_LEDGER_ADDRESS
          }
        },
        'subscription': {
          'expiryMinutes': process.env.SUBSCRIPTION_FEATURE_EXPIRY_MINUTES,
          'dollars': {
            'cost': process.env.SUBSCRIPTION_FEATURE_DOLLARS_COST,
            'address': process.env.SUBSCRIPTION_FEATURE_DOLLARS_LEDGER_ADDRESS   
          },
          'ethers': {
            'cost': process.env.SUBSCRIPTION_FEATURE_ETHERS_COST,
            'address': process.env.SUBSCRIPTION_FEATURE_ETHERS_LEDGER_ADDRESS  
          }
        }
      }
    },
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.IS_DEVELOPMENT ? { 'Access-Control-Allow-Origin': '*' } : {})
    }
  };
};