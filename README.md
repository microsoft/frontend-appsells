[Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct)

# FrontendAppsells



[Please click here to run the demo as it's hosted on Azure Static Web Apps.](https://thankful-grass-03b28b11e.azurestaticapps.net/)



This demo presents symbiosis between "[Ledger Based Authorizations](https://overhide.io/)" and [Azure's Static Web Apps](https://azure.microsoft.com/en-us/services/app-service/static/#overview).

The intent is to enable application developers to add free and for-pay authorization aspects to their single page applications--with a minimal backend integration, no concern for payment-gateways, no database work, hence without taking on responsibility of knowing their customers (GDPR compliant).  We want to free app developers to focus on their features, not managing who is who, yet have a simple ability to make a profit from their creations.

The gist is to take public ledger authorization aspects from blockchains such as Ethereum, and make these concepts work for the majority of Web app customers holding regular US dollar credit cards. We want to enable app developers to charge for add-on features and subscriptions in their apps, without the developers having to stand up complex backends to interface with payment gateways and databases to keep tabs on their users.

This is an open-sourced demo of this "[Ledger Based Authorizations](https://overhide.io/)" concept, leveraging the open-source "[ledgers.js](https://www.npmjs.com/package/ledgers.js)" library, to inspire that solutions with [Azure Static Web Apps](https://azure.microsoft.com/en-us/services/app-service/static/#overview) need not be made available freely without authorizations, or require AAD onboarding and overhead of payment-gateways. They can be simple public for-profit offerings. The intent is to give developers a path-forward on how they can make a profit from their creations.

## This Repo

This project was created following below instructions to quickly create an Azure Static Web App for react:

- https://docs.microsoft.com/en-ca/azure/static-web-apps/getting-started?tabs=react

Prerequisites:

- [GitHub](https://github.com/) account
- [Azure](https://portal.azure.com/) account
- [VSCode](https://code.visualstudio.com/) with [Azure Functions Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions) installed.

It was ammended with demo bits and the [remuneration library](https://github.com/overhide/overhide/blob/master/docs/remuneration-api.md) and [ledgers.js](https://www.npmjs.com/package/ledgers.js) from [overhide](https://overhide.io).

## Using This in Your *Azure Static Web Apps* Projects

Sections of code significant to this demo beyond the template boilerplate.

### Azure Functions

The Azure functions to make this solution work are very simple, they live in the `/api` folder.

In `/api/SharedCode/overhide.js` we have three tiny functions that call the two ledger APIs (`is-signature-valid` and `get-transactions`) from the back-end (Azure functions).  This is all that's needed for the back-end to validate authN and authZ.  The APIs are detailed [here](https://test.ohledger.com/swagger.html) for dollars and [here](https://rinkeby.ethereum.overhide.io/swagger.html) for ethers.

See how this `/api/SharedCode/overhide.js` is used in the *RunFeature* Azure function.  This small utility file is all you need for your projects.

Notice that `/api/package.json` includes a dependency on `node-fetch`.  Copy that into your projects.  No need to worry about it past that--*Azure Static Web Apps* takes care of installing this dependency during deployment.

### UI Login Widget

In `/src/ledgers.js-react-widget` lives the React login widget:

​		![image-20200729232739005](C:\jj\src\frontend-appsells\docs\widget)

To use this widget in your UI:

- add `ledgers.js: 2.1.9` to you `/package.json` React app dependencies, `npm install`

- copy the `/src/ledgers.js-react-widget` folder to your project's components (will make it an [npm](https://www.npmjs.com/) component soon)

- notice that the `/src/ledgers.js-react-widget/LedgersWidget.js` depends on a context named `LedgersWidgetPaymentsInfoContext`; setup this context in your `/src/App.js`

- in your `/src/Appjs` wire in the above widget (important callouts below):

```
...
import { LedgersWidgetPaymentsInfoContext } from './ledgers.js-react-widget/LedgersWidget';
...
class App extends React.Component {
  ...
  this.state = {
    paymentsInfo: {
      updateApplicationStateFn: this.setPaymentsInfo,
      setErrorFn: this.setError
    },
  ...
  setPaymentsInfo = (info) => {
    this.setState({paymentsInfo: {...this.state.paymentsInfo, ...info}});
  }
  ...
  render() {
    ...
    <LedgersWidgetPaymentsInfoContext.Provider value={this.state.paymentsInfo}>
      ...
    </LedgersWidgetPaymentsInfoContext.Provider>
    ...
  }
}
```



- The `LedgersWidgetPaymentsInfoContext` context is React's dependency-injection, it lets the `LedgersWidget.js` provide authN and authZ state/functionality to the feature widgets: `/src/components/FeatureComponent.js`.
- Study use of `paymentInfo` in `/src/components/FeatureComponent.js`
- This `/src/components/FeatureComponent.js` provides feedback to the user regarding authN/authZ state with respect to the available features.  It is where we call into the Azure functions back-end once allowed.
- Notice that the back-end does it's own verification of permissions.  The UI is there to provide payment feedback and allow payments.

## DevOps Appendix

### Azure Deployment

To deploy:

1. follow https://docs.microsoft.com/en-ca/azure/static-web-apps/getting-started?tabs=react to connect your clone of this GitHub repo to your *Azure Static Web Apps* resource for this application
    - this will update the `./.github/workflows` configuration with your connection's *GitHub CI/CD Actions*
1. ensure all changes in this repo are pushed to GitHub
1. ensure *GitHub CI/CD Actions* complete:  (e.g. https://github.com/overhide/FrontendAppsells/actions)
    - once *GitHub CI/CD Actions* complete, your build is automagically deployed

#### Configuration

In your *Static Web App* > *Configuration* create the following key value pairs.

| *Key* | *Value* |
| --- | --- |
| APPINSIGHTS_INSTRUMENTATIONKEY              | see 'Logging in Azure' below               |
| FREE_FEATURE_EXPIRY_MINUTES | 0 |
| FREE_FEATURE_DOLLARS_COST | 0 |
| FREE_FEATURE_DOLLARS_LEDGER_ADDRESS | 0x046c88317b23dc57F6945Bf4140140f73c8FC80F |
| FREE_FEATURE_ETHERS_COST | 0 |
| FREE_FEATURE_ETHERS_LEDGER_ADDRESS | 0x046c88317b23dc57F6945Bf4140140f73c8FC80F |
| PAID_FEATURE_EXPIRY_MINUTES | 0 |
| PAID_FEATURE_DOLLARS_COST | 2 |
| PAID_FEATURE_DOLLARS_LEDGER_ADDRESS | 0x046c88317b23dc57F6945Bf4140140f73c8FC80F |
| PAID_FEATURE_ETHERS_COST | .006 |
| PAID_FEATURE_ETHERS_LEDGER_ADDRESS | 0x046c88317b23dc57F6945Bf4140140f73c8FC80F |
| SUBSCRIPTION_FEATURE_EXPIRY_MINUTES | 2 |
| SUBSCRIPTION_FEATURE_DOLLARS_COST | 3 |
| SUBSCRIPTION_FEATURE_DOLLARS_LEDGER_ADDRESS | 0x046c88317b23dc57F6945Bf4140140f73c8FC80F |
| SUBSCRIPTION_FEATURE_ETHERS_COST | .009 |
| SUBSCRIPTION_FEATURE_ETHERS_LEDGER_ADDRESS | 0x046c88317b23dc57F6945Bf4140140f73c8FC80F |



A screenshot of the configuration when done:

![image-20200729230807451](C:\jj\src\frontend-appsells\docs\functions_config.png)



#### in Azure

1. create an *Application Insights* resource
1. take note of the new *Application Insights* *instrumentation key*
1. create a new *application setting* key-value pair in the *Static Web Apps* > *Configuration*
    - key:  `APPINSIGHTS_INSTRUMENTATIONKEY`
    - value: from above
1. inspect logs in the *Application Insights* > *Logs*, query: `traces | order by timestamp desc `

### Local Development

To run this solution in your local environment:

1. install VSCode and Azure Functions Extention for VSCode
1. in VSCode create a workspace with this repo
1. in a console `npm install` dependencies
1. in VSCode, start the local Azure Functions server by pressing F5
1. in a console start the react server with `npm start`
1. navigate browser to http://localhost:3000

#### Configuration

See `./api/local.settings.json`

#### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.