const { Console } = require("console");
const io = require("socket.io")(3000,{
    cors:{
        origin:"*",
         },
    });

var Users={}

io.on('connection',socket =>{
    socket.on('new-user',name=>{
        Users[socket.id] = name
        socket.broadcast.emit('user-connected',name)
        var userNames = []
        for(var index in Users)
        {
            if(index!=socket.id)
            {
                userNames.push(Users[index])
            }
        }
        socket.emit('users-in-session',userNames)
    })
    socket.on('user-typing',()=>{
        socket.broadcast.emit('user-typing',Users[socket.id])
    })
    socket.on('send-chat-message',message=>{
        var data = {name:Users[socket.id] ,message:message}
        socket.broadcast.emit('chat-message',data)
    })
    socket.on('disconnect',()=>{
        socket.broadcast.emit('user-disconnected',Users[socket.id])
        delete Users[socket.id]
    })
})