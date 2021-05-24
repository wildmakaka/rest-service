const express = require('express');
const createError = require('http-errors');
const fs = require('fs');
const logger = require('morgan');
const swaggerUI = require('swagger-ui-express');
const path = require('path');
const YAML = require('yamljs');
const userRouter = require('./resources/users/user.router');
const boardRouter = require('./resources/boards/board.router');
const taskRouter = require('./resources/tasks/task.router');

const app = express();
const swaggerDocument = YAML.load(path.join(__dirname, '../doc/api.yaml'));

if(app.get("env") === "production") {

  const accessLogStream = fs.createWriteStream(path.join(
    __dirname,
    '../log/',
    'access.log'), {flags: 'a'});
  app.use(logger('combined', {stream: accessLogStream}));
}
else {
  app.use(logger("dev"));
}

app.use(express.json());

app.use('/doc', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use('/', (req, res, next) => {
  if (req.originalUrl === '/') {
    res.send('Service is running!');
    return;
  }
  next();
});

app.use('/users', userRouter);
app.use('/boards', boardRouter);
app.use('/boards/:boardId/tasks', taskRouter);

app.use((req, res, next) => {
  next(createError(404, 'Not found'));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message || 'Internal Server Error'
    }
  });
  if(!err) {
    next(err)
  }
});


module.exports = app;
