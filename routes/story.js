const mongoose = require("mongoose")

const storySchema = new mongoose.Schema({
    content: String,
    createdAt: { type: Date, default: Date.now },
    userId: mongoose.Schema.Types.ObjectId,
  });

module.exports=mongoose.model('story',storySchema)