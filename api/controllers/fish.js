const mongoose = require("mongoose");
const Trip = mongoose.model("Trip");
const User = mongoose.model("User");

/**
 * @openapi
 * /trips/{tripId}/fish:
 *  post:
 *   summary: Add a new fish to a given trip.
 *   description: Add a new **fish** with species, weight and description to a trip with given unique identifier.
 *   tags: [Fish]
 *   security:
 *    - jwt: []
 *   parameters:
 *    - name: tripId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      description: <b>unique identifier</b> of trip
 *      required: true
 *      example: 635a62f5dc5d7968e6846914
 *   requestBody:
 *    description: Fish's species, weight and description.
 *    required: true
 *    content:
 *     application/x-www-form-urlencoded:
 *      schema:
 *       type: object
 *       properties:
 *        species:
 *         type: string
 *         description: <b>species</b> of fish
 *         example: Carp
 *        weight:
 *         type: number
 *         description: <b>weight</b> of fish in kg
 *         example: 5.21
 *        description:
 *         type: string
 *         description: <b>description</b> of fish
 *         example: She is a real beauty
 *       required:
 *        - species
 *   responses:
 *    '201':
 *     description: <b>Created</b>, with fish details.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Fish'
 *    '400':
 *     description: <b>Bad Request</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        tripId is required:
 *         value:
 *          message: Path parameter 'tripId' is required.
 *        species is required:
 *         value:
 *          message: Body parameter 'species' is required.
 *    '401':
 *     description: <b>Unauthorized</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        no token provided:
 *         value:
 *          message: No authorization token was found.
 *        user not found:
 *         value:
 *          message: User not found.
 *    '403':
 *     description: <b>Forbidden</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Not authorized to add fish to this trip.
 *    '404':
 *     description: <b>Not Found</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Trip with id '735a62f5dc5d7968e68467e3' not found.
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const fishCreate = async (req, res) => {
  const { tripId } = req.params;
  if (!tripId)
    res.status(400).json({ message: "Path parameter 'tripId' is required." });
  else {
    try {
      let trip = await Trip.findById(req.params.tripId).exec();
      if (!trip) {
        res.status(404).json({
          message: `Trip with id '${req.params.tripId}' not found.`,
        });
      } else {
        getAuthor(req, res, async (req, res, author) => {
          if (trip.user !== author.email && author.role !== "admin") {
            res.status(403).json({
              message: "Not authorized to add fish to this trip.",
            });
          } else {
            let trip = await Trip.findById(tripId).select("fish").exec();
            doAddFish(req, res, trip);
          }
        });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

const doAddFish = async (req, res, trip) => {
  if (!trip)
    res.status(404).json({
      message: `Trip with id '${req.params.tripId}' not found.`,
    });
  else if (!req.body.species)
    res.status(400).json({
      message: "Body parameter 'species' is required.",
    });
  else {
    let fish = {
      species: req.body.species,
    };
    if (req.body.weight) fish.weight = req.body.weight;
    if (req.body.description) fish.description = req.body.description;
    trip.fish.push(fish);
    try {
      await trip.save();
      res.status(201).json(trip.fish.slice(-1).pop());
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

/**
 * @openapi
 * /trips/{tripId}/fish/{fishId}:
 *  get:
 *   summary: Retrieve a specific fish of a given trip.
 *   description: Retrieve details of a **fish** of a given trip.
 *   tags: [Fish]
 *   parameters:
 *    - name: tripId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      required: true
 *      description: <b>unique identifier</b> of trip
 *      example: 635a62f5dc5d7968e6846574
 *    - name: fishId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      required: true
 *      description: <b>unique identifier</b> of fish
 *      example: 635a62f5dc5d7968e68464be
 *   responses:
 *    '200':
 *     description: <b>OK</b>, with trip details.
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         trip:
 *          type: object
 *          properties:
 *           _id:
 *            type: string
 *            description: <b>unique identifier</b> of trip
 *            example: 635a62f5dc5d7968e6846574
 *           name:
 *            type: string
 *            description: <b>name</b> of the trip
 *            example: Carp fishing on lake Bled
 *         fish:
 *          $ref: '#/components/schemas/Fish'
 *    '404':
 *     description: <b>Not Found</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        trip not found:
 *         value:
 *          message: "Trip with id '73512fc5022f6bd9e0dfe53e' not found."
 *        fish not found:
 *         value:
 *          message: "Fish with id '1' not found."
 *        no fish found:
 *         value:
 *          message: "No fish found."
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const fishReadOne = async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.tripId)
      .select("name fish")
      .exec();
    if (!trip)
      res.status(404).json({
        message: `Trip with id '${req.params.tripId}' not found`,
      });
    else if (!trip.fish || trip.fish.length == 0)
      res.status(404).json({ message: "No fish found." });
    else {
      let fish = trip.fish.id(req.params.fishId);
      if (!fish)
        res.status(404).json({
          message: `Fish with id '${req.params.fishId}' not found.`,
        });
      else {
        res.status(200).json({
          trip: {
            _id: req.params.tripId,
            name: trip.name,
          },
          fish,
          status: "OK",
        });
      }
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @openapi
 * /trips/{tripId}/fish/{fishId}:
 *  put:
 *   summary: Change existing fish to a given trip.
 *   description: Change existing **fish** with species, weight and description to a trip with given unique identifier.
 *   tags: [Fish]
 *   security:
 *    - jwt: []
 *   parameters:
 *    - name: tripId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      description: <b>unique identifier</b> of trip
 *      required: true
 *      example: 635a62f5dc5d7968e6846914
 *    - name: fishId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      description: <b>unique identifier</b> of fish
 *      required: true
 *      example: 636346e7171e084ff4e4bbf9
 *   requestBody:
 *    description: Fish's species, weight and description.
 *    required: true
 *    content:
 *     application/x-www-form-urlencoded:
 *      schema:
 *       type: object
 *       properties:
 *        species:
 *         type: string
 *         description: <b>species</b> of fish
 *         example: Carp
 *        weight:
 *         type: number
 *         description: <b>WEight</b> of fish in kg
 *         example: 5.21
 *        description:
 *         type: string
 *         description: <b>description</b> of fish
 *         example: Very aggressive
 *   responses:
 *    '200':
 *     description: <b>OK</b>, with updated fish details.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Fish'
 *    '400':
 *     description: <b>Bad Request</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        tripId and fishId are required:
 *         value:
 *          message: Path parameters 'tripId' and 'fishId' are required.
 *        species, weight or description is required:
 *         value:
 *          message: At least one of parameters 'species', 'weight' and 'description' are required.
 *    '401':
 *     description: <b>Unauthorized</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        no token provided:
 *         value:
 *          message: No authorization token was found.
 *        user not found:
 *         value:
 *          message: User not found.
 *    '403':
 *     description: <b>Forbidden</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Not authorized to update this fish.
 *    '404':
 *     description: <b>Not Found</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        trip not found:
 *         value:
 *          message: Trip with id '735a62f5dc5d7968e6846914' not found.
 *        fish not found:
 *         value:
 *          message: Fish with id '736346e7171e084ff4e4bbf9' not found.
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const fishUpdateOne = async (req, res) => {
  if (!req.params.tripId || !req.params.fishId)
    res.status(400).json({
      message: "Path parameters 'tripId' and 'fishId' are required.",
    });
  else {
    try {
      let trip = await Trip.findById(req.params.tripId).exec();
      if (!trip)
        res.status(404).json({
          message: `Trip with id '${req.params.tripId}' not found.`,
        });
      else {
        getAuthor(req, res, async (req, res, author) => {
          if (trip.user !== author.email && author.role !== "admin") {
            res.status(403).json({
              message: "Not authorized to update this fish.",
            });
          } else {
            const fish = trip.fish.id(req.params.fishId);
            if (!fish)
              res.status(404).json({
                message: "Fish with id '" + req.params.fishId + "' not found.",
              });
            else if (
              !req.body.species &&
              !req.body.weight &&
              !req.body.description
            ) {
              res.status(400).json({
                message:
                  "At least one of parameters 'species', 'weight' and 'description' are required.",
              });
            } else {
              if (req.body.species) fish.species = req.body.species;
              if (req.body.weight) fish.weight = req.body.weight;
              if (req.body.description) fish.description = req.body.description;
              await trip.save();
              res.status(200).json(fish);
            }
          }
        });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

/**
 * @openapi
 * /trips/{tripId}/fish/{fishId}:
 *  delete:
 *   summary: Delete existing fish from a given trip.
 *   description: Delete existing **fish** with a given unique identifier from a trip with given unique identifier.
 *   tags: [Fish]
 *   security:
 *    - jwt: []
 *   parameters:
 *    - name: tripId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      description: <b>unique identifier</b> of trip
 *      required: true
 *      example: 635a62f5dc5d7968e6846914
 *    - name: fishId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      description: <b>unique identifier</b> of fish
 *      required: true
 *      example: 636346e7171e084ff4e4bbf9
 *   responses:
 *    '204':
 *     description: <b>No Content</b>, with no content.
 *    '400':
 *     description: <b>Bad Request</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Path parameters 'tripId' and 'fishId' are required.
 *    '401':
 *     description: <b>Unauthorized</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        no token provided:
 *         value:
 *          message: No authorization token was found.
 *        user not found:
 *         value:
 *          message: User not found.
 *    '403':
 *     description: <b>Forbidden</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Not authorized to delete this fish.
 *    '404':
 *     description: <b>Not Found</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        trip not found:
 *         value:
 *          message: Trip with id '735a62f5dc5d7968e6846914' not found.
 *        fish not found:
 *         value:
 *          message: Fish with id '736346e7171e084ff4e4bbf9' not found.
 *        no fish found:
 *         value:
 *          message: No fish found.
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const fishDeleteOne = async (req, res) => {
  const { tripId, fishId } = req.params;
  if (!tripId || !fishId)
    res.status(400).json({
      message: "Path parameters 'tripId' and 'fishId' are required.",
    });
  else {
    try {
      let trip = await Trip.findById(req.params.tripId).exec();
      if (!trip)
        res.status(404).json({
          message: `Trip with id '${req.params.tripId}' not found.`,
        });
      else {
        getAuthor(req, res, async (req, res, author) => {
          if (trip.user !== author.email && author.role !== "admin") {
            res.status(403).json({
              message: "Not authorized to delete this fish.",
            });
          } else {
            let trip = await Trip.findById(tripId).select("fish").exec();
            if (!trip)
              res.status(404).json({
                message: `Trip with id '${tripId}' not found.`,
              });
            else if (trip.fish && trip.fish.length > 0) {
              const fish = trip.fish.id(fishId);
              if (!fish)
                res.status(404).json({
                  message: `Fish with id '${fishId}' not found.`,
                });
              else {
                fish.deleteOne();
                await trip.save();
                res.status(204).send();
              }
            } else res.status(404).json({ message: "No fish found." });
          }
        });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

const getAuthor = async (req, res, cbResult) => {
  if (req.auth?.email) {
    try {
      let user = await User.findOne({ email: req.auth.email }).exec();
      if (!user) res.status(401).json({ message: "User not found." });
      else cbResult(req, res, user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = {
  fishCreate,
  fishReadOne,
  fishUpdateOne,
  fishDeleteOne,
};
