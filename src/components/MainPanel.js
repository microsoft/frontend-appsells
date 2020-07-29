import React from 'react';
import LoginComponent from './LoginComponent';
import ErrorComponent from './ErrorComponent';
import { PaymentsContext } from '../services/PaymentsService';
import { ErrorContext } from '../services/ErrorService';

class MainPanel extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
      <div className="ui grid">
        <div className="row centered">
          <ErrorContext.Consumer>
            {errorInfo => (
              <ErrorComponent errorInfo={errorInfo} />
            )}
          </ErrorContext.Consumer>
        </div>
        <div className="row centered">
          <PaymentsContext.Consumer>
            {paymentInfo => (
              <LoginComponent paymentInfo={paymentInfo} />
            )}
          </PaymentsContext.Consumer>
        </div>
      </div>
    );
  }
}

export default MainPanel;
