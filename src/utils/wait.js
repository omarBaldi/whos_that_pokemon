//? implement clearTimeout
export const wait = (ms = 1000) => {
  return new Promise((resolve, _reject) => setTimeout(resolve, ms));
};
