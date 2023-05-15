module.exports = (hbs) => {
  hbs.registerHelper("ifEquals", (a, b) => {
    return a == b;
  });

  hbs.registerHelper("ne", (a, b) => {
    return a != b;
  });

  hbs.registerHelper("ifIsTheSame", function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });
};
