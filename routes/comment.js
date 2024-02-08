const mongoose  =  require("mongoose")

const commetschema = mongoose.Schema({
    postid:String,
    comment :String,
    reply:[{
        type:mongoose.Schema.Types.ObjectId ,ref:"Comment"}]

})

module.exports = mongoose.model("comment", commetschema)