const mongoose  =  require("mongoose")

const replyschema = mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }, 
    postid:String,
    reply :String,

})

module.exports = mongoose.model("replys", replyschema)