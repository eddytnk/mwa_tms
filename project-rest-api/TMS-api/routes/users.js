var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/tms");

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var taskScheme = new Schema(
  {
    "id": ObjectId,
    "taskName": String,
    "taskDesc":String,
    "startDate":Date,
    "endDate":Date,
    "status":Boolean
  }
);

var scheduleSchema = new Schema(
  {
    "id": ObjectId, 
    "scheduleName" : String,
    "scheduleDesc" : String,
    "tasks":[taskScheme]
  }
);

var userSchema = new Schema({
    "id":ObjectId,
    "firstName":String,
    "lastName": String,
    "password":String,
    "email": {type: String, index: true, unique:true},
    "schedules": [scheduleSchema]
});


//create a model using schema
var User = mongoose.model("User",userSchema);


/* GET all users. */
router.get('/users', function(req, res, next) {
  User.find({},(err,user)=>{
    res.send(user);
  })
  
});

/* GET all users. */
router.get('/user/:id', function(req, res, next) {
  var id = req.params.id;
  User.findOne({_id:id},(err,user)=>{
    res.send(user);
  })
  
});

/* GET login users. */
router.post('/login', function(req, res, next) {
  var cred = req.body;
  console.log(cred);
  User.findOne(cred,(err,user)=>{
    console.log(user)
    res.send(user);
  })
  
});

/**
 * Add a new User to the DB
 */
router.post('/users', function(req, res, next) {

  console.log(req.body);
   var user = new User(req.body);
  user.save()
    .then(item => {
      res.send(item);
    })
  .catch(err => {
    console.log(err);
      res.status(400).send("unable to save to database");
  });
});


/**
 * add a new Schedule
 */
router.post('/user/:id/schedule', function(req, res, next) {

  var id = req.params.id;
  var schdule = req.body;
  console.log(schdule);
  var options = {new:true};

   User.findOneAndUpdate({_id:id},
          {$push: {"schedules": schdule}},
          options,
          (err,user)=>{
              if(err){
                throw err;
              }else {
                res.send(user);
              }
          });
 });


/**
 * update a  Schedule
 */
router.put('/user/:id/schedule/:schId', function(req, res, next) {

  var id = req.params.id;
  var schId = req.params.schId;
  var schdule = req.body;
  console.log(schdule);
  var options = {new:true};

   User.findOneAndUpdate({_id:id, "schedules._id":schId},
          {"schedules": [schdule]},
          options,
          (err,user)=>{
              if(err){
                throw err;
              }else {
                res.send(user);
              }
          });
 });


/**
 * add new a  Task
 */
router.post('/user/:id/schedule/:schId/task', function(req, res, next) {

  var id = req.params.id;
  var schId = req.params.schId;
  var task = req.body;
  console.log(task);

  var options = {new:true};

   User.findOneAndUpdate({_id:id, "schedules._id":schId},
          {$push: {"schedules.$.tasks": task}},
          options,
          (err,user)=>{
              if(err){
                throw err;
              }else {
                res.send(user);
              }
          });
 });


/**
 * update a  Task
 */
router.put('/user/:id/schedule/:schId/task/:tkId', function(req, res, next) {

  var id = req.params.id;
  var schId = req.params.schId;
  var tkId = req.params.tkId;

  var task = req.body;
  console.log(task);

  var options = {new:true};
  
   User.findOneAndUpdate({_id:id, "schedules._id":schId,"schedules.tasks._id":tkId},
          {"schedules.tasks": task},
          options,
          (err,user)=>{
              if(err){
                throw err;
              }else {
                res.send(user);
              }
          });
 });


/**
 * Delete a  Task
 */
router.delete('/user/:id/schedule/:schId/task/:tkId', function(req, res, next) {

  var id = req.params.id;
  var schId = req.params.schId;
  var tkId = req.params.tkId;

  var task = req.body;
  console.log(task);

   User.findOneAndRemove({_id:id, "schedules._id":schId,"schedules.tasks._id":tkId},
          {$pull:{"schedules.$.tasks._id": tkId}},
          (err,user)=>{
              if(err){
                throw err;
              }else {
                res.send(user);
              }
          });
 });


module.exports = router;
