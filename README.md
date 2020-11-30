[Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct)

# FrontendAppsells

![comic](https://github.com/microsoft/frontend-appsells/blob/main/docs/comic.png?raw=true)

## Demo

[Please click here to run the demo as it's hosted on Azure Static Web Apps.](https://thankful-grass-03b28b11e.azurestaticapps.net/)

## Introduction

This demo presents symbiosis between "[Ledger Based Authorizations](https://overhide.io/)" and [Azure's Static Web Apps](https://azure.microsoft.com/en-us/services/app-service/static/#overview).

The intent is to enable application developers to add free and for-pay authorization aspects to their single page applications--with a minimal backend integration, no concern for payment-gateways, no database work, hence without taking on responsibility of knowing their customers (GDPR compliant).  We want to free app developers to focus on their features, not managing who is who, yet have a simple ability to make a profit from their creations.

The gist is to take public ledger authorization aspects from blockchains such as Ethereum, and make these concepts work for the majority of Web app customers holding regular US dollar credit cards. We want to enable app developers to charge for add-on features and subscriptions in their apps, without the developers having to stand up complex backends to interface with payment gateways and databases to keep tabs on their users.

This is an open-sourced demo of this "[Ledger Based Authorizations](https://overhide.io/)" concept, leveraging the open-source "[ledgers.js](https://www.npmjs.com/package/ledgers.js)" library, to inspire that solutions with [Azure Static Web Apps](https://azure.microsoft.com/en-us/services/app-service/static/#overview) need not be made available freely without authorizations, or require AAD onboarding and overhead of payment-gateways. They can be simple public for-profit offerings. The intent is to give developers a path-forward on how they can make a profit from their creations.

If you consider [a standard scalable e-commerce setup](https://docs.microsoft.com/en-us/azure/architecture/solution-ideas/articles/scalable-ecommerce-web-app), it suggests that Web app developers integrate with third-party payment-gateways themselves.  Here, we're offering a simple path forward without that burden.  Not requisite--but a nice side benefit--it's a path forward that future proofs for payments with cryptos.  Consider the green annotations below, applied on top of the standard model:

![diagram](https://github.com/microsoft/frontend-appsells/blob/main/docs/arch.png?raw=true)

Some terms:

- ledger -- public table of payments between anonymized entities
- authN -- authentication (I am who I say I am)
- authZ -- authorization (I am allowed to do as much as I can prove I paid for)
- SPA -- Single Page Application; thick client Web application in the browser

## This Repo

This project was created following below instructions to quickly create an Azure Static Web App for react:

- [Azure Static Web Apps getting-started guide](https://docs.microsoft.com/en-ca/azure/static-web-apps/getting-started?tabs=react)

Prerequisites:

- [GitHub](https://github.com/) account
- [Azure](https://portal.azure.com/) account
- [VSCode](https://code.visualstudio.com/) with [Azure Functions Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions) installed.

It was amended with demo bits and the [remuneration library](https://overhide.io/2020/09/06/remuneration-api.html) and [ledgers.js](https://www.npmjs.com/package/ledgers.js) from [overhide](https://overhide.io).

## Overview

In this demo we have a React frontend and two Azure functions for the backend.  The code we wrote in our app is under the "our demo code" label below:

![diagram](https://github.com/microsoft/frontend-appsells/blob/main/docs/diagram.png?raw=true)

See next section for more code details.

The *ledgers.js-react-widget* (React widget) provides login visuals to our users (in the browser) and updates the rest of our application as to whether the user authenticated and paid up for feature access.

The widget interacts with other visual components representing features in our app via a React context (*LedgersWidgetPaymentsInfoContext*, not shown).  This context provides payment information.  These other components, represented by *FeatureComponent* in our demo, are various paid add-ons and subscriptions.  Since these are features that require authentication and payment, they interact with the *ledgers.js-react-widget* (via this injected context) for additional payments.  

As these (*FeatureComponent*) features are used they call into our Azure functions backend to do feature specific business work.  In addition to feature related parameters,  the frontend provides the backend with information proving the user is authenticated (signature) and which ledger they authorized against (paid up).  The Azure functions backend validates the provided signature and validates authorizations before performing feature work.  The backend does the validations with [two simple REST APIs](https://overhide.io/2020/09/06/remuneration-api.html).  

> This demo is rudimentary; the backend should really be extended to return a token for reuse on subsequent calls.

### What We Accomplished as Application Developers

- we will get paid for our efforts
- we just plopped a simple widget into our frontend to give us a login + payments
- we spent very little effort on the backend to accomplish same
- this nimbleness and small footprint is very much in-line with the [Azure Static Web Apps](https://azure.microsoft.com/en-us/services/app-service/static/) offering
- we didn't stand up a database for tracking our users (GDPR)
- the ledgers used are anonymous public ledgers, separating us as developers from being responsible for user's payment data
- if we choose to store feature data, it flows naturally that it can be kept anonymized in our feature data stores
- we use crypto concepts but allow our users to pay with credit cards in US dollars
- since we use crypto concepts, our application is crypto ready:  we also allow payments with ethers
- this is completely secure in an introspectable user-agent such as a Web browser:  no API keys, nothing to decompile

## Using This in Your *Azure Static Web Apps* Projects

The basic steps to use what you see here in your projects:

- read through and follow the [Azure Static Web Apps getting-started guide](https://docs.microsoft.com/en-ca/azure/static-web-apps/getting-started?tabs=react); after you should have:
  - Web application scaffolded from a template
  - [GitHub](https://github.com/) account
  - [Azure](https://portal.azure.com/) account
- if you followed the above, you have your React (or other) app in [GitHub](https://github.com/) and you're ready to instrument for payments
- if you want to get paid in Ethers, ensure to onboard onto Ethereum
  - onboarding just means getting an Ethereum public/private key pair
- if you want to get paid in US dollars, ensure to onboard on [overhide-ledger](https://overhide.io/):
  - [test ledger onboarding](https://test.ohledger.com/onboard)
  - [production ledger onboarding](https://ohledger.com/onboard)
- configure your new application with your onboarded public addresses (both Ethereum and overhide)
  - see all the `*_FEATURE_*_LEDGER_ADDRESS` Azure function configuration points in the [Configuration](#configuration) section below
  - see the `/api/local.settings.json` file for local (F5 run) settings of same
- use the `/api/SharedCode/overhide.js` backend library in your Azure functions, see the [Azure Functions](#azure-functions) section below
- use the `/src/ledgers.js-react-widget` widget in your frontend, see the [UI Login Widget](#ui-login-widget) section below
- ask for help on [r/overhide](https://www.reddit.com/r/overhide/)



Next we dive a bit deeper into sections of code significant to this demo from a payments perspective.

### Azure Functions

The Azure functions to make this solution work are very simple, they live in the `/api` folder.

In `/api/SharedCode/overhide.js` we have three tiny functions that call the [two ledger APIs](https://overhide.io/2020/09/06/remuneration-api.html) (`is-signature-valid` and `get-transactions`) from the back-end (Azure functions).  This is all that's needed for the back-end to validate authN and authZ.  The APIs are detailed [here](https://test.ohledger.com/swagger.html) for dollars and [here](https://rinkeby.ethereum.overhide.io/swagger.html) for ethers.

See how this `/api/SharedCode/overhide.js` is used in the *RunFeature* Azure function.  This small utility file is all you need for your projects.

Notice that `/api/package.json` includes a dependency on `node-fetch`.  Copy that into your projects.  No need to worry about it past that--*Azure Static Web Apps* takes care of installing this dependency during deployment.

### UI Login Widget

In `/src/ledgers.js-react-widget` lives the React login widget:

​		![widget](https://github.com/microsoft/frontend-appsells/blob/main/docs/widget.png?raw=true)

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

Most of the configuration is a fees schedule including ledger addresses of the recipient (developer of the app).

Note, `0x046c88317b23dc57F6945Bf4140140f73c8FC80F` is one of my public addresses on both the Ethereum blockchain and in the overhide-ledger:  here I configured the same address for all features.  I could have used multiple addresses, perhaps one per feature, and check authorization per address.  Each address would be a feature SKU in that case.

A screenshot of the configuration when done:

![config](https://github.com/microsoft/frontend-appsells/blob/main/docs/functions_config.png?raw=true)



#### Logging in Azure

1. create an *Application Insights* resource
1. take note of the new *Application Insights* *instrumentation key*
1. create a new *application setting* key-value pair in the *Static Web Apps* > *Configuration*
    - key:  `APPINSIGHTS_INSTRUMENTATIONKEY`
    - value: from above
1. inspect logs in the *Application Insights* > *Logs*, query: `traces | order by timestamp desc `

### Local Development

To run this solution in your local environment:

1. install [VSCode](https://code.visualstudio.com/) and [Azure Functions Extention for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions)
1. in VSCode create a workspace with this repo
1. in a separate console `npm install` dependencies
1. back in VSCode, start the local Azure Functions server by pressing F5
1. in the separate console start the react server with `npm start`
1. navigate browser to http://localhost:3000

#### Configuration

See `./api/local.settings.json`

#### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.
