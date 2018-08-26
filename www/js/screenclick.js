var bigBang = new Date(Date.now());
var socket = io(); // Socket.io
var picbox = document.getElementById('picbox');
let possiblepics = [
'/media/img/1up.gif',
'/media/img/Anonymous.jpg',
'/media/img/asshole.png',
'/media/img/dafuck.jpg'
];
let lastclicked = Date.now();
function randomFromInterval(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
};
socket.on('connected', function(socketname) {
    if(window.location.hash){ socket.emit('hash', window.location.hash); }
    picbox.src = "media/img/kiwi-trans.png";
});

socket.on('changescreenclickimage', function(data) {
    let tmpnum = randomFromInterval(0, possiblepics.length -1);
    picbox.src = possiblepics[tmpnum];
    //
});

socket.on('screenclick', function(data) {//x and y 0-1 percentage.
    console.log('screenclick');
    console.log(data);
    let x = data.x * 100;
    let y = data.y * 100;
    picbox.style.position = "absolute";
    picbox.style.left =x+'%';
    picbox.style.top = y+'%';
});

setInterval(function(){
    let diff = Date.now() - lastclicked;
    if(diff > 120000){

    }
},30000);