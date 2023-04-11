import { Local, State } from "./modules.js";

export class Product extends HTMLElement {
  constructor() {
    super();
    const templateElem = document.querySelector('[data-template="new-item"]');
    const template = document.importNode(templateElem.content, true);
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template);
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
      const indexToDelete = State.savedItems.findIndex(
        (item) => item.id === id
      );
      State.savedItems.splice(indexToDelete, 1);
      Local.saveList();
      this.remove();
    });
  }
}

customElements.define("new-product", Product);
