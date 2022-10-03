const mongo = require('./mongo')
require('dotenv').config()
const max = process.env.LEADERBOARD_HIGHEST_NUMBER || 20

class LeaderBoard {
  constructor(max) {
    this._max = max
    this._number = 0
    this.board = []
    this.syncDB()
  }

  formatBoard() {
    return this.board
  }

  addData(data) {
    const { name, studentID } = data
    if (parseInt(data.score) == data.score) {
      const score = parseInt(data.score)
      if (this.removeDuplicateStudentID(studentID, score)) {
        return
      }
      const index = this.insertScoreIndex(score)
      if (index < this._max) {
        const newData = { name, studentID, score }
        this.board.splice(index, 0, newData)
        if (this._number === this._max) {
          this.board.pop()
        } else {
          this._number += 1
        }
      }
    }
  }

  insertScoreIndex(score) {
    let index = 0
    for (let i = 0; i < this._number; i++) {
      if (score <= this.board[i].score) {
        index += 1
      }
    }
    return index
  }

  removeDuplicateStudentID(studentID, score) {
    let index = -1
    this.board.some((obj, idx) => {
      if (obj.studentID === studentID) {
        index = idx
        return true
      }
    })
    if (index > -1) {
      if (score > this.board[index].score) {
        this.board.splice(index, 1)
        this._number -= 1
      } else {
        return true
      }
    }
    return false
  }

  tenthHighestScore() {
    if (this._number > 19) {
      const score = this.board[19].score
      return score
    } else {
      return 0
    }
  }

  async syncDB() {
    const data = await mongo.GameScore.find()
      .sort({ score: -1 })
      .limit(this._max)
    this.board = data.map((obj) => {
      const { name, score, studentID } = obj
      return { name, score, studentID }
    })
    this._number = data.length
  }
}

const board = new LeaderBoard(max)
// board.addData({"score": 12, "studentID": "a"});
// console.log(board.board);
// board.addData({"score": 2, "studentID": "b"});
// console.log(board.board);
// board.addData({"score": 2, "studentID": "a"});
// console.log(board.board);
// board.addData({"score": 5, "studentID": "b"});
// console.log(board.board);
// board.addData({"score": 22, "studentID": "b"});
// console.log(board.board);

module.exports = board
