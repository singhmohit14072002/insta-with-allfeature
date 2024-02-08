const mongoose = require('mongoose');

const msgSchema = mongoose.Schema({
    msg: {
        type: String,
        required: [true, 'msg is required for creating a message document']
    },
    sender: String,
    reciver: String,
    replys: [{
        type: mongoose.Types.ObjectId,
        ref: 'msg'
    }],  //rep
    // group

},
    {
        timestamps: true
    }
)
module.exports = mongoose.model('msg', msgSchema)