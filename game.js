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
var attack_stage = new PIXI.Container();
var steal_stage = new PIXI.Container();
var item_stage = new PIXI.Container();
var battle_text_stage = new PIXI.Container();
var threat_stage = new PIXI.Container();
var game_stage = new PIXI.Container();
game_stage.scale.x = GAME_SCALE;
game_stage.scale.y = GAME_SCALE;

var master_stage = new PIXI.Container();
var battle_screen;
var player;
var player_name;
var player_text;
var battle_x;
var battle_y;
var temp_x;
var temp_y;
var temp_direction;
var player_health = 10;
var health_meter;
var player_alive = true;
var player_charge;
var player_speed = 5;
var enemy;
var danger_level;
var current_enemy;
var enemy2;
var enemies = [];
var hand;
var mode;
var menu_text;
var magic_text;
var enemy_text;
var item_text;
var step = 10;
var count = 1;
var battle_active = false;
var dialogue_active = false;
var world;
var tu;
var playerDirection;
var npc12112_dialogue = [];
var currentDialogue = 0;
var currentNPC = 0;
var dialogueEnd = true;
var dialogueBox;
var dialogueText;

const PLAYERMOVEAMOUNT = 25;
const FIGHT = 100;
const STEAL = 200;
const ITEM = 300;
const RUN = 400;

const RIGHT = -1;
const LEFT = -2;
const UP = -3;
const DOWN = -4;

const WKEY = 87;
const AKEY = 65;
const SKEY = 83;
const DKEY = 68;
const SPACE = 32;
const SHIFT = 16;
const ENTER = 13;

const BAT = 1;
const GOBLIN = 2;
const PIXIE = 3;
const OGRE = 4;
const TREE_BOSS = 5;
const POSSESSED_SOLDIER = 6;
const SKELETON = 7;
 
function generateLevel() 
{   
	// Initialize tile utilities
	tu = new TileUtilities( PIXI );
	world = tu.makeTiledWorld("assets/map.json", "assets/tiles.png");
	game_stage.addChild(world);
   
	collidableArray = world.getObject("Collidable").data;
    teleportArray = world.getObject("Teleport").data;
    npcArray = world.getObject("NPC").data;
	
	player = createMovieClip( PLAYERMOVEAMOUNT * 2, PLAYERMOVEAMOUNT * 106, 1, 1, "PlayerRight", 1, 3 );
	playerDirection = RIGHT;
	player_name = "Hero"; //Replace with user input
   //player.anchor.x = .5;
	//player.anchor.y = .5;
	game_stage.addChild( player );
	
	enemy = new Enemy();
	enemy2 = new Enemy({id: GOBLIN,
						num_charges: 1,
						x: 700, 
						y: 600, 
						state: createMovieClip( 700, 600, 1, 1, "Goblin", 1, 2 ), 
						name: "Goblin", 
						attack: 1, 
						speed: 6});
	enemies.push( enemy );
	enemies.push( enemy2 );
   
    initialize_npc_dialogue();
	
	game_stage.addChild( enemy.state );
	game_stage.addChild( enemy2.state );
	document.addEventListener('keydown', keydownEventHandler);
	
	master_stage.addChild(game_stage);
	
	update();
}

function generateBattleMenu() 
{
   if ( player_alive ) 
   {
      battle_stage = new PIXI.Container();
	  battle_text_stage = new PIXI.Container();
      battle_active = true;
      battle_text_stage.scale.x = 1.5;
      battle_text_stage.scale.y = 1.5;
      mode = RUN;
	  
	  battle_screen = new PIXI.Sprite(PIXI.Texture.fromImage("battle_menu_forest.png"));
	  battle_stage.addChild( battle_screen );
      
      if ( menu_text != null ) 
      {
         delete menu_text;
      }

      menu_text = new PIXI.extras.BitmapText("fight\nskill\nitem\nrun", {font: "16px gamefont"});
      menu_text.position.x = 105;
      menu_text.position.y = 250;
	  battle_text_stage.addChild( menu_text );
	  
	  player_text = new PIXI.extras.BitmapText(player_name, {font: "16px gamefont"});
      player_text.position.x = 10;
      player_text.position.y = 250;
	  battle_text_stage.addChild( player_text );
	  
	  temp_x = player.position.x;
	  temp_y = player.position.y;
	  temp_direction = playerDirection;
	  
	  swapPlayer( 100, 200, 5, 5, "PlayerRight", 1, 3 );
	  
	  battle_stage.addChild( player );
	  
	  current_enemy = checkTarget();
	  enemy_text = new PIXI.extras.BitmapText(current_enemy.name, {font: "16px gamefont"});
	  enemy_text.position.x = 250;
	  enemy_text.position.y = 250;
	  battle_text_stage.addChild( enemy_text );
	  battle_stage.addChild(current_enemy.health_meter);
	  
	  switch ( current_enemy.id ) {
			case BAT:
				current_enemy.state = createMovieClip( 250, 200, 1, 1, current_enemy.name, 1, 7 );
				current_enemy.state.animationSpeed = 0.25;
				break;
			case GOBLIN:
				current_enemy.state = createMovieClip( 250, 200, 5, 5, current_enemy.name, 1, 2 );
				break;
	  }
	  
	  battle_stage.addChild( current_enemy.state );
	  battle_stage.addChild( threat_stage );

      if ( hand != null ) 
      {
         delete hand;
      }

      hand = new PIXI.Sprite(PIXI.Texture.fromImage("hand.png"));
      hand.position.x = menu_text.position.x - 20;
      hand.position.y = menu_text.position.y + menu_text.height - 10;

	  
      battle_text_stage.addChild( hand );
	  battle_stage.addChild(battle_text_stage);
      master_stage.addChild( battle_stage );
   }
}

function update() 
{
	removeDeadEnemies();
	requestAnimationFrame( update );
	update_camera();
	if ( battle_active ) { 
		generateHealthMeter();
		current_enemy.updateHealthBar();
		renderer.render( battle_stage ); }
	else { renderer.render( master_stage ); }
}

/**

*/
function removeDeadEnemies () {
	for(var i in enemies){
		var foe = enemies[i];
		if(!foe.is_alive){
			foe.state.visible = false;
			delete foe;
			game_stage.removeChild( foe.state );
			master_stage.removeChild( foe.state );
			
		}
	}
}

/**
 * checks for collision of two objects using there rectangle dimensions
 * @param {*} object a PIXi.Container Object of subclass
 * @param {*} otherObject a PIXi.Container Object of subclass
 * @returns true if there is collisoin; false if otherwise
 */
function checkRectangleCollision( object, otherObject ){

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
		if(checkRectangleCollision(player, foe.state)){
			foe.is_hit = true;
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
    {name: "up", from: "run", to: "item"}

  ],
  callbacks: {
    onfight: function() { moveHand(hand.position.x, menu_text.position.y + 
                           menu_text.height - 70); mode = FIGHT;},
    //onmagic: function() { moveHand(hand.position.x, player.position.y - 105); mode = 2; },
    onsteal: function() { moveHand(hand.position.x, menu_text.position.y + 
                           menu_text.height - 50); mode = STEAL;},
    onitem: function() { moveHand(hand.position.x, menu_text.position.y + 
                           menu_text.height - 30); mode = ITEM;},
    onrun: function() { moveHand(hand.position.x, menu_text.position.y + 
                           menu_text.height - 10); mode = RUN;}
  }
});

// ---------- Input handlers
function keydownEventHandler(event) {
   if ( player_alive ) {
      if ( !battle_active && !dialogue_active ) {
      
         // Vertical --------------------------------------------------
         if ( event.keyCode == WKEY )
         {
            // Update the player sprite to upper facing player
            player.y -= PLAYERMOVEAMOUNT;
            swapPlayer( player.x, player.y, 1, 1, "PlayerUp", 1, 3  );
            playerDirection = UP;
            
            collide = tu.hitTestTile(player, collidableArray, 0, world, "every");
            teleport = tu.hitTestTile(player, teleportArray, 0, world, "every");
            npc = tu.hitTestTile(player, npcArray, 0, world, "every");
            
            // Does player try to move to tile they shouldn't?
            if( !collide.hit || !npc.hit )
            {
               player.y += PLAYERMOVEAMOUNT;
            }
            
            // Does player transition to new area?
            if( !teleport.hit )
            {
               teleportPlayer( teleport.index );
            }
            
            // Does player encounter enemy?
            if( checkEnemyPlayerCollisions() )
            {
               if ( count == 1 ) 
               {
                  player.y += PLAYERMOVEAMOUNT;
                  generateBattleMenu( checkTarget() );
                  //alert("" + player.position.x);
                  count--;
               }
            }
         }
         
         else if ( event.keyCode == SKEY ) 
         {
            // Update the player sprite to lower facing player
            player.y += PLAYERMOVEAMOUNT;
            swapPlayer( player.x, player.y, 1, 1, "PlayerDown", 1, 3  );
            playerDirection = DOWN;
            
            collide = tu.hitTestTile(player, collidableArray, 0, world, "every");
            teleport = tu.hitTestTile(player, teleportArray, 0, world, "every");
            npc = tu.hitTestTile(player, npcArray, 0, world, "every");
            
            // Does player try to move to tile they shouldn't?
            if( !collide.hit || !npc.hit )
            {
               player.y -= PLAYERMOVEAMOUNT;
            }
            
            // Does player transition to new area?
            if( !teleport.hit )
            {
               teleportPlayer( teleport.index );
            }
            
            // Does player encounter enemy?
            if( checkEnemyPlayerCollisions() )
            {
               if ( count == 1 ) 
               {
                  player.y -= PLAYERMOVEAMOUNT;
                  generateBattleMenu();
                  //alert("" + player.position.x);
                  count--;
               }
            }
         }

         // Horizontal --------------------------------------------------
         else if ( event.keyCode == AKEY ) 
         {
            // Update the player sprite to left facing player
            player.x -= PLAYERMOVEAMOUNT;
            swapPlayer( player.x, player.y, 1, 1, "PlayerLeft", 1, 3  );
            playerDirection = LEFT;
            
            collide = tu.hitTestTile(player, collidableArray, 0, world, "every");
            teleport = tu.hitTestTile(player, teleportArray, 0, world, "every");
            npc = tu.hitTestTile(player, npcArray, 0, world, "every");
            
            // Does player try to move to tile they shouldn't?
            if( !collide.hit || !npc.hit )
            {
               player.x += PLAYERMOVEAMOUNT;
            }
            
            // Does player transition to new area?
            if( !teleport.hit )
            {
               teleportPlayer( teleport.index );
            }
            
            // Does player encounter enemy?
            if( checkEnemyPlayerCollisions() )
            {
               if ( count == 1 ) 
               {
                  player.x += PLAYERMOVEAMOUNT;
                  generateBattleMenu();
                  //alert("" + player.position.x);
                  count--;
               }
            }
         }

         else if ( event.keyCode == DKEY ) 
         {
            // Update the player sprite to right facing player
            player.x += PLAYERMOVEAMOUNT;
            swapPlayer( player.x, player.y, 1, 1, "PlayerRight", 1, 3  );
            playerDirection = RIGHT; 
            
            collide = tu.hitTestTile(player, collidableArray, 0, world, "every");
            teleport = tu.hitTestTile(player, teleportArray, 0, world, "every");
            npc = tu.hitTestTile(player, npcArray, 0, world, "every");
            
            // Does player try to move to tile they shouldn't?
            if( !collide.hit || !npc.hit )
            {
               player.x -= PLAYERMOVEAMOUNT;
            }
            
            // Does player transition to new area?
            if( !teleport.hit )
            {
               teleportPlayer( teleport.index );
            }
            
            // Does player encounter enemy?
            if( checkEnemyPlayerCollisions() )
            {
               if ( count == 1 ) 
               {
                  player.x -= PLAYERMOVEAMOUNT;
                  generateBattleMenu();
                  //alert("" + player.position.x);
                  count--;
               }
            }
         }
         
         else if ( event.keyCode == ENTER ) 
         {
            if( checkNPCInteraction() )
            {
               dialogueBox = createRoundedRect( 0, 400, 500, 100, 10, "white" );
               dialogueText = new PIXI.Text(npc12112_dialogue[currentDialogue], 
                  {fontFamily : 'Calibri', fontSize: 25, fill : 0xFFFFFF, align : 'center'});
               dialogueText.y = 5;
               dialogueText.y = 400;
               currentDialogue++;
   
               master_stage.addChild( dialogueBox );
               master_stage.addChild( dialogueText );
   
               dialogue_active = true;
               dialogueEnd = false;
            }
         }
      }


      else if ( battle_active )
      {
         if ( event.keyCode == WKEY ) { // Up key 38
            menu.up();
         }

         if ( event.keyCode == SKEY ) { // Down key 40
            menu.down();
         }

         if ( event.keyCode == ENTER ) { // Enter key
            
            if ( mode == FIGHT ) { fight( checkTarget() ); }

            else  if ( mode == STEAL ) { steal( checkTarget() ); }

            else  if ( mode == ITEM ) { useItem( checkTarget() ); }
         
            else if ( mode == RUN ) { run( checkTarget() ); }
         
         }
      }
      
      else if ( dialogue_active )
      {
         if ( event.keyCode == ENTER )
         {
            if( !dialogueEnd )
            {
               iterateDialogue();
            }
            
            else
            {
               dialogue_active = false;
               master_stage.removeChild( dialogueBox );
               master_stage.removeChild( dialogueText );
               currentDialogue = 0;
            }
         }
      }
   }
}


function checkNPCInteraction()
{
   // NPC at 12, 112
   return checkValidInteraction( 12, 112 );
}


function checkValidInteraction( npcX, npcY )
{

   if( (playerDirection == UP && 
       npcX * 25 == player.x && npcY * 25 + 25 == player.y) ||  
       
       (playerDirection == DOWN && 
       npcX * 25 == player.x && npcY * 25 - 25 == player.y) ||
       
       (playerDirection == LEFT && 
       npcX * 25 + 25 == player.x && npcY * 25 == player.y) ||
       
       (playerDirection == RIGHT && 
       npcX * 25 - 25 == player.x && npcY * 25 == player.y)  )
   {
      currentNPC = 12112;
      return true;
   }
}


function iterateDialogue()
{
   switch( currentNPC )
   {
      case 12112:
         dialogueText.setText(npc12112_dialogue[currentDialogue]);
         currentDialogue++;
         
         if( currentDialogue == npc12112_dialogue.length )
         {
            dialogueEnd = true;
         }
         
         break;
   }
}


function initialize_npc_dialogue()
{  
   npc12112_dialogue.push( "hey" );
   npc12112_dialogue.push( "hello" );
   npc12112_dialogue.push( "test" );
   npc12112_dialogue.push( "press" );
   npc12112_dialogue.push( "enter" );
}


// Transition player to new area based on teleporter touched
function teleportPlayer( teleportIndex )
{
   //alert(teleportIndex);
   switch( teleportIndex )
   {
      case 10644:
         player.x = PLAYERMOVEAMOUNT * 4;
         player.y = PLAYERMOVEAMOUNT * 3;
         swapPlayer( player.x, player.y, 1, 1, "PlayerDown", 1, 3  );
         playerDirection = DOWN;
         break;
         
      case 204:
         player.x = PLAYERMOVEAMOUNT * 44;
         player.y = PLAYERMOVEAMOUNT * 107;
         swapPlayer( player.x, player.y, 1, 1, "PlayerDown", 1, 3  );
         playerDirection = DOWN;
         break;
      
      case 4544:
         player.x = PLAYERMOVEAMOUNT * 55;
         player.y = PLAYERMOVEAMOUNT * 44;
         swapPlayer( player.x, player.y, 1, 1, "PlayerUp", 1, 3  );
         playerDirection = UP;
         break;
      
      case 4555:
         player.x = PLAYERMOVEAMOUNT * 44;
         player.y = PLAYERMOVEAMOUNT * 44;
         swapPlayer( player.x, player.y, 1, 1, "PlayerUp", 1, 3  );
         playerDirection = UP;
         break;
      
      case 495:
         player.x = PLAYERMOVEAMOUNT * 55;
         player.y = PLAYERMOVEAMOUNT * 107;
         swapPlayer( player.x, player.y, 1, 1, "PlayerDown", 1, 3  );
         playerDirection = DOWN;
         break;
      
      case 10655:
         player.x = PLAYERMOVEAMOUNT * 95;
         player.y = PLAYERMOVEAMOUNT * 5;
         swapPlayer( player.x, player.y, 1, 1, "PlayerDown", 1, 3  );
         playerDirection = DOWN;
         break;
      
      case 10698:
         player.x = PLAYERMOVEAMOUNT * 1;
         player.y = PLAYERMOVEAMOUNT * 94;
         swapPlayer( player.x, player.y, 1, 1, "PlayerUp", 1, 3  );
         playerDirection = UP;
         break;
         
      case 9501:
         player.x = PLAYERMOVEAMOUNT * 98;
         player.y = PLAYERMOVEAMOUNT * 107;
         swapPlayer( player.x, player.y, 1, 1, "PlayerDown", 1, 3  );
         playerDirection = DOWN;
         break;
      
      case 5644:
         player.x = PLAYERMOVEAMOUNT * 55;
         player.y = PLAYERMOVEAMOUNT * 57;
         swapPlayer( player.x, player.y, 1, 1, "PlayerDown", 1, 3  );
         playerDirection = DOWN;
         break;
      
      case 5655:
         player.x = PLAYERMOVEAMOUNT * 44;
         player.y = PLAYERMOVEAMOUNT * 57;
         swapPlayer( player.x, player.y, 1, 1, "PlayerDown", 1, 3  );
         playerDirection = DOWN;
         break;
   }
}


function checkTarget(){

	for(var i in enemies){
		var foe = enemies[i];
		if(foe.is_hit) {
			return foe;
		}
	}
}

function fight( foe ) { //Pass in enemy
  if( player_speed > foe.speed ) {
	playerAttack( foe );
	
	if ( player_alive && foe.is_alive ) {
		enemyAttack( foe ); //Pass in enemy
	}
  }

  else {
	if ( player_alive && foe.is_alive ) {
		enemyAttack( foe ); //Pass in enemy
	}
	
	playerAttack( foe );
  }
}

/**
	Handles player attack in combat
*/
function playerAttack( foe ) {
	if (player_alive) {
		var player_attack = getRand(2) + 2;
		//alert("Your attack hit the enemy for " + player_attack + " damage.");
		swapPlayer( 100, 200, 5, 5, "PlayerAttack", 1, 3  );
		player.loop = false;
		player.onComplete = swapPlayer( 100, 200, 5, 5, "PlayerRight", 1, 3  );
		var temp_state = foe.state;
		foe.state = createMovieClip( foe.state.position.x, foe.state.position.y, foe.state.scale.x, foe.state.scale.y, foe.name + "damage", 1, 3 );
		foe.loop = false;
		
		var animationFinished = function () {
			//alert("Animation just reached it's end.");
			foe.state = temp_state;
			foe.gotoAndStop(0);
		};
		
		foe.onComplete = animationFinished;

		foe.health -= player_attack;

		if ( foe.health <= 0 ) { 
			
			//alert("The enemy has been slain.");
			if (foe.num_charges <= 1) {
				foe.is_alive = false;
				var index = enemies.indexOf( foe );
				if (index > -1) {
					enemies.splice(index, 1);
				}
				endBattle(foe);
			}
			
			foe.loseCharge();
			
		}
	}
}

/**
	Helper function that handles enemy attack in combat
*/
function enemyAttack( foe ) {
	if ( foe.is_alive ) {
		var enemy_chance = getRand(10);
		
		if ( enemy_chance < 8 ) {
			//alert( "The enemy hits you for " + foe.attack + " damage." );
			player_health -= foe.attack;
		}

		else {
			//alert("The enemy misses their attack.");
		}

		if ( player_health <= 0 ) {
			//alert("You have fallen in battle. ;-;");
			game_stage.removeChild( player ); 
			game_stage.removeChild( health_meter );
			player.stop();
			player_alive = false;
			endBattle( foe );
		}
	}
}

/**
	Helper function that handles steal action in combat
*/
function steal( foe ) {
	var steal_chance = getRand(10);
	if ( player_speed > foe.speed ) {
		//if ( steal_chance < 6 ) { alert("Couldn't steal."); } //50% chance

		//else { alert("You have stolen <item> from enemy."); }

		enemyAttack( foe );
	}

	else {
		enemyAttack( foe );
	
		//if ( steal_chance < 6 ) { alert("Couldn't steal."); } //50% chance

		//else { alert("You have stolen <item> from enemy."); }	
	}
}

/**
	Helper function that handles using an item action in combat
*/
function useItem( foe ) {
	//alert("You drink a health potion.");
	player_health += getRand(3) + 2; //30% - 50%
	enemyAttack( foe );
}

/**
	Helper function that handles run action in combat
*/
function run( foe ) {
	var run_chance = getRand(10);
	
	if ( run_chance == 10 ) { //10% chance to fail
		//alert("Couldn't get away.");
		enemyAttack( foe ); // run fail
	}

	else {
        //alert("You have escaped.");
		endBattle( foe ); // run success
	}
}

/**
	Helper function that displays the health meter
*/
function generateHealthMeter () {
	if ( health_meter != null ) {
		battle_stage.removeChild( health_meter );
		delete health_meter;
	}
	
	if ( player_health < 0 ) { player_health = 0; }

	if ( player_health > 10 ) { player_health = 10; }

	if ( player_alive ) {
		health_meter = createSprite( player.position.x - 100, player.position.y + 200, .5, .5, ( "ex_meter" + player_health + ".png" ) );
		battle_stage.addChild( health_meter );
	}
}

/**
	Helper function that ends the battle
*/
function endBattle ( foe ) {
	battle_active = false;
	foe.is_hit = false;
	moveHand(hand.position.x, menu_text.position.y + 
                           menu_text.height - 10);
	mode = RUN;
	count = 1;
	clearBattleScreen();
}

function clearBattleScreen() {
	battle_text_stage.removeChild( hand );
	battle_text_stage.removeChild( menu_text );
	battle_stage.removeChild( battle_screen );
	battle_stage.removeChild( player );
	
	switch ( temp_direction ) {
			case UP:
				swapPlayer( temp_x, temp_y, 1, 1, "PlayerUp", 1, 3  );
				break;
			case DOWN:
				swapPlayer( temp_x, temp_y, 1, 1, "PlayerDown", 1, 3  );
				break;
			case LEFT:
				swapPlayer( temp_x, temp_y, 1, 1, "PlayerLeft", 1, 3  );
				break;
			case RIGHT:
				swapPlayer( temp_x, temp_y, 1, 1, "PlayerRight", 1, 3  );
				break;
	}
	
	battle_stage.removeChild( current_enemy.state );
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
	Helper function that creates a rounded rectangle
*/
function createRoundedRect( x, y, width, height, radius, color ) {
	var graphics = new PIXI.Graphics();
	graphics.beginFill(color);
	graphics.drawRoundedRect( x, y, width, height, radius );
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
function swapPlayer ( x, y, scale_x, scale_y, image, low, high ) {
	game_stage.removeChild( player );
	player = createMovieClip( x, y, scale_x, scale_y, image, low, high );
	game_stage.addChild( player );
}


/**
	Helper function that returns a random number from 1 to max
*/
function getRand( max ) {
	return Math.floor(( Math.random() * max ) + 1 );
}

/**
	Updates the camera
*/
function update_camera() {
  game_stage.x = -player.x*GAME_SCALE + GAME_WIDTH/2 - player.width/2*GAME_SCALE;
  game_stage.y = -player.y*GAME_SCALE + GAME_HEIGHT/2 + player.height/2*GAME_SCALE;
  game_stage.x = -Math.max(0, Math.min(world.worldWidth*GAME_SCALE - GAME_WIDTH, -game_stage.x));
  game_stage.y = -Math.max(0, Math.min(world.worldHeight*GAME_SCALE - GAME_HEIGHT, -game_stage.y)); 
}

/**
---------------------------------------------------
Enemy Class
---------------------------------------------------
Example:
enemy = new Enemy({id: 1(monster id), x: 700, y: 400, state: enemy_sprite, name: "Common Bat", attack: 3, speed: 2}); 	//instantiation
enemy.updateHealthBar(); 																			//calling a method     
*/
function Enemy(obj) {
    'use strict';
    if (typeof obj === "undefined") { // DEFAULT
		this.id = 1;
		this.num_charges = 3;
		this.x = 750;
		this.y = 500;
        this.state = createMovieClip( this.x, this.y, 1, 1, "Overworld_Bat", 1, 2 );
        this.name = "Bat";
		this.health = 10;
		this.health_meter = createSprite( 350, 400, .5, .5, ( "ex_meter10.png" ) );
		this.attack = 1;
		this.speed = 2;
		this.is_alive = true;
		this.is_hit = false;
    } 
	
	else {
		this.id = obj.id;
		this.num_charges = obj.num_charges;
		this.x = obj.x;
		this.y = obj.y;
        this.state = obj.state;
        this.name = obj.name;
		this.health = 10;
		this.health_meter = createSprite( 350, 400, .5, .5, ( "ex_meter10.png" ) );
		
		this.attack = obj.attack;
		this.speed = obj.speed;
		this.is_alive = true;
		this.is_hit = false;
    }

}

/**
	Updates the enemy health meter
*/
Enemy.prototype.updateHealthBar = function () {
    'use strict';
	if ( this.num_charges > 0 ) {
		if ( this.health <= 0 ) { this.health += 10; }
	}
	
	threat_stage.removeChildren();
	
	for ( var i = this.num_charges; i > 0; i-- ) {
				danger_level = createMovieClip( 470 - (i*25), 410, .8, .8, "laughing_skull", 1, 5 );
				
				threat_stage.addChild( danger_level );
	}
	
    if ( this.health_meter != null ) {
		battle_stage.removeChild( this.health_meter );
	}

	if ( this.health < 0 ) { this.health = 0; }

	if ( this.health > 10 ) { this.health = 10; }
	
	if ( this.is_alive ) {
		this.health_meter = createSprite( 350, 400, .5, .5, ( "ex_meter" + this.health + ".png" ) );
		battle_stage.addChild( this.health_meter );
	}
};

Enemy.prototype.addCharge = function () {
	this.num_charges++;
};

Enemy.prototype.loseCharge = function () {
	this.num_charges--;
};


