export const formatMoney = (amount: number | string) => {
  if (amount === undefined) {
    amount = 0;
  } else if (typeof amount === "string") {
    amount = parseFloat(amount);
  }

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};
