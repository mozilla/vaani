/* global navigator */

class Dialer {
  /**
   * Dials the specified number
   * @param phoneNumber {String} The number to dial
   * @param callback {Function} The function to callback
   */
  static dial (phoneNumber, callback) {
    var telephony = navigator.mozTelephony;

    telephony.dial(phoneNumber).then(function (call) {
      callback(null, call);
    });
  }

  /**
   * Maps a string of number words to a string of number digits
   * @param words {String} The word numbers (separated by space)
   * @return digits {String} The digits (no spaces)
   */
  static wordsToDigits (words) {
    var digits = words;

    digits = digits.replace(/call/g, '');
    digits = digits.replace(/zero/g, '0');
    digits = digits.replace(/one/g, '1');
    digits = digits.replace(/two/g, '2');
    digits = digits.replace(/three/g, '3');
    digits = digits.replace(/four/g, '4');
    digits = digits.replace(/five/g, '5');
    digits = digits.replace(/six/g, '6');
    digits = digits.replace(/seven/g, '7');
    digits = digits.replace(/eight/g, '8');
    digits = digits.replace(/nine/g, '9');
    digits = digits.replace(/\s/g, '');

    return digits;
  }
}


export default Dialer;
