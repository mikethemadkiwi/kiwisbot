var bigBang = new Date(Date.now());
var socket = io(); // Socket.io
var picbox = document.getElementById('picbox');
let possiblepics = [
'/media/img/Anonymous.jpg',
'/media/img/dafuck.jpg',
'/media/img/drugs.jpg',
'/media/img/help.gif',
'/media/img/kiwidance.gif',
'/media/img/mad_kiwi.jpg',
'/media/img/moister.jpg',
'/media/img/nathan_vaseline.PNG',
'/media/img/thatmoment.gif',
'/media/img/wizard.jpg',
'/media/img/wtf_is_this.gif',
];
let lastclicked = Date.now();
function randomFromInterval(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
};
socket.on('connected', function(socketname) {
    let tmpnum = randomFromInterval(0, possiblepics.length -1);
    //picbox.src = possiblepics[tmpnum];
});

socket.on('changescreenclickimagespecific', function(data) {
    picbox.src = data;
    //
});
socket.on('changescreenclickimage', function(data) {
    let tmpnum = randomFromInterval(0, possiblepics.length -1);
    picbox.src = possiblepics[tmpnum];
    //
});

socket.on('screenclick', function(data) {//x and y 0-1 percentage.
    let windowx = window.innerWidth / 100;
    let windowy = window.innerHeight / 100;
    let x = data.x * 100 * windowx;
    let y = data.y * 100 * windowy;
    console.log(x, y);
    halfw = picbox.width / 2;
    halfh = picbox.height / 2;
    x = x-halfw;
    y = y-halfh;
    picbox.style.position = 'absolute';
    // picbox.style.top = y+'px';
    // picbox.style.left = x+'px';
    picbox.style.webkitTransform = "translate("+x+"px,"+y+"px)";
    picbox.style.transitionDuration = "1.5s";
});