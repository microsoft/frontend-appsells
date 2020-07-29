import React from 'react';
import LedgersWidget from '../ledgers.js-react-widget/LedgersWidget';
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
          <ErrorComponent />
        </div>

        <div className="row centered">
          <LedgersWidget />
        </div>

        <div className="row centered" style={{marginTop: "100px"}}>
          <div className="four wide column">
            <div className="ui center aligned segment basic">
              <FeatureComponent which="free" 
                                authLabel="Login Free"
                                useLabel="Use Feature"
                                showCost={false} />
            </div>
          </div>
          <div className="four wide column">
            <div className="ui center aligned segment basic">
              <FeatureComponent which="paid" 
                                authLabel="Add Feature"
                                useLabel="Use Feature"
                                showCost={true} />
            </div>
          </div>
          <div className="four wide column">
            <div className="ui center aligned segment basic">
              <FeatureComponent which="subscription" 
                                authLabel="Subscribe Feature"
                                useLabel="Use Feature"
                                showCost={true} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MainPanel;
