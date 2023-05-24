import { Subject } from "../../modules/observer.js";

export class ExchangeRateButton extends Subject {
  constructor() {
    super();
    this.exchangeRate = 0;
  }

  /**
   * set the exchange rate
   *
   * @param {number} exRate exchange rate value
   */
  set exchangeRate(exRate) {
    this._exchangeRate = exRate;
    this.notify({ exRate: this.exchangeRate });
  }

  get exchangeRate() {
    return this._exchangeRate;
  }

  attributeChangedCallback(attr, oldValue, newValue) {
    if (attr === "data-rate") {
      this.exchangeRate = Number.parseFloat(newValue);
    }
  }

  static get observedAttributes() {
    return ["data-rate"];
  }
}

customElements.define("rate-button", ExchangeRateButton);
