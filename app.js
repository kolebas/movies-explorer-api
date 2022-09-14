const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
require('dotenv').config();
const bodyParser = require('body-parser');
const { errors } = require('celebrate');

const {
  NODE_ENV, DB_SERVER, DB_PORT, DB_NAME,
} = process.env;
const dbServer = NODE_ENV === 'production' ? DB_SERVER : '0.0.0.0';
const dbPort = NODE_ENV === 'production' ? DB_PORT : '27017';
const dbName = NODE_ENV === 'production' ? DB_NAME : 'moviedb-dev';
const router = require('./routes/index');
require('dotenv').config();
const { requestLogger, errorLogger } = require('./middlewares/logger');

const allowedCors = [
  'https://front.kolebas.nomoredomains.sbs',
  'http://localhost:3000',
];

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

app.use((req, res, next) => {
  const { origin } = req.headers;
  const requestHeaders = req.headers['access-control-request-headers'];
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
  if (allowedCors.includes(origin)) {
    const { method } = req;
    res.header('Access-Control-Allow-Origin', origin);
    if (method === 'OPTIONS') {
      res.header('Access-Control-Allow-Headers', requestHeaders);
      res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
      return res.end();
    }
  }
  return (next());
});

app.use(requestLogger);

app.use(router);

app.use(errorLogger);

app.use(errors());
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({ message: statusCode === 500 ? 'На сервере произошла ошибка' : message });
  next();
});

async function main() {
  await mongoose.connect(`mongodb://${dbServer}:${dbPort}/${dbName}`);
  await app.listen(PORT);
}

main();
