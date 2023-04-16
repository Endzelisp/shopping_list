import {
  UIElem,
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

UIElem.exchangeRateEl.addEventListener("pointerdown", () => {
  // Open up exchange rate dialog box
  UIElem.dialogExchangeRate.showModal();
});

UIElem.dialogExchangeRate.addEventListener("close", () => {
  // Capture info about the exchange rate
  // and save it to local storage

  const exRateInputEl = UIElem.dialogExchangeRate.querySelector(
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
  UIElem.exchangeRateEl.innerText = Number.parseFloat(exRate).toFixed(2);
  Local.saveExRate();

  // Update item's price when the exchange rate changes
  UIElem.dialogExchangeRate.dispatchEvent(renderList);
});

UIElem.newItem.addEventListener("pointerdown", () => {
  // Show up the dialog box to add a new item
  // just if the exchangeRate is set

  if (!("exchangeRate" in localStorage)) {
    alert("La tasa de cambio no ha sido configurada");
    return;
  }

  const quantityEl = UIElem.dialogNewItem.querySelector(
    '[data-input="quantity"]'
  );
  const productEl = UIElem.dialogNewItem.querySelector('[data-input="name"]');
  const priceEl = UIElem.dialogNewItem.querySelector('[data-input="price"]');
  quantityEl.value = 1;
  productEl.value = "";
  priceEl.value = null;
  UIElem.dialogNewItem.showModal();
});

UIElem.dialogNewItem.addEventListener("close", () => {
  // Capture user info about the product and
  // send it through the event detail object

  const dialogEl = UIElem.dialogNewItem;
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

    UIElem.dialogNewItem.dispatchEvent(updateList);
  }
});

UIElem.newWeightedItem.addEventListener("pointerdown", () => {
  // Show up the dialog box to add a new weighted items
  // just if the exchangeRate is set

  if (!("exchangeRate" in localStorage)) {
    alert("La tasa de cambio no ha sido configurada");
    return;
  }

  const productEl = UIElem.dialogNewweightedItem.querySelector(
    '[data-input="name"]'
  );
  const priceEl = UIElem.dialogNewweightedItem.querySelector(
    '[data-input="price"]'
  );
  const weightEl = UIElem.dialogNewweightedItem.querySelector(
    '[data-input="weight"]'
  );
  productEl.value = "";
  priceEl.value = null;
  weightEl.value = null;
  UIElem.dialogNewweightedItem.showModal();
});

UIElem.dialogNewweightedItem.addEventListener("close", () => {
  // Capture user info about the weighted product
  // and send it through the event detail object

  const dialogEl = UIElem.dialogNewweightedItem;
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

    UIElem.dialogNewItem.dispatchEvent(updateList);
  }
});

UIElem.mainContainer.addEventListener("updateList", (e) => {
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
  UIElem.mainContainer.dispatchEvent(renderList);
});

UIElem.mainContainer.addEventListener("renderList", () => {
  // Clear out the actual displayed list of items
  UIElem.clearList();
  const checkObj = State.savedItems.map((item) => item.product);
  if (checkObj.length === 0 && "savedItems" in localStorage) {
    // Runs if the savedItems list is empty
    State.savedItems = Local.read();
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
    UIElem.itemContainer.appendChild(product);
  });

  UIElem.mainContainer.dispatchEvent(renderTotalUSD);
});

UIElem.mainContainer.addEventListener("renderTotalUSD", () => {
  const total = State.savedItems.reduce(
    (acc, current) => acc + calculateTotal(current),
    0
  );
  UIElem.totalPriceUSD.innerText = total.toFixed(2);
  renderTotalBs.detail.totalInUSD = total;
  UIElem.mainContainer.dispatchEvent(renderTotalBs);
});

UIElem.mainContainer.addEventListener("renderTotalBs", (e) => {
  // Exchange the product prices from USD to Bs
  let total = e.detail.totalInUSD;
  total *= Number.parseFloat(State.exchangeRate);
  UIElem.totalPriceBs.innerText = total.toFixed(2);
});

// -----------------
// one time run code

if ("exchangeRate" in localStorage) {
  const exRate = localStorage.getItem("exchangeRate");
  State.exchangeRate = exRate;
  UIElem.exchangeRateEl.innerText = Number.parseFloat(exRate).toFixed(2);
} else {
  alert("Tasa de cambio no configurada");
  UIElem.exchangeRateEl.innerText = 0;
}

UIElem.mainContainer.dispatchEvent(renderList);
