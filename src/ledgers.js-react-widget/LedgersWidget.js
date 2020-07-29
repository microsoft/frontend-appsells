import React from 'react';
import LoginComponent from './components/LoginComponent';

// Expose a context as a convenience.
export const LedgersWidgetPaymentsInfoContext = React.createContext();

class LedgersWidget extends React.Component {
  render() {
    return (
      <LedgersWidgetPaymentsInfoContext.Consumer>
        {paymentInfo => (
          <LoginComponent paymentInfo={paymentInfo} />
        )}
      </LedgersWidgetPaymentsInfoContext.Consumer>        
    );
  }
}

export default LedgersWidget;
