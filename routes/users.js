const mongoose = require("mongoose")
const plm = require("passport-local-mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/instagramOriginal")


var userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  bio: String,
  password: String,
  profilepic: String,
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Posts"
  }],
  reels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "reels"
  }],
  follower:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  }],
  following:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  }],
  requests:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  }],
  isPrivate: { type: Boolean, default: false }  ,
  story:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:"story"
  }],
  socketId:String

})
userSchema.plugin(plm)


module.exports = mongoose.model('User', userSchema)