const mongoose = require('mongoose')

const GameScoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  studentID: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
  try: {
    type: Number,
    required: true,
    default: 1,
  },
  description: {
    type: String,
    required: false,
  },
})

const GameScore = mongoose.model('GameScore', GameScoreSchema)

module.exports = { GameScore }
