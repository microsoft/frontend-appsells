/**
 * Utilities to help with all the other components
 */

/** initialization **/

/**
 * @returns {string} a make pretend challenge
 */
export function makePretendChallenge() {
  return `please sign this challenge proving you own this address :: ${(new Date()).getTime() / 1000}`; // make pretend challenge
}

/**
 * @param {number} t - millis to delay
 * @returns {Promise} completing when delay is done
 */
export function delay(t) {
  return new Promise(resolve => setTimeout(resolve.bind(null), t));
};