import React from 'react';
import ErrorService, { ErrorContext } from './services/ErrorService';
import FeesScheduleService, { FeesContext } from './services/FeesScheduleService';
import PaymentsService, { PaymentsContext } from './services/PaymentsService';
import MainPanel from './components/MainPanel';

class App extends React.Component {

  #errorService;
  #feesScheduleService;
  #paymentsService;

  constructor(props) {
    super(props);

    this.state = {

      // error info descriptor used throughout the app
      errorInfo: {text: null},

      // payments info descriptor synced by PaymentsService
      paymentsInfo: {},

      // fees info descriptor synched with backend (/GetSchedule)
      feesInfo: {}
    };
  }

  componentDidMount() {
    this.#errorService = new ErrorService(this.setErrorInfo);
    this.#feesScheduleService = new FeesScheduleService(this.setFeesInfo, this.#errorService.setError);
    this.#paymentsService = new PaymentsService(this.setPaymentsInfo, this.#errorService.setError);
  }

  // Set error info.
  // @param {object} info
  setErrorInfo = (info) => {
    this.setState({errorInfo: {...this.state.errorInfo, ...info}});
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
    console.log(JSON.stringify(info));
  }

  render() {
    return (
      <ErrorContext.Provider value={this.state.errorInfo}>
        <FeesContext.Provider value={this.state.feesInfo}>
          <PaymentsContext.Provider value={this.state.paymentsInfo}>
            <p>{JSON.stringify(this.state.paymentsInfo)}</p>
            <p>{JSON.stringify(this.state.errorInfo)}</p>
            <p>{JSON.stringify(this.state.feesInfo)}</p>
            <br/>
            <MainPanel />
          </PaymentsContext.Provider>
        </FeesContext.Provider>
      </ErrorContext.Provider>
    );
  }
}

export default App;
