const mongoose = require("mongoose")

var postSchema = mongoose.Schema({
    postText: String,
    postDate: {
        type: Date,
        default: Date.now()
    },
    postPic:String,
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }, 
    likes: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    
    

    
})

module.exports=mongoose.model('Posts',postSchema)