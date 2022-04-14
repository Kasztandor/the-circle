var level = {}
var gameLoopInterval
var pressedButtons = []
var moveDirection
var upVector = 0
var canvas = document.querySelector("canvas")
var ctx = canvas.getContext("2d")
var playerCoords = [0,0]
var mapSize = [0,0]
var bs = 50
var obstacles = "#Z"
var levelId = 1
var h = []

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
				case "L": //liquid
					ctx.fillStyle = 'lightblue'
					ctx.fillRect(j*bs+350-playerCoords[1],i*bs+250-playerCoords[0],bs,bs)
					break
				case "U": //upper
					ctx.fillStyle = 'black'
					ctx.fillRect(j*bs+350-playerCoords[1],i*bs+250-playerCoords[0],bs,bs/2)
					ctx.fillStyle = 'gray'
					ctx.fillRect(j*bs+350-playerCoords[1],i*bs+275-playerCoords[0],bs,bs/2)
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
		while (h.length>0){
			h.pop()
		}

		/* indise */
		if (level.map[yy][xx]!=" "){
			block = level.map[yy][xx]
			obstacles.indexOf(block)!=-1?arrPush(h,"inside"):0
			obstacles.indexOf(block)!=-1?arrPush(h,"down"):0
			block=="D"?arrPush(h, "LOSE"):0
			block=="L"?arrPush(h, "liquid"):0
			block=="U"?arrPush(h, "down"):0
		}
		/* ⬁ */
		if (level.map[yy-1][xx-1]!=" " && Math.sqrt(Math.pow(Math.abs((xx*bs-bs/2)-x),2)+Math.pow(Math.abs((yy*bs-bs/2)-y),2))<=bs/2){
			block = level.map[yy-1][xx-1]
			obstacles.indexOf(block)!=-1?arrPush(h, "top", /*"left"*/):0
			block=="D"?arrPush(h, "LOSE"):0
		}
		/* ⇧ */
		if (level.map[yy-1][xx]!=" " && yy*bs>=y){
			block = level.map[yy-1][xx]
			obstacles.indexOf(block)!=-1?arrPush(h, "top"):0
			block=="Z"?arrPush(h, "zipline"):0
			block=="D"?arrPush(h, "LOSE"):0
		}
		/* ⬀ */
		if (level.map[yy-1][xx+1]!=" " && Math.sqrt(Math.pow(Math.abs((xx*bs+bs/2)-x),2)+Math.pow(Math.abs((yy*bs-bs/2)-y),2))<=bs/2){
			block = level.map[yy-1][xx+1]
			obstacles.indexOf(block)!=-1?(arrPush(h,"top", /*"right"*/)):0
			block=="D"?arrPush(h, "LOSE"):0
		}
		/* ⇦ */
		if (level.map[yy][xx-1]!=" " && xx*bs>=x){
			block = level.map[yy][xx-1]
			obstacles.indexOf(block)!=-1?arrPush(h, "left"):0
			block=="D"?arrPush(h, "LOSE"):0
			//xx*bs>x?arrPush(h, "down"):0
		}
		/* ⇨ */
		if (level.map[yy][xx+1]!=" " && xx*bs<=x){ 
			block = level.map[yy][xx+1]
			obstacles.indexOf(block)!=-1?arrPush(h, "right"):0
			block=="D"?arrPush(h, "LOSE"):0
			//xx*bs<x?arrPush(h, "down"):0
		}
		/* ⬃⇩⬂ */
		// Ciekawy efekt: if ((yy+1)<level.map.length && level.map[yy+1][xx-1])!=-1 && Math.sqrt(Math.abs(y-(yy+1)*bs)*Math.abs(x-(xx-1)*bs))<=bs){
		if ((yy+1)<level.map.length){
			/* ⬃ */
			if (level.map[yy+1][xx-1]!=" " && Math.sqrt(Math.pow(Math.abs((xx*bs-bs/2)-x),2)+Math.pow(Math.abs((yy*bs+bs/2)-y),2))<=bs/2){
				block = level.map[yy+1][xx-1]
				obstacles.indexOf(block)!=-1?arrPush(h, "down"):0
				block=="D"?arrPush(h, "LOSE"):0
			}
			/* ⇩ */
			if (level.map[yy+1][xx]!=" " && yy*bs<=y){
				block = level.map[yy+1][xx]
				obstacles.indexOf(block)!=-1?arrPush(h, "down"):0
				block=="D"?arrPush(h, "LOSE"):0
				block=="U"?arrPush(h, "down"):0
			}
			/* ⬂ */
			if (level.map[yy+1][xx+1]!=" " && Math.sqrt(Math.pow(Math.abs((xx*bs+bs/2)-x),2)+Math.pow(Math.abs((yy*bs+bs/2)-y),2))<=bs/2){
				block = level.map[yy+1][xx+1]
				obstacles.indexOf(block)!=-1?arrPush(h, "down"):0
				block=="D"?arrPush(h, "LOSE"):0
			}
		}
	}
	return h
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
		// is player jumping?
		var jump = false
		if ((pressedButtons.indexOf("ArrowUp") !== -1 || pressedButtons.indexOf("KeyW") !== -1) && checkHitboxes().indexOf("down")!=-1 && checkHitboxes().indexOf("liquid")==-1){
			jump = true
		}
		// is player moving?
		if ((pressedButtons.indexOf("ArrowLeft") !== -1 || pressedButtons.indexOf("KeyA") !== -1) && checkHitboxes().indexOf("left")==-1){
			playerCoords[1] -= 10
		}
		else if ((pressedButtons.indexOf("ArrowRight") !== -1 || pressedButtons.indexOf("KeyD") !== -1) && checkHitboxes().indexOf("right")==-1){
			playerCoords[1] += 10
		}
		// jumping
		if (jump){
			upVector = 15
		}
		else{
			var falling = true
			if (checkHitboxes().indexOf("liquid")!=-1){
				checkHitboxes().indexOf("top")==-1?upVector++:0
				checkHitboxes().indexOf("down")!=-1?upVector=1:0
				upVector++
			}
			else{
				if (checkHitboxes().indexOf("down")!=-1){
					upVector = 0
					upVector++
				}
				if(checkHitboxes().indexOf("top")!=-1){
					upVector = 0
				}
			}
			if (checkHitboxes().indexOf("zipline")!=-1){
				upVector++
			}
			upVector--
			upVector<-30?upVector=-30:0
			upVector>30?upVector=30:0
		}
		playerCoords[0]-=upVector
		// correcting under roof position
		if (checkHitboxes().indexOf("top")!=-1){
			while (checkHitboxes().indexOf("top")!=-1){
				playerCoords[0]++
			}
			playerCoords[0]--
		}
		if (checkHitboxes().indexOf("down")!=-1){
			while (checkHitboxes().indexOf("down")!=-1){
				playerCoords[0]--
			}
			playerCoords[0]++
		}
	}
	display()
}
function runLevel(a=levelId){
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
		levelId = a
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
runLevel()