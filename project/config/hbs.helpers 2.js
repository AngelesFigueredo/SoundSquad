module.exports = (hbs) => {
  hbs.registerHelper("ifEquals", (a, b) => {
    return a == b;
  });
};
