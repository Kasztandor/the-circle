var level = {}
var gameLoopInterval
var pressedButtons = []
var moveDirection
var jumpVector = 0
var canvas = document.querySelector("canvas")
var ctx = canvas.getContext("2d")
var playerCoords = [0,0]
var mapSize = [0,0]
var bs = 50
var obstacles = "#Z"

function loadLevel(a){
	var js = document.createElement("script")
	js.type = "text/javascript"
	js.src = "levels/"+a+".js"
	js.id = "levelFunction"
	document.body.appendChild(js)
	document.getElementById('levelFunction').remove()
}
function resetView(){
	const ctx = document.querySelector("canvas").getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function display(){
	resetView()
	for (var i = 0; i<level.map.length; i++){
		for (var j = 0; j<level.map[0].length; j++){
			switch (level.map[i][j]){
				case "#":
					ctx.fillStyle = 'black'
					ctx.fillRect(j*bs+350-playerCoords[1],i*bs+250-playerCoords[0],bs,bs)
					break
				case "Z":
					ctx.fillStyle = 'black'
					ctx.fillRect(j*bs+350-playerCoords[1],i*bs+250-playerCoords[0],bs,bs/2)
					ctx.fillStyle = 'yellow'
					ctx.fillRect(j*bs+350-playerCoords[1],i*bs+275-playerCoords[0],bs,bs/2)
					break
				case "W":
					ctx.fillStyle = 'green'
					ctx.fillRect(j*bs+350-playerCoords[1],i*bs+250-playerCoords[0],bs,bs)
					break
				case "D":
					ctx.fillStyle = 'red'
					ctx.fillRect(j*bs+350-playerCoords[1],i*bs+250-playerCoords[0],bs,bs)
					break
			}
		}
	}
	ctx.arc(350+bs/2, 250+bs/2, bs/2, 0, 2 * Math.PI);
	ctx.fillStyle = 'red'
	ctx.fill();
}
function checkHitboxes(x=playerCoords[1], y=playerCoords[0]){
	var xx = Math.floor((x+bs/2)/bs)
	var yy = Math.floor((y+bs/2)/bs)
	//console.log(xx+" "+yy)
	//var surroundings = [level.map[yy-1][xx-1]+level.map[yy-1][xx]+level.map[yy-1][xx+1],level.map[yy][xx-1]+level.map[yy][xx]+level.map[yy][xx+1],level.map[yy+1][xx-1]+level.map[yy+1][xx]+level.map[yy+1][xx+1]]
	var hitted = []
	/* WIN */
	if (level.map[yy][xx] == "W"){
		hitted.push("WIN")
	}
	else if (level.map[yy][xx] == "D"){
		hitted.push("LOSE")
	}
	else{
		/* indise */
		if (obstacles.indexOf(level.map[yy][xx])!=-1){
			hitted.push("inside")
		}
		/* ⬁ */
		if (false){
			hitted.indexOf("top")==-1?hitted.push("top"):0
			hitted.indexOf("left")==-1?hitted.push("left"):0
		}
		/* ⇧ */
		if (obstacles.indexOf(level.map[yy-1][xx])!=-1 && yy*bs>=y){
			hitted.indexOf("top")==-1?hitted.push("top"):0
			if (level.map[yy-1][xx] == "Z" && yy*bs>=y){
				hitted.push("zipline")
			}
		}
		/* ⬀ */
		if (false){
			hitted.indexOf("top")==-1?hitted.push("top"):0
			hitted.indexOf("right")==-1?hitted.push("right"):0
		}
		/* ⇦ */
		if (obstacles.indexOf(level.map[yy][xx-1])!=-1 && xx*bs>=x){
			hitted.indexOf("left")==-1?hitted.push("left"):0
		}
		/* ⇨ */
		if (obstacles.indexOf(level.map[yy][xx+1])!=-1 && xx*bs<=x){
			hitted.indexOf("right")==-1?hitted.push("right"):0
		}
		/* ⬃ */
		if ((yy+1)<level.map.length && false){
			hitted.indexOf("down")==-1?hitted.push("down"):0
			hitted.indexOf("left")==-1?hitted.push("left"):0
		}
		/* ⇩ */
		if ((yy+1)<level.map.length && obstacles.indexOf(level.map[yy+1][xx])!=-1 && yy*bs<=y){
			hitted.indexOf("down")==-1?hitted.push("down"):0
		}
		/* ⬂ */
		if ((yy+1)<level.map.length && false){
			hitted.indexOf("down")==-1?hitted.push("down"):0
			hitted.indexOf("right")==-1?hitted.push("right"):0
		}
	}
	return hitted
	//console.log(surroundings[0]+"\n"+surroundings[1]+"\n"+surroundings[2])
}
function gameLoop(){
	/* WIN */
	if (checkHitboxes().indexOf("WIN")!=-1){
		nextLevel()
	}
	else if (checkHitboxes().indexOf("LOSE")!=-1){
		runLevel()
	}
	else{
		/* check jump */
		var allowJump = false
		if (pressedButtons.indexOf("ArrowUp") !== -1 || pressedButtons.indexOf("KeyW") !== -1){
			if (checkHitboxes().indexOf("down")!=-1){
				jumpVector = 15
				allowJump = true
			}
		}
		if (pressedButtons.indexOf("ArrowLeft") !== -1 || pressedButtons.indexOf("KeyA") !== -1){
			if (checkHitboxes().indexOf("left")==-1){
				playerCoords[1] -= 10
			}
		}
		else if (pressedButtons.indexOf("ArrowRight") !== -1 || pressedButtons.indexOf("KeyD") !== -1){
			if (checkHitboxes().indexOf("right")==-1){
				playerCoords[1] += 10
			}
		}
		/* make jump and calculate jump vector */
		if (checkHitboxes().indexOf("down")!=-1 && allowJump==false){
			jumpVector=0
		}
		else{
			playerCoords[0]-=jumpVector
			jumpVector<=35?jumpVector-=1:0
		}
		/* repair inside block situations */
		if (checkHitboxes().indexOf("down")!=-1 || checkHitboxes().indexOf("inside")!=-1){
			while (checkHitboxes().indexOf("down")!=-1 || checkHitboxes().indexOf("inside")!=-1){
				playerCoords[0]--
			}
			playerCoords[0]++
		}
		else if(checkHitboxes().indexOf("top")!=-1){
			if (jumpVector>0 || checkHitboxes().indexOf("zipline")!=-1){
				jumpVector=0
			}
			while (checkHitboxes().indexOf("top")!=-1){
				playerCoords[0]++
			}
			playerCoords[0]--
		}
	}
	//console.log("X:"+playerCoords[1]+" Y: "+playerCoords[0])
	//console.log(h)
	display()
}
function runLevel(a=level.id){
	clearInterval(gameLoopInterval)
	loadLevel(a)
	setTimeout(()=>{
		for (var i = 0; i<level.map.length; i++){
			for (var j = 0; j<level.map[0].length; j++){
				if (level.map[i][j] == "P"){
					playerCoords = [i*bs,j*bs]
					level.map[i] = level.map[i].replace("P"," ")
				}
			}
		}
		gameLoopInterval = setInterval(gameLoop, 33)
	},1)
}
function nextLevel(){
	runLevel(level.id+1)
}
function keyChecker(a, b){
	if (b){
		if (pressedButtons.indexOf(a) == -1){
			pressedButtons.push(a)
		}
	}
	else{
		var index = pressedButtons.indexOf(a)
		if (index !== -1){
			pressedButtons.splice(index, 1)
		}
	}
}
document.addEventListener('keydown', (e) => {
	keyChecker(e.code, true)
});
document.addEventListener('keyup', (e) => {
	keyChecker(e.code, false)
});
runLevel(1)
setTimeout(display,1)