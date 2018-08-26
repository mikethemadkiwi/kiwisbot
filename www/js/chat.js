var bigBang = new Date(Date.now());
//
//console.log('Began at :'+ bigBang);

// if(window.location.hash){
//
var socket = io(); // Socket.io
var ls = localStorage; //local broswer storage variable.
var mc = document.getElementById('mainContent');
let objDatabase = [];


socket.on('connected', function(socketname) {
    if(window.location.hash){ socket.emit('hash', window.location.hash); }
});
socket.on('beamchatline', function(data) {
    objDatabase.push(new chatobjectProto(data));
    UpdateEngine();
    console.log('beamchatline');
    console.log(data);
});

var chatobjectProto = function(data) {
    this.io = data;
    this.starttime = Date.now();
};
chatobjectProto.prototype.update = function(id) {
        var tmpd = Date.now() - this.starttime;
        var t = '';
        for (var i = 0; i < this.io.data.message.message.length; i++) {
            t += this.io.data.message.message[i].text;
        };
        if (this.io.apidata.avatarUrl != null) {
            mc.innerHTML += '<div id="nametag" class="' + this.io.data.user_roles[0] + '"><img src="' + this.io.apidata.avatarUrl + '" width="20px" />' + this.io.data.user_name + ' - Level ' + this.io.data.user_level + ' ' + this.io.data.user_roles[0] + '</div><div id="'+id+'" class="chattxt"></div>';
            let chattxt = document.getElementById(id);
            chattxt.innerText += ''+t+'';
        } else {
            mc.innerHTML += '<div id="nametag" class="' + this.io.data.user_roles[0] + '">' + this.io.data.user_name + ' - Level ' + this.io.data.user_level + ' ' + this.io.data.user_roles[0] + '</div><div id="'+id+'" class="chattxt"></div>';
            let chattxt = document.getElementById(id);
            chattxt.innerText += ''+t+'';
        }
};
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