/* global navigator */

class Dialer {
  /**
   * Dials the specified number
   * @param phoneNumber {String} The number to dial
   * @param callback {Function} The function to callback
   */
  static dial (phoneNumber, callback) {
    if (!navigator.mozTelephony) {
      callback(Error('navigator.mozTelephony not found'));
      return;
    }

    var telephony = navigator.mozTelephony;

    telephony.dial(phoneNumber).then((call) => {
      callback(null, call);
    }).catch((err) => {
      callback(err);
    });
  }
}


export default Dialer;
