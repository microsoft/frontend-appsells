module.exports = async function (context, req) {
  const config = JSON.parse(process.env.FRONTEND_APPSELLS_CONFIG);

  if (req.query.name || (req.body && req.body.name)) {
    context.res = {
      body: {
        text: `Hello ${(req.query.name || req.body.name)}`,
        config: config
      },
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.IS_DEVELOPMENT ? { 'Access-Control-Allow-Origin': '*' } : {})
      }
    };
  }
  else {
    context.res = {
      status: 400,
      body: "Please pass a name on the query string or in the request body"
    };
  }
};