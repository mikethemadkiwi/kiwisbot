var bigBang = new Date(Date.now());
//
//console.log('Began at :'+ bigBang);

// if(window.location.hash){
//
var socket = io(); // Socket.io
var ls = localStorage; //local broswer storage variable.
var mc = document.getElementById('mainContent');
let jukebox = document.getElementById("jukebox");
let soundObj = function (name, loc, vol){
    jukebox.src = loc;
    jukebox.volume = vol;
    jukebox.play();
}
let vidbox = document.getElementById("vidbox");
vidbox.onended = function(){
    vidbox.src = '';
};
let videoObj = function (name, loc, vol){
    vidbox.src = loc;
    vidbox.volume = vol;
    vidbox.play();
}


let objDatabase = [];


socket.on('connected', function(socketname) {
    //console.log(`you are connected as socket: ${socketname}.`);
    if(window.location.hash){ socket.emit('hash', window.location.hash); }
});
    
    socket.on('tweet', function(data) {
        console.log('tweet');
        console.log(`User ${data.user.screen_name} from ${data.user.location} Tweeted: ${data.text}`)
    });
    socket.on('beamjoin', function(data) {
        console.log('beamjoin');
        console.log(data);
    });
    socket.on('beampart', function(data) {
        console.log('beampart');
        console.log(data);
    });
    socket.on('ts3join', function(data) {
        console.log('ts3join');
        console.log(data);
    });
    socket.on('ts3part', function(data) {
        console.log('ts3part');
        console.log(data);
    });
    socket.on('ts3text', function(data) {
        console.log('ts3text');
        console.log(data);
    });
    socket.on('radiorequest', function(res) {
        console.log('radiorequest');
        console.log(res);
    });
    socket.on('venture', function(data) {
        console.log('venture');
        console.log(data);
        //new notificationProto('Venture', data);
    });
    socket.on('followed', function(data) {
        console.log('followed');
        console.log(data);
        objDatabase.push(new followObjectProto(data));
        UpdateEngine();
        //gamelist[data.info.id] = new gameObj("Followed", data.info.user.username, data.info.user.avatarUrl, data.info.id, data.info);
    });
    socket.on('unfollowed', function(data) {
        console.log('unfollowed');
        console.log(data);
        objDatabase.push(new unfollowObjectProto(data));
        UpdateEngine();
        //gamelist[data.info.id] = new gameObj("UnFollowed", data.info.user.username, data.info.user.avatarUrl, data.info.id, data.info);
    });
    socket.on('hosted', function(data) {
        console.log('hosted');// hoster (hosting you) hostee (you hosting)
        console.log(data);
        //gamelist[data.info.id] = new gameObj("Hosted", data.info.user.username, data.info.user.avatarUrl, data.info.id, data.info);
    });
    socket.on('PurgeMessage', function(data) {
        console.log('PurgeMessage');// hoster (hosting you) hostee (you hosting)
        console.log(data);
        //gamelist[data.info.id] = new gameObj("Hosted", data.info.user.username, data.info.user.avatarUrl, data.info.id, data.info);
    });
    socket.on('banneduser', function(data) {
        console.log('banneduser');// hoster (hosting you) hostee (you hosting)
        console.log(data);
        //gamelist[data.info.id] = new gameObj("Hosted", data.info.user.username, data.info.user.avatarUrl, data.info.id, data.info);
    });
    socket.on('subscribed', function(data) {
        console.log('subscribed');
        console.log(data);
        //gamelist[data.info.id] = new gameObj("Hosted", data.info.user.username, data.info.user.avatarUrl, data.info.id, data.info);
    });
    socket.on('resubscribed', function(data) {
        console.log('resubscribed');
        console.log(data);
        //gamelist[data.info.id] = new gameObj("Hosted", data.info.user.username, data.info.user.avatarUrl, data.info.id, data.info);
    });

    //button events
    socket.on('sound', function(name) {
        switch(name){
            case 'honk':
            soundObj(name, '/media/sounds/honk.mp3', 0.5)// name, location of file, volume from 0 <> 1. 0.5 being 50%
            break;
            default://
        }
    });
    socket.on('video', function(name) {
        switch(name){
            case 'effyou':
            videoObj(name, '/media/videos/effyou.mp4', 1)//a video example.
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
let unfollowObjectProto = function (data){
    this.io = data;
    this.starttime = Date.now();
}
unfollowObjectProto.prototype.update = function(id){
    mc.innerHTML += mc.innerHTML += `<div id="nametag" class="Owner">Unfollowed</div><div id="${id}" class="chattxt"></div>`;
    let chattxt = document.getElementById(id);
    chattxt.innerText += `${this.io.info.user.username} is a fucking dick for unfollowing us!!! dick! fucking dick,...... yeah i said it... dick...`;
}
//
let followObjectProto = function (data){
    this.io = data;
    this.starttime = Date.now();
}
followObjectProto.prototype.update = function(id){
    mc.innerHTML += mc.innerHTML += `<div id="nametag" class="Owner">Followed:</div><div id="${id}" class="chattxt"></div>`;
    let chattxt = document.getElementById(id);
    chattxt.innerText += `${this.io.info.user_name} is following us!!!`;
}










///
// UPDATE ENGINE
///
let UpdateEngine = function() {
    mc.innerHTML = '';
    if(objDatabase.length > 8){
        objDatabase.shift(); 
    }
    for (var i = 0;i< objDatabase.length; i++) {
        objDatabase[i].update(i);
    }
    window.scrollTo(0, document.body.scrollHeight);
};

