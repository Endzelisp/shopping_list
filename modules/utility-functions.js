export function generateId(product) {
  const randomStart = Math.random().toString().slice(-3);
  const randomEnd = Math.random().toString().slice(-3);
  const word = product.split(" ")[0];
  return randomStart + word + randomEnd;
}
