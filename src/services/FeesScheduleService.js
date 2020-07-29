import React from "react";

export const FeesContext = React.createContext();

class FeesScheduleService {

  // @param {(info) => ()} setFeesCallback - function called when new fees object
  // @param {(text) => ()} setError - fn to set error if any
  constructor(setFeesCallback, setError) {
    this.setFeesCallback = setFeesCallback;
    this.setError = setError;
  }

  // Set fees info.
  //
  // @param {object} info - to set error message to
  setFees = (info) => {
    this.setFeesCallback(info);
  }

  // Fetch fees info from back-end
  fetchFees = async () => {
    try {
      let { schedule } = await (await fetch(`${process.env.REACT_APP_API}/GetSchedule`, { 
        headers: {
          'Accept': 'application/json'
        }
      })).json();
      console.log(`FeesScheduleService::fetchFees: ${JSON.stringify(schedule)}`);
      this.setFees(schedule);
    } catch (error) {
      this.setError(error);
    }
  }
}  

export default FeesScheduleService;