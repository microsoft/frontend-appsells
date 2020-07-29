import React from 'react';
import { ErrorContext } from '../services/ErrorService';

class ErrorComponent extends React.Component {

  render() {
    const message = (errorInfo) => {
      if (errorInfo && errorInfo.text) {
        return (
          <div style={{maxWidth: "1000px", width: "80%"}}>
            <div className="ui negative message">
              <i className="close icon" onClick={() => errorInfo?.setErrorFn(null)}></i>
              <p>{errorInfo?.text}</p>
            </div>
          </div>                      
        );
      }
      return null;
    }

  return (
      <ErrorContext.Consumer>
        {errorInfo => message(errorInfo)}
      </ErrorContext.Consumer>
    );
  }

}

export default ErrorComponent;
