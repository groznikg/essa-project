const mongoose = require("mongoose");
const Trip = mongoose.model("Trip");
const User = mongoose.model("User");
const NodeGeocoder = require("node-geocoder");

/**
 * @openapi
 *  /trips/distance:
 *   get:
 *    summary: Retrieve fishing trips within a given distance.
 *    description: Retrieve **fishing trips** within a given distance.
 *    tags: [Trips]
 *    parameters:
 *     - name: lng
 *       in: query
 *       required: true
 *       description: <b>longitude</b> of the trip
 *       schema:
 *        type: number
 *        minimum: -90
 *        maximum: 90
 *       example: 15.272580993
 *     - name: lat
 *       in: query
 *       required: true
 *       description: <b>latitude</b> of the trip
 *       schema:
 *        type: number
 *        minimum: -180
 *        maximum: 180
 *       example: 46.2195704036
 *     - name: distance
 *       in: query
 *       schema:
 *        type: number
 *        minimum: 0
 *        default: 5
 *       description: maximum <b>distance</b> in kilometers
 *     - name: nResults
 *       in: query
 *       schema:
 *        type: integer
 *        minimum: 1
 *        default: 10
 *       description: maximum <b>number of results</b>
 *    responses:
 *     '200':
 *      description: <b>OK</b>, with list of trips.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/Trip'
 *        example:
 *         - _id: 635a62f5dc5d7968e68467e3
 *           name: Carp fishing on lake Bled
 *           time: 2023-10-19T16:16:57.108Z
 *           type: Carp fishing
 *           user: test@test.com
 *           description: Catching big carp on a chilli october morning.
 *           coordinates: [46.2195704036, 15.272580993]
 *     '400':
 *      description: <b>Bad Request</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "Query parameters 'lng' and 'lat' are required"
 *     '404':
 *      description: <b>Not Found</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "No trips found."
 *     '500':
 *      description: <b>Internal Server Error</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "geo near accepts just one argument when querying for a GeoJSON point. Extra field found: $maxDistance: 5000.0"
 */
const tripsByDistance = async (req, res) => {
  let lng = parseFloat(req.query.lng);
  let lat = parseFloat(req.query.lat);
  let distance = parseFloat(req.query.distance);
  distance = 1000 * (isNaN(distance) ? 5 : distance);
  let nResults = parseInt(req.query.nResults);
  nResults = isNaN(nResults) ? 10 : nResults;
  if (!lng || !lat)
    res
      .status(400)
      .json({ message: "Query parameters 'lng' and 'lat' are required." });
  else {
    try {
      let trips = await Trip.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [lat, lng],
            },
            distanceField: "distance",
            spherical: true,
            maxDistance: distance,
          },
        },
        { $project: { comments: false, id: false } },
        { $limit: nResults },
      ]);
      if (!trips || trips.length == 0)
        res.status(404).json({ message: "No trips found." });
      else res.status(200).json(trips);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

/**
 * @openapi
 *  /trips/address:
 *   get:
 *    summary: Retrieve fishing trips within a given distance around an address.
 *    description: Retrieve **fishing trips** within a given distance around an address.
 *    tags: [Trips]
 *    parameters:
 *     - name: address
 *       in: query
 *       schema:
 *        type: string
 *       description: <b>address</b>
 *     - name: distance
 *       in: query
 *       schema:
 *        type: number
 *        minimum: 0
 *        default: 5
 *       description: maximum <b>distance</b> in kilometers
 *     - name: nResults
 *       in: query
 *       schema:
 *        type: integer
 *        minimum: 1
 *        default: 10
 *       description: maximum <b>number of results</b>
 *    responses:
 *     '200':
 *      description: <b>OK</b>, with list of trips.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/Trip'
 *        example:
 *         - _id: 635a62f5dc5d7968e68467e3
 *           name: Carp fishing on lake Bled
 *           time: 2023-10-19T16:16:57.108Z
 *           type: Carp fishing
 *           user: test@test.com
 *           description: Catching big carp on a chilli october morning.
 *           coordinates: [15.272580993, 46.2195704036]
 *     '400':
 *      description: <b>Bad Request</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "Query parameter 'address' is required"
 *     '404':
 *      description: <b>Not Found</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "No trips found."
 *     '500':
 *      description: <b>Internal Server Error</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "geo near accepts just one argument when querying for a GeoJSON point. Extra field found: $maxDistance: 5000.0"
 */
const tripsByAddressAndDistance = async (req, res) => {
  if (!req.query.address)
    res.status(400).json({ message: "Query parameter 'address' is required." });
  else {
    try {
      if (!process.env.GOOGLE_API_KEY) {
        res.status(400).json({ message: "Google API key is required" });
      } else {
        const options = {
          provider: "google", // Use 'opencage' as the provider
          httpAdapter: "https", // Specify the HTTP adapter
          apiKey: process.env.GOOGLE_API_KEY, // Provide your OpenCage Data API key here
        };

        const geocoder = NodeGeocoder(options);
        const address = req.query.address;
        // Geocode the address to get latitude and longitude
        const geocodeResult = await geocoder.geocode(address);
        if (!geocodeResult || geocodeResult.length === 0) {
          res
            .status(404)
            .json({ message: "Could not geocode the provided address." });
          return;
        }

        // Extract latitude and longitude from the geocode result
        const lat = geocodeResult[0].latitude;
        const lng = geocodeResult[0].longitude;
        let distance = parseFloat(req.query.distance);
        distance = 1000 * (isNaN(distance) ? 5 : distance);
        let nResults = parseInt(req.query.nResults);
        nResults = isNaN(nResults) ? 10 : nResults;
        let trips = await Trip.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [lat, lng],
              },
              distanceField: "distance",
              spherical: true,
              maxDistance: distance,
            },
          },
          { $project: { comments: false, id: false } },
          { $limit: nResults },
        ]);
        if (!trips || trips.length == 0)
          res.status(404).json({ message: "No trips found." });
        else res.status(200).json(trips);
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

/**
 * @openapi
 * /trips:
 *  post:
 *   summary: Add a new trip.
 *   description: Add a new **trip**.
 *   tags: [Trips]
 *   security:
 *    - jwt: []
 *   requestBody:
 *    description: New trip's data.
 *    required: true
 *    content:
 *     application/x-www-form-urlencoded:
 *      schema:
 *       type: object
 *       properties:
 *        name:
 *         type: string
 *         description: <b>name</b> of trip
 *         example: Carp fishing on lake Bled
 *        time:
 *         type: string
 *         description: <b>time</> of trip
 *         example: 2023-10-19T16:16:57.108Z
 *        type:
 *         type: string
 *         description: <b>type</b> of trip
 *         example: Carp fishing
 *        description:
 *         type: string
 *         description: <b>description</b> of the trip
 *         example: Catching big carp on a chilli october morning.
 *        coordinates:
 *         type: array
 *         minItems: 2
 *         maxItems: 2
 *         items:
 *          type: number
 *         description: <b>coordinates</b> of the trip
 *         example: [15.272580993, 46.2195704036]
 *       required:
 *        - name
 *        - time
 *        - type
 *   responses:
 *    '201':
 *     description: <b>Created</b>, with details.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Trip'
 *    '400':
 *     description: <b>Bad Request</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        name and type are required.:
 *         value:
 *          message: Parameters 'name' and 'type' are required.
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
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const tripsCreate = async (req, res) => {
  getAuthor(req, res, async (req, res, author) => {
    try {
      if (!req.body.name || !req.body.type || !req.body.time) {
        res.status(400).json({
          message: "Parameters 'name', 'time' and 'type' are required.",
        });
      } else {
        let trip = {
          name: req.body.name,
          time: req.body.time,
          type: req.body.type,
          user: author.email,
        };
        if (req.body.description) trip.description = req.body.description;
        if (req.body.coordinates)
          trip.coordinates = req.body.coordinates.split(",");
        await Trip.create(trip);
        res.status(201).json(trip);
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
};

/**
 * @openapi
 * /trips/{tripId}:
 *   get:
 *    summary: Retrieve details of a given trip.
 *    description: Retrieve **details** for a given trip.
 *    tags: [Trips]
 *    parameters:
 *    - name: tripId
 *      in: path
 *      required: true
 *      description: <b>unique identifier</b> of a trip
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      example: 635a62f5dc5d7968e68464c1
 *    responses:
 *     '200':
 *      description: <b>OK</b>, with trip details.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/Trip'
 *        example:
 *         - _id: 635a62f5dc5d7968e68467e3
 *           name: Carp fishing on lake Bled
 *           time: 2023-10-19T16:16:57.108Z
 *           type: Carp fishing
 *           user: test@test.com
 *           description: Catching big carp on a chilli october morning.
 *           coordinates: [15.272580993, 46.2195704036]
 *     '404':
 *      description: <b>Not Found</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "Trip with id '735a62f5dc5d7968e68464c1' not found."
 *     '500':
 *      description: <b>Internal Server Error</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "Cast to ObjectId failed for value \"1\" (type string) at path \"_id\" for model \"Trip\""
 */
const tripsReadOne = async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.tripId).select("-id").exec();
    if (!trip) {
      res.status(404).json({
        message: `Trip id '${req.params.tripId}' not found`,
      });
    } else res.status(200).json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @openapi
 * /trips/{tripId}:
 *  put:
 *   summary: Change existing trip.
 *   description: Change existing **trip** with given unique identifier.
 *   tags: [Trips]
 *   security:
 *    - jwt: []
 *   parameters:
 *    - name: tripId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      description: <b>unique identifier</b> of a trip
 *      required: true
 *      example: 635a62f5dc5d7968e6846914
 *   requestBody:
 *    description: Trips's name, type, description and coordinates.
 *    required: true
 *    content:
 *     application/x-www-form-urlencoded:
 *      schema:
 *       type: object
 *       properties:
 *        name:
 *         type: string
 *         description: <b>name</b> of a trip
 *         example: New trip name
 *        time:
 *         type: string
 *         description: <b>time</> of trip
 *         example: 2023-10-19T16:16:57.108Z
 *        type:
 *         type: string
 *         description: <b>type</b> of a trip
 *         example: Sea fishing
 *        description:
 *         type: string
 *         description: <b>description</b> of a trip
 *         example: Hanging out with a bunch of friends
 *        coordinates:
 *         type: array
 *         items:
 *          type: number
 *         minItems: 2
 *         maxItems: 2
 *         description: <b>coordinates</b> of a trip
 *         example: [15.272580993, 46.2195704036]
 *   responses:
 *    '200':
 *     description: <b>OK</b>, with updated comment details.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Trip'
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
 *        at least one body parameter is required:
 *         value:
 *          message: At least on of body parameters is required.
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
 *        message: Not authorized to update this trip.
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
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const tripsUpdateOne = async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.tripId).exec();
    if (!trip) {
      res.status(404).json({
        message: `Trip id '${req.params.tripId}' not found`,
      });
    } else {
      getAuthor(req, res, async (req, res, author) => {
        if (trip.user !== author.email && author.role !== "admin") {
          res.status(403).json({
            message: "Not authorized to update this trip.",
          });
        } else {
          if (req.body.name) trip.name = req.body.name;
          if (req.body.time) trip.time = req.body.time;
          if (req.body.type) trip.type = req.body.type;
          if (req.body.description) trip.description = req.body.description;
          if (req.body.coordinates)
            trip.coordinates = req.body.coordinates.split(",");
          await Trip.updateOne({ _id: req.params.tripId }, trip);
          res.status(200).json(trip);
        }
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @openapi
 * /trips/{tripId}:
 *  delete:
 *   summary: Delete existing trip.
 *   description: Delete existing **trip** with a given unique identifier.
 *   tags: [Trips]
 *   security:
 *    - jwt: []
 *   parameters:
 *    - name: tripId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      description: <b>unique identifier</b> of location
 *      required: true
 *      example: 635a62f5dc5d7968e6846914
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
 *        message: Path parameter 'tripId' is required.
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
 *        message: Not authorized to delete this trip.
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
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const tripsDeleteOne = async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.tripId).exec();
    if (!trip) {
      res.status(404).json({
        message: `Trip id '${req.params.tripId}' not found`,
      });
    } else {
      getAuthor(req, res, async (req, res, author) => {
        if (trip.user !== author.email && author.role !== "admin") {
          res.status(403).json({
            message: "Not authorized to delete this trip.",
          });
        } else {
          await Trip.deleteOne({ _id: req.params.tripId }).exec();
          res.status(204).json({
            message: `Trip with id '${req.params.tripId}' successfully deleted`,
          });
        }
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @openapi
 *  /trips:
 *   get:
 *    summary: Retrieve all fishing trips.
 *    description: Retrieve all **fishing trips**.
 *    tags: [Trips]
 *    responses:
 *     '200':
 *      description: <b>OK</b>, with list of trips.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/Trip'
 *        example:
 *         - _id: 635a62f5dc5d7968e68467e3
 *           name: Carp fishing on lake Bled
 *           time: 2023-10-19T16:16:57.108Z
 *           type: Carp fishing
 *           user: test@test.com
 *           description: Catching big carp on a chilli october morning.
 *           coordinates: [15.272580993, 46.2195704036]
 *     '404':
 *      description: <b>Not Found</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "No trips found."
 *     '500':
 *      description: <b>Internal Server Error</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "Database not available."
 */
const tripsGetAll = async (req, res) => {
  try {
    let trips = await Trip.find();
    if (!trips || trips.length == 0)
      res.status(404).json({ message: "No trips found." });
    else res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const tripsGetAllWithPaging = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const take = parseInt(req.query.take) || 10; // Default limit to 10 if not specified

    const totalTrips = await Trip.countDocuments(); // Get the total number of trips
    const totalPages = Math.ceil(totalTrips / take); // Calculate the total number of pages

    const trips = await Trip.find().skip(skip).limit(take);

    if (!trips || trips.length === 0)
      res.status(404).json({ message: "No trips found." });
    else
      res.status(200).json({
        trips,
        totalPages,
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
  tripsByDistance,
  tripsCreate,
  tripsReadOne,
  tripsUpdateOne,
  tripsDeleteOne,
  tripsGetAll,
  tripsByAddressAndDistance,
  tripsGetAllWithPaging,
};
