const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");

const globalErrorHandler = require('./utils/globalErrorHandler');

// dotenv.config({path : './config.env'});

const userRouter = require('./routes/userRouter');
const examRouter = require('./routes/examRouter');
const statusRouter = require('./routes/statusRouter');
const resultRouter = require('./routes/resultRouter');
const viewRouter = require('./routes/viewRouter');

const app = express();
app.use(express.json({ limit: '5kb' }));
app.use(cookieParser());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, './views'));

app.use(express.static(path.join(__dirname, './public')));

app.use('/api/v1/user', userRouter);
app.use('/api/v1/exam', examRouter);
app.use('/api/v1/status', statusRouter);
app.use('/api/v1/result', resultRouter);
app.use('/', viewRouter);
app.use(globalErrorHandler); // Global error handler middleware 

mongoose.connect(process.env.DB_CONNECTION_STRING).then(() => {
  console.log('Database connected');
});

app.listen(process.env.PORT || 8000, () => {
  console.log('listening on port');
});
