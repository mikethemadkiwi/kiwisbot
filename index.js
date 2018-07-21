// all in one mixer bot chat interactive loader.
const intLib = require('beam-interactive-node2');
const clientLib = require('beam-client-node');
const auth = require('mixer-shortcode-oauth');
const colors = require('colors');
const ws = require('ws'); 
//npm install beam-interactive-node2 colors ws beam-client-node mixer-shortcode-oauth --save
//
const mixer = [];
const configfile = './config.json';
const mc = require(`./mixerChat.js`);
const mi = require(`./mixerInteractive.js`); 
//




const authToken = require(configfile);
if (typeof authToken.clientId !== 'string') {
    throw new Error('clientId was not a string');
}

if (typeof authToken.clientSecret !== 'string' && authToken.clientSecret !== null) {
    throw new Error('clientSecret was not a string or null');
}

if (typeof authToken.interactiveId !== 'number') {
    throw new Error('interactiveId was not a number');
}

const authInfo = {
    client_id: authToken.clientId,
    client_secret: authToken.clientId,
    scopes: [
        'interactive:manage:self',
        'interactive:play',
        'interactive:robot:self',
        'chat:purge',
        'channel:analytics:self',
        'channel:details:self',
        'chat:bypass_links',
        'chat:bypass_slowchat',
        'chat:change_ban',
        'chat:chat',
        'chat:whisper',
        'chat:connect',
        'chat:edit_options',
        'chat:giveaway_start',
        'chat:poll_start',
        'chat:timeout',
        'chat:remove_message'
    ],
};


const store = new auth.LocalTokenStore(__dirname + '/mixertoken.json');
const authClient = new auth.ShortcodeAuthClient(authInfo, store);
authClient.on('code', code => {
    console.log(`Go to https://mixer.com/go?code=${code} and enter code ${code}...`);
});

authClient.on('expired', () => {
    console.error('Auth request expired');
    process.exit(1);
});

authClient.on('declined', () => {
    console.error('Auth request declined');
    process.exit(1);
});

authClient.on('error', (e) => {
    console.error('Auth error:', e);
    process.exit(1);
});

authClient.on('authorized', (token) => {
    //console.log('Got token!', token);
    loadMixerServices(token)
});

function mixerGameClientError(err){
    console.error('interactive connection error:', e);
    process.exit(1);
};

function loadMixerServices(token){

    //interactive
    mixer['interactive'] = new mi({
        authToken: token.access_token,
        versionId: authToken.interactiveId,
    });
    //chat   
    mixer['chat'] = new mc({
        authToken: token.access_token,
        expires_at: Date.now() + (365 * 24 * 60 * 60 * 1000),
        channelId: authToken.channelId,
    })










    ////////////////////////////////////////////////////////////
    // |Handlers|  
    ////////////////////////////////////////////////////////////
    const kothList = [];
    let sendlist = setInterval(function(){
        let list = [];
        for(var i=0;i<kothList.length;i++){
            if(kothList[i] != null){
                list.push(kothList[i]);
            }
        }
        mixer['interactive'].updateControl({
            sceneID: 'default',
            controls: [
                {
                    controlID: 'kothwinner',
                    data: list,
                },
            ],
        })
    }, 5000)
    let oldkoth = Date.now();
    mixer['interactive'].on('controlEvt', results => {
        // console.log(results.type)
        // console.log(results.data)
        console.log(results.data[0].controlID)
        console.log(results.data[2].username)
        console.log(`Spark Cost: ${results.data[0].cost}`)
        // if(typeof(results.data[0].meta.Command) != 'undefined'){
        //     console.log(results.data[0].meta.Command.value)            
        // }
        //console.log(`###################################################################`);
        //mixer['chat'].say(`User: ${results.data[2].username} pressed "${results.data[0].controlID}" for ${results.data[0].cost} sparks.`)
        switch(results.data[0].controlID){
            case'koth':
                //add user to koth
                let u = Date.now();
                let t = (u - oldkoth);
                if(typeof(kothList[results.data[2].userID]) == 'undefined'){
                    // console.log(`new user`)
                    kothList[results.data[2].userID] = {name: results.data[2].username, points: t};
                }
                else{          
                    // console.log(`old user`)
                    kothList[results.data[2].userID].points += t;
                }
                // console.log(kothList)
                //
                //add points to old user, replace new user

                mixer['interactive'].updateControl({
                    sceneID: 'default',
                    controls: [
                        {
                            controlID: 'koth',
                            text: results.data[2].username,
                        },
                    ],
                })

                oldkoth = u;
            break;
            case'lmiad':
                //mixer['chat'].say(`🔥 Look ${results.data[2].username}, I'm a dragon!! 🔥`)
                mixer['interactive'].updateControl({
                    sceneID: 'default',
                    controls: [
                        {
                            controlID: 'lmiad',
                            text: results.data[2].username,
                        },
                    ],
                })
            break;
            default://
        }
        //
        // if(results.data[2].channelGroups.includes('Owner')){
        //     mixer['interactive'].changeGroups(results.data[2], 'admin');
        // }
        // else if(results.data[2].channelGroups.includes('ChannelEditor')){
        //     mixer['interactive'].changeGroups(results.data[2], 'admin');
        // }
        if(results.data[2].channelGroups.includes('banned')){
            mixer['interactive'].changeGroups(results.data[2], 'banned');
        }
        // else{
        //     mixer['interactive'].changeGroups(results.data[2], 'game');
        // }
    });
    const intPlayers = [];
    mixer['interactive'].on('participantJoin', results => {
        console.log(`participantJoin`)
        console.log(`{${results.userID}} ${results.username}`)
        intPlayers[results.sessionID] = results;
        console.log(`###################################################################`);
    });
    mixer['interactive'].on('participantLeave', results => {
        console.log(`participantLeave`)
        console.log(results)
        console.log(intPlayers[results].username)
        console.log(`###################################################################`);
    });
    mixer['interactive'].on('participantUpdate', results => {
        console.log(`participantUpdate`)
        console.log(results)
        console.log(`###################################################################`);
    });
    mixer['chat'].on('ChatMessage', data => {
        //console.log('ChatMessage', data);  
        if(data.user_roles.includes('Owner')){
            var tmptxt = '';
            for (key in data.message.message) { tmptxt += data.message.message[key].text; };
            var cmd = tmptxt.split(' ');// 1st word = cmd[0] 2nd word = cmd[1] etc etc
            if (cmd[0].substr(0, 1) == "!") {
                switch (cmd[0]) {
                //
                case '!time': 
                    let t = new Date(Date.now())
                    mixer['chat'].say(`Current Time:  ${t}`);
                break;
                case '!viola': 
                    //mixer['interactive'].changeGroups(cmd[1], cmd[2]);
                break;
                
                default:
                //
                }
            }
        }            
    });

};


// do this last. checks auth and sets standards, 
//eventually we should error check this
authClient.doAuth();