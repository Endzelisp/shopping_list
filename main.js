import * as UI from "./modules/ui.js";
import * as Local from "./modules/localstorage-management.js";
import { generateId } from "./modules/utility-functions.js";
import { State } from "./modules/state.js";
import { ItemElement } from "./web-components/item/item.js";
import {
  updateList,
  renderList,
  renderTotalUSD,
  renderTotalBs,
} from "./modules/custom-events.js";

class Item {
  constructor(obj) {
    this.quantity = obj.quantity;
    this.weight = obj.weight;
    this.product = obj.product;
    this.rawPrice = obj.price;
    this.currency = obj.currency;
    this.type = obj.type;
    this.id = obj.id;
    this.totalPriceBs = this.#bs();
    this.totalPriceUSD = this.#usd();
  }

  #bs() {
    const subTotal =
      Number.parseFloat(this.rawPrice) * (this.quantity || this.weight);
    if (this.currency === "usd") {
      return subTotal * State.exchangeRate;
    }
    return subTotal;
  }

  #usd() {
    const subTotal =
      Number.parseFloat(this.rawPrice) * (this.quantity || this.weight);
    if (this.currency === "bs") {
      return subTotal / State.exchangeRate;
    }
    return subTotal;
  }

  adjustPrice() {
    this.totalPriceBs = this.#bs();
    this.totalPriceUSD = this.#usd();
  }
}

UI.exchangeRateElem.addEventListener("pointerdown", () => {
  // Open up exchange rate dialog box
  UI.dialogExchangeRate.showModal();
});

UI.dialogExchangeRate.addEventListener("close", () => {
  // Capture info about the exchange rate
  // and save it to local storage

  const exRateInputEl = UI.dialogExchangeRate.querySelector(
    '[data-input="exchange-rate"]'
  );
  const exRate = Number.parseFloat(exRateInputEl.value);

  if (Number.isNaN(exRate)) {
    alert("Tasa de cambio no actualizada");
    return;
  }
  if (exRate === 0) {
    alert("La tasa de cambio no puede ser cero");
    return;
  }

  State.exchangeRate = exRate;
  UI.exchangeRateElem.innerText = Number.parseFloat(exRate).toFixed(2);
  Local.saveExRate();

  // Update item's price when the exchange rate changes
  State.savedItems.forEach((item) => item.adjustPrice());
  UI.dialogExchangeRate.dispatchEvent(renderList);
});

UI.addItemBtn.addEventListener("pointerdown", () => {
  // Show up the dialog box to add a new item
  // just if the exchangeRate is set

  if (!("exchangeRate" in localStorage)) {
    alert("La tasa de cambio no ha sido configurada");
    return;
  }

  const quantityEl = UI.dialogUnitaryItem.querySelector(
    '[data-input="quantity"]'
  );
  const productEl = UI.dialogUnitaryItem.querySelector('[data-input="name"]');
  const priceEl = UI.dialogUnitaryItem.querySelector('[data-input="price"]');
  quantityEl.value = 1;
  productEl.value = "";
  priceEl.value = null;
  UI.dialogUnitaryItem.showModal();
});

UI.dialogUnitaryItem.addEventListener("close", () => {
  // Capture user info about the product and
  // send it through the event detail object

  const dialogEl = UI.dialogUnitaryItem;
  const quantityEl = dialogEl.querySelector('[data-input="quantity"]');
  const priceEl = dialogEl.querySelector('[data-input="price"]');
  const currencyEl = dialogEl.querySelector("fieldset input:checked");
  const productEl = dialogEl.querySelector('[data-input="name"]');
  const product = productEl.value.trim();
  const currency = currencyEl.value;
  const quantity = Number.parseInt(quantityEl.value);
  const price = Number.parseFloat(priceEl.value).toFixed(2);

  if (product !== "" && price !== null) {
    updateList.detail.product = product;
    updateList.detail.currency = currency;
    updateList.detail.quantity = quantity;
    updateList.detail.price = price;
    updateList.detail.type = "unitary";
    updateList.detail.weight = null;
    updateList.detail.id = generateId(product);

    UI.dialogUnitaryItem.dispatchEvent(updateList);
  }
});

UI.addWeightedItem.addEventListener("pointerdown", () => {
  // Show up the dialog box to add a new weighted items
  // just if the exchangeRate is set

  if (!("exchangeRate" in localStorage)) {
    alert("La tasa de cambio no ha sido configurada");
    return;
  }

  const productEl = UI.dialogWeightedItem.querySelector('[data-input="name"]');
  const priceEl = UI.dialogWeightedItem.querySelector('[data-input="price"]');
  const weightEl = UI.dialogWeightedItem.querySelector('[data-input="weight"]');
  productEl.value = "";
  priceEl.value = null;
  weightEl.value = null;
  UI.dialogWeightedItem.showModal();
});

UI.dialogWeightedItem.addEventListener("close", () => {
  // Capture user info about the weighted product
  // and send it through the event detail object

  const dialogEl = UI.dialogWeightedItem;
  const weightEl = dialogEl.querySelector('[data-input="weight"]');
  const priceEl = dialogEl.querySelector('[data-input="price"]');
  const currencyEl = dialogEl.querySelector("fieldset input:checked");
  const productEl = dialogEl.querySelector('[data-input="name"]');

  // Add a zero before the decimal point if the user didn't do it
  let weight = weightEl.value;
  if (weight[0] === "." || weight[0] === ",") {
    weight = `0${weight}`;
  }
  weight = Number.parseFloat(weight);
  const currency = currencyEl.value;
  const product = productEl.value.trim();
  const price = Number.parseFloat(priceEl.value);

  if (product !== "" && price !== null) {
    updateList.detail.weight = weight;
    updateList.detail.price = price;
    updateList.detail.product = product;
    updateList.detail.currency = currency;
    updateList.detail.type = "weighted";
    updateList.detail.quantity = null;
    updateList.detail.id = generateId(product);

    UI.dialogUnitaryItem.dispatchEvent(updateList);
  }
});

UI.mainContainer.addEventListener("updateList", (e) => {
  // Receive captured info about the product
  // saving it in the State module and localStorage

  const quantity = e.detail.quantity;
  const weight = e.detail.weight;
  const product = e.detail.product;
  const currency = e.detail.currency;
  const type = e.detail.type;
  const price = e.detail.price;
  const id = e.detail.id;

  State.savedItems.push(
    new Item({ quantity, weight, product, price, currency, type, id })
  );
  Local.saveList();
  UI.mainContainer.dispatchEvent(renderList);
});

UI.mainContainer.addEventListener("renderList", () => {
  // Clear out the actual displayed list of items
  UI.clearList();
  if (State.savedItems.length === 0) {
    State.savedItems = Local.readList();
  }

  State.savedItems.forEach((item) => {
    const product = new ItemElement();
    product.loadData(
      `${item.quantity || item.weight.toString().concat(" Kg")} ${
        item.product
      }`,
      item.totalPriceBs.toFixed(2),
      item.id
    );
    UI.itemContainer.appendChild(product);
  });

  UI.mainContainer.dispatchEvent(renderTotalUSD);
});

UI.mainContainer.addEventListener("renderTotalUSD", () => {
  const total = State.savedItems.reduce(
    (acc, current) => acc + current.totalPriceUSD,
    0
  );
  UI.totalUSDElem.innerText = total.toFixed(2);
  renderTotalBs.detail.totalInUSD = total;
  UI.mainContainer.dispatchEvent(renderTotalBs);
});

UI.mainContainer.addEventListener("renderTotalBs", (e) => {
  // Exchange the product prices from USD to Bs
  let total = e.detail.totalInUSD;
  total *= Number.parseFloat(State.exchangeRate);
  UI.totalBsElem.innerText = total.toFixed(2);
});

// -------------
// Initial setup

function init() {
  if (!("exchangeRate" in localStorage)) {
    UI.exchangeRateElem.innerText = 0;
    alert("Tasa de cambio no configurada");
    return;
  }
  const exRate = localStorage.getItem("exchangeRate");
  State.exchangeRate = exRate;
  UI.exchangeRateElem.innerText = Number.parseFloat(exRate).toFixed(2);
  UI.mainContainer.dispatchEvent(renderList);
}

init();
