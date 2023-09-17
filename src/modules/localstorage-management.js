// localstorage management module
import { State } from "./state.js";

export function saveList() {
  localStorage.setItem("savedItems", JSON.stringify(State.savedItems));
}

export function readList() {
  const savedItems = JSON.parse(localStorage?.savedItems);
  if (Array.isArray(savedItems)) {
    return savedItems;
  }
  delete localStorage.savedItems;
  return [];
}

export function saveExRate() {
  localStorage.setItem("exchangeRate", State.exchangeRate);
}
