const isLoggedIn = (req, res, next) => {
  if (req.session.currentUser) {
    next();
  } else {
    res.render("auth/login-form", { errorMessage: "Debes iniciar sesión" });
    return;
  }
};

const isLoggedOut = (req, res, next) => {
  if (!req.session.currentUser) {
    next();
  } else {
    res.redirect("/");
  }
};

const checkRole =
  (roles = []) =>
  (req, res, next) => {
    if (roles.includes(req.session.currentUser.role)) {
      next();
    } else {
      //chequear a dónde redirecciona esto, y poner el errorMessage en todas las páginas que sean susceptibles a devolver un not permission
      res.render("auth/login", { errorMessage: "No tienes permiso." });
    }
  };

module.exports = { isLoggedIn, isLoggedOut, checkRole };
