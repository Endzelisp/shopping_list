import { State } from "../../modules/state.js";
import { renderTotalUSD } from "../../modules/custom-events.js";
import { mainContainer, newItemTemplate } from "../../modules/ui.js";
import * as Local from "../../modules/localstorage-management.js";

const CURRENCY_TYPE = {
  USD: "usd",
  BS: "bs",
};

export class ItemElement extends HTMLElement {
  constructor(props) {
    super();
    this.quantity = props.quantity;
    this.weight = props.weight;
    this.product = props.product;
    this.rawPrice = props.rawPrice;
    this.currency = props.currency;
    this.type = props.type;
    this.id = props.id;
    this.totalPriceBs = this.#bs(State.exchangeRate);
    this.totalPriceUSD = this.#usd(State.exchangeRate);
    const importedTemplate = document.importNode(newItemTemplate.content, true);
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(importedTemplate);
  }

  #bs(exRate) {
    const subTotal =
      Number.parseFloat(this.rawPrice) * (this.quantity || this.weight);
    if (this.currency === CURRENCY_TYPE.USD) {
      return subTotal * exRate;
    }
    return subTotal;
  }

  #usd(exRate) {
    const subTotal =
      Number.parseFloat(this.rawPrice) * (this.quantity || this.weight);
    if (this.currency === CURRENCY_TYPE.BS) {
      return subTotal / exRate;
    }
    return subTotal;
  }

  notify({ exRate }) {
    this.totalPriceBs = this.#bs(exRate);
    this.totalPriceUSD = this.#usd(exRate);
  }

  connectedCallback() {
    const itemName = this.shadowRoot.querySelector('[data-item="name"]');
    const itemPrice = this.shadowRoot.querySelector('[data-item="price"]');
    this.setAttribute("id", this.id);
    itemName.innerText = `${
      this.quantity || this.weight.toString().concat(" Kg")
    } ${this.product}`;
    itemPrice.innerText = `${this.totalPriceBs} Bs.`;
    const removeItem = this.shadowRoot.querySelector('[data-item="delete"]');
    removeItem.addEventListener("pointerdown", () => {
      const id = this.getAttribute("id");
      State.deleteItem(id);
      Local.saveList();
      this.remove();
      mainContainer.dispatchEvent(renderTotalUSD);
    });
  }
}

customElements.define("new-item", ItemElement);
