const mongoose = require("mongoose");
const db = require("../models/db");
const User = mongoose.model("User");
const Trip = mongoose.model("Trip");
const FishingGroup = mongoose.model("FishingGroup");
const initialUsers = require("../../data/users.json");
const initialTrips = require("../../data/trips.json");
const initialFishingGroups = require("../../data/fishing-groups.json");

const addInitialDB = async (req, res) => {
  var message = "";

  for (var user of initialUsers) {
    const userFound = await User.findById(user.id);
    if (!userFound) {
      const newUser = new User();
      newUser._id = user.id;
      newUser.name = user.name;
      newUser.email = user.email;
      newUser.role = user.role;
      newUser.fishingGroup = user.fishingGroup;
      newUser.setPassword(user.password);
      await newUser.save();
      message += "Saved user: " + newUser.name + "\n";
    }
  }

  for (var trip of initialTrips) {
    const tripFound = await Trip.findById(trip.id);
    if (!tripFound) {
      const newTrip = new Trip();
      newTrip._id = trip.id;
      newTrip.name = trip.name;
      newTrip.time = trip.time;
      newTrip.type = trip.type;
      newTrip.user = trip.user;
      newTrip.description = trip.description;
      newTrip.coordinates = trip.coordinates;
      newTrip.fish = trip.fish;
      newTrip.comments = trip.comments;
      await newTrip.save();
      message += "Saved trip: " + newTrip.name + "\n";
    }
  }

  Trip.collection.createIndex({ coordinates: "2dsphere" });

  for (var fishingGroup of initialFishingGroups) {
    const fishingGroupFound = await FishingGroup.findById(fishingGroup.id);
    if (!fishingGroupFound) {
      const newFishingGroup = new FishingGroup();
      newFishingGroup._id = fishingGroup.id;
      newFishingGroup.name = fishingGroup.name;
      newFishingGroup.creator = fishingGroup.creator;
      newFishingGroup.description = fishingGroup.description;
      newFishingGroup.users = fishingGroup.users;
      await newFishingGroup.save();
      message += "Saved fishing group: " + newFishingGroup.name + "\n";
    }
  }

  res.status(200).json({ message });
};

const deleteData = async (req, res) => {
  console.log("delete");
  var message = "";
  let users = await User.find().exec();
  if (users.length > 0) {
    User.collection.drop();
    message += "'Users' successfully deleted.\n";
  }
  let trips = await Trip.find().exec();
  if (trips.length > 0) {
    Trip.collection.drop();
    message += "'Trips' successfully deleted.\n";
  }
  let fishingGroups = await FishingGroup.find().exec();
  if (fishingGroups.length > 0) {
    FishingGroup.collection.drop();
    message += "'FishingGroups' successfully deleted.\n";
  }
  res.status(200).json({ message });
};

module.exports = {
  addInitialDB,
  deleteData,
};
