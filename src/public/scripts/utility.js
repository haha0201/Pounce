export function getBorders() {
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;
  let stuff = windowHeight / windowWidth;

  let realWindowWidth = windowWidth;
  let realWindowHeight = windowHeight;
  if (stuff > 9 / 16) {
    realWindowHeight = (windowWidth * 9) / 16;
  }
  if (stuff < 9 / 16) {
    realWindowWidth = (windowHeight * 16) / 9;
  }

  let changeX = Math.abs(realWindowWidth - windowWidth);
  let changeY = Math.abs(realWindowHeight - windowHeight);

  let leftBorder = changeX / 2;
  let topBorder = changeY / 2;
}

export function resize(ctx, canvas) {
  ctx.textAlign = "center"
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;
  let scale = window.innerWidth / canvas.width;
  if (window.innerHeight / canvas.height < window.innerWidth / canvas.width) {
    scale = window.innerHeight / canvas.height;
  }
  let leftBorder = windowWidth - canvas.width / 2;
  let topBorder = windowHeight - canvas.height / 2;
  canvas.style.transform = "scale(" + scale + ")";
  canvas.style.left = (1 / 2) * (windowWidth - canvas.width) + "px";
  canvas.style.top = (1 / 2) * (windowHeight - canvas.height) + "px";
}

export function lerp( start, end, time ) {
	return start * ( 1 - time ) + end * time;
}

export function negative(e){
  return !e;
}