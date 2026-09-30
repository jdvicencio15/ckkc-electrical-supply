export const roundMoney = (value) => {
  return (
    Math.round(
      (Number(value) + Number.EPSILON) * 100
    ) / 100
  );
};

export const toCents = (value) => {
  return Math.round(
    (Number(value) + Number.EPSILON) * 100
  );
};

export const fromCents = (cents) => {
  return cents / 100;
};