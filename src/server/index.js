/*
const fs = require("fs")
fs.unlink("index.js", ()=>{})
*/
/*
shift ctrl S in console
*/

const express = require('express');
const WebSocket = require('ws');
const uuid = require("uuid");
const msgpack = require("msgpack-lite");
const path = require("path");
const app = express();
const wss = new WebSocket.Server({ noServer: true });
console.log("Game Started")

const serverTick = 40;
const arenaX = 1000;
const arenaY = 1000;

let currentTime = 0;
let lastTime = Date.now();

const players = {};
const clients = {};
const initPack = {player: []};
const removePack = {player: []};
const Player = require("./objects/player");

let currentNumber = -1;

const makeId = () => {
  currentNumber ++;
  return String(currentNumber);
}

app.use(express.static("src/public"));

app.get("/", function (req, res) {
  res.sendFile("index.html");
});

wss.on("connection", ws=>{
  // intiial code
  // player joins, or wait for player message first
  const clientId = makeId();

	ws.on("message",(data)=>{
		const msg = JSON.parse(data)
    if (msg.type === "join"){
      clients[clientId] = ws;
      players[clientId] = new Player(clientId, msg.name);
      const peyload = {
        type: "init",
        selfId: clientId,
        config: {
          tick: serverTick,
          x: arenaX,
          y: arenaY
        },
        datas: {
          player: [...Player.getAllInitPack({players})],
        }
      }
      clients[clientId].send(
        msgpack.encode(
          peyload
        )
      );
      initPack.player.push(
        players[clientId].getInitPack()
      );
    }
    if (msg.type === "keys"){
      const player = players[clientId]
      if (player){
      const valueData = msg.data;
      player.movement[valueData.keys] = valueData.value;
      player.pendingKeys[valueData.keys] = valueData.value;
      }
      
    }
    if (msg.type === "chat"){
      const player = players[clientId]
      if (player){
      const valueData = msg.data;
	    if (valueData.startsWith("/name") || valueData.startsWith("/nick")) {
        if (/\S/.test(valueData.slice(6))) {
		    player.name = valueData.slice(6);
        }
	    }
	    else {
		    player.chatValue = msg.data;
		    player.chatTime = 3;
		    player.justChat = true;
	    }
      }
    }

    /*
		return new Promise((resolve, reject)=>{
			
		})
    */
	})
	ws.on('close',()=>{
    if (players[clientId]){
    delete players[clientId];
    removePack.player.push(clientId);
    }
    if (clients[clientId]){
      delete clients[clientId];
    }
		//when player leaves
	})
})


const server = app.listen(3000);
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, socket => {
    wss.emit('connection', socket, request);
  });
});


function updateGameState(clients, players){
  let delta = (Date.now() - lastTime)/1000;
  lastTime = Date.now();
	currentTime += delta;

  Player.collision({ playerArray: Object.entries({ ...players }), players });
  
  let pack = Player.pack({players, delta, arenaX, arenaY});

  for(let i of Object.keys(clients)){
    const clientSocket = clients[i];
    if (clientSocket.readyState === WebSocket.OPEN) {
      //Update
      clientSocket.send(
			  msgpack.encode({
				  type: "update",
				  datas: {player: pack},
			  })
      ); 
    }
    if (removePack.player.length > 0) {
      //Remove
      clientSocket.send(
        msgpack.encode({
          type: "remove",
          datas: removePack
        })
      );
    }
    if (initPack.player.length > 0) {
      //Remove
      clientSocket.send(
        msgpack.encode({
          type: "init",
          datas: initPack
        })
      );
    }
    
  }
  //Reset Packs
  initPack.player = [];
  removePack.player = [];
}

setInterval(() => {
  updateGameState(clients, players);
}, 1000 / serverTick); 