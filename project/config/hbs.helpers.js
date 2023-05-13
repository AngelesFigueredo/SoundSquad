module.exports = (hbs) => {
  hbs.registerHelper("ifEquals", (a, b) => {
    return a == b;
  });

  hbs.registerHelper("ne", (a, b) => {
    return a != b;
  });
};
