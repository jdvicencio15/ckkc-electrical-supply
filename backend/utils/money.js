const roundMoney = (value) => {
  return Math.round(
    (Number(value) + Number.EPSILON) * 100
  ) / 100;
};

const toCents = (value) => {
  return Math.round(
    (Number(value) + Number.EPSILON) * 100
  );
};

const fromCents = (cents) => {
  return cents / 100;
};

module.exports = {
  roundMoney,
  toCents,
  fromCents,
};