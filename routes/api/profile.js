const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load Person Model
const Person = require("../../models/Person");

// Load Profile Model
const Profile = require("../../models/Profile");

// @type    GET
//@route    /api/profile/
// @desc    route for personnal user profile
// @access  PRIVATE
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          return res.status(404).json({ profileNotFound: "No Profile Found" });
        }
        res.json(profile);
      })
      .catch(err => console.log("Got some error in Profile " + err));
  }
);

// @type    POST
//@route    /api/profile/
// @desc    route for updating/saving personnal user profile
// @access  PRIVATE
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const profileValues = {};
    profileValues.user = req.user.id;
    if (req.body.username) profileValues.username = req.body.username;
    if (req.body.website) profileValues.website = req.body.website;
    if (req.body.country) profileValues.country = req.body.country;
    if (req.body.protfolio) profileValues.protfolio = req.body.protfolio;
    if (typeof req.body.languages != undefined) {
      profileValues.languages = req.body.languages.split(",");
    }
    // get social links
    profileValues.social = {};
    if (req.body.youtube) profileValues.social.youtube = req.body.youtube;
    if (req.body.facebook) profileValues.social.facebook = req.body.facebook;
    if (req.body.instagram) profileValues.social.instagram = req.body.instagram;

    // Database operation
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (profile) {
          // i.e. Update. Since already exist
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileValues },
            { new: true }
          )
            .then(profile => res.json(profile))
            .catch(err => console.log("Problem with update: " + err));
        } else {
          Profile.findOne({ username: profileValues.username })
            .then(profile => {
              // username already exist
              if (profile) {
                res.status(400).json({ username: "username already exists" });
              }
              //save user. no username with this username
              new Profile(profileValues)
                .save()
                .then(profile => res.json(profile))
                .catch(err => console.log("user not saved: " + err));
            })
            .catch(err =>
              console.log("Problem in finding username from database" + err)
            );
        }
      })
      .catch(err => console.log("Problem in fetching profile: " + err));
  }
);

// @type    GET
// @route   /api/auth/:username
// @desc    route for getting user profile based on USERNAME
// @access  PUBLIC
router.get("/:username", (req, res) => {
  Profile.findOne({ username: req.params.username })
    .populate("user", ["name", "profilepic"])
    .then(profile => {
      if (!profile) {
        return res.status(404).json({ userNotFound: "user not found" });
      }
      res.json(profile);
    })
    .catch(err => console.log("error in fetching username: " + err));
});

// @type    GET
// @route   /api/auth/:everyone
// @desc    route for getting user profile of EVERYONE
// @access  PUBLIC
router.get("/find/everyone", (req, res) => {
  Profile.find()
    .populate("user", ["name", "profilepic"])
    .then(profiles => {
      if (!profiles) {
        return res.status(404).json({ userNotFound: "user not found" });
      }
      res.json(profiles);
    })
    .catch(err => console.log("error in fetching username: " + err));
});

// @type    DELETE
// @route   /api/profile/
// @desc    route for deleting user based on ID
// @access  PRIVATE
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id });
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        Person.findOneAndRemove({ _id: req.user.id })
          .then(() => {
            res.json({ success: "delete was successful" });
          })
          .catch(err => console.log("Deleting profile error: " + err));
      })
      .catch(err => console.log("Deleting error: " + err));
  }
);

// @type    POST
// @route   /api/profile/workrole
// @desc    route for adding work profile of a person
// @access  PRIVATE

router.post(
  "/workrole",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const newWork = {
          role: req.body.role,
          company: req.body.company,
          country: req.body.country,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          details: req.body.details
        };
        profile.workrole.unshift(newWork);
        profile
          .save()
          .then(profile => res.json(profile))
          .catch(err => console.log("workrole push error: " + err));
      })
      .catch(err => console.log("Work Profile error: " + err));
  }
);

// @type    POST
// @route   /api/profile/workrole/:w_id
// @desc    route for deleting a specific workrole
// @access  PRIVATE
router.delete(
  "/workrole/:w_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // check if we got a profile
        const removethis = profile.workrole
          .map(item => item.id)
          .indexOf(req.params.w_id);

        profile.workrole.splice(removethis, 1);

        profile
          .save()
          .then(profile => res.json(profile))
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  }
);

module.exports = router;
