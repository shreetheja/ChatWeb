const socket = io.connect('http://localhost:3000')

const messageForm = document.getElementById('send-form')
const messageInput = document.getElementById('message-input')
const messageContainer = document.getElementById('message-cont')
const peopleContainer = document.getElementById('people-cont')

var MessageElem = document.querySelector('#chat-message');
var PeopleElem = document.querySelector('#people-message');

const name = prompt("What is your name?")

var canPublish = true
var TypeThrottle = 200
var usersTyping = {}
var users = {}

socket.emit('new-user',name)

socket.on('users-in-session',data=>
{
    data.forEach(value=>
    {
        appendPeople(value)
    })
    document.getElementById("user-name").innerText =`your name : ${name}`
})
socket.on('user-connected',name=>
{
    UserConnected(name)
})
socket.on('user-typing',name=>
{
    UserTyping(`${name}`)
})
socket.on('chat-message',data=>
{
    appendMessage(`${data.name} : ${data.message}`)
})
socket.on('user-disconnected',name=>
{
    UserDisconnected(name)
})


messageForm.addEventListener('submit',e=>
{
    e.preventDefault();
    const message = messageInput.value;
    socket.emit('send-chat-message',message)
    appendMessage(`you : ${message}`)
    messageInput.value = ''
})
messageInput.addEventListener('keyup',()=>{
    if(canPublish)
    {
        socket.emit('user-typing')
        canPublish =false
        setTimeout(function(){
            canPublish =true
        },TypeThrottle)
    }
})

function appendMessage(message)
{
    var clone = MessageElem.cloneNode(true);
    clone.innerText = message;
    messageContainer.append(clone)
    
}
function appendPeople(name)
{
    var clone = PeopleElem.cloneNode(true);
    clone.innerText = name;
    clone.setAttribute("id",name);
    console.log(clone)
    peopleContainer.append(clone)
    
}
function UserConnected(name)
{
    appendMessage(`${name} Joined.`)
    var clone = PeopleElem.cloneNode(true);
    clone.classList.remove("order-1");
    clone.classList.add("order-5");
    clone.innerText = name;
    clone.setAttribute("id",name);
    peopleContainer.append(clone)
    userEntered(name)
    
}
function UserDisconnected(name)
{
   appendMessage(`${name} Left.`)
   var holder = document.getElementById(name)
   holder.classList.remove("order-5");
   holder.classList.add("order-12");
   holder.style.backgroundColor = "#800000"
   console.log(holder)
}





// animation Methods
function UserTyping(name)
{
    var ele = document.getElementById(name)
    ele.classList.remove("order-5");
    ele.classList.add("order-3");
    ele.classList.add("backgroundAnimatedTyping")
    setTimeout(StoppedTyping,4000,name)
}
function StoppedTyping(name)
{
    var ele = document.getElementById(name)
    ele.classList.remove("order-3");
    ele.classList.add("order-5");
    ele.classList.remove("backgroundAnimatedTyping")
    console.log("Animated")
}

function userEntered(name)
{
    var ele = document.getElementById(name)
    ele.classList.remove("order-5");
    ele.classList.remove("order-2");
    ele.classList.add("backgroundAnimatedNewUser")
    setTimeout(StoppedTyping,4000,name)
}
function userEnteredFinish(name)
{
    var ele = document.getElementById(name)
    ele.classList.remove("order-2");
    ele.classList.remove("order-5");
    ele.classList.add("backgroundAnimatedNewUser")
    setTimeout(StoppedTyping,4000,name)
}

