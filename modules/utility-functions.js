export function generateId(product) {
  const randomStart = Math.random().toString().slice(-3);
  const randomEnd = Math.random().toString().slice(-3);
  const word = product.split(" ")[0];
  return randomStart + word + randomEnd;
}

export function calculateTotal(item) {
  if (item.type === "unitary") {
    return parseFloat(item.price) * parseInt(item.quantity);
  } else if (item.type === "weighted") {
    return parseFloat(item.price) * parseFloat(item.weight);
  }
}
