const express = require('express')
const path = require('path')
const app = express()
const server = require('http').Server(app)
const { Console } = require("console");
const io = require("socket.io")(server,{
    cors:{
        origin:"*",
         },
});

var rooms={}

app.set('views','./views')
app.set('view engine','ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))

//routings
app.get('/',(req,res)=>{
    res.render('index',{rooms:rooms})
})

app.post('/room',(req,res)=>{
    if (rooms[req.body.room] != null) {
        console.log(`Redirected To room:${req.body.room}`)
        return res.redirect(`/${req.body.room}`)
      }
      rooms[req.body.room] = { Users: {} }
      res.redirect(req.body.room)
      
})

app.get('/:room',(req,res)=>{
    console.log(req.params.room)
    res.render('room',{roomName:req.params.room})
})
server.listen(3000)
io.on('connection',socket =>{
    socket.on('new-user',(roomName,name)=>{
        console.log(`server Has rooms: ${rooms}`)
        socket.join(roomName)
        rooms[roomName].Users[socket.id] = name
        socket.broadcast.to(roomName).emit('user-connected',name)
        var userNames = []
        for(var index in rooms[roomName].Users)
        {
            if(index!=socket.id)
            {
                userNames.push(rooms[roomName].Users[index])
            }
        }
        socket.emit('users-in-session',userNames)
    })
    socket.on('user-typing',(roomName)=>{
        socket.broadcast.to(roomName).emit('user-typing',rooms[roomName].Users[socket.id])
    })
    socket.on('send-chat-message',(roomName,message)=>{
        var data = {name:rooms[roomName].Users[socket.id] ,message:message}
        socket.broadcast.to(roomName).emit('chat-message',data)
    })
    socket.on('disconnect',()=>{
            getRoomFromUser(socket).forEach(roomName=>{
                socket.broadcast.to(roomName).emit('user-disconnected',rooms[roomName].Users[socket.id])
                delete rooms[roomName].Users[socket.id]
            })
           
        
    })
})
function getRoomFromUser(socket)
{
    var userinRoom =[]
    for(var room in rooms)
    {
        for(var user in rooms[room].Users)
        {
            if(user==socket.id)
            {
               userinRoom.push(room)
            }
        }
    }
    return userinRoom;
}

