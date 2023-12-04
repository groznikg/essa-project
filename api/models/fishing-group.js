const mongoose = require("mongoose");

/**
 * @openapi
 * components:
 *  schemas:
 *   FishingGroup:
 *    type: object
 *    description: <b>Fishing group</b>.
 *    properties:
 *     _id:
 *      type: string
 *      description: unique identifier
 *     name:
 *      type: string
 *      description: name of the Fishing group
 *     creator:
 *      type: string
 *      description: email of creator of the Fishing group
 *     users:
 *      type: array
 *      items:
 *       type: string
 *      description: emails of members of the Fishing group
 *     description:
 *      type: string
 *      description: description of the Fishing group
 *    required:
 *     - _id
 *     - name
 */
const fishingGroupSchema = mongoose.Schema({
  name: { type: String, required: [true, "Name is required!"] },
  creator: { type: String, required: [true, "Creator is required"] },
  users: { type: [String] },
  description: { type: String },
});

mongoose.model("FishingGroup", fishingGroupSchema, "FishingGroups");
