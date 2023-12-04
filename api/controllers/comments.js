const mongoose = require("mongoose");
const Trip = mongoose.model("Trip");
const User = mongoose.model("User");

/**
 * @openapi
 * /trips/{tripId}/comments:
 *  post:
 *   summary: Add a new comment to a given trip.
 *   description: Add a new **comment** with comment's content to a trip with given unique identifier.
 *   tags: [Comments]
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
 *    description: Comment's content.
 *    required: true
 *    content:
 *     application/x-www-form-urlencoded:
 *      schema:
 *       type: object
 *       properties:
 *        comment:
 *         type: string
 *         description: <b>content</b> of comment
 *         example: What bait did you use?
 *       required:
 *        - comment
 *   responses:
 *    '201':
 *     description: <b>Created</b>, with comment details.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Comment'
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
 *        author comment are required:
 *         value:
 *          message: Body parameter 'comment' is required.
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
const commentsCreate = async (req, res) => {
  const { tripId } = req.params;
  if (!tripId)
    res.status(400).json({ message: "Path parameter 'tripId' is required." });
  else {
    try {
      let trip = await Trip.findById(tripId).select("comments").exec();
      doAddComment(req, res, trip);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

const doAddComment = async (req, res, trip) => {
  if (!trip)
    res.status(404).json({
      message: `Trip with id '${req.params.tripId}' not found.`,
    });
  else if (!req.body.comment)
    res.status(400).json({
      message: "Body parameter 'comment' is required.",
    });
  else {
    getAuthor(req, res, async (req, res, author) => {
      trip.comments.push({
        author: author.email,
        comment: req.body.comment,
      });
      try {
        await trip.save();
        res.status(201).json(trip.comments.slice(-1).pop());
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });
  }
};

/**
 * @openapi
 * /trips/{tripId}/comments/{commentId}:
 *  get:
 *   summary: Retrieve a specific comment of a given trip.
 *   description: Retrieve details of a **comment** of a given trip.
 *   tags: [Comments]
 *   parameters:
 *    - name: tripId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      required: true
 *      description: <b>unique identifier</b> of trip
 *      example: 635a62f5dc5d7968e6846574
 *    - name: commentId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      required: true
 *      description: <b>unique identifier</b> of comment
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
 *         comment:
 *          $ref: '#/components/schemas/Comment'
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
 *        comment not found:
 *         value:
 *          message: "Comment with id '1' not found."
 *        no comments found:
 *         value:
 *          message: "No comments found."
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const commentsReadOne = async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.tripId)
      .select("name comments")
      .exec();
    if (!trip)
      res.status(404).json({
        message: `Trip with id '${req.params.tripId}' not found`,
      });
    else if (!trip.comments || trip.comments.length == 0)
      res.status(404).json({ message: "No comments found." });
    else {
      let comment = trip.comments.id(req.params.commentId);
      if (!comment)
        res.status(404).json({
          message: `Comment with id '${req.params.commentId}' not found.`,
        });
      else {
        res.status(200).json({
          trip: {
            _id: req.params.tripId,
            name: trip.name,
          },
          comment,
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
 * /trips/{tripId}/comments/{commentId}:
 *  put:
 *   summary: Change existing comment of a given trip.
 *   description: Change existing **comment** with author's name and comment's content to a trip with given unique identifier.
 *   tags: [Comments]
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
 *    - name: commentId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      description: <b>unique identifier</b> of comment
 *      required: true
 *      example: 636346e7171e084ff4e4bbf9
 *   requestBody:
 *    description: Comment's author and content.
 *    required: true
 *    content:
 *     application/x-www-form-urlencoded:
 *      schema:
 *       type: object
 *       properties:
 *        comment:
 *         type: string
 *         description: <b>content</b> of comment
 *         example: What bait did you use?
 *       required:
 *        - comment
 *   responses:
 *    '200':
 *     description: <b>OK</b>, with updated comment details.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Comment'
 *    '400':
 *     description: <b>Bad Request</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        tripId and commentId are required:
 *         value:
 *          message: Path parameters 'tripId' and 'commentId' are required.
 *        comment is required:
 *         value:
 *          message: Parameter 'comment' is required.
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
 *        message: Not authorized to update this comment.
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
 *        comment not found:
 *         value:
 *          message: Comment with id '736346e7171e084ff4e4bbf9' not found.
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const commentsUpdateOne = async (req, res) => {
  if (!req.params.tripId || !req.params.commentId)
    res.status(400).json({
      message: "Path parameters 'tripId' and 'commentId' are required.",
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
              message: "Not authorized to update this comment.",
            });
          } else {
            const comment = trip.comments.id(req.params.commentId);
            if (!comment)
              res.status(404).json({
                message:
                  "Comment with id '" + req.params.commentId + "' not found.",
              });
            else if (!req.body.comment) {
              res.status(400).json({
                message: "Parameter 'comment' is required.",
              });
            } else {
              comment.comment = req.body.comment;
              await trip.save();
              res.status(200).json(comment);
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
 * /trips/{tripId}/comments/{commentId}:
 *  delete:
 *   summary: Delete existing comment from a given trip.
 *   description: Delete existing **comment** with a given unique identifier from a trip with given unique identifier.
 *   tags: [Comments]
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
 *    - name: commentId
 *      in: path
 *      schema:
 *       type: string
 *       pattern: '^[a-fA-F\d]{24}$'
 *      description: <b>unique identifier</b> of comment
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
 *        message: Path parameters 'tripId' and 'commentId' are required.
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
 *        message: Not authorized to delete this comment.
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
 *        comment not found:
 *         value:
 *          message: Comment with id '736346e7171e084ff4e4bbf9' not found.
 *        no comments found:
 *         value:
 *          message: No comments found.
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const commentsDeleteOne = async (req, res) => {
  const { tripId, commentId } = req.params;
  if (!tripId || !commentId)
    res.status(400).json({
      message: "Path parameters 'tripId' and 'commentId' are required.",
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
              message: "Not authorized to delete this comment.",
            });
          } else {
            let trip = await Trip.findById(tripId).select("comments").exec();
            if (!trip)
              res.status(404).json({
                message: `Trip with id '${tripId}' not found.`,
              });
            else if (trip.comments && trip.comments.length > 0) {
              const comment = trip.comments.id(commentId);
              if (!comment)
                res.status(404).json({
                  message: `Comment with id '${commentId}' not found.`,
                });
              else {
                comment.deleteOne();
                await trip.save();
                res.status(204).send();
              }
            } else res.status(404).json({ message: "No comments found." });
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
  commentsCreate,
  commentsReadOne,
  commentsUpdateOne,
  commentsDeleteOne,
};
