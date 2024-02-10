const mongoose  =  require("mongoose")

const commetschema = mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }, 
    postid:String,
    comment :String,
    reply:[{
        type:mongoose.Schema.Types.ObjectId ,ref:"replys"}]

})

module.exports = mongoose.model("comment", commetschema)