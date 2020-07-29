import React from 'react';
import ErrorService, { ErrorContext } from './services/ErrorService';
import FeesScheduleService, { FeesContext } from './services/FeesScheduleService';
import { LedgersWidgetPaymentsInfoContext } from './ledgers.js-react-widget/LedgersWidget';
import MainPanel from './components/MainPanel';

class App extends React.Component {

  #errorService;
  #feesScheduleService;

  constructor(props) {
    super(props);

    // application state
    this.state = {

      // payments info descriptor updated by LedgersWidget
      //
      // Injected into `LedgersWidgetPaymentsInfoContext.Consumer` -- will have the following functions:
      //
      //   getCurrentCurrency = () => { /* public function: returns 'dollars' or 'ethers' */ }
      //   isAuthenticated = async () => { /* is current crednetial authenticatd against the current currency's ledger? */ }
      //   isAuthorized = async (amount, to, since) => { /* does current currency ledger have 'amount' or more paid 'to' recepient 'since' (or all if 'since' null)? */ }
      //   topUp = async (amount, to) => { /* public function: top-up payments 'to' recepient on the current currency ledger with 'amount' */ }
      //
      paymentsInfo: {
        updateApplicationStateFn: this.setPaymentsInfo,
        setErrorFn: this.setError
      },

      // error info descriptor used throughout the app
      errorInfo: {
        text: null,
        setErrorFn: this.setError
      },

      // fees info descriptor updated by backend (/GetSchedule):
      //
      // 'free': {
      //   'expiryMinutes': ..,
      //   'dollars': {
      //     'cost': ..,
      //     'address': ..
      //   },
      //   'ethers': {
      //     'cost': ..,
      //     'address': ..
      //   }
      // },
      // 'paid': { /* same as above */ },
      // 'subscription: { /* same as above */ }
      //
      feesInfo: {}
    };
  }

  componentDidMount = async () => {
    this.#errorService = new ErrorService(this.setError);
    this.#feesScheduleService = new FeesScheduleService(this.setFeesInfo, this.#errorService.setError);

    await this.#feesScheduleService.fetchFees();
  }

  // Set error info.
  // @param {object} info
  setError = (text) => {
    this.setState({errorInfo: {...this.state.errorInfo, ...{text: text ? `${text}` : null}}});
  }

  // Set fees info.
  // @param {object} info
  setFeesInfo = (info) => {
    this.setState({feesInfo: {...this.state.feesInfo, ...info}});
  }

  // Set payments info.
  // @param {object} info
  setPaymentsInfo = (info) => {
    this.setState({paymentsInfo: {...this.state.paymentsInfo, ...info}});
  }

  render() {
    return (
      <ErrorContext.Provider value={this.state.errorInfo}>
        <FeesContext.Provider value={this.state.feesInfo}>
          <LedgersWidgetPaymentsInfoContext.Provider value={this.state.paymentsInfo}>
            <pre>{JSON.stringify(this.state.paymentsInfo, null, 2)}</pre>
            <p>{JSON.stringify(this.state.errorInfo)}</p>
            <p>{JSON.stringify(this.state.feesInfo)}</p>
            <br/>
            <MainPanel />
          </LedgersWidgetPaymentsInfoContext.Provider>
        </FeesContext.Provider>
      </ErrorContext.Provider>
    );
  }
}

export default App;
