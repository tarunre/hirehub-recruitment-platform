const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  college: String,
  rollNo: String,
  program: String,
  stream: String,
  enrollmentYear: Number,
  backlogs: Number,
  cgpa: Number,
  email: String,
  phone: String,
  sex: String,
  dob: String,
  nationality: String,
  profilePic: String, // URL or path to the profile picture
});

module.exports = mongoose.model('User', UserSchema);
