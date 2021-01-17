import { getBorders, resize, lerp, negative } from './scripts/utility.js';

const server = {
  tick: 25, //ServerTick, updates automatically
  x: NaN, //ArenaX
  y: NaN //ArenaY
}
if (!Date.now) {
  Date.now = function now() {
    return new Date().getTime();
  };
}

let afr;
export const players = {};
const controller = new Controller()

let keys = ["arrowup", "arrowright", "arrowdown", "arrowleft"];


let selfId = "";
let lastKeys = [];
CanvasRenderingContext2D.prototype.textSize = function(size){
  ctx.font = `${size}px 'Ubuntu'`;
}

class Player {
  constructor(initPack){
    this.x = initPack.x;
    this.y = initPack.y;
    this.size = initPack.size;
    this.name = initPack.name;
    this.id = initPack.id;
    this.chatTime = initPack.chatTime;
    this.chatValue = initPack.chatValue;
    players[ this.id ] = this;
    this.serverX = this.x;
    this.serverY = this.y;
    this.middleStateX = this.x;
    this.middleStateY = this.y;
  }
  updatePack(updatePack){
    if (updatePack.x){
    this.serverX = updatePack.x;
    }
    if (updatePack.y){
    this.serverY = updatePack.y;
    }
    if (updatePack.chatValue){
    this.chatTime = 3;
    this.chatValue = updatePack.chatValue;
    }
    if (updatePack.name){
      this.name = updatePack.name;
    }
  }
  interpPlayer(delta){
    this.chatTime -= delta;
    if (this.chatTime < 0){
      this.chatTime = 0;
    }
    if ( delta <= 1 / server.tick){
      this.x = lerp(this.x, this.middleStateX, delta*server.tick)
      this.y = lerp(this.y, this.middleStateY, delta*server.tick)
      this.middleStateX = lerp(this.middleStateX, this.serverX, delta*server.tick)
      this.middleStateY = lerp(this.middleStateY, this.serverY, delta*server.tick)
    }
    
  }
  render(self, delta){
    this.interpPlayer(delta);
    const x = this.x-self.x+800;
    const y = this.y-self.y+450;
    ctx.beginPath();
    ctx.fillStyle = "rgb(50, 50, 50)"
    ctx.arc(x, y, this.size, 0, Math.PI*2)
    ctx.fill();

    ctx.textSize(30);
    ctx.fillText(this.name, x, y-this.size-15)

    
    ctx.font = "20px Verdana, Geneva, sans-serif";
		ctx.fillStyle = `rgb(50, 50, 50, ${this.chatTime*2.5})`;
		const width = ctx.measureText( this.chatValue ).width;
		ctx.fillRect(
				Math.round( x - width / 2 - 3 ),
				Math.round( y - 98 ),
				Math.round( ( width * 2 ) / 2 + 6 ),
				25
			);
		ctx.fillStyle = `rgb(200, 200, 200, ${this.chatTime*4})`;
	  ctx.fillText(this.chatValue, x, Math.round( y - this.size - 50));
  }
}

/*
const ws = new WebSocket("wss://idk.haha0201.repl.co")
*/
var HOST = location.origin.replace(/^http/, 'ws')
const ws = new WebSocket(HOST);

let wsOpen = false;
let wsClosed = false;
ws.addEventListener('open', function (event) {
  wsOpen = true;

})

ws.onclose = function(event) {
  wsClosed = true;
};


ws.binaryType = "arraybuffer";
const canvas = document.getElementById("canvas");
//document.body.appendChild(canvas)
const ctx = canvas.getContext("2d");
const chatBox = document.getElementById( "chatBox" );
const chatHolder = document.getElementById( "chatHolder" );
const nameBox = document.getElementById("nameBox");
let scale;
let mouseX = 1;
let mouseY = 1;
let winX = 0;
let winY = 0;
let leftBorder = 0;
let topBorder = 0;
let windowWidth = 0;
let windowHeight = 0;
let chatLock = false;


let lastTime = Date.now();
let currentTime = Date.now();
let delta = 0;

resize(ctx, canvas);
window.onload = function () {
  window.addEventListener("resize", resize.bind(null, ctx, canvas));
  canvas.addEventListener("mousemove", (e) => {
    mouseX = Math.round(e.pageX / scale - leftBorder / scale);
    mouseY = Math.round(e.pageY / scale - topBorder / scale);
  });

  resize(ctx, canvas);
};
document.onkeydown = function(e){
  controller.keys[e.keyCode] =  true;
  if (!e.repeat){
  if (selfId && document.activeElement !== chatBox){
    if (keys.includes(e.key.toLowerCase())) {
    ws.send(
      JSON.stringify(
        {
          type: "keys",
          data: {
            keys: keys.indexOf(e.key.toLowerCase()),
            value: true
          }
        }
      )
    )
    }
  }
  }
}
document.onkeyup = function(e){
  controller.keys[e.keyCode] = false;
  if (!e.repeat){
  if (selfId && document.activeElement !== chatBox){
    if (keys.includes(e.key.toLowerCase())) {
    ws.send(
      JSON.stringify(
        {
          type: "keys",
          data: {
            keys: keys.indexOf(e.key.toLowerCase()),
            value: false
          }
        }
      )
    )
    }
  }
  }
}





function render(dt){
  const self = players[selfId];
  ctx.clearRect(0, 0, 1600, 900)
  ctx.fillStyle = 'rgb(0, 0, 0)'
  ctx.fillRect(0, 0, 1600, 900)
  if (selfId){
    //Update
    ctx.fillStyle = `rgb(200, 50, 50)`
    ctx.fillRect(-self.x+800-5, -self.y+450-5, server.x+10, server.y+10)
    ctx.fillStyle = `rgb(200, 200, 200)`
    ctx.fillRect(-self.x+800, -self.y+450, server.x, server.y)
    

    for(let i of Object.keys(players)){
      const player = players[i];
      player.render(self, dt);
    }
  }
  else{
    ctx.fillStyle = 'rgb(200, 200, 200)'
    ctx.textSize(40);
    ctx.fillText("Loading...", 800, 450)
  }

  if (wsClosed === true){
    ctx.clearRect(0, 0, 1600, 900)
    ctx.fillStyle = 'rgb(0, 0, 0)'
    ctx.fillRect(0, 0, 1600, 900)
    ctx.fillStyle = 'rgb(200, 200, 200)'
    ctx.textSize(50);
    ctx.fillText("the game went offline", 800, 300)
    ctx.textSize(20)
    ctx.fillText("The reason is unkown. Perhaps the game is updating, or the server crashed.", 800, 350)
    ctx.textSize(20)
    ctx.fillText("Please reload to try again. If this problem persists, please contact haha0201#7989 on discord.", 800, 375)
    
    
  }
}
function updateKeys(dt){
  if (selfId){
  if (!controller.enter){
    chatLock = false;
  }
  let enteredChat = false;
  if (controller.enter && document.activeElement === chatBox && chatLock == false){
    if (chatBox.value.length > 0){
      const peyloade = {
        type: "chat",
        data: chatBox.value
      }
      ws.send(JSON.stringify(peyloade));
      chatHolder.style.display = "none";
    }
    chatHolder.style.display = "none";
    chatBox.value = "";
    chatBox.blur();
    chatHolder.style.display = "none";
    chatHolder.style.display = "none";
    enteredChat = true;

  }
  if (controller.enter && chatLock == false && document.activeElement !== chatBox && enteredChat === false){
    chatHolder.style.display = "block";
    chatBox.focus();
  }
  

  if (controller.enter){
    chatLock = true;
  }
  }

  

}

function mainLoop(time){
  const delta = ( time - lastTime ) / 1000;
	lastTime = time;

  getBorders();
  /*
  currentTime = Date.now();
  delta = currentTime-lastTime;
  lastTime = currentTime;
  */
  render(delta);
  updateKeys(delta);
  afr = window.requestAnimationFrame(mainLoop);
}
afr = window.requestAnimationFrame(mainLoop)

ws.addEventListener("message", ( datas ) => {
	const msg = msgpack.decode(new Uint8Array( datas.data))
  if (msg.type === "init"){
    if ( msg.selfId ) {
			selfId = msg.selfId;
		}
    if ( msg.config ){
      server.tick = msg.config.tick;
      server.x = msg.config.x;
      server.y = msg.config.y;
    }
    if ( msg.datas ){
      if (msg.datas.player && msg.datas.player.length > 0 ){
        for (let data of msg.datas.player) {
				  new Player(data);
			  }
      }
    }
  }
  else if (msg.type === "update"){
    if (msg.datas.player && msg.datas.player.length > 0){
      for (let data of msg.datas.player){
        const player = players[data.id];
        if (player){
          player.updatePack(data)
        }
      }
    }
  }
  else if ( msg.type === "remove" ) {
    if (msg.datas.player && msg.datas.player.length > 0){
		  for ( let data of msg.datas.player ) {
			  delete players[data];
	    }
    }
  }
});

document.getElementById("playButton").addEventListener("click", function () {
  if (wsOpen === true){
	  document.getElementById("menu").style.display = "none";
	  document.getElementById("game").style.display = "block";
    ws.send(JSON.stringify(
      {
        type: "join",
        name: nameBox.value
      }
    ))
  }

})