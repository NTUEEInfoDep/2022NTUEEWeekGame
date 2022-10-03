const express = require('express')
const crypto = require('crypto');
const asyncHandler = require('express-async-handler')

const mongo = require('./mongo')
const leaderBoard = require('./leaderBoard')

const router = express.Router()

require('dotenv').config();

const privateKey = Buffer.from(process.env.PUBLIC_KEY, "base64");
function decrypt(iv, encryptedMessage) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', privateKey, Buffer.from(iv, 'base64'))
  let decrypted = decipher.update(Buffer.from(encryptedMessage, 'base64'))
  decrypted += decipher.final('utf8')
  console.log(decrypted)
  return decrypted;
}


router.get('/', (req, res) => {
  console.log('hi')
  res.send('Hello world\n')
})

router.route('/highestScore').get(
  asyncHandler(async (req, res) => {
    const { studentID } = req.query
    const data = await mongo.GameScore.findOne({ studentID })
    if (data) {
      res.send({ score: data.score, name: data.name })
    } else {
      res.send({ score: 0, name: null })
    }
  })
)

// router.post(
//   '/highestScores',
//   express.urlencoded({ extended: false }),
//   asyncHandler(async (req, res) => {
//     const { studentID } = req.body
//     const data = await mongo.GameScore.findOne({ studentID })
//     if (data) {
//       res.send({ score: data.score, name: data.name })
//     } else {
//       res.send({ score: 0, name: null })
//     }
//   })
// )

router.get('/tenthHighestScore', (req, res) => {
  //res.send(leaderBoard.tenthHighestScore());
  res.send(0)
})

router.post(
  '/reportScore',
  express.urlencoded({ extended: false }),
  asyncHandler(async (req, res) => {
    const { encrypted, iv, name } = req.body;
    const tmp = decrypt(iv, encrypted);
    const dec = JSON.parse(tmp);
    const {studentID, score} = dec;
    const data = await mongo.GameScore.findOne({ studentID })
    let highestScore = score
    let update = true
    let originalScore = 0
    let finalName = name
    if (data) {
      originalScore = data.score
      if (score > originalScore) {
        await mongo.GameScore.updateOne(
          { studentID },
          { name, score, time: Date.now(), try: data.try + 1 }
        )
        leaderBoard.addData({ name, score, studentID })
      } else {
        highestScore = originalScore
        update = false
        finalName = data.name
        await mongo.GameScore.updateOne({ studentID }, { try: data.try + 1 })
      }
    } else {
      await new mongo.GameScore({
        studentID,
        name,
        score,
        time: Date.now(),
      }).save()
      leaderBoard.addData({ name, score, studentID })
    }
    res.send({
      score,
      highestScore,
      update,
      originalScore,
      studentID,
      name: finalName,
    })
  })
)

router.get('/leaderBoard', (req, res) => {
  res.send(leaderBoard.formatBoard())
})

router.post(
  '/reloadLeaderBoard',
  asyncHandler(async (req, res) => {
    await leaderBoard.syncDB()
    res.send(leaderBoard.formatBoard())
  })
)

router.post(
  "/pagedLeaderBoard",
  asyncHandler(async(req, res) =>{
    const {page} = req.body;
    if(Number.isInteger(page) && page > 0){
      const DBdata = await mongo.GameScore.find().sort({ score: -1 });
      const board = DBdata.map((obj) => {
        const { name, score, studentID } = obj
        return { name, score, studentID }
      });
      if((page - 1) * 10 < board.length){
        if(page * 10 <= board.length){
          res.send({data: board.slice((page - 1) * 10, page * 10), last: false});
          res.status(204);
        }
        else{
          res.send({data: board.slice((page - 1) * 10, board.length), last: true});
          res.status(204);
        }
      }
      else{
        res.status(400).end();
        return;
      }
    }
    else{
      res.status(400).end();
      return;
    }
}))

module.exports = router
