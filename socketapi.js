const io = require( "socket.io" )();
const userModel = require("./routes/users")
const msgModel = require("./routes/messages")
const socketapi = {
    io: io
};

// Add your socket.io logic here!
io.on( "connection", function( socket ) {
    console.log( "A user connected" );

    socket.on("newUserJoine", async username=>{

        const currentuser = await userModel.findOne({username})

        const onlinUsers = await userModel.find({
            socketId: { $nin: [""] },
            username: { $nin: [username] }
        })

        socket.broadcast.emit("addonlineuser", {
            name: currentuser.username,
            profile: currentuser.profilepic
        })

        onlinUsers.forEach(singleuser=>{
            socket.emit("addonlineuserone",{
                name : singleuser.username,
                profile:singleuser.profilepic
            })
        })

        // console.log("current user "+onlinUsers);


        currentuser.socketId = socket.id ;
        await currentuser.save()

    })

    socket.on("privateMsg", async msg=>{
        const msgs = await msgModel.create({
            msg:msg.sendermsg,
            sender:msg.sender,
            reciver:msg.reciver
        })

        var forreciver = await userModel.findOne({username:msg.reciver})

        await msgs.save()

        socket.to(forreciver.socketId).emit("recivermsg", msg.sendermsg)
        
    })

    socket.on('disconnect', async () => {
        await userModel.findOneAndUpdate({
            socketId: socket.id
        }, {
            socketId: ''
        })
    })

    socket.on("getallchats", async allmsg=>{
        const allMessage = await msgModel.find({
            $or: [{
                sender: allmsg.sender,
                reciver: allmsg.reciver
            },
            {
                sender: allmsg.reciver,
                reciver: allmsg.sender
            }]
        })

        socket.emit("allchats", allMessage)
    })

});
// end of socket.io logic

module.exports = socketapi;