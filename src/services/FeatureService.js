class FeatureService {

  // @param {(text) => ()} setError - fn to set error if any
  constructor(setError) {
    this.setError = setError;
  }

  // Fetch fees info from back-end
  // @returns {boolean} if successful run
  runFeature = async (featureName, currency, address, message, signature) => {
    try {
      const uri = `${process.env.REACT_APP_API}/RunFeature?featureName=${featureName}&currency=${currency}&address=${address}&message=${btoa(message)}&signature=${signature}`;
      let { featureUsed } = await (await fetch(uri, { 
        headers: {
          'Accept': 'application/json'
        }
      })).json();
      return featureUsed;
    } catch (error) {
      this.setError(error);
    }
  }
}  

export default FeatureService;