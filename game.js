var gameport = document.getElementById("gameport");

var renderer = PIXI.autoDetectRenderer(500, 500, {backgroundColor: 0x330033});
gameport.appendChild(renderer.view);

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

PIXI.loader
  .add('gamefont.fnt')
  .add("assets.json")
  .load(generateLevel);

var battle_stage = new PIXI.Container();
var game_stage = new PIXI.Container();
var master_stage = new PIXI.Container();
var player;
var enemy;
var enemy_health;
var enemies = [];
var hand;
var mode;
var menu_text;
var magic_text;
var item_text;
var step = 10;
var count = 1;
var battle_active = false;
const FIGHT = 1;
const STEAL = 2;
const ITEM = 3;
const RUN = 4;
 
function generateLevel() {
	
	player = createSprite( 50, 200, 1, 1, "player1.png" );
	game_stage.addChild( player );
	
	enemy = createMovieClip( 350, 200, 1, 1, "bat", 1, 2 );
        enemy_health = getRand(5);
	enemies.push(enemy);
	game_stage.addChild( enemy );
	document.addEventListener('keydown', keydownEventHandler);
	
	master_stage.addChild(game_stage);
	
	update();
}

function generateBattleMenu() {
  battle_stage = new PIXI.Container();
  battle_active = true;
  battle_stage.scale.x = 1.5;
  battle_stage.scale.y = 1.5;
  if ( menu_text != null ) {
	delete menu_text;
  }
  menu_text = new PIXI.extras.BitmapText("fight\nsteal\nitem\nrun", {font: "16px gamefont"});
  text2 = new PIXI.extras.BitmapText("", {font: "16px gamefont"});
  menu_text.position.x = player.position.x - 150;
  menu_text.position.y = player.position.y - 100;
  battle_stage.addChild(menu_text);
  
  if ( hand != null ) {
	delete hand;
  }

  hand = new PIXI.Sprite(PIXI.Texture.fromImage("hand.png"));
  hand.position.x = player.position.x - 172;
  hand.position.y = player.position.y - 35;
 
  battle_stage.addChild(hand);
  master_stage.addChild(battle_stage);
}

function update() {
  if(checkEnemyPlayerCollisions() ){
			if ( count == 1 ) {
				generateBattleMenu();
				//alert("" + player.position.x);
				count--;
			}
	};	

  requestAnimationFrame(update);
  renderer.render(master_stage);
}

/**
 * checks for collision of two objects using there rectangle dimensions
 * @param {*} object a PIXi.Container Object of subclass
 * @param {*} otherObject a PIXi.Container Object of subclass
 * @returns true if there is collisoin; false if otherwise
 */
function checkRectangleCollision(object, otherObject){

	let collision = false, combinedHalfWidths, xVector, yVector

	//Find the center points of each sprite
	object.centerX = object.x +  object.width / 2;
	object.centerY = object.y + object.height / 2;

	otherObject.centerX = otherObject.x + otherObject.width / 2;
	otherObject.centerY = otherObject.y + otherObject.height / 2;

	//finding half widths and half heights
	object.halfWidth = object.width / 2;
  	object.halfHeight = object.height / 2;
  	otherObject.halfWidth = otherObject.width / 2;
	otherObject.halfHeight = otherObject.height / 2;

	//Calculate the distance vector between the sprites
	xVector = object.centerX - otherObject.centerX;
	yVector = object.centerY - otherObject.centerY;

	//Figure out the combined half-widths(with a more leaniate threshold for gameplay)
	//and half-heights
  	combinedHalfWidthsAdjusted = object.halfWidth + otherObject.halfWidth - 20;
  	combinedHalfHeights = object.halfHeight + otherObject.halfHeight;

	//Check for a collision on the x axis
	if (Math.abs(xVector) < (combinedHalfWidthsAdjusted) && Math.abs(yVector) < combinedHalfHeights) {
		collision = true;	
	}

	return collision;
}

/**
 * checks every collision with every skull to see if it collides with the player
 * using checkRectangleCollision function
 */
function checkEnemyPlayerCollisions(){

	for(var i in enemies){
		var foe = enemies[i];
		if(checkRectangleCollision(player, foe)){
			return true;
		}
	}

	return false;
}

function moveHand(x, y) {
  if (!hand) return;
  createjs.Tween.removeTweens(hand.position);
  createjs.Tween.get(hand.position).to({ x: x, y: y}, 100, createjs.Ease.bounceOut);
}

var menu = StateMachine.create({
  initial: {state: 'run', event: 'init'},
  error: function() {},
  events: [
    {name: "down", from: "fight", to: "steal"}, //fight->magic
    //{name: "down", from: "magic", to: "steal"},
    {name: "down", from: "steal", to: "item"},
    {name: "down", from: "item", to: "run"},
    {name: "down", from: "run", to: "run"},
    
    {name: "up", from: "fight", to: "fight"},
    //{name: "up", from: "magic", to: "fight"},
    {name: "up", from: "steal", to: "fight"}, //steal->magic
    {name: "up", from: "item", to: "steal"},
    {name: "up", from: "run", to: "item"}],
  callbacks: {
    onfight: function() { moveHand(hand.position.x, player.position.y - 95); mode = FIGHT;},
    //onmagic: function() { moveHand(hand.position.x, player.position.y - 105); mode = 2; },
    onsteal: function() { moveHand(hand.position.x, player.position.y - 75); mode = STEAL;},
    onitem: function() { moveHand(hand.position.x,player.position.y - 55); mode = ITEM;},
    onrun: function() { moveHand(hand.position.x,player.position.y - 35); mode = RUN;} 
  }
});

function keydownEventHandler(event) {
 if ( !battle_active ) {
 	 var temp_x = player.position.x;
	 var temp_y = player.position.y;
  
  	if ( event.keyCode == 87 ) { // W key
		// Update the player sprite to upper facing player
		swapPlayer( temp_x, temp_y - step, 1, 1, "player4.png"  );
     	}

	if ( event.keyCode == 65 ) { // A key
		// Update the player sprite to left facing player
		swapPlayer( temp_x - step, temp_y, 1, 1, "player2.png"  );
  	}
	
 	if ( event.keyCode == 83 ) { // S key
	    	// Update the player sprite to lower facing player
		swapPlayer( temp_x, temp_y + step, 1, 1, "player3.png"  );
	}
	
  	if ( event.keyCode == 68 ) { // D key
		// Update the player sprite to right facing player
		swapPlayer( temp_x + step, temp_y, 1, 1, "player1.png"  );
	}
  }

  else {
       if (event.keyCode == 87) { // Up key 38
    menu.up();
  }

  if (event.keyCode == 83) { // Down key 40
    menu.down();
  }

  if (event.keyCode == 13) { // Enter key
	if ( mode == RUN ){
		swapPlayer( player.position.x - (step*step), player.position.y, 1, 1, "player2.png"  );
    		endBattle();
        }
	
	else if ( mode == FIGHT ) {
		enemy_health--;
	        if ( enemy_health == 0 ) { alert("The enemy has been slain"); game_stage.removeChild( enemy ); enemies = []; endBattle();}	
        }
  }

  }
}

function endBattle () {
	battle_active = false; 
	count = 1;
	battle_stage.removeChild( hand );
	battle_stage.removeChild( menu_text );
	battle_stage = new PIXI.Container();
	master_stage.removeChild( battle_stage ); 
}

/**
	Helper function that creates a sprite
*/
function createSprite (x, y, scale_x, scale_y, image ) {
	var sprite = new PIXI.Sprite( PIXI.Texture.fromFrame( image ) );
	sprite.position.x = x;
	sprite.position.y = y;
	sprite.scale.x = scale_y;
	sprite.scale.y = scale_x;
	return sprite;
}
/**
*/
function createShape() {
   var graphics = new PIXI.Graphics();
   graphics.beginFill('0x000000');
   graphics.drawRect(0, 0, 1100, 500);
   graphics.endFill();
   return graphics;
}

/**
	Helper function that returns a movie clip
*/
function createMovieClip ( x, y, scale_x, scale_y, image, low, high ) {
	var clips = [];
	for ( var i = low; i <= high; i++ ) {
    		clips.push( PIXI.Texture.fromFrame( image + i + '.png' ) );
  	}
	
	var movie_clip = new PIXI.extras.MovieClip( clips );
	movie_clip.scale.x = scale_x;
	movie_clip.scale.y = scale_y;
	movie_clip.position.x = x;
	movie_clip.position.y = y;
	movie_clip.animationSpeed = 0.1;
	movie_clip.play();	
  	return movie_clip;
}

/**
	Helper function that swaps the player sprite
*/
function swapPlayer ( x, y, scale_x, scale_y, image ) {
	game_stage.removeChild( player );
	player = createSprite( x, y, scale_x, scale_y, image );
	game_stage.addChild( player );
}


/**
	Helper function that returns a random number from 1 to max
*/
function getRand( max ) {
	return Math.floor(( Math.random() * max ) + 1 );
}