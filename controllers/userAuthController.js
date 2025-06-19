const passport = require('passport');

const userAuthController = {
  showLogin(req, res) {
    res.render('user/login_user', { error: req.query.error });
  },

  login(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.redirect('/user/login?error=' + encodeURIComponent(info.message));
      }
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.redirect('/user/dashboard');  // Change according to your app routes
      });
    })(req, res, next);
  },

  logout(req, res) {
    req.logout(function(err) {
      if (err) return next(err);
      res.redirect('/user/login');
    });
  },

  showSignup(req, res) {
    res.render('user/signup_user', { error: req.query.error || null });
  }
};

module.exports = userAuthController;
