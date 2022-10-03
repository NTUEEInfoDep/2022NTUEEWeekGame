const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
const api = require('./api')
const path = require('path')
const logger = require('morgan')

const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackConfig = require('../webpack.config.js')

console.log(process.env.NODE_ENV)
const { MONGO_HOST, MONGO_DBNAME, MONGO_PASSWORD, MONGO_USERNAME, MONGO_PORT } =
  process.env
const port = process.env.PORT || 4000
// console.log(`mongodb://${MONGO_USERNAME}:${ MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DBNAME}`);

mongoose
  .connect(
    `mongodb://${MONGO_HOST}/${MONGO_DBNAME}`,
    // `mongodb://${MONGO_USERNAME}:${ MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DBNAME}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then((res) => console.log('mongo db connection created'))
  .catch((err) => console.log(err))

const db = mongoose.connection

db.on('error', (err) => console.log(err))
db.once('open', () => {
  const app = express()
  app.use(logger('dev'))
  app.use(express.json())
  app.use('/api', api)
  if (process.env.NODE_ENV !== 'development') {
    app.use(express.static(path.join(__dirname, '../build')))
  } else {
    const compiler = webpack({ ...webpackConfig, mode: 'development' })
    app.use(webpackDevMiddleware(compiler))
  }

  // app.use(express.static(path.join(process.cwd(), "client")));

  app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}!`)
  })
})
