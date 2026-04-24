const User = require('../models/User');

// MVC Controller for authentication
class AuthController {
  // GET /register
  static getRegister(req, res) {
    res.render('auth/register', {
      title: 'Register',
      error: req.flash('error'),
      success: req.flash('success')
    });
  }

  // POST /register
  static async postRegister(req, res) {
    const { username, email, password, confirmPassword } = req.body;
    try {
      if (!username || !email || !password) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/register');
      }
      if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect('/register');
      }
      const existing = await User.findOne({ $or: [{ email }, { username }] });
      if (existing) {
        req.flash('error', 'Username or email already taken.');
        return res.redirect('/register');
      }
      const user = new User({ username, email, password });
      await user.save();
      req.flash('success', 'Account created! Please log in.');
      res.redirect('/login');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Registration failed. Try again.');
      res.redirect('/register');
    }
  }

  // GET /login
  static getLogin(req, res) {
    res.render('auth/login', {
      title: 'Login',
      error: req.flash('error'),
      success: req.flash('success')
    });
  }

  // POST /login
  static async postLogin(req, res) {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if (!user || !(await user.comparePassword(password))) {
        req.flash('error', 'Invalid credentials.');
        return res.redirect('/login');
      }
      req.session.userId = user._id.toString();
      req.session.username = user.username;
      res.redirect('/dashboard');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Login failed.');
      res.redirect('/login');
    }
  }

  // POST /logout
  static logout(req, res) {
    req.session.destroy(() => res.redirect('/login'));
  }
}

module.exports = AuthController;
