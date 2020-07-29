import React from 'react';
import LoginComponent from './LoginComponent';
import ErrorComponent from './ErrorComponent';
import FeatureComponent from './FeatureComponent';
import { PaymentsContext } from '../services/PaymentsService';
import { FeesContext } from '../services/FeesScheduleService';
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
        <ErrorContext.Consumer>
          {errorInfo => (
            <div className="row centered">
              <ErrorComponent errorInfo={errorInfo} />
            </div>
          )}
        </ErrorContext.Consumer>
        <PaymentsContext.Consumer>
          {paymentInfo => (
            <FeesContext.Consumer>
              {feesInfo => (
                <div className="row centered">
                  <div className="ui grid">
                    <div className="row centered">
                      <LoginComponent paymentInfo={paymentInfo} />
                    </div>
                    <div className="row centered" style={{marginTop: "100px"}}>
                      <div className="four wide column">
                        <div className="ui center aligned segment basic">
                          <FeatureComponent which="free" 
                                            paymentInfo={paymentInfo} 
                                            feesInfo={feesInfo}
                                            authLabel="Login Free"
                                            useLabel="Use Feature"
                                            showCost={false} />
                        </div>
                      </div>
                      <div className="four wide column">
                        <div className="ui center aligned segment basic">
                          <FeatureComponent which="paid" 
                                            paymentInfo={paymentInfo} 
                                            feesInfo={feesInfo}
                                            authLabel="Add Feature"
                                            useLabel="Use Feature"
                                            showCost={true} />
                        </div>
                      </div>
                      <div className="four wide column">
                        <div className="ui center aligned segment basic">
                          <FeatureComponent which="subscription" 
                                            paymentInfo={paymentInfo} 
                                            feesInfo={feesInfo}
                                            authLabel="Subscribe Feature"
                                            useLabel="Use Feature"
                                            showCost={true} />
                        </div>
                      </div>
                    </div>
                  </div>                  
                </div>              
              )}
            </FeesContext.Consumer>
          )}
        </PaymentsContext.Consumer>
      </div>
    );
  }
}

export default MainPanel;
