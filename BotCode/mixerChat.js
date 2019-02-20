//requires
let util = require('util');
let events = require('events');
//module
let beamchat = function(auth) {
    //
    let userInfo;
    let self = this;
    let mixer; 
    const ws = require('ws');
    const Mixer = require('beam-client-node');
    const client = new Mixer.Client(new Mixer.DefaultRequestRunner());
    client.use(new Mixer.OAuthProvider(client, {
        tokens: {
            access: auth.authToken,
            expires: auth.expires_at,
        },
    }));
    
    // Gets the user that the Access Token we provided above belongs to.
    client.request('GET', `users/current`)
    .then(response => {
        userInfo = response.body;
        return new Mixer.ChatService(client).join(auth.channelId);
    })
    .then(response => {
        const body = response.body;
        return createChatSocket(userInfo.id, auth.channelId, body.endpoints, body.authkey);
    })
    .catch(error => {
        self.emit('error', error)
    });

    /**
     * Creates a Mixer chat socket and sets up listeners to various chat events.
     * @param {number} userId The user to authenticate as
     * @param {number} channelId The channel id to join
     * @param {string[]} endpoints An array of endpoints to connect to
     * @param {string} authkey An authentication key to connect with
     * @returns {Promise.<>}
     */
    function createChatSocket (userId, channelId, endpoints, authkey) {
        mixer = new Mixer.Socket(ws, endpoints).boot();
        mixer.on('UserJoin', data => {
            self.emit('UserJoin', data);
        });
        mixer.on('UserLeave', data => {
            self.emit('UserLeave', data);
        });
        mixer.on('ChatMessage', data => {
            self.emit('ChatMessage', data);  
        });
        mixer.on('error', error => {
            self.emit('error', error);
        });
        mixer.on('PollStart', data => {
            self.emit('PollStart', data);
        });
        mixer.on('PollEnd', data => {
            self.emit('PollEnd', data);
        });
        mixer.on('PurgeMessage', data => {
            self.emit('PurgeMessage', data);
        });
        mixer.on('DeleteMessage', data => {
            self.emit('DeleteMessage', data);
        });
        mixer.on('ClearMessages', data => {
            self.emit('ClearMessages', data);
        });
        mixer.on('UserUpdate', data => {
            self.emit('UserUpdate', data);
        });
        mixer.on('unhandledRejection', (reason, p) => {
            console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
        });
        return mixer.auth(channelId, userId, authkey)
        .then(() => {
            self.emit('Login', true);
        })
    }
    self.say = function(msg) {
        mixer.call('msg', [`${msg}`])
        .catch(function(err){
            console.log(err)
        });
    }
    self.whisper = function(user, msg) {
        mixer.call('whisper', [user, `${msg}`])
        .catch(function(err){
            console.log(err)
        });
    }
    self.poll  = function(q, a, t){
        mixer.call('vote:start', [q, a, t]);
    }
    self.selfBan = function(user, time){
        mixer.call('timeout', [user, time])
    }
    self.purgeUser = function(user){
        mixer.call('purge', [user])
    }
    self.on('unhandledRejection', (reason, p) => {
        console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    });
        //
}
beamchat.prototype = new events.EventEmitter;
module.exports = beamchat;