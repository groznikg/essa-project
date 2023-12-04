const mongoose = require("mongoose");

/**
 * @openapi
 * components:
 *  schemas:
 *   Comment:
 *    type: object
 *    description: Comment about fishing trip.
 *    properties:
 *     _id:
 *      type: string
 *      description: <b>unique identifier</b> of comment
 *      example: 635a62f5dc5d7968e68464be
 *     author:
 *      type: string
 *      description: <b>name of the author</b> of the comment
 *      example: test@test.com
 *     comment:
 *      type: string
 *      description: <b>comment</b> about the location
 *      example: What bait did you use?
 *     createdOn:
 *      type: string
 *      description: <b>date</b> of the comment <b>creation</b>
 *      format: date-time
 *      example: 2022-12-25T17:43:00.000Z
 *    required:
 *     - _id
 *     - author
 *     - comment
 *     - createdOn
 */
const commentSchema = new mongoose.Schema({
  author: { type: String, required: [true, "Author is required!"] },
  comment: { type: String, required: [true, "Comment is required!"] },
  createdOn: { type: Date, default: Date.now },
});

/**
 * @openapi
 * components:
 *  schemas:
 *   Fish:
 *    type: object
 *    description: Fish caught on a fishing trip.
 *    properties:
 *     _id:
 *      type: string
 *      description: <b>unique identifier</b> of fish
 *      example: 635a62f5dc5d7968e68464be
 *     species:
 *      type: string
 *      description: <b>species</b> of the fish
 *      example: Carp
 *     weight:
 *      type: number
 *      description: <b>weight</b> of the fsh in kg
 *      example: 5.21
 *     description:
 *      type: string
 *      description: <b>description</b> of the fish
 *      example: She is a real beauty
 *    required:
 *     - _id
 *     - species
 */
const fishSchema = new mongoose.Schema({
  species: { type: String, required: [true, "Species is required!"] },
  weight: { type: Number },
  description: { type: String },
});

/**
 * @openapi
 * components:
 *  schemas:
 *   Trip:
 *    type: object
 *    description: Fishing <b>trip</b>.
 *    properties:
 *     _id:
 *      type: string
 *      description: unique identifier
 *     name:
 *      type: string
 *      description: name of the trip
 *     type:
 *      type: string
 *      description: type of the fish
 *     user:
 *      type: string
 *      description: email of the fisherman
 *     description:
 *      type: string
 *      description: description of the trip
 *     fish:
 *      type: array
 *      items:
 *       $ref: '#/components/schemas/Fish'
 *     coordinates:
 *      type: array
 *      items:
 *       type: number
 *      minItems: 2
 *      maxItems: 2
 *      description: GPS coordinates of the trip
 *     comments:
 *      type: array
 *      items:
 *       $ref: '#/components/schemas/Comment'
 *    required:
 *     - _id
 *     - name
 *     - type
 *     - user
 */
const tripSchema = mongoose.Schema({
  name: { type: String, required: [true, "Name is required!"] },
  time: { type: Date, default: Date.now, required: [true, "Time is required"] },
  type: { type: String, required: [true, "Type is required!"] },
  user: { type: String, required: [true, "User is required!"] },
  description: { type: String },
  fish: { type: [fishSchema] },
  coordinates: {
    type: [Number],
    validate: {
      validator: (v) => Array.isArray(v) && v.length == 2,
      message: "Coordinates must be an array of two numbers!",
    },
    index: "2dsphere",
  },
  comments: {
    type: [commentSchema],
  },
});

mongoose.model("Trip", tripSchema, "Trips");
