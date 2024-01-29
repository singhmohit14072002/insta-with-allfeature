const mongoose = require("mongoose")

var postSchema = mongoose.Schema({
    title: String,
    reelsDate: {
        type: Date,
        default: Date.now
    },
    description:String,
    path:String,
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }, 
    likes: [],
    comment: [],
})

module.exports=mongoose.model('reels',postSchema)