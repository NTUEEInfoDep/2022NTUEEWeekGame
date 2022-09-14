const express = require("express");
const asyncHandler = require("express-async-handler");

const mongo = require("./mongo");
const leaderBoard = require("./leaderBoard");

const router = express.Router();

router.get("/", (req, res) => {
  console.log("hi");
  res.send("Hello world\n");
});

router.route("/highestScore").get(
  asyncHandler(async (req, res) => {
    const { studentID } = req.query;
    const data = await mongo.GameScore.findOne({ studentID });
    if (data) {
      res.send({ score: data.score, name: data.name });
    } else {
      res.send({ score: 0, name: null });
    }
  })
);

router.post(
  "/highestScores",
  express.urlencoded({ extended: false }),
  asyncHandler(async (req, res) => {
    const { studentID } = req.body;
    const data = await mongo.GameScore.findOne({ studentID });
    if (data) {
      res.send({ score: data.score, name: data.name });
    } else {
      res.send({ score: 0, name: null });
    }
  })
);

router.get("/tenthHighestScore", (req, res) => {
  //res.send(leaderBoard.tenthHighestScore());
  res.send(0);
});

router.post(
  "/reportScore",
  express.urlencoded({ extended: false }),
  asyncHandler(async (req, res) => {
    const { name, studentID, score } = req.body;
    const data = await mongo.GameScore.findOne({ studentID });
    let highestScore = score;
    let update = true;
    let originalScore = 0;
    let finalName = name;
    if (data) {
      originalScore = data.score;
      if (score > originalScore) {
        await mongo.GameScore.updateOne(
          { studentID },
          { name, score, time: Date.now(), try: data.try + 1 }
        );
        leaderBoard.addData({ name, score, studentID });
      } else {
        highestScore = originalScore;
        update = false;
        finalName = data.name;
        await mongo.GameScore.updateOne({ studentID }, { try: data.try + 1 });
      }
    } else {
      await new mongo.GameScore({ studentID, name, score, time: Date.now() }).save();
      leaderBoard.addData({ name, score, studentID });
    }
    res.send({ score, highestScore, update, originalScore, studentID, name: finalName });
  })
);

router.get("/leaderBoard", (req, res) => {
  res.send(leaderBoard.formatBoard());
});

router.post(
  "/reloadLeaderBoard",
  asyncHandler(async (req, res) => {
    await leaderBoard.syncDB();
    res.send(leaderBoard.formatBoard());
  })
);

module.exports = router;
