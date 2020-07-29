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

    this.state = {

      // error info descriptor used throughout the app
      errorInfo: {
        text: null,
        setErrorFn: this.setError
      },

      // payments info descriptor synced by PaymentsService
      paymentsInfo: {
        setPaymentsInfoFn: this.setPaymentsInfo,
        setErrorFn: this.setError
      },

      // fees info descriptor synched with backend (/GetSchedule)
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
            <p>{JSON.stringify(this.state.paymentsInfo)}</p>
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
