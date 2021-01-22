import { getBorders, resize, lerp, negative, sha256 } from './scripts/utility.js';

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
let guest = false;
export const players = {};
const controller = new Controller()

let keys = ["arrowup", "arrowright", "arrowdown", "arrowleft"];
let keys2 = ["w", "d", "s", "a"];

function round(e) {
	return Math.round(e);
}
var convert = function(x) {
	x = round(x);
	if (x < 1000) { return String(x); }
	else if (x < 10000) {
		return String(round(x / 10) / 100) + "k";
	}
	else if (x < 100000) {
		return String(round(x / 100) / 10) + "k";
	}
	else if (x < 1000000) {
		return String(round(x / 1000)) + "k";
	}
	else if (x < 10000000) {
		return String(round(x / 10000) / 100) + "M";
	}
	else if (x < 100000000) {
		return String(round(x / 100000) / 10) + "M";
	}
	else if (x < 1000000000) {
		return String(round(x / 1000000)) + "M";
	}
	else if (x < 10000000000) {
		return String(round(x / 10000000) / 100) + "B";
	}
	else if (x < 100000000000) {
		return String(round(x / 100000000) / 10) + "B";
	}
	else if (x < 1000000000000) {
		return String(round(x / 1000000000)) + "B";
	}
	else if (x < 10000000000000) {
		return String(round(x / 10000000000) / 100) + "T";
	}
	else if (x < 100000000000000) {
		return String(round(x / 100000000000) / 10) + "T";
	}
	else if (x < 1000000000000000) {
		return String(round(x / 1000000000000)) + "T";
	}
	else if (x < 10000000000000000) {
		return String(round(x / 10000000000000) / 100) + "q";
	}
	else if (x < 100000000000000000) {
		return String(round(x / 100000000000000) / 10) + "q";
	}
	else if (x < 1000000000000000000) {
		return String(round(x / 1000000000000000)) + "q";
	}
	else if (x < 10000000000000000000) {
		return String(round(x / 10000000000000000) / 100) + "Q";
	}
	else if (x < 100000000000000000000) {
		return String(round(x / 100000000000000000) / 10) + "Q";
	}
	else if (x < 1000000000000000000000) {
		return String(round(x / 1000000000000000000)) + "Q";
	}
	else if (x < 10000000000000000000000) {
		return String(round(x / 10000000000000000000) / 100) + "S";
	}
	else if (x < 100000000000000000000000) {
		return String(round(x / 100000000000000000000) / 10) + "S";
	}
	else {
		return String(round(x / 1000000000000000000000)) + "S";
	}
};

let selfId = "";
let lastKeys = [];
CanvasRenderingContext2D.prototype.textSize = function(size) {
	ctx.font = `${size}px 'Ubuntu'`;
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radius) {
  var r = x + w;
  var b = y + h;
  this.beginPath();
  this.moveTo(x + radius, y);
  this.lineTo(r - radius, y);
  this.quadraticCurveTo(r, y, r, y + radius);
  this.lineTo(r, y + h - radius);
  this.quadraticCurveTo(r, b, r - radius, b);
  this.lineTo(x + radius, b);
  this.quadraticCurveTo(x, b, x, b - radius);
  this.lineTo(x, y + radius);
  this.quadraticCurveTo(x, y, x + radius, y);
  this.fill();
};

CanvasRenderingContext2D.prototype.strokeRoundRect = function (x, y, w, h, radius) {
  var r = x + w;
  var b = y + h;
  this.beginPath();
  this.moveTo(x + radius, y);
  this.lineTo(r - radius, y);
  this.quadraticCurveTo(r, y, r, y + radius);
  this.lineTo(r, y + h - radius);
  this.quadraticCurveTo(r, b, r - radius, b);
  this.lineTo(x + radius, b);
  this.quadraticCurveTo(x, b, x, b - radius);
  this.lineTo(x, y + radius);
  this.quadraticCurveTo(x, y, x + radius, y);
  this.stroke();
};


/*-- Entering Game Stuff --*/
let active = "guest";
const playMethodDiv = document.getElementById("playMethod");
const registerDiv = document.getElementById("register");
const registerButton = document.getElementById("openRegister");
const loginButton = document.getElementById("openLogin");
const loginDiv = document.getElementById("login");
const guestButton = document.getElementById("openGuest");
const playButton = document.getElementById("playGame");
const logoutButton = document.getElementById("logout");
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const playOptions = document.getElementById("playOptions");
const registerRemember = document.getElementById("registerRemember");
const loginRemember = document.getElementById("loginRemember");

const info = document.getElementById("info");
const info2 = document.getElementById("info2");

guestButton.addEventListener("click", function(event) {
	ws.send(JSON.stringify({
		type: "guest"
	}))
});

/*-- Login --*/
loginButton.addEventListener("click", (event) => {
	registerDiv.style.display = "none";
	loginDiv.style.display = "block";
	info.innerHTML = ""
	const loginPassword = document.getElementById("loginPassword").value;
	const loginUsername = document.getElementById("loginUsername").value;
	const registerPassword = document.getElementById("registerPassword").value;
	const registerUsername = document.getElementById("registerUsername").value;
	loginPassword.value = "";
	loginUsername.value = "";
	registerPassword.value = "";
	registerUsername.value = "";
})
/*-- Logout --*/
logoutButton.addEventListener("click", (event) => {
	ws.send(JSON.stringify({
		type: "logout"
	}))
})

loginForm.addEventListener("submit", (event) => {
	const username = document.getElementById("loginUsername").value;
	const password = document.getElementById("loginPassword").value;
	/* haha add account */
	const peyloade = {
		type: 'login',
		account: {
			username,
			password: sha256(username + password + "pounce")
		}
	}
	ws.send(JSON.stringify(peyloade))
})

/*-- Register --*/
registerButton.addEventListener("click", (event) => {
	registerDiv.style.display = "block";
	loginDiv.style.display = "none";
	info.innerHTML = ""
	const loginPassword = document.getElementById("loginPassword").value;
	const loginUsername = document.getElementById("loginUsername").value;
	const registerPassword = document.getElementById("registerPassword").value;
	const registerUsername = document.getElementById("registerUsername").value;
	loginPassword.value = "";
	loginUsername.value = "";
	registerPassword.value = "";
	registerUsername.value = "";
})

registerForm.addEventListener("submit", (event) => {
	let username = document.getElementById("registerUsername").value;
	let password = document.getElementById("registerPassword").value;
	/* haha add account */
	const peyloade = {
		type: 'create',
		account: {
			username,
			password: sha256(username + password + "pounce")
		}
	}
	ws.send(JSON.stringify(peyloade))
})

playButton.addEventListener("click", (event) => {
	/* given the user's account/guest, load them into game */
	const peyloade = {
		type: "join"
	}
	ws.send(JSON.stringify(peyloade))
})
/*-- Everything Else--*/



class Player {
	constructor(initPack) {
		this.x = initPack.x;
		this.y = initPack.y;
		this.size = initPack.size;
		this.name = initPack.name;
		this.id = initPack.id;
		this.chatTime = initPack.chatTime;
		this.chatValue = initPack.chatValue;
		players[this.id] = this;
		this.serverX = this.x;
		this.serverY = this.y;
		this.middleStateX = this.x;
		this.middleStateY = this.y;
		this.dead = initPack.dead;
		this.protection = initPack.protection;
		this.score = initPack.score;
		this.dev = initPack.dev;
    this.level = initPack.level;
	}
	updatePack(updatePack) {
		if (updatePack.x) {
			this.serverX = updatePack.x;
		}
		if (updatePack.y) {
			this.serverY = updatePack.y;
		}
    if (updatePack.level != undefined){
      this.level = updatePack.level;
    }
		if (updatePack.chatValue) {
			this.chatTime = 5;
			this.chatValue = updatePack.chatValue;
		}
		if (updatePack.name) {
			this.name = updatePack.name;
		}
		if (updatePack.dead != undefined) {
			this.dead = updatePack.dead;
			if (updatePack.lastHit != undefined) {
				this.lastHit = updatePack.lastHit;
			}
		}
		if (updatePack.protection != undefined) {
			this.protection = updatePack.protection;
		}
		if (updatePack.score != undefined) {
			this.score = updatePack.score;
		}
		if (updatePack.size) {
			this.size = updatePack.size;
		}
		if (updatePack.dev) {
			this.dev = updatePack.dev;
		}

	}
	interpPlayer(delta) {
		this.chatTime -= delta;
		if (this.chatTime < 0) {
			this.chatTime = 0;
		}
		if (delta <= 1 / server.tick) {
			this.x = lerp(this.x, this.middleStateX, delta * server.tick)
			this.y = lerp(this.y, this.middleStateY, delta * server.tick)
			this.middleStateX = lerp(this.middleStateX, this.serverX, delta * server.tick)
			this.middleStateY = lerp(this.middleStateY, this.serverY, delta * server.tick)
		}

	}
	render(self, delta) {
		this.interpPlayer(delta);
		if (this.dead === false) {
			const x = this.x - self.x + 800;
			const y = this.y - self.y + 450;
			if (this.protection) {
				ctx.globalAlpha = 0.5;
			}
			else {
				ctx.globalAlpha = 1;
			}
			ctx.beginPath();
			if (!this.dev) {
				ctx.fillStyle = "rgb(50, 50, 50)"
			}
			else {
				ctx.fillStyle = `hsl(${Date.now() / 10}, 90%, 20%)`
			}
			ctx.arc(x, y, this.size, 0, Math.PI * 2)
			ctx.fill();
			ctx.globalAlpha = 1;

			ctx.textSize(30);
			ctx.fillText(this.name, x, y - this.size - 22)
			ctx.textSize(17);
      if (this.level != null){
			ctx.fillText("Level "+this.level, x, y - this.size - 4.3)
      }
      else{
      ctx.fillText("Guest Account", x, y - this.size - 4.3)
      }


			ctx.textSize(20)
			ctx.fillStyle = `rgb(50, 50, 50, ${this.chatTime * 2.5})`;
			const width = ctx.measureText(this.chatValue).width;
			ctx.fillRect(
				Math.round(x - width / 2 - 3),
				Math.round(y - 70 - this.size),
				Math.round((width * 2) / 2 + 6),
				25
			);
			ctx.fillStyle = `rgb(200, 200, 200, ${this.chatTime * 4})`;
			ctx.fillText(this.chatValue, x, Math.round(y - this.size - 52));
		}
	}
}

/*
const ws = new WebSocket("wss://idk.haha0201.repl.co")
*/
var HOST = location.origin.replace(/^http/, 'ws')
const ws = new WebSocket(HOST);

let wsOpen = false;
let wsClosed = false;
ws.addEventListener('open', function(event) {
	wsOpen = true;
	if (localStorage.getItem("username") != null && localStorage.getItem("password") != null) {
		const peyloade = {
			type: 'login',
			account: {
				username: localStorage.getItem("username"),
				password: localStorage.getItem("password")
			}
		}
		ws.send(JSON.stringify(peyloade))
	}

})

ws.onclose = function(event) {
	wsClosed = true;
};


ws.binaryType = "arraybuffer";
const canvas = document.getElementById("canvas");
//document.body.appendChild(canvas)
const ctx = canvas.getContext("2d");
const chatBox = document.getElementById("chatBox");
const chatHolder = document.getElementById("chatHolder");
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
window.onload = function() {
	window.addEventListener("resize", resize.bind(null, ctx, canvas));
	canvas.addEventListener("mousemove", (e) => {
		mouseX = Math.round(e.pageX / scale - leftBorder / scale);
		mouseY = Math.round(e.pageY / scale - topBorder / scale);
	});

	resize(ctx, canvas);
};
document.onkeydown = function(e) {
	controller.keys[e.keyCode] = true;
	if (!e.repeat) {
		if (selfId && document.activeElement !== chatBox) {
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
			if (keys2.includes(e.key.toLowerCase())) {
				ws.send(
					JSON.stringify(
						{
							type: "keys",
							data: {
								keys: keys2.indexOf(e.key.toLowerCase()),
								value: true
							}
						}
					)
				)
			}

		}
	}
}
document.onkeyup = function(e) {
	controller.keys[e.keyCode] = false;
	if (!e.repeat) {
		if (selfId && document.activeElement !== chatBox) {
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
			if (keys2.includes(e.key.toLowerCase())) {
				ws.send(
					JSON.stringify(
						{
							type: "keys",
							data: {
								keys: keys2.indexOf(e.key.toLowerCase()),
								value: false
							}
						}
					)
				)
			}

		}
	}
}





function render(dt) {
	const self = players[selfId];
	ctx.clearRect(0, 0, 1600, 900)
	ctx.fillStyle = 'rgb(0, 0, 0)'
	ctx.fillRect(0, 0, 1600, 900)
	if (selfId) {
		//Update
		ctx.fillStyle = `rgb(200, 50, 50)`
		ctx.fillRect(-self.x + 800 - 10, -self.y + 450 - 10, server.x + 20, server.y + 20)
		ctx.fillStyle = `rgb(200, 200, 200)`
		ctx.fillRect(-self.x + 800, -self.y + 450, server.x, server.y)

		let leaderboard = [];
		for (let i of Object.keys(players)) {
			const player = players[i];
			if (!player.dead) {
				let type = "normal";
				if (player.id === selfId) {
					type = "self";
				}
				leaderboard.push({
					name: player.name,
					score: player.score,
					type: type,
					id: player.id
				})
			}
			player.render(self, dt);
		}
		leaderboard.sort((a, b) => b.score - a.score);
		let place = 0;
		for (let i of leaderboard) {
			place++;
			players[i.id].place = place;
			i.place = place;
		}
		leaderboard = leaderboard.slice(0, 3);
		if (!self.dead) {
			if (!leaderboard.find((e) => e.type === "self")) {
				leaderboard.push({
					name: self.name,
					score: self.score,
					type: "selfBad",
					id: selfId,
					place: self.place
				})
			}
		}



		ctx.fillStyle = "rgba(22, 54, 90, 0.68)";
		ctx.fillRect(1275, 50, 300, leaderboard.length * 40 + 13);
		ctx.textSize(30);
		for (let i of leaderboard) {
			ctx.textAlign = "left";
			if (i.type === "normal") {
				ctx.fillStyle = "black";
			}
			else {
				ctx.fillStyle = "white";
			}
			ctx.textSize(25);
			ctx.fillText(
				i.place + ". " + i.name + ": " + convert(i.score),
				1290,
				124 + (leaderboard.indexOf(i) - 1) * 40
			);
			ctx.textAlign = "center";
		}

    if (!guest){
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgb(30, 30, 30)"
    ctx.lineWidth = 5;
    ctx.strokeRoundRect(1500, 300, 30, 500, 20)
    }
     


		if (self.dead) {
			ctx.fillStyle = "rgb(0, 0, 0)"
			ctx.globalAlpha = 0.5;
			ctx.fillRect(0, 0, 1600, 900)
			ctx.globalAlpha = 1;
			ctx.fillStyle = 'rgb(250, 200, 200)'
			ctx.textSize(90);
			ctx.fillText("you are dead", 800, 380)
			if (self.lastHit === false) {
				ctx.textSize(40);
				ctx.fillText("what a stupid death", 800, 460)
			}
			else {
				ctx.textSize(40);
				ctx.fillText("killed by " + self.lastHit.name, 800, 460)
			}
			ctx.textSize(20)
			ctx.fillText("== click space to respawn ==", 800, 500)
			if (controller.space) {
				ws.send(JSON.stringify({
					type: "respawn"
				}))
			}
		}
	}
	else {
		ctx.fillStyle = 'rgb(200, 200, 200)'
		ctx.textSize(40);
		ctx.fillText("Loading...", 800, 450);
	}

	if (wsClosed === true) {
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
function updateKeys(dt) {
	if (selfId) {
		const self = players[selfId];
		if (self.dead === false) {
			if (!controller.enter) {
				chatLock = false;
			}
			let enteredChat = false;
			if (controller.enter && document.activeElement === chatBox && chatLock == false) {
				if (chatBox.value.length > 0) {
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
			if (controller.enter && chatLock == false && document.activeElement !== chatBox && enteredChat === false) {
				chatHolder.style.display = "block";
				chatBox.focus();
			}


			if (controller.enter) {
				chatLock = true;
			}
		}
		else {
			chatHolder.style.display = "none";
			chatBox.value = "";
			chatBox.blur();
			chatHolder.style.display = "none";
			chatHolder.style.display = "none";
		}
	}



}

function mainLoop(time) {
	const delta = (time - lastTime) / 1000;
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

ws.addEventListener("message", (datas) => {
	const msg = msgpack.decode(new Uint8Array(datas.data))
	if (msg.type === "create") {
    guest = false;
		if (msg.success) {
			playButton.style.display = "inline";
			logoutButton.style.display = "inline";
			registerDiv.style.display = "none";
			info.innerHTML = "Logged in as " + msg.username;
			playOptions.style.display = "none";
			if (registerRemember.checked) {
				const password = document.getElementById("registerPassword").value;
				const username = document.getElementById("registerUsername").value;
				localStorage.setItem("username", msg.username);
				localStorage.setItem("password", sha256(username + password + "pounce"));
			}
		}
		else {
			if (msg.reason === 1) {
				info.innerHTML = "Your username cannot be whitespace and must be <12 chars"
			}
			if (msg.reason === 2) {
				info.innerHTML = "This username has been taken"
			}
		}
	}
	else if (msg.type === "logout") {
		logoutButton.style.display = "none";
		playButton.style.display = "none";
		playOptions.style.display = "block";
		info.innerHTML = "";
		info2.innerHTML = "";
		localStorage.removeItem("username")
		localStorage.removeItem("password")
		const loginPassword = document.getElementById("loginPassword").value;
		const loginUsername = document.getElementById("loginUsername").value;
		const registerPassword = document.getElementById("registerPassword").value;
		const registerUsername = document.getElementById("registerUsername").value;
		loginPassword.value = "";
		loginUsername.value = "";
		registerPassword.value = "";
		registerUsername.value = "";

	}
	else if (msg.type === "login") {
    guest = false;
		if (msg.success) {
			info.innerHTML = "Logged in as " + msg.username
			loginDiv.style.display = "none";
			logoutButton.style.display = "inline";
			playButton.style.display = "inline";
			playOptions.style.display = "none";
			if (loginRemember.checked) {
				const password = document.getElementById("loginPassword").value;
				const username = document.getElementById("loginUsername").value;
				localStorage.setItem("username", msg.username);
				localStorage.setItem("password", sha256(username + password + "pounce"));
			}
		}
		else {
			info.innerHTML = "The username or password is incorrect";
		}
	}
	else if (msg.type === "guest") {
    guest = true;
		info.innerHTML = "Logged in as " + msg.username
		playButton.style.display = "inline";
		logoutButton.style.display = "inline";
		playOptions.style.display = "none";
		registerDiv.style.display = "none";
		loginDiv.style.display = "none";
	}

	else if (msg.type === "ingame") {
		info2.innerHTML = "Account currently in game!"
	}
	else if (msg.type === "init") {
		game.style.display = "block";
		menu.style.display = "none";
		if (msg.selfId) {
			selfId = msg.selfId;
		}
		if (msg.config) {
			server.tick = msg.config.tick;
			server.x = msg.config.x;
			server.y = msg.config.y;
		}
		if (msg.datas) {
			if (msg.datas.player && msg.datas.player.length > 0) {
				for (let data of msg.datas.player) {
					new Player(data);
				}
			}
		}
	}
	else if (msg.type === "update") {
		if (msg.datas.player && msg.datas.player.length > 0) {
			for (let data of msg.datas.player) {
				const player = players[data.id];
				if (player) {
					player.updatePack(data)
				}
			}
		}
	}
	else if (msg.type === "remove") {
		if (msg.datas.player && msg.datas.player.length > 0) {
			for (let data of msg.datas.player) {
				delete players[data];
			}
		}
	}
});

