import React from 'react';
import { FeesContext } from '../services/FeesScheduleService';
import { LedgersWidgetPaymentsInfoContext } from '../ledgers.js-react-widget/LedgersWidget';
class FeatureComponent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    const render = (paymentInfo, feesInfo) => {
      return (
        <div>
          <i className="lock icon massive circular"></i>        
          <h3>{this.props.which}</h3>
          <button className="ui primary button">
            {this.props.authLabel}
            {this.props.showCost ? ` ($1.00)` : ''}
          </button>
        </div>
      );
    }

    return (
      <LedgersWidgetPaymentsInfoContext.Consumer>
        {paymentInfo => (
          <FeesContext.Consumer>
            {feesInfo => render(paymentInfo, feesInfo)}
          </FeesContext.Consumer>
        )}
      </LedgersWidgetPaymentsInfoContext.Consumer>  
    );
  }
}

export default FeatureComponent;
