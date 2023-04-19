import {
  Local,
  State,
  Item,
  updateList,
  renderList,
  renderTotalUSD,
  renderTotalBs,
  generateId,
  calculateTotal,
} from "./modules.js";
import { Product } from "./item-component.js";
import * as UI from "./UI-module.js";

UI.exchangeRateEl.addEventListener("pointerdown", () => {
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
  UI.exchangeRateEl.innerText = Number.parseFloat(exRate).toFixed(2);
  Local.saveExRate();

  // Update item's price when the exchange rate changes
  UI.dialogExchangeRate.dispatchEvent(renderList);
});

UI.newItem.addEventListener("pointerdown", () => {
  // Show up the dialog box to add a new item
  // just if the exchangeRate is set

  if (!("exchangeRate" in localStorage)) {
    alert("La tasa de cambio no ha sido configurada");
    return;
  }

  const quantityEl = UI.dialogNewItem.querySelector('[data-input="quantity"]');
  const productEl = UI.dialogNewItem.querySelector('[data-input="name"]');
  const priceEl = UI.dialogNewItem.querySelector('[data-input="price"]');
  quantityEl.value = 1;
  productEl.value = "";
  priceEl.value = null;
  UI.dialogNewItem.showModal();
});

UI.dialogNewItem.addEventListener("close", () => {
  // Capture user info about the product and
  // send it through the event detail object

  const dialogEl = UI.dialogNewItem;
  const quantityEl = dialogEl.querySelector('[data-input="quantity"]');
  const priceEl = dialogEl.querySelector('[data-input="price"]');
  const currencyEl = dialogEl.querySelector('[data-input="currency"]');
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

    UI.dialogNewItem.dispatchEvent(updateList);
  }
});

UI.newWeightedItem.addEventListener("pointerdown", () => {
  // Show up the dialog box to add a new weighted items
  // just if the exchangeRate is set

  if (!("exchangeRate" in localStorage)) {
    alert("La tasa de cambio no ha sido configurada");
    return;
  }

  const productEl = UI.dialogNewweightedItem.querySelector(
    '[data-input="name"]'
  );
  const priceEl = UI.dialogNewweightedItem.querySelector(
    '[data-input="price"]'
  );
  const weightEl = UI.dialogNewweightedItem.querySelector(
    '[data-input="weight"]'
  );
  productEl.value = "";
  priceEl.value = null;
  weightEl.value = null;
  UI.dialogNewweightedItem.showModal();
});

UI.dialogNewweightedItem.addEventListener("close", () => {
  // Capture user info about the weighted product
  // and send it through the event detail object

  const dialogEl = UI.dialogNewweightedItem;
  const weightEl = dialogEl.querySelector('[data-input="weight"]');
  const priceEl = dialogEl.querySelector('[data-input="price"]');
  const currencyEl = dialogEl.querySelector('[data-input="currency"]');
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

    UI.dialogNewItem.dispatchEvent(updateList);
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
  let price = e.detail.price;
  const id = e.detail.id;

  if (currency === "bs") {
    price = price / State.exchangeRate;
  }
  State.savedItems.push(
    new Item({ quantity, weight, product, type, price, id })
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
    const priceBs =
      calculateTotal(item) * Number.parseFloat(State.exchangeRate);
    const product = new Product();
    product.loadData(
      `${item.quantity || item.weight.toString().concat(" Kg")} ${
        item.product
      }`,
      priceBs.toFixed(2),
      item.id
    );
    UI.itemContainer.appendChild(product);
  });

  UI.mainContainer.dispatchEvent(renderTotalUSD);
});

UI.mainContainer.addEventListener("renderTotalUSD", () => {
  const total = State.savedItems.reduce(
    (acc, current) => acc + calculateTotal(current),
    0
  );
  UI.totalPriceUSD.innerText = total.toFixed(2);
  renderTotalBs.detail.totalInUSD = total;
  UI.mainContainer.dispatchEvent(renderTotalBs);
});

UI.mainContainer.addEventListener("renderTotalBs", (e) => {
  // Exchange the product prices from USD to Bs
  let total = e.detail.totalInUSD;
  total *= Number.parseFloat(State.exchangeRate);
  UI.totalPriceBs.innerText = total.toFixed(2);
});

// -------------
// Initial setup

function init() {
  if (!("exchangeRate" in localStorage)) {
    UI.exchangeRateEl.innerText = 0;
    alert("Tasa de cambio no configurada");
    return;
  }
  const exRate = localStorage.getItem("exchangeRate");
  State.exchangeRate = exRate;
  UI.exchangeRateEl.innerText = Number.parseFloat(exRate).toFixed(2);
  UI.mainContainer.dispatchEvent(renderList);
}

init();
