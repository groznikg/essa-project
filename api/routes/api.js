const express = require("express");
const router = express.Router();

const { expressjwt: jwt } = require("express-jwt");
const auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: "payload",
  algorithms: ["HS256"],
});

/* Controllers */
const ctrlTrips = require("../controllers/trips");
const ctrlComments = require("../controllers/comments");
const ctrlFish = require("../controllers/fish");
const ctrlAuthentication = require("../controllers/authentication");
const ctrlFishingGroups = require("../controllers/fishing-group");
const ctrlDB = require("../controllers/db");

/* Trips */
router
  .route("/trips")
  .get(ctrlTrips.tripsGetAll)
  .post(auth, ctrlTrips.tripsCreate);
router.route("/trips-paginate").get(ctrlTrips.tripsGetAllWithPaging);
router.get("/trips/distance", ctrlTrips.tripsByDistance);
router.get("/trips/address", ctrlTrips.tripsByAddressAndDistance);
router
  .route("/trips/:tripId")
  .get(ctrlTrips.tripsReadOne)
  .put(auth, ctrlTrips.tripsUpdateOne)
  .delete(auth, ctrlTrips.tripsDeleteOne);

/* Comments */
router.post("/trips/:tripId/comments", auth, ctrlComments.commentsCreate);
router
  .route("/trips/:tripId/comments/:commentId")
  .get(ctrlComments.commentsReadOne)
  .put(auth, ctrlComments.commentsUpdateOne)
  .delete(auth, ctrlComments.commentsDeleteOne);

/* Fish */
router.post("/trips/:tripId/fish", auth, ctrlFish.fishCreate);
router
  .route("/trips/:tripId/fish/:fishId")
  .get(ctrlFish.fishReadOne)
  .put(auth, ctrlFish.fishUpdateOne)
  .delete(auth, ctrlFish.fishDeleteOne);

/* Fishing groups */
router
  .route("/fishing-group")
  .get(ctrlFishingGroups.fishingGroupGetAll)
  .post(auth, ctrlFishingGroups.fishingGroupCreate);
router
  .route("/fishing-group/:fishingGroupId")
  .put(auth, ctrlFishingGroups.fishingGroupUpdateOne)
  .delete(auth, ctrlFishingGroups.fishingGroupDeleteOne);
router
  .route("/fishing-group/:fishingGroupId/users")
  .put(auth, ctrlFishingGroups.fishingGroupAddUsers);
router
  .route("/fishing-group/:fishingGroupId/users-remove")
  .put(auth, ctrlFishingGroups.fishingGroupDeleteOneUser);

/* Auth */
router.post("/register", ctrlAuthentication.register);
router.post("/login", ctrlAuthentication.login);

router.route("/db").post(ctrlDB.addInitialDB).delete(ctrlDB.deleteData);

module.exports = router;
