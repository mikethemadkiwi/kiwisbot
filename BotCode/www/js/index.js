var bigBang = new Date(Date.now());
//
//console.log('Began at :'+ bigBang);

// if(window.location.hash){
    //
var socket = io(); // Socket.io
// var ls = localStorage; //local broswer storage variable.
var mc = document.getElementById('mainContent');
let objDatabase = [];


socket.on('ChatMessage', function(data) {
    // console.log('ChatMessage', data)
    let obj = {};
    obj.data = data;
    obj.str = '';
    obj.update = function(){
        obj.str = '';
        let tmpstr = `${obj.data.user_level} > ${obj.data.user_name} > `;
        for (key in obj.data.message.message){
            tmpstr += `${obj.data.message.message[key].text} `;
        }
        tmpstr += '<br />';        
        mc.innerHTML += tmpstr;
    }
    objDatabase.push(obj);
    UpdateEngine();
});
socket.on('participantJoin', function(data) {
    // console.log(data)
    console.log(`user connected from Interactive:`);  
// if(window.location.hash){ socket.emit('hash', window.location.hash); }
});
// socket.on('disconnected', function(socketname) {
//     console.log(`user disconnected from socket: ${socketname}.`);
// // if(window.location.hash){ socket.emit('hash', window.location.hash); }
// });
socket.on('participantLeave', function(data) {
    // console.log(data)
    console.log(`user disconnected from Interactive:`);
// if(window.location.hash){ socket.emit('hash', window.location.hash); }
});

//button events
socket.on('sound', function(name) {
    switch(name){
        case 'honk':
        soundObj(name, 'media/sounds/honk.mp3', 0.5)// name, location of file, volume from 0 <> 1. 0.5 being 50%
        break;
        default://
    }
});
socket.on('video', function(name) {
    switch(name){
        case 'effyou':
        videoObj(name, 'media/videos/effyou.mp4', 1)//a video example.
        break;
        default://
    }
});
socket.on('image', function(name) {
    console.log(name);
    switch(name){
        case 'poop':
        //new notificationProto('image', `<img src='media/img/poop.jpg' />`);
        break;
        default://
    }
});



// let followObjectProto = function (data){
//     this.io = data;
//     this.starttime = Date.now();
// }
// followObjectProto.prototype.update = function(id){
//     mc.innerHTML += mc.innerHTML += `<div id="nametag" class="Owner">Followed:</div><div id="${id}" class="chattxt"></div>`;
//     let chattxt = document.getElementById(id);
//     chattxt.innerText += `${this.io.info.user_name} is following us!!!`;
// }


///
// UPDATE ENGINE
///
let UpdateEngine = function() {
    mc.innerHTML = '';
    for (key in objDatabase) {
        objDatabase[key].update();
    }
    window.scrollTo(0, document.body.scrollHeight);
};