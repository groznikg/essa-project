var tecaj = require("../../data/users.json");

var homePage = (req, res) => {
  res.render("index");
};

var pageDB = (req, res) => {
  res.render("db");
};

module.exports = {
  pageDB,
  homePage,
};
