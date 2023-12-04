const mongoose = require("mongoose");
const FishingGroup = mongoose.model("FishingGroup");
const User = mongoose.model("User");

/**
 * @openapi
 *  /fishing-group:
 *   get:
 *    summary: Retrieve all fishing groups.
 *    description: Retrieve all **fishing groups**.
 *    tags: [FishingGroup]
 *    responses:
 *     '200':
 *      description: <b>OK</b>, with list of fishing groups.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/FishingGroup'
 *        example:
 *         - _id: 635a62f5dc5d7968e68467e3
 *           name: Ljubljana group
 *           creator: John Doe
 *     '404':
 *      description: <b>Not Found</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "No fishing groups found."
 *     '500':
 *      description: <b>Internal Server Error</b>, with error message.
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *        example:
 *         message: "Database not available."
 */
const fishingGroupGetAll = async (req, res) => {
  try {
    let fishingGroups = await FishingGroup.find();
    if (!fishingGroups || fishingGroups.length == 0)
      res.status(404).json({ message: "No fishing groups found." });
    else res.status(200).json(fishingGroups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @openapi
 * /fishing-group:
 *  post:
 *   summary: Add a new fishing group.
 *   description: Add a new **fishing group**.
 *   tags: [FishingGroup]
 *   security:
 *    - jwt: []
 *   requestBody:
 *    description: New fishing group's data.
 *    required: true
 *    content:
 *     application/x-www-form-urlencoded:
 *      schema:
 *       type: object
 *       properties:
 *        name:
 *         type: string
 *         description: <b>name</b> of fishing group
 *         example: Ljubljana fishing club
 *        description:
 *         type: string
 *         description: <b>description</b> of the fishing group
 *         example: We fish in Ljubljana!
 *       required:
 *        - name
 *   responses:
 *    '201':
 *     description: <b>Created</b>, with details.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/FishingGroup'
 *    '400':
 *     description: <b>Bad Request</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        name and type are required.:
 *         value:
 *          message: Parameter 'name' is required.
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
const fishingGroupCreate = async (req, res) => {
  getAuthor(req, res, async (req, res, author) => {
    try {
      if (!req.body.name) {
        return res.status(400).json({
          message: "Parameter 'name' is required.",
        });
      }
      const fishingGroupData = {
        name: req.body.name,
        creator: author.email,
        users: [author.email],
      };
      if (req.body.description) {
        fishingGroupData.description = req.body.description;
      }
      const fishingGroup = await FishingGroup.create(fishingGroupData);
      if (fishingGroup) {
        if (!author.fishingGroup) {
          author.fishingGroup = [];
        }
        author.fishingGroup.push(fishingGroup._id);
        await author.save();
        res.status(201).json(fishingGroup);
      } else {
        res
          .status(500)
          .json({ message: "Failed to create the fishing group." });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
};

/**
 * @openapi
 * /fishing-group/{fishingGroupId}:
 *  put:
 *   summary: Change existing fishing group.
 *   description: Change existing **fishing group** with given unique identifier.
 *   tags: [FishingGroup]
 *   security:
 *    - jwt: []
 *   parameters:
 *    - name: fishingGroupId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      description: <b>unique identifier</b> of a fishing group
 *      required: true
 *      example: 635a62f5dc5d7968e6846914
 *   requestBody:
 *    description: Fishing group's name and description.
 *    required: true
 *    content:
 *     application/x-www-form-urlencoded:
 *      schema:
 *       type: object
 *       properties:
 *        name:
 *         type: string
 *         description: <b>name</b> of a fishing group
 *         example: New group name
 *        description:
 *         type: string
 *         description: <b>description</b> of a fishing group
 *         example: Same group with a new description.
 *   responses:
 *    '200':
 *     description: <b>OK</b>, with updated details.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/FishingGroup'
 *    '400':
 *     description: <b>Bad Request</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        fishingGroupId is required:
 *         value:
 *          message: Path parameter 'fishingGroupId' is required.
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
 *          message: Fishing group with id '735a62f5dc5d7968e6846914' not found.
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const fishingGroupUpdateOne = async (req, res) => {
  try {
    const fishingGroup = await FishingGroup.findById(req.params.fishingGroupId);
    if (!fishingGroup) {
      return res.status(404).json({
        message: `Fishing group with id '${req.params.fishingGroupId}' not found`,
      });
    }
    if (!req.body.name && !req.body.description) {
      return res.status(400).json({
        message: `At least one of the body parameters is required.`,
      });
    }
    getAuthor(req, res, async (req, res, author) => {
      if (fishingGroup.creator !== author.email && author.role !== "admin") {
        return res.status(403).json({
          message: "Not authorized to update this trip.",
        });
      }
      if (req.body.name) {
        fishingGroup.name = req.body.name;
      }
      if (req.body.description) {
        fishingGroup.description = req.body.description;
      }
      await fishingGroup.save();
      res.status(200).json(fishingGroup);
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @openapi
 * /fishing-group/{fishingGroupId}/users:
 *  put:
 *   summary: Add users to existing fishing group.
 *   description: Add users to existing **fishing group** with given unique identifier.
 *   tags: [FishingGroup]
 *   security:
 *    - jwt: []
 *   parameters:
 *    - name: fishingGroupId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      description: <b>unique identifier</b> of a fishing group
 *      required: true
 *      example: 635a62f5dc5d7968e6846914
 *   requestBody:
 *    description: Fishing group's new users.
 *    required: true
 *    content:
 *     application/x-www-form-urlencoded:
 *      schema:
 *       type: object
 *       properties:
 *        users:
 *         type: array
 *         items:
 *          type: string
 *         description: emails's of <b>new users</b> of a fishing group
 *         example: [test@mail.com]
 *       required:
 *        - users
 *   responses:
 *    '200':
 *     description: <b>OK</b>, with updated details.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/FishingGroup'
 *    '400':
 *     description: <b>Bad Request</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        fishingGroupId is required:
 *         value:
 *          message: Path parameter 'fishingGroupId' is required.
 *        at least one body parameter is required:
 *         value:
 *          message: Body parameter 'users' is required.
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
 *          message: Fishing group with id '735a62f5dc5d7968e6846914' not found.
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const fishingGroupAddUsers = async (req, res) => {
  try {
    const fishingGroup = await FishingGroup.findById(req.params.fishingGroupId);
    if (!fishingGroup) {
      return res.status(404).json({
        message: `Fishing group with id '${req.params.fishingGroupId}' not found`,
      });
    }
    if (!req.body.users) {
      return res.status(400).json({
        message: `Body parameter 'users' is required.`,
      });
    }
    const userEmails = req.body.users.split(",");
    getAuthor(req, res, async (req, res, author) => {
      if (fishingGroup.creator !== author.email && author.role !== "admin") {
        return res.status(403).json({
          message: "Not authorized to update this trip.",
        });
      }
      const usersToAdd = [];
      for (const userEmail of userEmails) {
        const newUser = await User.findOne({ email: userEmail });
        if (newUser) {
          if (!newUser.fishingGroup) {
            newUser.fishingGroup = [];
          }
          if (!newUser.fishingGroup.includes(fishingGroup._id)) {
            newUser.fishingGroup.push(fishingGroup._id);
            usersToAdd.push(newUser.save());
          }
        }
      }
      await Promise.all(usersToAdd);
      fishingGroup.users = [...new Set(fishingGroup.users.concat(userEmails))];
      await fishingGroup.save();
      res.status(200).json(fishingGroup);
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @openapi
 * /fishing-group/{fishingGroupId}:
 *  delete:
 *   summary: Delete existing fishing group.
 *   description: Delete existing **fishing group** with a given unique identifier.
 *   tags: [FishingGroup]
 *   security:
 *    - jwt: []
 *   parameters:
 *    - name: fishingGroupId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      description: <b>unique identifier</b> of fishing group
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
 *        message: Path parameter 'fishingGroupId' is required.
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
 *        message: Not authorized to delete this fishing group.
 *    '404':
 *     description: <b>Not Found</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        fishing group not found:
 *         value:
 *          message: Fishing group with id '735a62f5dc5d7968e6846914' not found.
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const fishingGroupDeleteOne = async (req, res) => {
  try {
    const fishingGroup = await FishingGroup.findById(req.params.fishingGroupId);

    if (!fishingGroup) {
      return res.status(404).json({
        message: `Fishing group with id '${req.params.fishingGroupId}' not found`,
      });
    }

    getAuthor(req, res, async (req, res, author) => {
      if (fishingGroup.creator !== author.email && author.role !== "admin") {
        return res.status(403).json({
          message: "Not authorized to delete this trip.",
        });
      }
      const usersToRemove = [];
      for (const user of fishingGroup.users) {
        const newUser = await User.findOne({ email: user });
        if (newUser) {
          if (newUser.fishingGroup) {
            const index = newUser.fishingGroup.indexOf(fishingGroup._id);
            if (index !== -1) {
              newUser.fishingGroup.splice(index, 1);
              usersToRemove.push(newUser.save());
            }
          }
        }
      }
      await Promise.all(usersToRemove);
      await FishingGroup.deleteOne({ _id: req.params.fishingGroupId });
      res.status(204).json({
        message: `Fishing group with id '${req.params.fishingGroupId}' successfully deleted`,
      });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @openapi
 * /fishing-group/{fishingGroupId}/users-remove:
 *  put:
 *   summary: Delete existing user of the fishing group.
 *   description: Delete existing **user** with a given unique identifier.
 *   tags: [FishingGroup]
 *   security:
 *    - jwt: []
 *   parameters:
 *    - name: fishingGroupId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      description: <b>unique identifier</b> of fishing group
 *      required: true
 *      example: 635a62f5dc5d7968e6846914
 *   requestBody:
 *    description: Fishing group's users to remove.
 *    required: true
 *    content:
 *     application/x-www-form-urlencoded:
 *      schema:
 *       type: object
 *       properties:
 *        users:
 *         type: array
 *         items:
 *          type: string
 *         description: emails's of <b>users</b> to remove from a fishing group
 *         example: [test@mail.com]
 *       required:
 *        - users
 *   responses:
 *    '200':
 *     description: <b>OK</b>, with updated details.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/FishingGroup'
 *    '400':
 *     description: <b>Bad Request</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Path parameters 'fishingGroupId' and 'userId' are required.
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
 *        message: Not authorized to delete this user from a fishing group.
 *    '404':
 *     description: <b>Not Found</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        fishing group not found:
 *         value:
 *          message: Fishing group with id '735a62f5dc5d7968e6846914' not found.
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const fishingGroupDeleteOneUser = async (req, res) => {
  try {
    const fishingGroup = await FishingGroup.findById(req.params.fishingGroupId);
    if (!fishingGroup) {
      return res.status(404).json({
        message: `Fishing group with id '${req.params.fishingGroupId}' not found`,
      });
    }
    getAuthor(req, res, async (req, res, author) => {
      if (fishingGroup.creator !== author.email && author.role !== "admin") {
        return res.status(403).json({
          message: "Not authorized to delete users from this fishing group.",
        });
      }
      const usersToRemove = req.body.users.split(",");
      const updatedUsers = [];
      for (const userEmail of usersToRemove) {
        if (userEmail !== fishingGroup.creator) {
          const user = await User.findOne({ email: userEmail });
          if (user) {
            // Remove the fishing group from the user
            if (user.fishingGroup) {
              user.fishingGroup = user.fishingGroup.filter(
                (groupId) => groupId !== fishingGroup._id
              );
            }
            // Save the user
            await user.save();
            updatedUsers.push(user);
          }
        }
      }
      // Update the fishing group's user list
      fishingGroup.users = fishingGroup.users.filter(
        (userEmail) => !usersToRemove.includes(userEmail)
      );
      await fishingGroup.save();
      res.status(200).json(fishingGroup);
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
  fishingGroupGetAll,
  fishingGroupCreate,
  fishingGroupUpdateOne,
  fishingGroupDeleteOne,
  fishingGroupAddUsers,
  fishingGroupDeleteOneUser,
};
