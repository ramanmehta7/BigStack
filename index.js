const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const passport = require("passport");

//bring all routes
const auth = require("./routes/api/auth");
const questions = require("./routes/api/questions");
const profile = require("./routes/api/profile");

const app = express();

//Middleware for bodyparser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//Attempt to connect to database
mongoose
  .connect("mongodb://localhost:27017/bigstack", { useNewUrlParser: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.log(err));

// err => {
//   if (!err) {
//     console.log("MongoDB connected successfully.");
//   } else {
//     console.log("error is : " + err);
//   }
// }

//Passport MiddleWare
app.use(passport.initialize());

//config for JWT Strategy
require("./strategies/jsonwtStrategy")(passport);

// test route
app.get("/", (req, res) => {
  res.send("hi bigstack");
});

//actual routes
app.use("/api/auth", auth);
app.use("/api/questions", questions);
app.use("/api/profile", profile);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`server is running at ${port}`));
