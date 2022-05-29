const catchAsync = require('../utils/catchAsync');
const Status = require('../models/statusModel');
const Exam = require('../models/examModel');
const AppError = require('../utils/AppError');

exports.getAllStatusByExamCode = catchAsync(async (req, res, next) => {
  const status = await Status.find({examCode : req.params.examCode}).select('-_id -examCode -__v');
  if(!status.length) return next(new AppError('Either exam code is wrong or exam has not been started yet', 404));

  res.status(200).json({
    status: 'success',
    data: status
  })
});

exports.getAllStatusByStudent = catchAsync(async (req, res, next) => {
  const status = await Status.find({studentEmail : req.params.studentEmail});
  if(!status.length) return next(new AppError('There are no records found of this student', 404));

  res.status(200).json({
    status: 'success',
    data: status
  })
});

exports.createStatus = catchAsync(async (req, res) => {
  const exam = await Exam.findOne({examCode: req.body.examCode});
  if(!exam) return res.status(404).json({ status: 'fail', message: 'Exam not found'});

  const examStartTime = new Date(exam.startTime).getTime();
  const examEndTime = new Date(exam.endTime).getTime();
  const currTime = Date.now();

  if(examStartTime > currTime || currTime >= examEndTime) return res.status(404).json({ status: 'fail',
    message: examStartTime > currTime ? 'Exam not started yet' : 'Exam is already finished',
    // currTime: Date.now(),
    // startTime: examStartTime,
    // endTime: new Date(exam.endTime).getTime()
  });

  const data = await Status.create({
    ...req.body,
    id: req.body.examCode+req.user.email,
    studentName: req.user.name,
    studentEmail: req.user.email
  });

  res.status(200).json({
    status: 'success',
    msg: 'Status created successfully',
    data: data
  })
});

exports.updateStatus = catchAsync(async (req, res, next) => {
  let data = await Status.findOne({id: req.body.examCode+req.user.email});
  if(!data) return next(new AppError('Exam code is invalid OR student has no record for this exam'));

  data = await Status.findOneAndUpdate({id: req.body.examCode+req.user.email}, {
    tabSwitchCount: req.body.tabSwitchCount ? data.tabSwitchCount+1 : data.tabSwitchCount,
    keyPressCount: req.body.keyPressCount ? data.keyPressCount+1 : data.keyPressCount,
    mobileFound: req.body.mobileFound ? true : data.mobileFound,
    prohibitedObjectFound: req.body.prohibitedObjectFound ? true : data.prohibitedObjectFound,
    faceNotVisible: req.body.faceNotVisible ? true : data.faceNotVisible,
    multipleFaceFound: req.body.multipleFaceFound ? true : data.multipleFaceFound,
    id: req.body.examCode+req.user.email,
    studentName: req.user.name,
    studentEmail: req.user.email
  }, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    msg: 'Status updated successfully',
    data: data
  })
});

exports.inc = catchAsync(async (req, res, next) => {
  const data = await Status.findOneAndUpdate({id: req.body.examCode+req.user.email}, {
    ...req.body,
    id: req.body.examCode+req.user.email,
    studentName: req.user.name,
    studentEmail: req.user.email
  }, {
    new: true,
    runValidators: true,
  });

  if(!data) return next(new AppError('Exam code is invalid OR student has no record for this exam'));

  res.status(200).json({
    status: 'success',
    msg: 'Status updated successfully',
    data: data
  })
});