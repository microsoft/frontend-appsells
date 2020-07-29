import React from 'react';

class ErrorComponent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    if (this.props.errorInfo && this.props.errorInfo.text) {
      var message = (
        <div className="ui negative message">
          <i className="close icon" onClick={() => this.props.errorInfo?.setError(null)}></i>
          <p>{this.props.errorInfo?.text}</p>
        </div>
      );
    }

  return (<div style={{maxWidth: "1000px", width: "80%"}}>{message}</div>);
  }
}

export default ErrorComponent;
