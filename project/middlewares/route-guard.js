const isLoggedIn = (req, res, next) => {
  if (req.session.currentUser) {
    next();
  } else {
    res.render("auth/login-form", { errorMessage: "You must log-in." });
    return;
  }
};

const isLoggedOut = (req, res, next) => {
  if (req.session.currentUser) {
    res.redirect("/login");
  } else {
    next();
  }
};
const checkRole =
  (roles = []) =>
  (req, res, next) => {
    if (roles.includes(req.session.currentUser.role)) {
      next();
    } else {
      //chequear a dónde redirecciona esto, y poner el errorMessage en todas las páginas que sean susceptibles a devolver un not permission
      res.render("auth/login", { errorMessage: "You don't have permissions." });
    }
  };

module.exports = { isLoggedIn, isLoggedOut, checkRole };
