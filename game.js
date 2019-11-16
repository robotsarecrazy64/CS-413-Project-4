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
var player_health = 10;
var health_meter;
var player_alive = true;
var player_speed = 5;
var enemy;
var enemy_health;
var enemy_meter;
var enemy_speed = 2;
var enemy_alive = true;
var enemies = [];
var hand;
var mode;
var menu_text;
var magic_text;
var item_text;
var step = 10;
var count = 1;
var battle_active = false;
var item_looted = false;
var world;
var tu;

//Constants to inprove readability
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
	
	// Initialize tile utilities to create world map
	tu = new TileUtilities( PIXI );
	world = tu.makeTiledWorld("assets/map.json", "assets/tiles.png");
	game_stage.addChild(world);
	
	player = createSprite( 50, 200, 1, 1, "rightarrow.png" );
	//player.anchor.x = .5;
	//player.anchor.y = .5;
	game_stage.addChild( player );
	
	enemy = createMovieClip( 350, 200, 1, 1, "bat", 1, 2 );
        enemy_health = 10;
	subenemy = createMovieClip( 325, 200, 1, 1, "bat", 1, 2 );
	enemies.push(enemy);
        enemies.push(subenemy);
	game_stage.addChild( enemy );
	document.addEventListener('keydown', keydownEventHandler);
	
	master_stage.addChild(game_stage);
	
	update();
}

function generateBattleMenu() {
	if ( player_alive ) {
		battle_stage = new PIXI.Container();
		battle_active = true;
		battle_stage.scale.x = 1.5;
		battle_stage.scale.y = 1.5;
		
		if ( menu_text != null ) { delete menu_text;}
  
		menu_text = new PIXI.extras.BitmapText("fight\nsteal\nitem\nrun", {font: "16px gamefont"});
		text2 = new PIXI.extras.BitmapText("", {font: "16px gamefont"});
		menu_text.position.x = player.position.x - 150;
		menu_text.position.y = player.position.y - 100;
		battle_stage.addChild(menu_text);
  
		if ( hand != null ) { delete hand; }

		hand = new PIXI.Sprite(PIXI.Texture.fromImage("hand.png"));
		hand.position.x = player.position.x - 172;
		hand.position.y = player.position.y - 35;
 
		battle_stage.addChild(hand);
		master_stage.addChild(battle_stage);
	}
}

function update() {
	if(checkEnemyPlayerCollisions() ){
		if ( count == 1 ) {
			generateBattleMenu();
			count--;
		}
	}	
	
	generateHealthMeter();
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

	for(var element in enemies){
		var foe = enemies[element];
		
		if(checkRectangleCollision(player, foe)){
			return true;
		}
	}

	return false;
}

/**
	Updates the hand location in the battle menu
*/
function moveHand(x, y) {
	if (!hand) return;
	
	createjs.Tween.removeTweens(hand.position);
	createjs.Tween.get(hand.position).to({ x: x, y: y}, 100, createjs.Ease.bounceOut);
}

/**
	Battle Menu
*/
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
	}});

// ---------- Input handlers
function keydownEventHandler(event)
{
	if ( player_alive ) {
		if ( !battle_active ) {
		// Vertical --------------------------------------------------
			if ( event.keyCode == WKEY ) { // W key
			
				// Update the player sprite to upper facing player
				player.y -= PLAYERMOVEAMOUNT;
				swapPlayer( player.x, player.y, 1, 1, "uparrow.png"  );
			}
      
			else if ( event.keyCode == SKEY ) { // S key
				// Update the player sprite to lower facing player
				player.y += PLAYERMOVEAMOUNT;
				swapPlayer( player.x, player.y, 1, 1, "downarrow.png"  );
			}

	    // Horizontal --------------------------------------------------
			else if ( event.keyCode == AKEY ) { // A key
				// Update the player sprite to left facing player
				player.x -= PLAYERMOVEAMOUNT;
				swapPlayer( player.x, player.y, 1, 1, "leftarrow.png"  );
			}

			else if ( event.keyCode == DKEY ) { // D key
				// Update the player sprite to right facing player
				player.x += PLAYERMOVEAMOUNT;
				swapPlayer( player.x, player.y, 1, 1, "rightarrow.png"  );
			}
   }


   else {
		if (event.keyCode == WKEY) { // Up key 38
			menu.up();
		}

		if (event.keyCode == SKEY) { // Down key 40
			menu.down();
		}

		if ( event.keyCode == ENTER ) { // Enter key
			if ( mode == FIGHT ) { fight(); }

			else if ( mode == STEAL ) { steal(); }

			else if ( mode == ITEM ) { useItem(); }
	
			else if ( mode == RUN ) { run(); }
		}
    }
  }
}

/**
	Fight action in battle
*/
function fight() { //Pass in enemy
	if( player_speed > enemy_speed ) {
		playerAttack();
	
		if ( player_alive && enemy_alive ) { enemyAttack(); }//Pass in enemy
	}

	else {
		if ( player_alive && enemy_alive ) { enemyAttack(); }//Pass in enemy
	
		playerAttack();
  }
}

/**
	Player attack in battle
*/
function playerAttack() {
	var player_attack = getRand(2) + 2;
	alert("Your attack hit the enemy for " + player_attack + " damage.");
	enemy_health -= player_attack;

        if ( enemy_health <= 0 ) { 
               alert("The enemy has been slain."); 
               game_stage.removeChild( enemy );
	       game_stage.removeChild( enemy_meter );
               enemy_alive = false;
               enemies = []; 
               endBattle();
        }
}

/**
	Enemy turn in battle
*/
function enemyAttack() {
	var enemy_chance = getRand(10);
	
	if ( enemy_chance < 8 ) {
		var enemy_attack = getRand(3);
		alert("The enemy hits you for " + enemy_attack + " damage.");
		player_health -= enemy_attack;
	}

	else {
		alert("The enemy misses their attack.");
	}

	if ( player_health <= 0 ) {
		alert("You have fallen in battle. ;-;");
		game_stage.removeChild( player ); 
		game_stage.removeChild( health_meter );
		player_alive = false;
		endBattle();
	}
}

/**
	Steal item from enemy during battle
*/
function steal() {
	var steal_chance = getRand(10);
	
	if ( player_speed > enemy_speed ) {
		if ( (steal_chance > 6 ) && !item_looted ) { alert("You have stolen <item> from enemy."); item_looted = true; } //50% chance

		else { alert("Couldn't steal."); }

		enemyAttack();
	}

	else {
		enemyAttack();
	
		if ( (steal_chance > 6 ) && !item_looted ) { alert("You have stolen <item> from enemy."); item_looted = true; } //50% chance

		else { alert("Couldn't steal."); }
	}
}

/**
	Use item in battle
*/
function useItem() {
	alert("You drink a health potion.");
	player_health += getRand(3) + 2; //30% - 50%
	enemyAttack();
}

/**
	Run battle option
*/
function run() {
	var run_chance = getRand(10);
	
	if ( run_chance == 10 ) { //10% chance to fail
		alert("Couldn't get away.");
		enemyAttack(); // run fail
	}

	else {
        	swapPlayer( player.position.x - PLAYERMOVEAMOUNT, 
						player.position.y, 1, 1, "leftarrow.png"  ); //Pick a direction

		alert("You have escaped.");
		endBattle(); // run success
	}
}

/**
	Helper function that displays the health meter for the player and enemies
*/
function generateHealthMeter () {
	if ( health_meter != null ) {
		game_stage.removeChild( health_meter );
		delete health_meter;
	}
	
	if ( player_health < 0 ) { player_health = 0; } //Prevents health from going too low

	if ( player_health > 10 ) { player_health = 10; } //Prevents health from going too high

	if ( player_alive ) {
		health_meter = new createSprite( player.position.x, player.position.y + 25, .2, .1, ( "ex_meter" + player_health + ".png" ) );
		game_stage.addChild( health_meter );
	}

	
	// Repeat Same Pattern for EACH enemy (loop through battle array if fighting multiple enemies at once)
	if ( enemy_meter != null ) {
		game_stage.removeChild( enemy_meter );
		delete enemy_meter;
	}

	if ( enemy_health < 0 ) { enemy_health = 0; } //Prevents health from going too low

	if ( enemy_health > 10 ) { enemy_health = 10; } //Prevents health from going too high
	
	if ( enemy_alive ) {
		enemy_meter = new createSprite( enemy.position.x, enemy.position.y + 25, .2, .1, ( "ex_meter" + enemy_health + ".png" ) );
		game_stage.addChild( enemy_meter );
	}
}

/**
	Given a sprite, make sure that it stays within the bounds of the screen
	Accounts for the sprites anchor position to keep the entirety of the sprite in bounds
*/
function bound( sprite )
{
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

/**
	Keep players and enemies from moving off of the screen
*/
function boundObjects()
{
	bound( player );
}

/**
	Ends Combat by removing combat menu
*/
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
	Helper function that creates a shape for the different screens
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