import React from 'react';
import LedgersWidget from '../ledgers.js-react-widget/LedgersWidget';
import NoEthereumWalletComponent from './NoEthereumWalletComponent';
import ErrorComponent from './ErrorComponent';
import FeatureComponent from './FeatureComponent';

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
          <NoEthereumWalletComponent />
        </div>

        <div className="row centered">
          <ErrorComponent />
        </div>

        <div className="row centered">
          <LedgersWidget />
        </div>

        <div className="row centered" style={{marginTop: "100px"}}>
          <div className="four wide column">
            <div className="ui center aligned segment basic">
              <FeatureComponent which="free" 
                                authLabel="Login to Use"
                                payLayble=""
                                useLabel="Use Feature"
                                subLabel="(access forever)"
                                showCost={false} />
            </div>
          </div>
          <div className="four wide column">
            <div className="ui center aligned segment basic">
              <FeatureComponent which="paid" 
                                authLabel="Login to Use"
                                payLabel="Add Feature"
                                useLabel="Use Feature"
                                subLabel="(access forever)"
                                showCost={true} />
            </div>
          </div>
          <div className="four wide column">
            <div className="ui center aligned segment basic">
              <FeatureComponent which="subscription" 
                                authLabel="Login to Use"
                                payLabel="Subscribe Feature"
                                useLabel="Use Feature"
                                subLabel="(2 minute access)"
                                showCost={true} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MainPanel;
