import React from 'react';
import { LedgersWidgetPaymentsInfoContext } from '../ledgers.js-react-widget/LedgersWidget';

class NoEthereumWalletComponent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      dismissed: false
    };
  }

  render() {
    const message = (paymentsInfo) => {
      if (!this.state.dismissed 
          && paymentsInfo 
          && paymentsInfo.wallet 
          && !('ethers' in paymentsInfo.wallet || paymentsInfo.wallet['ethers'])) {
        return (
          <div style={{maxWidth: "1000px", width: "80%"}}>
            <div className="ui info message">
              <i className="close icon" onClick={() => this.setState({dismissed: true})}></i>
              <p>The 'ethers' currency is not available as no Ethereum <em>web3.js</em> wallet detected.</p>
            </div>
          </div>                      
        );
      }
      return null;
    }

  return (
      <LedgersWidgetPaymentsInfoContext.Consumer>
        {paymentsInfo => message(paymentsInfo)}
      </LedgersWidgetPaymentsInfoContext.Consumer>
    );
  }

}

export default NoEthereumWalletComponent;
