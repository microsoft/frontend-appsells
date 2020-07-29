import React from "react";

export const ErrorContext = React.createContext();

class ErrorService {

  // @param {(text) => ()} setErrorCallback - function called when new error set
  constructor(setErrorCallback) {
    this.setErrorCallback = setErrorCallback;
  }

  // Set error info.
  //
  // @param {string} text - to set error message to
  setError = (text) => {
    console.log(`ErrorService::setError(${text})`);
    this.setErrorCallback(text);
  }
}

export default ErrorService;