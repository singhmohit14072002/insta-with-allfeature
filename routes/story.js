const mongoose = require("mongoose")

const storySchema = new mongoose.Schema({
  dp: String,
  story: {
    type: String,
    default: "https://cdn.iconscout.com/icon/free/png-256/free-add-instagram-story-4941588-4108988.png"
  },
  createdAt: { type: Date, default: Date.now },
  userId: mongoose.Schema.Types.ObjectId,
});

module.exports = mongoose.model('story', storySchema)