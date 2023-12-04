const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

/**
 * @openapi
 *  components:
 *   schemas:
 *    User:
 *     type: object
 *     description: User of the application.
 *     properties:
 *      email:
 *       type: string
 *       format: email
 *       description: email of the user
 *       example: test@email.com
 *      name:
 *       type: string
 *       description: name and surname of the user
 *       example: Test User
 *       writeOnly: true
 *      password:
 *       type: string
 *       description: password of the user
 *       example: test
 *     required:
 *      - email
 *      - name
 *      - password
 *    Authentication:
 *     type: object
 *     description: Authentication token of the user.
 *     properties:
 *      token:
 *       type: string
 *       description: JWT token
 *       example: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NTZiZWRmNDhmOTUzOTViMTlhNjc1ODgiLCJlbWFpbCI6InNpbW9uQGZ1bGxzdGFja3RyYWluaW5nLmNvbSIsIm5hbWUiOiJTaW1vbiBIb2xtZXMiLCJleHAiOjE0MzUwNDA0MTgsImlhdCI6MTQzNDQzNTYxOH0.GD7UrfnLk295rwvIrCikbkAKctFFoRCHotLYZwZpdlE
 *     required:
 *      - token
 */
const usersSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: [true, "Email is required!"] },
  name: { type: String, required: [true, "Name is required!"] },
  role: { type: String, required: [true, "Role is required!"] },
  fishingGroup: { type: [String] },
  hash: { type: String, required: [true, "Hash is required!"] },
  salt: { type: String, required: [true, "Salt is required!"] },
});

usersSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
    .toString("hex");
};

usersSchema.methods.validPassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
    .toString("hex");
  return this.hash === hash;
};

usersSchema.methods.generateJwt = function () {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
      fishingGroup: this.fishingGroup,
      exp: parseInt(expiry.getTime() / 1000),
    },
    process.env.JWT_SECRET
  );
};

mongoose.model("User", usersSchema, "Users");
