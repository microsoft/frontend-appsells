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
      //   getInfo = () => { /* public function: returns an object with currency ('dollars' or 'ethers'), address, message, signature, ledgerUri */ }
      //   isAuthenticated = () => { /* is current crednetial authenticatd against the current currency's ledger? */ }
      //   getOutstanding = (amount, to, since) => { /* does current currency ledger have 'amount' or more paid 
      //                                                'to' recepient 'since' (or all if 'since' null)? 
      //                                                Differnce in dollars or ethers, $0 if authorized. 
      //                                                Null if not yet known: will update application state. */ }
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
            <MainPanel />
          </LedgersWidgetPaymentsInfoContext.Provider>
        </FeesContext.Provider>
      </ErrorContext.Provider>
    );
  }
}

export default App;
