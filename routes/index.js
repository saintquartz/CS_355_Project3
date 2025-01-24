var express = require('express');
var router = express.Router();
const fs = require("fs");
const postDBFileName = "./model/postDB.json";

function readUserDB() {
  let data = fs.readFileSync(postDBFileName, "utf-8");
  return JSON.parse(data);
}


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('homePage');
});

router.get('/home/', function(req, res, next) {
  let post = readUserDB(); 
  res.render('home', {posts: post.posts});
});


module.exports = router;
