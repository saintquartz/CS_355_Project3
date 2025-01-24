var express = require('express');
var router = express.Router();
const fs = require("fs");
const { getCollection } = require('../model/db');

const currentFileName = "./model/current.json";

function readCurrent() {
    let data = fs.readFileSync(currentFileName, "utf-8");
    return JSON.parse(data);
}

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let current = readCurrent();
  let usersCollection = getCollection('profile-info');
  try {
    let profile = await usersCollection.find({email:`${current.email}`});
    res.render('home', { 
      username: profile.username,
    });
  } catch(e) {
    res.status(500).send("Failed to save to db.")
  }
});

router.get('/leaderboard', async function(req, res, next) {
  let current = readCurrent();
  let profileCollection = getCollection('profile-info');
  try {
    let leaderboard = await profileCollection.find({}).sort({highscore:-1});
    res.render('leaderboard', {
      current: current.email,
      games: leaderboard
    });
  } catch(e) {
    res.status(500).send("Failed to save to db.")
  }
});

router.get('/profile', async function(req, res, next) {
  let current = readCurrent();
  let usersCollection = getCollection('profile-info');
  let gamesCollection = getCollection('player-history');
  try {
    let profile = await usersCollection.findOne({email:`${current.email}`});
    let games = await gamesCollection.findOne({email:`${current.email}`});
    res.render('profile', { 
      username: profile.username,
      name: profile.name,
      email: profile.email,
      highscore: profile.score,
      history: games 
    });
  } catch(e) {
    res.status(500).send("rtyhrthrthrthrthrhrth.")
  }
});

module.exports = router;