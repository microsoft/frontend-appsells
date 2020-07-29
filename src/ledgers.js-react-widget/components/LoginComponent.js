import React from 'react';
import PaymentsService from '../services/PaymentsService';

class LoginComponent extends React.Component {

  #paymentsService;

  componentDidMount = async () => {
    this.#paymentsService = new PaymentsService(this.props.paymentInfo.setPaymentsInfoFn, this.props.paymentInfo.setErrorFn);
  }

  render() {
    const hasWallet = this.props.paymentInfo 
      && this.props.paymentInfo.wallet 
      && this.props.paymentInfo.wallet[(this.props.paymentInfo.currentCurrency || this.props.paymentInfo.defaultCurrency)];
    
    if (!hasWallet) {
      var generateButton = (
        <button className={`ui button primary`}
                style={{marginLeft: "10px"}}
                onClick={(e) => {e.preventDefault(); return this.props.paymentInfo?.service?.generateNewKeys()}}>
          Generate New
        </button>
      );
    }
    
    return (
      <form className="ui form">              
        <div className="inline field">
          <label style={{fontSize: "larger", marginRight: "10px"}}>{hasWallet ? 'Wallet Address' : 'Login Key'}</label>
          <div className="ui buttons">
            <button className={`ui button primary ${this.props.paymentInfo?.enabled?.dollars ? '' : 'disabled'}`}
                    onClick={(e) => {e.preventDefault(); return this.props.paymentInfo?.service?.setCurrentCurrency('dollars')}}>
              dollars
            </button>
            <div className={`or`}></div>
            <button className={`ui button primary ${this.props.paymentInfo?.enabled?.ethers ? '' : 'disabled'}`}
                    onClick={(e) => {e.preventDefault(); return this.props.paymentInfo?.service?.setCurrentCurrency('ethers')}}>
              ethers
            </button>
          </div>
          <input type="text" 
                  id="username" 
                  name="username" 
                  className={`${hasWallet ? 'disabled' : ''}`}
                  style={{marginLeft: "10px", width: "40em"}} 
                  value={this.props.paymentInfo?.payerPrivateKey || this.props.paymentInfo?.payerAddress || ''}
                  onChange={(event) => this.props.paymentInfo?.service?.setSecretKey(event.target.value)}>
          </input>
          {generateButton}
        </div>
      </form>
    );
  }
}

export default LoginComponent;
