const mongoose = require("mongoose")
const plm = require("passport-local-mongoose")

// mongoose.connect("mongodb://127.0.0.1:27017/instagramOriginal")

mongoose.connect("mongodb+srv://shivamshah1210:FrniPY5T4jf3PMww@cluster0.e0emzlh.mongodb.net/?retryWrites=true&w=majority")

var userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  bio: String,
  password: String,
  profilepic: {
    type:String,
    default: "https://st3.depositphotos.com/9998432/13335/v/450/depositphotos_133352010-stock-illustration-default-placeholder-man-and-woman.jpg"
  },
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