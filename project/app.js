// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");
require("./config/hbs.helpers")(hbs);

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);
require("./config/session.config")(app);

// default value for title local
const capitalize = require("./utils/capitalize");
const projectName = "project";

app.locals.appTitle = `${capitalize(projectName)} created with IronLauncher`;

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
const authRoutes = require("./routes/auth.routes");
const auddRoutes = require("./routes/audD/audD.routes");
const postRoutes = require("./routes/post.routes");
const commentRoutes = require("./routes/comment.routes");
const eventsRoutes = require("./routes/events.routes");
const eventsChatRoutes = require("./routes/events-chat.routes");
const messagesRoutes = require("./routes/messages.routes");
const playlistsRoutes = require("./routes/playlists.routes");

app.use("/", indexRoutes);
app.use("/", authRoutes);
app.use("/", auddRoutes);
app.use("/", postRoutes);
app.use("/", commentRoutes);
app.use("/", eventsChatRoutes);
app.use("/", eventsRoutes);
app.use("/", messagesRoutes);
app.use("/", playlistsRoutes)


// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
