declare const language: {
  /**
   *
   * @param locale Locale String i.e. "en-GB"
   * @param key text key i.e "quit"
   */
  get(locale: string, key: string): string;
};

export = language;
