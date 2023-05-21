import { State } from "../../modules/state.js";
import { renderTotalUSD } from "../../modules/custom-events.js";
import { mainContainer, newItemTemplate } from "../../modules/ui.js";
import * as Local from "../../modules/localstorage-management.js";

export class ItemElement extends HTMLElement {
  constructor() {
    super();
    const importedTemplate = document.importNode(newItemTemplate.content, true);
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(importedTemplate);
  }

  loadData(product, price, id) {
    const itemName = this.shadowRoot.querySelector('[data-item="name"]');
    const itemPrice = this.shadowRoot.querySelector('[data-item="price"]');
    this.setAttribute("id", id);
    itemName.innerText = product;
    itemPrice.innerText = `${price} Bs.`;
  }

  connectedCallback() {
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
