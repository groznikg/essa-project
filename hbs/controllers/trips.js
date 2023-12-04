const trips = (req, res) => {
  res.render("trips");
};

const tripDetails = (req, res) => {
  res.render("trip-details");
};
module.exports = {
  trips,
  tripDetails,
};
