import React from 'react';

class FeatureComponent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
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
}

export default FeatureComponent;
