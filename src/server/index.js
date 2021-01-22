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
const Database = require("@replit/database")
const db = new Database()
const xpNeeded = (level) => {
  let x = level;
  let calculation;
  if (x < 0){
    calculation = 0;
  }
  else if (x < 20){
    calculation = Math.round(1/2 * (21 * x + 11 * Math.pow(x, 2) + Math.pow(x, 3)/3)) + 15 + x*25;
  }
  else if (x < 101){
    calculation = Math.round(1.48148 * Math.pow(1.1, x) + 22.3804 * x + 37.8683 * Math.pow(x, 3/2) - 6.3979 * Math.pow(x, 2) + 0.384767 * Math.pow(x, 3) - 0.0007 * Math.pow(x, 4));
  }
  else{
    calculation = Math.round(-15000 * x + 75 * Math.pow(x, 2) + Math.pow(x, 3)/3) + 727801;
  }
  if (x >= 99){
    calculation --;
  }
  return calculation;
  
}
const getXP = (xp) => {
  let gotten = false;
  let time = Date.now();
  let level = 0;
  if (xp > 10000){
    level = 27;
  }
  if (xp > 100000){
    level = 67;
  }
  if (xp > 320000){
    level = 100;
  }
  if (xp > 3500000){
    level = 200;
  }
  while(!gotten){
    if (xp < xpNeeded(level)){
      gotten = true;
      break;
    }
    else{
      level ++;
    }
  }
  return {
    level: level,
    xpNeeded: xpNeeded(level) - xpNeeded(level-1),
    progress: xp - xpNeeded(level-1),
    time: Date.now() - time
  };
}

const whiteSpace = /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]/g;


let accounts = {}; // {username:"okay",passwords:"impro"}

(async () => {
	accounts = await db.get("accounts")
  for(var i of Object.keys(accounts)){
    const account = accounts[i];
    const xpData = getXP(account.totalXP);
    account.level = xpData.level;
    account.xpNeeded = xpData.xpNeeded;
    account.xp = xpData.progress;
    account.toXP = account.xp;
    
  }
	console.log("Accounts: " + Object.keys(accounts).length)
})()
async function clearDatabase() {
	await db.set("accounts", {}).then(console.log("Database Cleared")).catch((error) => {console.error(error);})
}
async function createUser(account) {
	let users = []
	getAccounts().then(async function() {
		const acc = account;
    //XP
    acc.totalXP = 0;
    const xpData = getXP(acc.totalXP);
    acc.level = xpData.level;
    acc.xpNeeded = xpData.xpNeeded;
    acc.xp = xpData.progress;
    acc.toXP = xpData.xpNeeded;

		acc.kills = 0;
    acc.record = 0;
    acc.recordKills = 0;
    acc.bounces = 0;
    
		acc.dev = false;
		users = JSON.parse(JSON.stringify(accounts));
		users[acc.username] = acc;
    accounts = JSON.parse(JSON.stringify(users));
		await db.set("accounts", users).catch((error) => {console.error(error);});
	})
}
const getAccounts = async () => {
	return await db.get('accounts')
}
const hasUser = async (account, sensitive) => {
	return new Promise(async (resolve, reject) => {
		const accounts = await db.get("accounts")
		for (let username of Object.keys(accounts)) {
      if (!sensitive){
			if (username.toLowerCase() === account.username.toLowerCase()) {
				resolve()
			}
      }
      if (sensitive){
      if (username === account.username) {
				resolve()
			}
      }
		}
		reject()
	})
}


class PendingClient {
	constructor() {
		this.account = false;
		this.guest = false;
	}
}
const serverTick = 40;
const arenaX = 1000;
const arenaY = 1000;

let currentTime = 0;
let lastTime = Date.now();

const players = {};
const clients = {};
const pendingClients = {};
const initPack = { player: [] };
const removePack = { player: [] };
const Player = require("./objects/player");
const sha256 = require("./utility/sha256");

let currentNumber = -1;

const developerPass = `cdeabdabfbdb6a543c56f17daacf2b3c5fd03cb2134da46d9374c5683272b809`;

const makeId = () => {
	currentNumber++;
	return String(currentNumber);
}



let randomConso = function() {
	let index = Math.round(Math.random() * 20);
	let consos = [
		"b",
		"c",
		"d",
		"f",
		"g",
		"h",
		"j",
		"k",
		"l",
		"m",
		"n",
		"p",
		"q",
		"r",
		"s",
		"t",
		"v",
		"w",
		"x",
		"y",
		"z"
	];
	return consos[index];
};
let randomVowel = function() {
	let index = Math.round(Math.random() * 4);
	let vowels = ["a", "e", "i", "o", "u"];
	return vowels[index];
};


app.use(express.static("src/public"));
app.use(express.static("src/public/profiles"));

app.get("/", function(req, res) {
	res.sendFile("index.html");
});

wss.on("connection", ws => {
	// intiial code
	// player joins, or wait for player message first
	const clientId = makeId();
	pendingClients[clientId] = new PendingClient();
	const pendingClient = pendingClients[clientId];

	ws.on("message", (data) => {
		const msg = JSON.parse(data)
		if (!pendingClient.account) {
			if (msg.type === "create") {
				const account = msg.account;
				account.username = account.username.replace(whiteSpace, "")
				account.password = sha256(account.password)
				if (!/\S/.test(account.username) || account.username.length > 16) {
					ws.send(msgpack.encode({
						type: "create",
						success: false,
						reason: 1
					}))
				}
				else {
					hasUser(account, false).then(() => {
						// user is in database so send client error
						ws.send(msgpack.encode({
							type: "create",
							success: false,
							reason: 2
						}))
					}).catch(() => {
						createUser(account)
						ws.send(msgpack.encode({
							type: "create",
							success: true,
							username: account.username
						}))
						pendingClient.account = account.username;
						//send the client initial data
					})
				}
			} else if (msg.type === "login") {
				const account = msg.account;
				account.username = account.username.replace(whiteSpace, "");
				account.password = sha256(account.password)
				hasUser(account, true).then(() => {
					// user is in base
					for (let accId of Object.keys(accounts)) {
            const acc = accounts[accId];
						if (acc.username === account.username) {
							if (acc.password === account.password) {
								ws.send(msgpack.encode({
									type: "login",
									success: true,
									username: account.username
								}))
								pendingClient.account = account.username;
							}
							else {
								ws.send(msgpack.encode({
									type: "login",
									success: false,
								}))
							}
						}
					}
				}).catch(() => {
					ws.send(msgpack.encode({
						type: "login",
						success: false,
					}))
					//send the client initial data
				})
			} else if (msg.type === "guest") {
				pendingClient.account = "Guest" +
					randomConso().toUpperCase() +
					randomVowel() +
					randomConso() +
					randomVowel() +
					randomConso() +
					randomVowel();
				pendingClient.guest = true;
				ws.send(msgpack.encode({
					type: "guest",
					username: pendingClient.account
				}))
			}
		}
		if (pendingClient.account != false) {
			if (msg.type === "join") {
				let fail = false;
				for (let poop of Object.keys(players)) {
					const testPlayer = players[poop];
					if (testPlayer.name === pendingClient.account) {
						const peyload = {
							type: "ingame"
						}
						ws.send(
							msgpack.encode(
								peyload
							)
						)
						fail = true;
						break;
					}
				}
				if (!fail) {
          let level = null;
          let xpNeeded = null;
          let account = accounts[pendingClient.account];
          if (account){
            level = account.level;
            xpNeeded = account.xpNeeded;
          }
					clients[clientId] = ws;
					players[clientId] = new Player(clientId, pendingClient.account, pendingClient.guest, level, xpNeeded);
					const peyload = {
						type: "init",
						selfId: clientId,
						config: {
							tick: serverTick,
							x: arenaX,
							y: arenaY
						},
						datas: {
							player: [...Player.getAllInitPack({ players })],
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
			}
      if (msg.type === "logout"){
        const player = players[clientId];
        if (!player){
          pendingClient.account = false;
          pendingClient.guest = false;
          ws.send(
            msgpack.encode(
              {
                type: "logout"
              }
            )
          )
        }
      }
			if (msg.type === "keys") {
				const player = players[clientId]
				if (player) {
					const valueData = msg.data;
					player.movement[valueData.keys] = valueData.value;
					player.pendingKeys[valueData.keys] = valueData.value;
				}

			}
			if (msg.type === "chat") {
				const player = players[clientId]
				if (player) {
					const valueData = msg.data;
					if (valueData.startsWith("/give") && player.dev === true) {
						try {
							player.score += Number(valueData.slice(6));
						}
						catch (err) { }
					}
					else if (valueData.startsWith("/kill") && player.dev === true) {
						player.dead = true;
					}

					else if (valueData.startsWith("/score") && player.dev === true) {
						try {
							player.score += Number(valueData.slice(7));
						}
						catch (err) { }
					}
					else if (valueData.startsWith("/god") && player.dev === true) {
						player.god = !player.god;
					}
					else {
						player.chatValue = msg.data;
						player.chatTime = 3;
						player.justChat = true;
					}
				}
			}
			if (msg.type === "respawn") {
				const player = players[clientId]
				if (player) {
					if (player.dead === true) {
						player.dead = false;
						player.x = Math.random() * 600 + 200;
						player.y = Math.random() * 600 + 200;
						player.movement = [false, false, false, false]
						player.pendingKeys = [false, false, false, false]
						player.lastChatTime = 1;
						player.protection = true;
						player.bounceX = 0;
						player.bounceY = 0;
						player.velX = 0;
						player.velY = 0;
						player.protectTimer = 3;
						player.lastHit = false;
						player.lastHitTimer = 0;
						player.size = 30;

					}
				}
			}
		}

		/*
			return new Promise((resolve, reject)=>{
				
			})
		*/
	})
	ws.on('close', () => {
		if (players[clientId]) {
			delete players[clientId];
			removePack.player.push(clientId);
		}
		if (clients[clientId]) {
			delete clients[clientId];
		}
		delete pendingClients[clientId];
		//when player leaves
	})
})


const server = app.listen(3000);
server.on('upgrade', (request, socket, head) => {
	wss.handleUpgrade(request, socket, head, socket => {
		wss.emit('connection', socket, request);
	});
});


function updateGameState(clients, players) {
	let delta = (Date.now() - lastTime) / 1000;
	lastTime = Date.now();
	currentTime += delta;



	Player.collision({ playerArray: Object.entries({ ...players }), players });

	for (let i of Object.keys(players)) {
		const player = players[i];
		if (!player.god) {
			if ((player.x < player.size || player.x > arenaX - player.size || player.y < player.size || player.y > arenaY - player.size) && player.dead === false) {
				player.dead = true;
        player.score *= 1/3;
				if (player.lastHit) {
          if (players[player.lastHit.id].dead === false){
					  players[player.lastHit.id].score += 100 + player.score / 2;
            if (accounts[player.lastHit.name]){
              accounts[player.lastHit.name].kills ++;
              accounts[player.lastHit.name].toXP += 100 + player.score / 2;
              accounts[player.lastHit.name].totalXP += 100 + player.score / 2;
            }
          }
				}
			}
		}
		else {
			if (player.x < player.size) {
				player.x = player.size;
			}
			if (player.x > arenaX - player.size) {
				player.x = arenaX - player.size;
			}
			if (player.y < player.size) {
				player.y = player.size;
			}
			if (player.y > arenaY - player.size) {
				player.y = arenaY - player.size;
			}
		}
    if (!player.dead){
      player.score += delta/2;
      if (accounts[player.name]){
        accounts[player.name].toXP += delta/2;
        accounts[player.name].totalXP += delta/2;
      }
      if (player.lastHitTimer >= 0){
        player.score += player.lastHitTimer * delta * 6;
        if (accounts[player.name]){
          accounts[player.name].toXP += player.lastHitTimer * delta * 6;
          accounts[player.name].totalXP += player.lastHitTimer * delta * 6;
        }
      }
    }
    if (accounts[player.name]){
      accounts[player.name].xp += (accounts[player.name].toXP-accounts[player.name].xp) * delta;

      while (accounts[player.name].xp >= accounts[player.name].xpNeeded){
        accounts[player.name].level ++;
        accounts[player.name].xp -= accounts[player.name].xpNeeded;
        accounts[player.name].toXP -= accounts[player.name].xpNeeded;
        accounts[player.name].xpNeeded = xpNeeded(accounts[player.name].level) - xpNeeded(accounts[player.name].level-1)
        player.level = accounts[player.name].level;
        player.xpNeeded = accounts[player.name].xpNeeded;
        player.levelChanged = true;
      }
    }
	}
	let pack = Player.pack({ players, delta, arenaX, arenaY });

	for (let i of Object.keys(clients)) {
		const clientSocket = clients[i];
    const peyloade = {
			type: "update",
			datas: { player: pack },
		};
    if (players[i]){
      if (accounts[players[i].name] != undefined){
        const account = accounts[players[i].name];
        peyloade.xp = Math.round(account.xp)
      }
    }
		if (clientSocket.readyState === WebSocket.OPEN) {
			//Update
			clientSocket.send(
				msgpack.encode(
          peyloade
        )
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


console.log("Game Started")

setInterval(() => {
	db.set("accounts", accounts).catch((error) => {console.error(error);})
}, 3300)
/*
//Setting Devs
//Only run if you want to make account a dev

setTimeout(() => {
  for(var i of accounts){
    if (["Pounce", "e", "Dev", "Developer", "SERVER", "Pouncer", "Tester", 'haha0201', 'Mathletesv'].includes(i.username)){
      i.dev = true;
    }
  }
}, 2000)
*/
