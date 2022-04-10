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
	//var surroundings = [level.map[yy-1][xx-1]+level.map[yy-1][xx]+level.map[yy-1][xx+1],level.map[yy][xx-1]+level.map[yy][xx]+level.map[yy][xx+1],level.map[yy+1][xx-1]+level.map[yy+1][xx]+level.map[yy+1][xx+1]]
	var hitted = []
	for (var i=0; i<3; i++){
		for (var j=0; j<3; j++){
			switch (i+""+j){
				case "00":
					if (false){
						hitted.indexOf("top")==-1?hitted.push("top"):0
						hitted.indexOf("left")==-1?hitted.push("left"):0
					}
					break
				case "01":
					if (obstacles.indexOf(level.map[yy-1][xx])!=-1 && yy*bs>=y){
						hitted.indexOf("top")==-1?hitted.push("top"):0
					}
					if (level.map[yy-1][xx] == "Z" && yy*bs>=y){
						hitted.push("zipline")
					}
					break
				case "02":
					if (false){
						hitted.indexOf("top")==-1?hitted.push("top"):0
						hitted.indexOf("right")==-1?hitted.push("right"):0
					}
					break
				case "10":
					if (obstacles.indexOf(level.map[yy][xx-1])!=-1 && xx*bs>=x){
						hitted.indexOf("left")==-1?hitted.push("left"):0
					}
					break
				case "12":
					if (obstacles.indexOf(level.map[yy][xx+1])!=-1 && xx*bs<=x){
						hitted.indexOf("right")==-1?hitted.push("right"):0
					}
					break
				case "20":
					if (false){
						hitted.indexOf("down")==-1?hitted.push("down"):0
						hitted.indexOf("left")==-1?hitted.push("left"):0
					}
					break
				case "21":
					if (obstacles.indexOf(level.map[yy+1][xx])!=-1 && yy*bs<=y){
						hitted.indexOf("down")==-1?hitted.push("down"):0
					}
					break
				case "22":
					if (false){
						hitted.indexOf("down")==-1?hitted.push("down"):0
						hitted.indexOf("right")==-1?hitted.push("right"):0
					}
					break
			}
		}
	}
	return hitted
	//console.log(surroundings[0]+"\n"+surroundings[1]+"\n"+surroundings[2])
}
function gameLoop(){
	var allowJump = false
	if (pressedButtons.indexOf("ArrowUp") !== -1 || pressedButtons.indexOf("KeyW") !== -1){
		if (checkHitboxes().indexOf("down")!=-1){
			jumpVector = 15
			allowJump = true
		}
	}
	if (checkHitboxes().indexOf("down")!=-1 && allowJump==false){
		jumpVector=0
	}
	else{
		playerCoords[0]-=jumpVector
		jumpVector-=1
		if (checkHitboxes().indexOf("down")!=-1){
			while (checkHitboxes().indexOf("down")!=-1){
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
	//console.log("X:"+playerCoords[1]+" Y: "+playerCoords[0])
	//console.log(h)
	display()
}
function runLevel(a){
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
runLevel(3)
setTimeout(display,1)