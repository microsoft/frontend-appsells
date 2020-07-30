import React from 'react';
import { FeesContext } from '../services/FeesScheduleService';
import { LedgersWidgetPaymentsInfoContext } from '../ledgers.js-react-widget/LedgersWidget';
import { ErrorContext } from '../services/ErrorService';
import FeatureService from '../services/FeatureService'
class FeatureComponent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      featureRan: false
    };
  }

  runFeature = async (setError, featureName, currency, address, message, signature) => {
    this.setState({featureRan: await (new FeatureService(setError)).runFeature(featureName, currency, address, message, signature)});
  }

  render() {
    const render = (paymentInfo, feesInfo, errorInfo) => {
      if (! ('getInfo' in paymentInfo)) return (<div></div>);
      const info = paymentInfo?.getInfo();
      const disabled = !info.address || !info.signature ? 'disabled' : '';
      const currency = info.currency;
      if (!currency) return (<div></div>);
      if (!feesInfo[this.props.which]) return (<div></div>);
      const cost = +feesInfo[this.props.which][currency].cost;
      const to = feesInfo[this.props.which][currency].address;
      const sinceMinutes = +feesInfo[this.props.which].expiryMinutes || null;
      let outstanding = cost === 0 ? 0 : paymentInfo.getOutstanding(cost, to, sinceMinutes);
      const loading = outstanding === null ? 'loading' : '';
      outstanding = +outstanding;
      const open = cost === 0 ? paymentInfo.isAuthenticated() : !loading && paymentInfo.isAuthenticated() && outstanding  === 0;
      const icon = open ? this.state.featureRan ? 'flag checkered' : 'unlock' : 'lock';
      const label = open ? this.props.useLabel : outstanding === 0 ? this.props.authLabel : this.props.payLabel;
      const showCost = this.props.showCost && outstanding !== 0;
      const roundDigits = currency === 'ethers' ? 10000 : 100;
      const costTag = `  (${currency === 'ethers' ? 'eth ' : '$'}${Math.round(outstanding * roundDigits)/roundDigits})`;
      const action = open 
        ? (e) => {e.preventDefault(); this.runFeature(
            errorInfo.setErrorFn,
            this.props.which,
            info.currency,
            info.address,
            info.message,
            info.signature);}
        : async (e) => {e.preventDefault(); await paymentInfo.topUp(outstanding, to)};

      return (
        <div>
          <i className={`${icon} icon massive circular`}></i>        
          <h3>{this.props.which}</h3>
          <button className={`ui primary button ${loading} ${disabled}`} onClick={(e) => action(e)}>
            {label}
            {showCost ? costTag : ''}
          </button>
        </div>
      );
    }

    return (
      <LedgersWidgetPaymentsInfoContext.Consumer>
        {paymentInfo => (
          <FeesContext.Consumer>
            {feesInfo => (
              <ErrorContext.Consumer>
                {errorInfo => render(paymentInfo, feesInfo, errorInfo)}
              </ErrorContext.Consumer>
            )}
          </FeesContext.Consumer>
        )}
      </LedgersWidgetPaymentsInfoContext.Consumer>  
    );
  }
}

export default FeatureComponent;
