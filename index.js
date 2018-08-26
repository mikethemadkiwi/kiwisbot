// all in one mixer bot chat interactive loader.
const intLib = require('beam-interactive-node2');
const clientLib = require('beam-client-node');
const auth = require('mixer-shortcode-oauth');
const colors = require('colors');
const ws = require('ws'); 
const say = require('say');//--
//npm install beam-interactive-node2 colors ws beam-client-node mixer-shortcode-oauth say carina --save
//
const mixer = [];
const configfile = './config.json';
const mc = require(`./mixerChat.js`);
const mi = require(`./mixerInteractive.js`); 
const mConst = require(`./mixerConstellation.js`); 
const mSock = require(`./mixerPageSocket.js`); 
//

const kothList = [];
let oldkoth = Date.now();
let commandBlacklist = []; // commandBlacklist[username] = {datetime rmeoval}
let globalCooldown = [];
const intPlayers = [];
const playerList = [];


let emojiFarm=[];
emojiFarm.push({id: 'dragon',data: '🐉'})
emojiFarm.push({id: 'dragonface',data: '🐲'})
emojiFarm.push({id: 'kiwi',data: '🥝'})
emojiFarm.push({id: 'greenheart',data: '💚'})

let playerObj = function (userid, participant){ // you should use this... you wrote it... didnt ( didnt what you stoned old man?!?!?!? )
    let self = this;
    self.userid = userid;
    self.participant = participant;
    self.api;
    self.stats = {
        name: '',
        hp: 0,
        mp: 0,
        ss: 0,
        str:0,
        agi:0,
        int:0,
        buff:[],
        debuff:[],
        items: {
        head: -1,
        chest: -1,
        legs: -1,
        feet: -1,
        wea1: -1,
        wea2: -1,
        },
        inventory:{
            player: [],
            bank: [],
        },
        rewards:{
        achieves: [],
        currency: 0,
        bankcurrency: 0,
        owned: [],
        },
    }
    return self;
}


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

function buttonEvent(results){
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
            mixer['chat'].say(`🔥 Look @${results.data[2].username}, I'm a dragon!! 🔥`)
            // mixer['chat'].whisper(results.data[2].username,`🔥 Look ${results.data[2].username}, I'm a dragon!! 🔥`)
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
        case'seecode':
            mixer['chat'].say(`The Code for this bot is Here @${results.data[2].username}:\n https://cnhv.co/8glgz`)
            sayThis(`Check out Mike the Mad kiwi's code! Download Link has been added to chat`);
        break; 
        case'support':
            mixer['chat'].whisper(results.data[2].username, `You can support by running this while you watch!! it supports the community i am part of! https://authedmine.com/media/miner.html?key=xPTovGD63eQRfB2zRLPI6vrN9zPzmoJJ`)
        break;  
        case'selfshout':
            mixer['chat'].say(`Give @${results.data[2].username} a follow and check them out some time! you'll be glad you did :D mixer.com/${results.data[2].username} :D`)
            sayThis(`Shameless Promotion mode engaged. You should all go follow ${results.data[2].username} . They are amazing. Shameless Promotion mode disengaged.`)
        break;
        case'banme':
            mixer['chat'].selfBan(results.data[2].username, 120);
            sayThis(`${results.data[2].username} couldnt handle it anymore and banned themselves!`);
        break;
        case'overlay':
            console.log(results.data[1])
        break;
        default://
    }

}

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
    //const   
    mixer['const'] = new mConst(authToken.channelId);
    //mixer page websocket
    mixer['sock'] = new mSock();

    ////////////////////////////////////////////////////////////
    // |Handlers|  
    ////////////////////////////////////////////////////////////
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
    }, 500)
    mixer['interactive'].on('controlEvt', results => {
        // console.log(results.type)
        // console.log(results.data)
        // console.log(results.data[0].controlID)
        // console.log(results.data[2].username)
        // console.log(`Spark Cost: ${results.data[0].cost}`)
        // if(typeof(results.data[0].meta.Command) != 'undefined'){
        //     console.log(results.data[0].meta.Command.value)            
        // }
        //console.log(`###################################################################`);
        //mixer['chat'].say(`User: ${results.data[2].username} pressed "${results.data[0].controlID}" for ${results.data[0].cost} sparks.`)
        //inputEvent.transactionID.hasOwnProperty('propname')
        let CD = 5000;
        if(results.data[0].meta.hasOwnProperty('CD')){
            // console.log(results.data[0])
            let gCD = results.data[0].meta.CD.value; //30000
            // globalCooldown
            let tmpg = -1;
            
            // console.log(globalCooldown)
            for (key in globalCooldown){
                if (key == results.data[0].controlID){
                    tmpg = Number(globalCooldown[key]);// returns Date
                }
            }
            
            if(tmpg != -1){ // 
                if(Date.now() > tmpg){
                    globalCooldown[results.data[0].controlID] = (Date.now() + gCD); 
                    buttonEvent(results);
                }
                else{
                    let tuc = globalCooldown[results.data[0].controlID] - Date.now(); //should return time until over
                    mixer['chat'].whisper(results.data[2].username,`:GoatLick :mixerlove Someone has pressed this button too recently. ${tuc} ms til usable. :GoatLick :mixerlove`);
                }
            }
            else{
                globalCooldown[results.data[0].controlID] = (Date.now() + gCD);
                buttonEvent(results); 
            }

        }
        else { // process if the button is NOT globally cooled

            //if  buttonpress is koth or mainpanelswitch dont run this.
            if(results.data[0].controlID == 'mainpanelswitch' || results.data[0].controlID == 'koth'){
                buttonEvent(results);
            }
            else{
                let tmpu = -1; // THIS IS RETURNING fuckkkkkkkki
                if(results.data[0].controlID == 'banme'){
                    CD = 120000
                }
                for (key in commandBlacklist){
                    if (key == results.data[2].username){
                        //this is the fuggin id i want... check if THIS exists...
                        tmpu = commandBlacklist[key];
                    }
                }
                if(tmpu != -1){ // user exists
                    if(Date.now() > tmpu){
                        commandBlacklist[results.data[2].username] = (Date.now() + CD); 
                        buttonEvent(results);
                    }
                    else{
                        mixer['chat'].whisper(results.data[2].username, ':GoatLick :mixerlove You have pressed a button too recently. Fugg off... learn some GD patience. :GoatLick :mixerlove')
                        // console.log(tmpu)
                    }
                }
                else{
                    commandBlacklist[results.data[2].username] = (Date.now() + CD);
                    buttonEvent(results); 
                }
            }

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


    mixer['interactive'].on('participantJoin', results => {
        console.log(`${colors.green(`Participant: `)} ${colors.yellow(`join`)}`)
        console.log(`{${results.userID}} ${results.username}`)
        intPlayers[results.sessionID] = results;
        playerList[results.sessionID] = new playerObj(results.userID, results);
        mixer['sock'].sendToSocket('participantJoin', playerList[results.sessionID])
    });
    mixer['interactive'].on('participantLeave', results => {
        console.log(`${colors.green(`Participant: `)} ${colors.yellow(`leave`)}`)
        console.log(results)
        console.log(intPlayers[results].username)     
        mixer['sock'].sendToSocket('participantLeave', playerList[results])
        for(key in intPlayers){
            if(intPlayers[key].sessionID == results){
                intPlayers.splice(key, -1);
            }
        }
    });
    mixer['interactive'].on('participantUpdate', results => {
        console.log(`${colors.green(`Participant: `)} ${colors.yellow(`update`)}`)
        console.log(results)
        intPlayers[results.sessionID] = results;
        console.log(`###################################################################`);
    });
    mixer['chat'].on('ChatMessage', data => {
        //console.log('ChatMessage', data);  
        if(data.user_roles.includes('Owner')){
            var tmptxt = '';
            for (key in data.message.message) { tmptxt += data.message.message[key].text; };
            var cmd = tmptxt.split(' ');// 1st word = cmd[0] 2nd word = cmd[1] etc etc
            if (cmd[0].substr(0, 1) == "`") {
                switch (cmd[0]) {
                //
                case '`time': 
                    let t = new Date(Date.now())
                    mixer['chat'].say(`Current Time:  ${t}`);
                break;
                case '`boardban':
                    let u; 
                    for(key in intPlayers){
                        if(intPlayers[key].username == cmd[1]){
                            u = intPlayers[key];
                        }
                    }
                    mixer['interactive'].changeGroups(u, 'banned');
                break;
                case '`unboardban':
                    let thisidentifierisunique; //apparently i got angry at this variable...
                    for(key in intPlayers){
                        if(intPlayers[key].username == cmd[1]){
                            thisidentifierisunique = intPlayers[key];
                        }
                    }
                    mixer['interactive'].changeGroups(thisidentifierisunique, 'default');
                break;
                case '`yton':
                    mixer['interactive'].updateControl({
                        sceneID: 'default',
                        controls: [
                            {
                                controlID: 'youtubeplayer',
                                text: 'yton',
                                meta: {Text: `${cmd[1]}`}
                            },
                        ],
                    })
                break;  
                case '`ytoff':
                    mixer['interactive'].updateControl({
                        sceneID: 'default',
                        controls: [
                            {
                                controlID: 'youtubeplayer',
                                text: 'ytoff',
                                meta: {Text: 'ytoff'}
                            },
                        ],
                    })     
                break;    
                case '`sama':
                    mixer['chat'].say(':pixelheart :pukingrainbows You should all go follow mr @Samalander on here and over at his regular stream location : twitch.tv/samalander :pukingrainbows :pixelheart');
                    sayThis(` You should all go follow Samalander on here, and over at his regular stream location twitch.tv / samalander`);
                break;           
                default:
                //
                }
            }
        }            
        });


    let latestFollow = 'None';
    let lfShow = true;
    let latestUnFollow = 'None';
    let lufShow = true;
    let latestHost = 'None';
    let hasUnFollowed = [];
    let hasFollowed = [];
    let hasHosted = [];
    mixer['const'].on('event', function(data) {
        console.log(colors.green(`Constellation: `)+colors.yellow(`${data.type}`)); // should return "hosted", "followed", "subscribed" & "resubscribed".
        switch(data.type){
            case('followed'):
                console.log(data.info);
                if(data.info.following == false){
                    //

                    if (hasUnFollowed.includes(data.info.user.username) == true){
                        console.log(`this user has already unfollowed`)
                    }
                    else{           
                        mixer['chat'].say(`@${data.info.user.username} unfollowed! Fugg You!! We didnt need your kind in here anyway.`)
                        sayThis(`${data.info.user.username} unfollowed! Fugg You!! We didnt need your kind in here anyway.`)
                        hasUnFollowed.push(data.info.user.username);
                        latestUnFollow = data.info.user.username;
                        // ib.latestUnFollow = data.info.user.username;
                    }

                    //
                }
                else{   
                    if (hasFollowed.includes(data.info.user.username) == true){
                        console.log(`this user has already followed`)
                    }
                    else{           
                        mixer['chat'].say(`@${data.info.user.username} followed! Thank You!!`)
                        sayThis(`${data.info.user.username} followed! Thank You!!`)
                        hasFollowed.push(data.info.user.username);
                        latestFollow = data.info.user.username; 
                        // ib.latestFollow = data.info.user.username;
                    } 
                }          
            break;
            case('hosted'):
                console.log(data.info.hoster.token);
                if(hasHosted.includes(data.info.hoster.token) == true){
                    console.log(`this user has already hosted`)
                }
                else{          // %USER% is Hosting... Fugg now we have to act professional.
                    mixer['chat'].say(`@${data.info.hoster.token} is Hosting... Fugg now we have to act professional.`)
                    sayThis(`${data.info.hoster.token} is Hosting... Fugg now we have to act professional.`)
                    hasHosted.push(data.info.hoster.token);
                    latestHost = data.info.hoster.token; 
                    // ib.latestHost = data.info.hoster.token;
                } 
            break;
            //cos seriously kiwi, subs?!?! pfft lol
            // case('subscribed'):
            //     console.log(data.info);
            //     // io.emit('subscribed', data); 
            // break;
            // case('resubShared'):
            //     console.log(data.info);
            //     // io.emit('resubShared', data); 
            // break;
            // case('resubscribed'):
            //     console.log(data.info);
            //     // io.emit('resubscribed', data); 
            // break;
            case('update'):
                console.log(data.info);
            break;
            default://dont trigger anything.
                console.log(data.info);
            }
        });
        mixer['const'].on('error', function(data) {
            console.log(`error`);
            // console.log(data)
        });

};


let sayBlacklist = [
    {word:'madkiwi', replace:'mad kiwi'},
    {word:'kiwisbot', replace:'kiwis bot'},
    {word:'Mannee', replace:'Dickie'},
    {word:'CowtopiaPrime', replace:'Mr Moo'},
    {word:'Katharsus', replace:'Kath'},
    {word:'weeatpengwins', replace:'The Glorious Mr Pengwins'},
    {word:'kaptenf1', replace:'kapten f1'},
    {word:'Hundr', replace:'hundur'},
    {word:'OMarkishere', replace:'oh mark is here'},
    {word:'KACILAC', replace:'Kak i Lac'},
    {word:'o/', replace:'wave'},
    {word:'o7', replace:'salute'},
    {word:'REJEkT_RADIO', replace:'Teebs'},
    {word:'rawdeegaming', replace:'His Royal Rawe Some Ness'},
    {word:'shadow404', replace:'shadow four oh four'},
    {word:'dearfish', replace:'That sexy koi toy'},
    {word:'samalander', replace:'Sam Ah Lander'},
    {word:'Samalander', replace:'Sam Ah Lander'},
]
function sayThis(msg){
    // for (key in t){
    //     console.log(t[key]);
    // }
    let broken = msg.split(' ');        ///////// THIS AUDIO STILL NEEDS TO BE IN A fuck...
    //
    let t = ''
    for(key in sayBlacklist){
        for(k2 in broken){
            if(sayBlacklist[key].word == broken[k2]){
                //voila!!
                broken[k2] = sayBlacklist[key].replace;
            }                 
        }     
    }        
    for(key in broken){
        broken[key] += ' ';
    }
    // this needs to be added to a queu first then processed 1 at a time based on a dt.
    //console.log(broken)
    say.speak(broken, 'Alex', 1.0)//
}




// do this last. checks auth and sets standards, 
//eventually we should error check this
authClient.doAuth();