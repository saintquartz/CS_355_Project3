var express = require('express');
var router = express.Router();
const fs = require("fs");
const { getCollection } = require('../model/db');

const currentFileName = "./model/current.json";

function readCurrent() {
    let data = fs.readFileSync(currentFileName, "utf-8");
    return JSON.parse(data);
}

function writeCurrent(tracker) {
    let data = JSON.stringify(tracker, null, 2);
    fs.writeFileSync(currentFileName, data, "utf-8");
}

router.get('/login', function(req, res) {
    res.render('login');
});

router.get('/signup', function(req, res) {
    res.render('signup');
});

router.get('/', function(req, res) {
    let current = readCurrent();
    if (current.email === "guest") {
        res.redirect("/auth/login");
    } else {
        res.redirect("/quiz/reset");
    }
});

router.get('/logout', function(req, res) {
    let current = readCurrent();
    current.email ="guest";
    current.score = 0;
    current.counter = 0;
    writeCurrent(current);
    res.redirect('/');
});

router.post("/login/submit", async  (req, res) => {
    try {
        let current = readCurrent();
        let usersCollection = getCollection('profile-info');
        let input = req.body;
      let check = await usersCollection.findOne({email:`${input.email}`});
      if(check.password === input.password) {
        current.email = input.email;
        writeCurrent(current);
        res.redirect("/users/profile");
      } else {
        res.status(401).send("The email or password is incorrect");
      }
    } catch(e) {
      res.status(500).send("Failed to save to db.");
    }
  });

router.post("/signup/submit", async (req, res) => {
  let current = readCurrent();
  let usersCollection = getCollection("profile-info");
  let gameCollection = getCollection("player-history");
  let input = req.body;
  try {
    let check = await usersCollection.findOne({email:`${input.email}`});

    if (check == null) {
        let history = {
            email:`${input.email}`,
            date: [],
            score: []
        }
        await gameCollection.insertOne(history);
        console.log("dsfgdfgdf");
        input.score = -1; //set to -1 for no high score
        await usersCollection.insertOne(input);
        current.email = input.email;
        writeCurrent(current);
        res.redirect("/users/profile");
    } else {
        res.status(401).send("The email is already in use");
    }
  } catch(e) {
    res.status(500).send("Failed to save to db.")
  }
});

module.exports = router;