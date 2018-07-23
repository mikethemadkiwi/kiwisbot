//requires
let util = require('util');
let events = require('events');
//module
let obj = function(chanid){
    const Carina = require('carina').Carina;
    const ws = require('ws');
    Carina.WebSocket = ws;
    const channelId = chanid;
    const ca = new Carina({ isBot: true }).open()
    let self = this;
    ca.subscribe(`channel:${channelId}:followed`, data => {
        self.emit('event', {type: 'followed', info: data});
    });
    ca.subscribe(`channel:${channelId}:hosted`, data => {
        self.emit('event', {type: 'hosted', info: data});
    });
    ca.subscribe(`channel:${channelId}:subscribed`, data => {
        self.emit('event', {type: 'subscribed', info: data});
    });
    ca.subscribe(`channel:${channelId}:resubscribed`, data => {
        self.emit('event', {type: 'resubscribed', info: data});
    });
    ca.subscribe(`channel:${channelId}:resubShared`, data => {
        self.emit('event', {type: 'resubShared', info: data});
    });
    ca.subscribe(`channel:${channelId}:update`, data => {
        self.emit('event', {type: 'update', info: data});
    });
    ca.subscribe(`interactive:${channelId}:connect`, data => {
        self.emit('event', {type: 'gameconnect', info: data});
    });
    //
    ca.on('unhandledRejection', (reason, p) => {
        console.log(` constellation`)
        console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    });
    ca.on('error', (err) => {
        ca.close();
        console.log(` constellation`)
        console.log(err);
    });    
};
obj.prototype = new events.EventEmitter;
module.exports = obj;