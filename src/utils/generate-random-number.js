export const getRandomNumberBetweenRange = ({ start = 0, end }) => {
  return Math.floor(Math.random() * (end - start)) + start;
};
