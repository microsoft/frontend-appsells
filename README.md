[Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct)

# FrontendAppsells

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

## Significant Code Sections

Sections of code significant to this demo beyond the template boilerplate.

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
| FRONTEND_APPSELLS_CONFIG | {"test": "value"} |
| APPINSIGHTS_INSTRUMENTATIONKEY | see 'Logging in Azure' below |

#### Logging in Azure

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

#### `npm test`

> Note: for tests to run you must have Azure functions running locally with [VSCode Azure Functions Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions).

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.
