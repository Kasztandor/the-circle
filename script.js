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

function arrPush(arr){
	for (var i = 1; i < arguments.length; i++) {
    	arr.indexOf(arguments[i])==-1?arr.push(arguments[i]):0
	}
}
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
				case "#": //block
					ctx.fillStyle = 'black'
					ctx.fillRect(j*bs+350-playerCoords[1],i*bs+250-playerCoords[0],bs,bs)
					break
				case "Z": //zipper
					ctx.fillStyle = 'black'
					ctx.fillRect(j*bs+350-playerCoords[1],i*bs+250-playerCoords[0],bs,bs/2)
					ctx.fillStyle = 'yellow'
					ctx.fillRect(j*bs+350-playerCoords[1],i*bs+275-playerCoords[0],bs,bs/2)
					break
				case "D": //death
					ctx.fillStyle = 'red'
					ctx.fillRect(j*bs+350-playerCoords[1],i*bs+250-playerCoords[0],bs,bs)
					break
				case "I": //info
					ctx.font = (bs/2+"px Arial")
					ctx.fillText("Level: "+level.id, j*bs-playerCoords[1]+350, i*bs-playerCoords[0]+250+bs/2)
					break
				case "W": //WIN
					ctx.fillStyle = 'green'
					ctx.fillRect(j*bs+350-playerCoords[1],i*bs+250-playerCoords[0],bs,bs)
					break
			}
		}
	}
	ctx.arc(350+bs/2, 250+bs/2, bs/2, 0, 2 * Math.PI);
	ctx.fillStyle = 'red'
	ctx.fill();
}
function checkHitboxes(x=playerCoords[1], y=playerCoords[0]){ //checking hitbox and events
	var xx = Math.floor((x+bs/2)/bs)
	var yy = Math.floor((y+bs/2)/bs)
	/* WIN */
	if (level.map[yy][xx] == "W"){
		return ["WIN"]
	}
	else if (level.map[yy][xx] == "D"){
		return ["LOSE"]
	}
	else{
		var hitted = []
		var hae = [] //hitted and events

		/* indise */
		level.map[yy][xx]!=" "?arrPush(hitted,"in"):0
		/* ⬁ */
		if (level.map[yy-1][xx-1]!=" " && Math.sqrt(Math.pow(Math.abs((xx*bs-bs/2)-x),2)+Math.pow(Math.abs((yy*bs-bs/2)-y),2))<=bs/2){
			arrPush(hitted,"lt")
			//obstacles.indexOf(level.map[yy-1][xx-1])!=-1?(arrPush(hae,"lt"),console.log(1)):0
		}
		/* ⇧ */
		if (level.map[yy-1][xx]!=" " && yy*bs>=y){
			arrPush(hitted,"t")
		}
		/* ⬀ */
		if (level.map[yy-1][xx+1]!=" " && Math.sqrt(Math.pow(Math.abs((xx*bs+bs/2)-x),2)+Math.pow(Math.abs((yy*bs-bs/2)-y),2))<=bs/2){
			arrPush(hitted,"rt")
		}
		/* ⇦ */
		if (level.map[yy][xx-1]!=" " && xx*bs>=x){
			arrPush(hitted, "l")
		}
		/* ⇨ */
		if (level.map[yy][xx+1]!=" " && xx*bs<=x){ 
			arrPush(hitted, "r")
		}
		/* ⬃⇩⬂ */
		// Ciekawy efekt: if ((yy+1)<level.map.length && level.map[yy+1][xx-1])!=-1 && Math.sqrt(Math.abs(y-(yy+1)*bs)*Math.abs(x-(xx-1)*bs))<=bs){
		if ((yy+1)<level.map.length){
			/* ⬃ */
			if (level.map[yy+1][xx-1]!=" " && Math.sqrt(Math.pow(Math.abs((xx*bs-bs/2)-x),2)+Math.pow(Math.abs((yy*bs+bs/2)-y),2))<=bs/2){
				arrPush(hitted,"ld")
			}
			/* ⇩ */
			if (level.map[yy+1][xx]!=" " && yy*bs<=y){
				arrPush(hitted,"d")
			}
			/* ⬂ */
			if (level.map[yy+1][xx+1]!=" " && Math.sqrt(Math.pow(Math.abs((xx*bs+bs/2)-x),2)+Math.pow(Math.abs((yy*bs+bs/2)-y),2))<=bs/2){
				arrPush(hitted,"rd")
			}
		}

		for (var i of hitted){
			var block
			switch (i){
				case "in": //indise
					obstacles.indexOf(block)!=-1?arrPush(hae,"inside"):0
					obstacles.indexOf(block)!=-1?arrPush(hae,"down"):0
					break
				case "lt": //left,top
					block = level.map[yy-1][xx-1]
					obstacles.indexOf(block)!=-1?arrPush(hae, "top", "left"):0
					break
				case "t": //top
					block = level.map[yy-1][xx]
					obstacles.indexOf(block)!=-1?arrPush(hae, "top"):0
					block=="Z"?arrPush(hae, "zipline"):0
					break
				case "rt": //right,top
					block = level.map[yy-1][xx+1]
					obstacles.indexOf(block)!=-1?(arrPush(hae,"top", "right")):0
					break
				case "l": //left
					block = level.map[yy][xx-1]
					obstacles.indexOf(block)!=-1?arrPush(hae, "left"):0
					//xx*bs>x?arrPush(hitted, "d"):0
					break
				case "r": //right
					block = level.map[yy][xx+1]
					obstacles.indexOf(block)!=-1?arrPush(hae, "right"):0
					//xx*bs<x?arrPush(hitted, "d"):0
					break
				case "ld": //left,down
					block = level.map[yy+1][xx-1]
					obstacles.indexOf(block)!=-1?arrPush(hae, "down"):0
					break
				case "d": //down
					block = level.map[yy+1][xx]
					obstacles.indexOf(block)!=-1?arrPush(hae, "down"):0
					break
				case "rd": //right,down
					block = level.map[yy+1][xx+1]
					obstacles.indexOf(block)!=-1?arrPush(hae, "down"):0
					break
			}
			block=="D"?arrPush(hae, "LOSE"):0
		}
	}
	return hae
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
	level.lastLevel?runLevel(1):runLevel(level.id+1)
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