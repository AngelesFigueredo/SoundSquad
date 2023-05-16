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

  // Helper function to check if a new day has started
  hbs.registerHelper("isNewDay", (messages, index) => {
    if (index === 0) {
      return true; // The first message is always a new day
    }

    const currentMessageDate = messages[index].createdAt.toDateString();
    const previousMessageDate = messages[index - 1].createdAt.toDateString();

    return currentMessageDate !== previousMessageDate;
  });

  // Helper function to format the time of createdAt
  hbs.registerHelper("getTime", (createdAt) => {
    const hours = createdAt.getHours().toString().padStart(2, "0");
    const minutes = createdAt.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  });

  // Helper function to format the date of createdAt
  hbs.registerHelper("getDate", (createdAt) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return createdAt.toLocaleDateString(undefined, options);
  });
};
