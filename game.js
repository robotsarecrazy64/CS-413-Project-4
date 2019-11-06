GAME_WIDTH = 500;
GAME_HEIGHT = 500;
GAME_SCALE = 2;
var gameport = document.getElementById("gameport");

var renderer = PIXI.autoDetectRenderer(GAME_WIDTH, 
                                       GAME_HEIGHT, 
                                       {backgroundColor: 0x330033});
gameport.appendChild(renderer.view);

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

PIXI.loader
  .add('gamefont.fnt')
  .add('assets/assets.json')
  .add('assets/map.json')
  .add('assets/tiles.png')
  .load(generateLevel);

var battle_stage = new PIXI.Container();
var game_stage = new PIXI.Container();
game_stage.scale.x = GAME_SCALE;
game_stage.scale.y = GAME_SCALE;

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
var world;
var tu;

const PLAYERMOVEAMOUNT = 25;
const FIGHT = 1;
const STEAL = 2;
const ITEM = 3;
const RUN = 4;

const WKEY = 87;
const AKEY = 65;
const SKEY = 83;
const DKEY = 68;
const SPACE = 32;
const SHIFT = 16;
const ENTER = 13;
 
function generateLevel() {
   
   // Initialize tile utilities
   tu = new TileUtilities( PIXI );
   world = tu.makeTiledWorld("assets/map.json", "assets/tiles.png");
   game_stage.addChild(world);

	
	player = createSprite( 50, 200, 1, 1, "rightarrow.png" );
   //player.anchor.x = .5;
   //player.anchor.y = .5;
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

   contain(player, {x: 0, y: 0, width: 1250, height: 1250});
   requestAnimationFrame(update);
   update_camera();
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

// ---------- Input handlers
function keydownEventHandler(e)
{
   if ( !battle_active ) {
      
      // Vertical --------------------------------------------------
      if ( e.keyCode == WKEY ) { // W key
         // Update the player sprite to upper facing player
         player.y -= PLAYERMOVEAMOUNT;
         swapPlayer( player.x, player.y, 1, 1, "uparrow.png"  );
      }
      
      else if ( e.keyCode == SKEY ) { // S key
         // Update the player sprite to lower facing player
         player.y += PLAYERMOVEAMOUNT;
         swapPlayer( player.x, player.y, 1, 1, "downarrow.png"  );
      }

      // Horizontal --------------------------------------------------
      else if ( e.keyCode == AKEY ) { // A key
         // Update the player sprite to left facing player
         player.x -= PLAYERMOVEAMOUNT;
         swapPlayer( player.x, player.y, 1, 1, "leftarrow.png"  );
      }

      else if ( e.keyCode == DKEY ) { // D key
         // Update the player sprite to right facing player
         player.x += PLAYERMOVEAMOUNT;
         swapPlayer( player.x, player.y, 1, 1, "rightarrow.png"  );
      }
   }


   else {
      if (e.keyCode == WKEY) { // Up key 38
         menu.up();
      }

      if (e.keyCode == SKEY) { // Down key 40
         menu.down();
      }

      if ( ENTER ) { // Enter key
         if ( mode == RUN ) {
            swapPlayer( player.position.x - PLAYERMOVEAMOUNT, 
                        player.position.y, 1, 1, "leftarrow.png"  );
            endBattle();
         }
	
         else if ( mode == FIGHT ) {
            enemy_health--;
            if ( enemy_health == 0 ) { 
               alert("The enemy has been slain"); 
               game_stage.removeChild( enemy ); 
               enemies = []; 
               endBattle();
            }	
         }
      }
   }
}


function bound( sprite )
{
  // Given a sprite, make sure that it stays within the bounds of the screen
  // Accounts for the sprites anchor position to keep the entirety of the sprite in bounds
  if( sprite.position.x < sprite.anchor.x * 32 )
  {
    sprite.position.x = sprite.anchor.x * 32;
  }
  else if( sprite.position.x + sprite.anchor.x * 32 > world.worldWidth )
  {
    sprite.position.x = world.worldWidth - sprite.anchor.x * 32;
  }
  if( sprite.position.y < sprite.anchor.y * 32 )
  {
    sprite.position.y = sprite.anchor.y * 32;
  }
  else if( sprite.position.y + sprite.anchor.y * 32 > world.worldHeight )
  {
    sprite.position.y = world.worldHeight - sprite.anchor.y * 32;
  }
}

function boundObjects()
{
  // Keep players and enemies from moving off of the screen
  bound( player );
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
   sprite.vx = 0;
   sprite.vy = 0;
   sprite.moving = false;
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


function contain(sprite, container) {

  let collision = undefined;

  //Left
  if (sprite.x < container.x) {
    sprite.x = container.x;
    collision = "left";
  }

  //Top
  if (sprite.y < container.y) {
    sprite.y = container.y;
    collision = "top";
  }

  //Right
  if (sprite.x + sprite.width > container.width) {
    sprite.x = container.width - sprite.width;
    collision = "right";
  }

  //Bottom
  if (sprite.y + sprite.height > container.height) {
    sprite.y = container.height - sprite.height;
    collision = "bottom";
  }

  //Return the `collision` value
  return collision;
}


function update_camera() {
  game_stage.x = -player.x*GAME_SCALE + GAME_WIDTH/2 - player.width/2*GAME_SCALE;
  game_stage.y = -player.y*GAME_SCALE + GAME_HEIGHT/2 + player.height/2*GAME_SCALE;
  game_stage.x = -Math.max(0, Math.min(world.worldWidth*GAME_SCALE - GAME_WIDTH, -game_stage.x));
  game_stage.y = -Math.max(0, Math.min(world.worldHeight*GAME_SCALE - GAME_HEIGHT, -game_stage.y));
}