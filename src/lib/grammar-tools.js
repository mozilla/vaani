class GrammarTools {
  /**
   * Removes special characters from a string and also condenses whitespace
   * @param value {String} The string to clean
   * @return {String} The cleaned string
   */
  static clean (value) {
    value = value.replace(/[^\w\s]/gi, '');
    value = value.replace(/\s+/g, ' ');

    return value;
  }
}


export default GrammarTools;
