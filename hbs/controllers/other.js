const home = (req, res) => {
  res.render("index");
};

const profile = (req, res) => {
  res.render("profile");
};

const register = (req, res) => {
  res.render("register");
};

module.exports = {
  home,
  profile,
  register,
};
