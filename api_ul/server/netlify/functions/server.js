// server/netlify/functions/server.js
const serverless = require("serverless-http");
const app = require("../../index"); // Path to your main Express app file: `server/index.js`

// Wrap your Express app with serverless-http
exports.handler = serverless(app);
