let randomConso = function () {
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
let randomVowel = function () {
  let index = Math.round(Math.random() * 4);
  let vowels = ["a", "e", "i", "o", "u"];
  return vowels[index];
};
module.exports = class Player{
  constructor(id, name){
    this.id = id;
    this.name = name;
    if (!/\S/.test(this.name)) {
      this.name =
        "Guest"+
        randomConso().toUpperCase() +
        randomVowel() +
        randomConso() +
        randomVowel() +
        randomConso() +
        randomVowel();
    }
    this.x = Math.random() * 100;
    this.y = Math.random() * 100;
    this.accX = 0;
    this.accY = 0;
    this.velX = 0;
    this.velY = 0;
    this.size = 30;
    this.maxVel = 300;
    this.friction = 0.7;
    this.bFriction = 0.85;
    this.justChat = true;
    this.movement = [false, false, false, false]
    this.pendingKeys = [false, false, false, false]
    this.lastChatTime = 1;
    this.bounceX = 0;
    this.bounceY = 0;

    this.lastName = "";

    this.chatTime = 3; // Seconds
    this.chatValue = "Hello!";
    this.lastChat = "";
  }
  update(dt, arenaX, arenaY){  
    if (this.movement[0] || this.pendingKeys[0]){
      this.velY -= this.maxVel*14 * dt;
    }
    if (this.movement[1] || this.pendingKeys[1]){
      this.velX += this.maxVel*14 * dt;
    }
    if (this.movement[2] || this.pendingKeys[2]){
      this.velY += this.maxVel*14 * dt;
    }
    if (this.movement[3] || this.pendingKeys[3]){
      this.velX -= this.maxVel*14 * dt;
    }

    if (!this.movement[1] && !this.movement[3]){
    this.velX *= Math.pow(this.friction, dt*50)
    }
    if (!this.movement[2] && !this.movement[0]){
    this.velY *= Math.pow(this.friction, dt*50)
    }
    this.bounceX *= Math.pow(this.bFriction, dt*50);
    this.bounceY *= Math.pow(this.bFriction, dt*50);




    this.chatTime -= dt;

    this.x += (this.velX+this.bounceX) * dt;
    this.y += (this.velY+this.bounceY) * dt;
    if (this.velX > this.maxVel){
      this.velX = this.maxVel;
    }
    if (this.velX < -this.maxVel){
      this.velX = -this.maxVel;
    }
    if (this.velY > this.maxVel){
      this.velY = this.maxVel;
    }
    if (this.velY < -this.maxVel){
      this.velY = -this.maxVel;
    }

    if (this.x < this.size){
      this.velX = 0;
      this.x = this.size;
    }
    if (this.x > arenaX-this.size){
      this.velX = 0;
      this.x = arenaX-this.size;
    }
    if (this.y < this.size){
      this.velY = 0;
      this.y = this.size;
    }
    if (this.y > arenaY-this.size){
      this.velY = 0;
      this.y = arenaY-this.size;
    }
    this.pendingKeys = [false, false, false, false]
    
  }
  static pack({players, delta, arenaX, arenaY}){
    let pack = [];
    for (let i of Object.keys(players)) {
			players[i].update(delta, arenaX, arenaY);
      pack.push(players[i].getUpdatePack());
    }
    return pack;
  }
  getUpdatePack(){
    let pack = {
      x: Math.round(this.x),
      y: Math.round(this.y),
      id: this.id
    }
    if (this.chatValue != this.lastChat || this.justChat){
      pack.chatValue = this.chatValue;
      this.lastChat = this.chatValue;
      this.justChat = false;
    }
    if (this.lastName != this.name){
      pack.name = this.name;
      this.lastName = this.name;
    }
    return pack;
  }
  getInitPack(){
    return {
      x: Math.round(this.x),
      y: Math.round(this.y),
      name: this.name,
      id: this.id,
      size: this.size,
      chatTime: this.chatTime,
      chatValue: this.chatValue
    }
  }
  static getAllInitPack({ players }) {
    var initPacks = [];
    for (let i of Object.keys(players)) {
      initPacks.push(players[i].getInitPack());
    }
    return initPacks;
  }
  static collision({ playerArray, players }) {
    for (let i = 0; i < playerArray.length; i++) {
      for (let j = i + 1; j < playerArray.length; j++) {
        let player1 = players[playerArray[i][0]];
        let player2 = players[playerArray[j][0]];
        if (
          Math.sqrt(
            Math.abs(
              Math.pow(player2.x - player1.x, 2) +
                Math.pow(player2.y - player1.y, 2)
            )
          ) < 60
        ) {
          let distance = Math.sqrt(
            Math.abs(
              Math.pow(player2.x - player1.x, 2) +
                Math.pow(player2.y - player1.y, 2)
            )
          );
          let rotate = Math.atan2(
            player2.y - player1.y,
            player2.x - player1.x
          );
          let bounceEffect = 26;
          player2.bounceX = ((Math.cos(rotate) * bounceEffect)) * 110;
          player1.bounceX = -((Math.cos(rotate) * bounceEffect)) * 110;
          player2.bounceY = ((Math.sin(rotate) * bounceEffect)) * 110;
          player1.bounceY = -((Math.sin(rotate) * bounceEffect)) * 110;
        }
      }
    }
  }
}