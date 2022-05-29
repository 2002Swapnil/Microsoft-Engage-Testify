const catchAsync = require('../utils/catchAsync');
const Status = require('../models/statusModel');
const Result = require('../models/resultModel');
const Exam = require('../models/examModel');

exports.render = (res, name) =>  res.status(200).render(name);

exports.protectExam = catchAsync(async (req, res) => {
  const currStatus = await Status.findOne({id : req.params.examCode+req.user.email});
  // console.log({id : req.params.examCode+req.user.email})
  if(!currStatus) return res.redirect(302, '/dashboard');

  const data = await Result.findOne({id : req.params.examCode+req.user.email});
  if(data) return res.redirect(302, '/dashboard');

  const exam = await Exam.findOne({examCode : req.params.examCode});
  const examEndTime = new Date(exam.endTime).getTime();
  const currTime = Date.now();
  if(currTime >= examEndTime) return res.status(400).json({status: 'fail', message: 'Exam has already ended'});

  res.status(200).render('exam', {
    userDetails: req.user,
    examDetails: exam
  });
});

exports.dashBoardRendering = catchAsync(async (req, res) => {
  if(req.user.role == 'student'){
    let data = await Result.find({studentEmail : req.user.email}).populate('exam').select('totalMarks obtainedMarks exam -_id');
    res.status(200).render('studentDashboard', {
      userDetails : req.user,
      examDetails: data
    })
  }
  else{
    res.status(200).render('teacherDashboard');
    // render(res, `${req.user.role}Dashboard`)
  }
});