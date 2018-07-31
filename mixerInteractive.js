//requires
let util = require('util');
let events = require('events');
//module
let beamInteractive = function(auth) {
    const mixerInteractivelib = require('beam-interactive-node2'); 
    let self = this;
    self.mixerInteractive; 
    const ws = require('ws');   
    const scenesArray = [
        {
            sceneID: 'default',
            controls: [],
            containers: [],
        },
    ];
    self.mixerInteractive = new mixerInteractivelib.GameClient();
    mixerInteractivelib.setWebSocket(require('ws'));
    self.mixerInteractive.on('open', () => this.mixerClientOpened());
    self.mixerInteractive.on('error', e => this.mixerGameClientError(e));
    self.mixerInteractive.open(auth).catch(this.mixerGameClientError);
    
    // for the love of god put in xbox handlers into the html's js file.


    this.serverDeets = function(deets){
        // console.log(`interactive got server deets~ updating control!`)
        



    };
    this.mixerClientOpened = function() {
        console.log('Mixer client opened');
        // self.mixerInteractive.on('message', (err) => console.log('<<<', err));
        // self.mixerInteractive.on('send', (err) => console.log('>>>', err));
        
        // LISTENERS
        self.mixerInteractive.state.on('participantJoin', participant => {
            self.emit('participantJoin', participant);
        });
        self.mixerInteractive.state.on('participantLeave', (participant) => {
            self.emit('participantLeave', participant);
        });
        self.mixerInteractive.state.on('participantUpdate', (participant) => {
            self.emit('participantUpdate', `{${participant.userID}} ${participant.username} (${participant.groupID})`);
        });

        ///////////        
        console.log('Connected to Interactive!');
        self.mixerInteractive.synchronizeState()
        .then(() => {
            //this will be for defining the groups.
            const defaultGroup = self.mixerInteractive.state.getGroup('default')
            defaultGroup.sceneID = 'default';
            //
            const groups = [];
            // groups.push({groupID: 'admin', sceneID: 'admin'});
            // groups.push({groupID: 'game', sceneID: 'game'});
            groups.push({groupID: 'banned', sceneID: 'banned'});
            self.mixerInteractive.createGroups({groups: groups}) //<-- adds new groups.
        })
        .then(() => {
            //add controls.
            self.mixerInteractive.getScenes()
            .then(scenelist=>{
                scenelist.scenes.forEach((scene) => {
                    console.log('making controls for: ' + scene.sceneID);
                    this.HandleControls(self.mixerInteractive.state.getScene(scene.sceneID).getControls());
                });
            })
        })
        .then(() =>{
            self.mixerInteractive.ready(true); /// runs the whole Jobby! (kinda, dont be a dick, really it's within scope.)
        })
        .catch(function(err){
            console.error(err)
        })

    }
    this.mixerGameClientError = function(error) {
        console.error('interactive error: ', error);
    }

    //update  controls 
    this.updateControl = function(control){
        this.mixerInteractive.updateControls(control);
    }


    ////////////////////////////////////////////////////////////////////////////////////////
    // Change Groups
    this.changeGroups = function(participantInfo, groupidInfo) {
        const participant = participantInfo;
        const groupid = groupidInfo;

        if (groupid !== "None") {
            this.mixerInteractive.synchronizeGroups()
                .then(() => {
                    //logger.info('Changing user to group: ' + groupid + '.');
                    let group = this.mixerInteractive.state.getGroup(groupid);
                    if (group !== undefined) {
                        participant.groupID = groupid;
                        this.mixerInteractive.updateParticipants({participants: [participant]});
                        console.log(participant)
                    } else {
                    console.log(`weird. failed. maybe check it's a legit groupid?`)
                    }
                })
                .catch(reason => console.error('Promise rejected', reason));
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////
    // Change Default Scene 4 Groups
    this.changeScenes = function (groupID, sceneID) {
        const group = groupID;
        const scene = sceneID;

        if (group !== "None") {
            this.mixerInteractive.synchronizeGroups()
                .then(() => {
                // logger.info('Changing ' + group + ' to ' + scene + '.');
                    let groupfinal = this.mixerInteractive.state.getGroup(group);
                    groupfinal.sceneID = scene;
                    return this.mixerInteractive.updateGroups({groups: [groupfinal]})
                })
                .then(controls=>{

                })
                .catch(reason => console.error('Promise rejected', reason));
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////
    // Handle Controls
    this.HandleControls = function(controls){
        let controltimeouts = [];
        controls.forEach(function (control){
            //set defaults
            // control.setBackgroundColor(`#bada55`)
            // control.setTextColor(`#000000`)
            control.on('click', (inputEvent, participant) => {
                // if(typeof(inputEvent.transactionID) != 'undefined'){
                //     self.mixerInteractive.captureTransaction(inputEvent.transactionID).catch(reason => console.error('Promise rejected', reason));
                //     // console.log(`User ${participant.username} charged ${control.cost} sparks (${inputEvent.transactionID})`)
                // }
                // console.log(control)
                // console.log(inputEvent)
                if(participant.groupID != 'banned'){
                    self.emit('controlEvt', {type: 'click', data: [control, inputEvent, participant]})
                }
                else {                    
                    console.log(`ignored click from ${participant.username}`)
                }
            })

            control.on('mousedown', (inputEvent, participant) => {
                if(typeof(inputEvent.transactionID) != 'undefined'){
                    self.mixerInteractive.captureTransaction(inputEvent.transactionID).catch(reason => console.error('Promise rejected', reason));
                    // console.log(`User ${participant.username} charged ${control.cost} sparks (${inputEvent.transactionID})`)
                } 
                if(participant.groupID != 'banned'){
                    self.emit('controlEvt', {type: 'mousedown', data: [control, inputEvent, participant]})
                }
                else {                    
                    console.log(`ignored click from ${participant.username}`)
                }
            })
        })
    }
}
beamInteractive.prototype = new events.EventEmitter;
module.exports = beamInteractive;