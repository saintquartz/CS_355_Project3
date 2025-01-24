var express = require('express');
var router = express.Router();
var seedrandom = require('seedrandom');
const fs = require("fs");
const { default: axios } = require('axios');
const { getCollection } = require('../model/db');

const questionsFileName = "./model/questions.json";
const counterFileName =  "./model/counter.json";
const qCheckFileName = "./model/questionCheck.json";
const currentFileName = "./model/current.json";

function readQuestions() {
    let data = fs.readFileSync(questionsFileName, "utf-8");
    return JSON.parse(data);
}

function writeQuestions(q) {
    let data = JSON.stringify(q, null, 2);
    fs.writeFileSync(questionsFileName, data, "utf-8");
}

function readCounter() {
    let data = fs.readFileSync(counterFileName, "utf-8");
    return JSON.parse(data);
}

function writeCounter(tracker) {
    let data = JSON.stringify(tracker, null, 2);
    fs.writeFileSync(counterFileName, data, "utf-8");
}

function readQCheck() {
    let data = fs.readFileSync(qCheckFileName, "utf-8");
    return JSON.parse(data);
}

function writeQCheck(check) {
    let data = JSON.stringify(check, null, 2);
    fs.writeFileSync(qCheckFileName, data, "utf-8");
}

function readCurrent() {
    let data = fs.readFileSync(currentFileName, "utf-8");
    return JSON.parse(data);
}

function writeCurrent(tracker) {
    let data = JSON.stringify(tracker, null, 2);
    fs.writeFileSync(currentFileName, data, "utf-8");
}

function repeatQ(q) {
    let qcheck = readQCheck();
    if (qcheck. length === 0) {
        return false;
    }

    for (const quest of qcheck) {
        if (q.question === quest.question) {
            return true;
        }
    }
    return false;
}



function shuffle(array) {
    let i = 4,
        j = 0,
        temp;
    
    while (i--) {
        j = Math.floor(Math.random() * (i + 1));
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}


async function addQuestions() {
    const api = await axios.get(`https://opentdb.com/api.php?amount=10&type=multiple`);
    const apiData = api.data.results;
    //console.log("hello");

    let clearQ = readQuestions();
    clearQ = [

    ];

    for (let qNum = 0; qNum < 10; qNum++) {
        let info = apiData[qNum];
        let choices = info.incorrect_answers;
        choices.push(info.correct_answer);
        //console.log(choices);
        let input = shuffle([0, 1 , 2, 3]);
        
        let ansIndex = 0;
        for (let i = 0; i < 4; i++) {
            if (input[i] === 3) {
                ansIndex = i;
            }
        }

        let chr = String.fromCharCode(65 + ansIndex);
        let questions = {
            "question": info.question,
            "A": choices[input[0]],
            "B": choices[input[1]],
            "C": choices[input[2]],
            "D": choices[input[3]],
            "answer": chr
        }
        clearQ.push(questions);
    }

    writeQuestions(clearQ);
}


router.get('/', function(req, res, next) {
    //console.log("hdfgdfgd");
    let questionsDB = readQuestions();
    

    let questions = questionsDB.pop();

    //console.log(questions);
    
    writeQuestions(questionsDB);

    let qcheck = readQCheck();
    qcheck.push(questions);
    writeQCheck(qcheck);

    let count = readCurrent();

    res.render('quiz', {
        quiz: questions,
        num: count.counter
    });
});



router.get('/result', async function(req, res, next) {
    let current = readCurrent();
    let gamesCollection = getCollection('player-history');
    let usersCollection = getCollection('profile-info');

    try {
        const date =  new Date();
        let day = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
        let checkGames = await gamesCollection.findOne({email:`${current.email}`});

        //high score
        let checkProfile = await usersCollection.findOne({email:`${current.email}`});
    
        if(checkProfile.score < current.score) {
            checkProfile.score = current.score;
            await usersCollection.findOneAndReplace({email:`${current.email}`}, checkProfile);
        }

        checkGames.date.push(day);
        checkGames.score.push(current.score);

        await gamesCollection.findOneAndReplace({email:`${current.email}`}, checkGames);

        res.render('result', {
            score: current.score,
            count: 10
        });
    } catch(e) {
        res.status(500).send("6576574567");
    }
});


router.post("/next", (req, res) => {
    let tracker = readCurrent();
    let check = readQCheck();
    
 
    if (req.body.choice === check[tracker.counter].answer) {

        tracker.score = tracker.score + 1;
    }

    tracker.counter = tracker.counter + 1;


    writeCurrent(tracker);

    if(tracker.counter < 10) {
        return res.redirect("/quiz");
    } else {
        return res.redirect("/quiz/result");
    }
});



router.get("/reset", async (req, res) => {
    let tracker = readCurrent();
    tracker.score = 0;
    tracker.counter = 0;
    writeCurrent(tracker);

    let clear = readQCheck();
    clear = [

    ];
    writeQCheck(clear);

    await addQuestions();

    res.redirect("/quiz");
});


module.exports = router;