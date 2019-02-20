window.addEventListener('load', function initMixer() {
  mixer.display.position().subscribe(handleVideoResized);

  const canvas = document.getElementById('canvas');
  const menu = document.getElementById('menuContainer');
  const bfarm = document.getElementById('buttonfarm');
  let currentKing = 'noone';
  const kothlist = document.getElementById('kothlist');
  const dragonflame = document.getElementById('dragonflame');
  let menuIsOpen = false;
  const offset = 10;


  //
  mixer.display.moveVideo({
    top: offset,
    bottom: offset,
    left: offset,
    right: offset,    
  });

  function handleVideoResized (position) {
    const player = position.connectedPlayer;
    menu.style.left = player.left +'px';
    menu.style.right = player.right +'px';
    bfarm.style.left = player.left +'px';
    bfarm.style.right = player.right +'px';  
    kothlist.style.left = player.left +'px';
}

let sortArray = function(arr, columns, order_by) {
  if(typeof columns == 'undefined') {
      columns = []
      for(x=0;x<arr[0].length;x++) {
          columns.push(x);
      }
  }

  if(typeof order_by == 'undefined') {
      order_by = []
      for(x=0;x<arr[0].length;x++) {
          order_by.push('ASC');
      }
  }

  function multisort_recursive(a,b,columns,order_by,index) {  
      var direction = order_by[index] == 'DESC' ? 1 : 0;

      var is_numeric = !isNaN(a[columns[index]]-b[columns[index]]);

      var x = is_numeric ? a[columns[index]] : a[columns[index]].toLowerCase();
      var y = is_numeric ? b[columns[index]] : b[columns[index]].toLowerCase();

      if(!is_numeric) {
          x = helper.string.to_ascii(a[columns[index]].toLowerCase(),-1),
          y = helper.string.to_ascii(b[columns[index]].toLowerCase(),-1);
      }

      if(x < y) {
              return direction == 0 ? -1 : 1;
      }

      if(x == y)  {
          return columns.length-1 > index ? multisort_recursive(a,b,columns,order_by,index+1) : 0;
      }

      return direction == 0 ? 1 : -1;
  }

  return arr.sort(function (a,b) {
      return multisort_recursive(a,b,columns,order_by,0);
  });
}




  canvas.addEventListener('click',function(evt){
    //   console.log('click', evt)
      if (menuIsOpen){
          // console.log('closing the menu');
          menu.style.display = 'none';
          bfarm.style.display = "none";
          kothlist.style.display = "none";
          menuIsOpen = false;
      }
      else{
          // console.log('opening the menu');
          menu.style.display = 'block';
          bfarm.style.display = "block";
          kothlist.style.display = "block";
          menuIsOpen = true;
      }
  });

mixer.socket.on('onSceneCreate', scene => {
  bfarm.innerHTML = '';
  // console.log(scene.scenes)
    for ( control in scene.scenes[0].controls ){
      // console.log(scene.scenes[0].controls[control].controlID)
      // console.log(scene.scenes[0].controls[control].meta)
      if(scene.scenes[0].controls[control].meta.category){
        if(scene.scenes[0].controls[control].meta.category.value != 'hidden'){
        
                      let b = document.createElement("button")
                      b.id = scene.scenes[0].controls[control].controlID;
                      b.className= "button-xsmall pure-button";
                      b.tabIndex = "0";
                      let t = document.createTextNode(scene.scenes[0].controls[control].text)
                      b.appendChild(t)
                      if(scene.scenes[0].controls[control].cost){
                        let t2 = document.createTextNode(` - ${scene.scenes[0].controls[control].cost} ⚡`)
                        b.appendChild(t2)
                      }
                      else {
                        let t2 = document.createTextNode(``);
                        b.appendChild(t2)
                      }
                      b.addEventListener('mouseup', function(evt){
                        mixer.socket.call('giveInput', {
                            controlID: b.id,
                            event: 'mouseup',
                            button: evt.button,
                        });        
                      });
                      b.addEventListener('mousedown',function(evt){
                        mixer.socket.call('giveInput', {
                            controlID: b.id,
                            event: 'mousedown',
                            button: evt.button,
                        });        
                      });
                      bfarm.appendChild(b)    
                      
        }
      }
    }
});
// mixer.socket.on('onControlUpdate', handleControlUpdate);
mixer.socket.on('event', function(event){
  // console.log(`EVENTFROMSERVER`, event)
  if(event.kothwinner){   
    let htmlhtml = 'King of the Hill <br />';
    htmlhtml += `Current King : ${currentKing}<hr width="20px" />`;
    let tmpArr = sortArray(event.kothwinner, ['points', 'name'], ['DESC','ASC']);
    // console.log(tmpArr)
    for(key in tmpArr){
      if(tmpArr[key] != null){
        //console.log(update.controls[0].data[key])
        htmlhtml += `${tmpArr[key].name} - ${tmpArr[key].points}`;
        htmlhtml += ` <br />`;
        kothlist.innerHTML = htmlhtml;
      }
    }
  }
  if(event.koth){
    // console.log(event)
    currentKing = event.koth;
  }
  if(event.lmiad){
    // console.log(event)
    // let color = randomHtmlCC();
    // let dbutt = document.getElementById('lmiad');
    //
    // mainpanelswitch.style.backgroundColor = color; // may need to check if color is dark and switch text to white.
    // topbar.style.backgroundColor = color;
    // bottombar.style.backgroundColor = color;
    // dragonmouth.style.display = 'block';
    // dbutt.innerText = `Look ${triggeredBy}! I'm a dragon!`;
    // t1 = setTimeout(function(){
    //   dragonmouth.style.display = 'none';
    //   dbutt.innerText = `Look Ma! I'm a dragon! - 1⚡`;
    //   mainpanelswitch.style.backgroundColor = '#bada55';
    //   topbar.style.backgroundColor = '#bada55';
    //   bottombar.style.backgroundColor = '#bada55';
    // }, 1500)
  }
});



mixer.isLoaded();
})