function formatPrecision(num: number | string, precision: number = 2) {
  return Number.parseFloat(Number(num).toFixed(precision));
}

export default formatPrecision;
