/**
 * Load environment variables
 */
require("dotenv").config();

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");

/**
 * Swagger and OpenAPI
 */
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = swaggerJsDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "MyFishingDiary",
      version: "0.1.0",
    },
    tags: [
      {
        name: "Trips",
        description: "Fishing <b>trips</b>",
      },
      {
        name: "Comments",
        description: "<b>Comments</b> of fishing trip",
      },
      {
        name: "Fish",
        description: "<b>Fish</b> caught on a fishing trip",
      },
      {
        name: "FishingGroup",
        description: "<b>Fishing groups</b>",
      },
      {
        name: "Authentication",
        description: "<b>User management</b> and authentication.",
      },
    ],
    servers: [
      {
        url: "https://localhost:3000/api",
        description: "Secure development server for testing",
      },
      {
        url: "http://localhost:3000/api",
        description: "Development server for testing",
      },
      {
        url: "https://my-fishing-diary.onrender.com/api",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        jwt: {
          type: "http",
          scheme: "bearer",
          in: "header",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorMessage: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Message describing the error.",
            },
          },
          required: ["message"],
        },
      },
    },
  },
  apis: ["./api/models/*.js", "./api/controllers/*.js"],
});

/**
 * Database connection
 */
require("./api/models/db.js");
require("./api/config/passport");

const apiRouter = require("./api/routes/api");

/**
 * Create server
 */
const port = process.env.PORT || 3000;
const app = express();

// Odprava varnostnih pomanjkljivosti
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.header("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

/**
 * CORS
 */
app.use(cors());

/**
 * Static pages
 */
app.use(express.static(path.join(__dirname, "angular", "build")));

/**
 * Passport
 */
app.use(passport.initialize());

/**
 * Body parser (application/x-www-form-urlencoded)
 */
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * API routing
 */
app.use("/api", apiRouter);

/**
 * Angular routing
 */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "angular", "build", "index.html"));
});

/**
 * Swagger file and explorer
 */
apiRouter.get("/swagger.json", (req, res) =>
  res.status(200).json(swaggerDocument)
);
apiRouter.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/**
 * Authorization error handler
 */
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError")
    res.status(401).json({ message: err.message });
});

/**
 * Start server
 */
if (process.env.HTTPS == "true") {
  const fs = require("fs");
  const https = require("https");
  https
    .createServer(
      {
        key: fs.readFileSync("cert/server.key"),
        cert: fs.readFileSync("cert/server.cert"),
      },
      app
    )
    .listen(port, () => {
      console.log(
        `Secure demo app started in '${
          process.env.NODE_ENV || "development"
        } mode' listening on port ${port}!`
      );
    });
} else {
  app.listen(port, () => {
    console.log(
      `Demo app started in ${
        process.env.NODE_ENV || "development"
      } mode listening on port ${port}!`
    );
  });
}
