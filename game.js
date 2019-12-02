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
var player_threat_stage = new PIXI.Container();
var game_stage = new PIXI.Container();
var startScreen = new PIXI.Container();
var instructScreen = new PIXI.Container();
var creditScreen = new PIXI.Container();
var winScreen = new PIXI.Container();
var loseScreen = new PIXI.Container();
var back = new PIXI.Container();
var statsScreen = new PIXI.Container();
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
var player_attack = 99;
var health_meter;
var player_alive = true;
var player_boost = false;
var player_armor = 1;
var player_max_armor = 1;
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
var npc4114_dialogue = [];
var npc17113_dialogue = [];
var npc22117_dialogue = [];
var npc20110_dialogue = [];
var npc27110_dialogue = [];
var npc27123_dialogue = [];
var npc33121_dialogue = [];
var npc34107_dialogue = [];
var npc43107_dialogue = [];
var npc4123_dialogue = [];
var npc40121_dialogue = [];
var npc40121X_dialogue = [];
var npc12112X_dialogue = [];
var npc40121_talked_to = false;
var npc12112_talked_to = false;
var currentDialogue = 0;
var currentLine;
var currentNPC = 0;
var dialogueEnd = true;
var dialogueBox;
var dialogueText;
var playerAttackText;
var playerHealthText;
var playerArmorText;
var playerArmorArray = [];
var currentHealthSprite;

const PLAYERMOVEAMOUNT = 25;
const PLAYER_START_X = PLAYERMOVEAMOUNT * 2;
const PLAYER_START_Y = PLAYERMOVEAMOUNT * 106;
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
const EVIL_TREE = 5;
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
	
	player = createMovieClip( PLAYER_START_X, PLAYER_START_Y, 1, 1, "PlayerRight", 1, 3 );
	playerDirection = RIGHT;
	player_name = "Hero"; //Replace with user input
   //player.anchor.x = .5;
	//player.anchor.y = .5;
	game_stage.addChild( player );
	
	enemy = new Enemy();
	/*
	enemy2 = new Enemy({id: GOBLIN,
						num_charges: 1,
						x: PLAYERMOVEAMOUNT * , 
						y: PLAYERMOVEAMOUNT * ,
						state: createMovieClip( PLAYERMOVEAMOUNT * 16, PLAYERMOVEAMOUNT * 40,
                                          1, 1, "Goblin", 1, 2 ),  
						name: "Goblin", 
						attack: 1, 
						speed: 6});*/
	/*enemy2 = new Enemy({id: OGRE,
						num_charges: 3,
						x: PLAYERMOVEAMOUNT * , 
						y: PLAYERMOVEAMOUNT * , 
                  state: createMovieClip( PLAYERMOVEAMOUNT * 16, PLAYERMOVEAMOUNT * 40,
                                          1, 1, "Overworld_Ogre", 1, 3 ), 
						name: "Ogre", 
						attack: 3, 
						speed: 2});*/
	/*enemy2 = new Enemy({id: PIXIE,
						num_charges: 2,
						x: PLAYERMOVEAMOUNT * , 
						y: PLAYERMOVEAMOUNT * ,
                  state: createMovieClip( PLAYERMOVEAMOUNT * 16, PLAYERMOVEAMOUNT * 40,
                                          1, 1, "Overworld_Pixie", 1, 3 ), 
						name: "Pixie", 
						attack: 2, 
						speed: 8});*/
	/*enemy2 = new Enemy({id: POSSESSED_SOLDIER,
						num_charges: 4,
						x: PLAYERMOVEAMOUNT * , 
						y: PLAYERMOVEAMOUNT * , 
                  state: createMovieClip( PLAYERMOVEAMOUNT * 16, PLAYERMOVEAMOUNT * 40,
                                          .6, .6, "Overworld_Possessed_Soldier", 1, 3 ), 
						name: "Soldier", 
						attack: 2, 
						speed: 7});*/
	/*enemy2 = new Enemy({id: SKELETON,
						num_charges: 6,
						x: PLAYERMOVEAMOUNT * , 
						y: PLAYERMOVEAMOUNT * ,
                  state: createMovieClip( PLAYERMOVEAMOUNT * 16, PLAYERMOVEAMOUNT * 40,
                                          .8, .8, "Overworld_Skeleton", 1, 3 ),
						name: "Skeleton", 
						attack: 4, 
						speed: 5});*/
                  
	enemy2 = new Enemy({id: EVIL_TREE,
						num_charges: 5,
						x: PLAYERMOVEAMOUNT * 36, 
						y: PLAYERMOVEAMOUNT * 11, 
						state: createMovieClip( PLAYERMOVEAMOUNT * 43, PLAYERMOVEAMOUNT * 43, 
                                          1, 1, "Overworld_Evil Tree", 1, 3 ), 
						name: "Evil Tree", 
						attack: 4, 
						speed: 8});
                  
   enemy3 = new Enemy({id: GOBLIN,
						num_charges: 1,
						x: PLAYERMOVEAMOUNT * 18, 
						y: PLAYERMOVEAMOUNT * 4,
						state: createMovieClip( PLAYERMOVEAMOUNT * 18, PLAYERMOVEAMOUNT * 4,
                                          1, 1, "Goblin", 1, 2 ), 
						name: "Goblin", 
						attack: 1, 
						speed: 6});
                  
   enemy4 = new Enemy({id: GOBLIN,
						num_charges: 1,
						x: PLAYERMOVEAMOUNT * 16, 
						y: PLAYERMOVEAMOUNT * 40,
						state: createMovieClip( PLAYERMOVEAMOUNT * 16, PLAYERMOVEAMOUNT * 40,
                                          1, 1, "Goblin", 1, 2 ), 
						name: "Goblin", 
						attack: 1, 
						speed: 6});
   
   enemy5 = new Enemy({id: GOBLIN,
						num_charges: 1,
						x: PLAYERMOVEAMOUNT * 8, 
						y: PLAYERMOVEAMOUNT * 27,
						state: createMovieClip( PLAYERMOVEAMOUNT * 8, PLAYERMOVEAMOUNT * 27,
                                          1, 1, "Goblin", 1, 2 ),  
						name: "Goblin", 
						attack: 1, 
						speed: 6});
   
   enemy6 = new Enemy({id: GOBLIN,
						num_charges: 1,
						x: PLAYERMOVEAMOUNT * 16, 
						y: PLAYERMOVEAMOUNT * 20,
						state: createMovieClip( PLAYERMOVEAMOUNT * 16, PLAYERMOVEAMOUNT * 20,
                                          1, 1, "Goblin", 1, 2 ), 
						name: "Goblin", 
						attack: 1, 
						speed: 6});
                  
   enemy7 = new Enemy({id: PIXIE,
						num_charges: 2,
						x: PLAYERMOVEAMOUNT * 28, 
						y: PLAYERMOVEAMOUNT * 39,
                  state: createMovieClip( PLAYERMOVEAMOUNT * 28, PLAYERMOVEAMOUNT * 39,
                                          1, 1, "Overworld_Pixie", 1, 3 ), 
						name: "Pixie", 
						attack: 2, 
						speed: 8});
   
   enemy8 = new Enemy({id: PIXIE,
						num_charges: 2,
						x: PLAYERMOVEAMOUNT * 43, 
						y: PLAYERMOVEAMOUNT * 29,
                  state: createMovieClip( PLAYERMOVEAMOUNT * 43, PLAYERMOVEAMOUNT * 29,
                                          1, 1, "Overworld_Pixie", 1, 3 ), 
						name: "Pixie", 
						attack: 2, 
						speed: 8});
   
   enemy9 = new Enemy({id: PIXIE,
						num_charges: 2,
						x: PLAYERMOVEAMOUNT * 39, 
						y: PLAYERMOVEAMOUNT * 4,
                  state: createMovieClip( PLAYERMOVEAMOUNT * 39, PLAYERMOVEAMOUNT * 4,
                                          1, 1, "Overworld_Pixie", 1, 3 ), 
						name: "Pixie", 
						attack: 2, 
						speed: 8});
   
   enemy9 = new Enemy({id: PIXIE,
						num_charges: 2,
						x: PLAYERMOVEAMOUNT * 30, 
						y: PLAYERMOVEAMOUNT * 23,
                  state: createMovieClip( PLAYERMOVEAMOUNT * 30, PLAYERMOVEAMOUNT * 23,
                                          1, 1, "Overworld_Pixie", 1, 3 ), 
						name: "Pixie", 
						attack: 2, 
						speed: 8});
   
		
	enemies.push( enemy );
	enemies.push( enemy2 );
   enemies.push( enemy3 );
	enemies.push( enemy4 );
   enemies.push( enemy5 );
	enemies.push( enemy6 );
   enemies.push( enemy7 );
   enemies.push( enemy8 );
	enemies.push( enemy9 );
   
   initialize_npc_dialogue();
	
	game_stage.addChild( enemy.state );
	game_stage.addChild( enemy2.state );
   game_stage.addChild( enemy3.state );
	game_stage.addChild( enemy4.state );
   game_stage.addChild( enemy5.state );
	game_stage.addChild( enemy6.state );
   game_stage.addChild( enemy7.state );
   game_stage.addChild( enemy8.state );
	game_stage.addChild( enemy9.state );
   
	document.addEventListener('keydown', keydownEventHandler);
	
	master_stage.addChild(game_stage);
   buildScreens();
   
   game_stage.visible = false;
	
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
	  current_enemy.visible = true;
	  enemy_text = new PIXI.extras.BitmapText(current_enemy.name, {font: "16px gamefont"});
	  enemy_text.position.x = 250;
	  enemy_text.position.y = 250;
	  battle_text_stage.addChild( enemy_text );
	  battle_stage.addChild(current_enemy.health_meter);
	  
	  switch ( current_enemy.id ) {
			case GOBLIN:
				current_enemy.state = createMovieClip( 250, 200, 5, 5, current_enemy.name, 1, 2 );
				break;
			case OGRE:
				current_enemy.state = createMovieClip( 215, 125, 2, 2, current_enemy.name, 1, 3 );
				break;
			case PIXIE:
				current_enemy.state = createMovieClip( 250, 200, 1, 1, current_enemy.name, 1, 5 );
				break;
			case POSSESSED_SOLDIER:
				current_enemy.state = createMovieClip( 240, 175, 2, 2, current_enemy.name, 1, 3 );
				break;
			case SKELETON:
				enemy_text.position.x -= 10;
				current_enemy.state = createMovieClip( 250, 135, 1.25, 1.25, current_enemy.name, 1, 3 );
				break;
			case BAT:
				current_enemy.state = createMovieClip( 225, 150, 2, 2, current_enemy.name, 1, 7 );
				current_enemy.state.animationSpeed = 0.25;
				break;
			case EVIL_TREE:
				enemy_text.position.x -= 10;
				current_enemy.state = createMovieClip( 205, 75, 1, 1, current_enemy.name, 1, 3 );
				break;
	  }
	  
	  battle_stage.addChild( current_enemy.state );
	  battle_stage.addChild( threat_stage );
	  battle_stage.addChild( player_threat_stage );

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
	requestAnimationFrame( update );
	update_camera();
	if ( battle_active ) { 
		generateHealthMeter();
		current_enemy.updateHealthBar();
		renderer.render( battle_stage ); }
	else { 
	removeDeadEnemies();
	renderer.render( master_stage ); }
}

/**

*/
function removeDeadEnemies () {
	for(var i in enemies){
		var foe = enemies[i];
		if(foe === current_enemy){
			foe.state.visible = false;
			delete foe;
			game_stage.removeChild( foe.state );
			//master_stage.removeChild( foe.state );
			
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
			foe.state.visible = false;
			game_stage.removeChild(foe);
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
   if( !game_stage.visible )
   {
      player.x = PLAYER_START_X;
      player.y = PLAYER_START_Y;
   }
   
   else if ( player_alive ) 
   {
      if ( !battle_active && !dialogue_active ) 
      {
      
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
               dialogueText = new PIXI.Text(currentArray[currentDialogue], 
                  {fontFamily : 'Calibri', fontSize: 25, fill : 0xFFFFFF, align : 'left'});
               dialogueText.x = 5;
               dialogueText.y = 405;
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
         }
      }
   }
}


function checkNPCInteraction()
{
   // NPC at 12, 112
   return checkValidInteraction( 12, 112 ) ||
          checkValidInteraction( 4, 114 ) ||
          checkValidInteraction( 17, 113 ) ||
          checkValidInteraction( 22, 117 ) ||
          checkValidInteraction( 20, 110 ) ||
          checkValidInteraction( 27, 110 ) ||
          checkValidInteraction( 27, 123 ) ||
          checkValidInteraction( 33, 121 ) ||
          checkValidInteraction( 34, 107 ) ||
          checkValidInteraction( 43, 107 ) ||
          checkValidInteraction( 4, 123 ) ||
          checkValidInteraction( 40, 121 );
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
      currentNPC = parseInt("" + npcX + npcY);
      getCurrentLine();
      return true;
   }
}


function getCurrentLine()
{
   switch( currentNPC )
   {
      case 12112:
         if( !npc12112_talked_to )
         {
            currentArray = npc12112_dialogue;
            player_attack++;
            npc12112_talked_to = true;
         }
         
         else
         {
            currentArray = npc12112X_dialogue;
         }
         
         break;
      case 4114:
         currentArray = npc4114_dialogue;
         break;
      case 17113:
         currentArray = npc17113_dialogue;
         break;
      case 22117:
         currentArray = npc22117_dialogue;
         break;
      case 20110:
         currentArray = npc20110_dialogue;
         break;
      case 27110:
         currentArray = npc27110_dialogue;
         break;
      case 27123:
         currentArray = npc27123_dialogue;
         break;
      case 33121:
         currentArray = npc33121_dialogue;
         player_armor = player_max_armor;
         player_health = 10;
         break;
      case 34107:
         currentArray = npc34107_dialogue;
         break;
      case 43107:
         currentArray = npc43107_dialogue;
         break;
      case 4123:
         currentArray = npc4123_dialogue;
         break;
      case 40121:
         if( !npc40121_talked_to )
         {
            currentArray = npc40121_dialogue;
            player_armor++;
            player_max_armor++;
            npc40121_talked_to = true;
         }
         
         else
         {
            currentArray = npc40121X_dialogue;
         }
         
         break;  
   }
}


function iterateDialogue()
{    
   if( currentDialogue == currentArray.length )
   {
      dialogueEnd = true;
      dialogue_active = false;
      master_stage.removeChild( dialogueBox );
      master_stage.removeChild( dialogueText );
      currentDialogue = 0;
   }
   
   else
   {
      dialogueText.setText(currentArray[currentDialogue]);
      currentDialogue++;
   }
}


function initialize_npc_dialogue()
{  // Needs enter when longer than --------------------------------
   npc12112_dialogue.push( "I'm the town's blacksmith, but I\n"+
                           "graduated with a degree in literature..." );
   npc12112_dialogue.push( "I've honed my craft over the years\n"+
                           "though! Here, let me teach you a thing\n" +
                           "or two...");
   npc12112_dialogue.push( "Your attack increased!" );
   npc12112_dialogue.push( "Also, 1 armor equal 10 health! So if\n"+
                           "you have 2 armor, you have 20 total\n" +
                           "health. But beware! You cannot restore");
   npc12112_dialogue.push( "armor in combat, only health. Find\n"+
                           "someone in a town who can restore it\n" +
                           "for you.");
   
   // Needs enter when longer than --------------------------------
   npc12112X_dialogue.push( "Sheesh, trying to take advantage of\n" +
                            "my generosity even more? Greedy lil\n"+
                            "bugger...");
   
   // Needs enter when longer than --------------------------------
   npc4114_dialogue.push( "I am a town guard, I help keep this\n"+
                          "place safe!" );
   
   // Needs enter when longer than --------------------------------
   npc17113_dialogue.push( "Oh someone help us! There is a great\n"+
                           "evil that wishes to destory us all!\n" );
   npc17113_dialogue.push( "You there, please help! There is a\n"+
                           "monster that is going to wipe out the\n"+
                           "world!" );
   npc17113_dialogue.push( "She may look like a regular woman,\n"+
                           "but she is the devil incarnate! Please\n"+
                           "help us!" );
   npc17113_dialogue.push( "You would be hailed a hero if she were\n"+
                           "slain by your hand!" );
   
   // Needs enter when longer than --------------------------------
   npc22117_dialogue.push( "If I jump into the pond and swam\n"+
                           "far away, would anyone chase after\n" +
                           "me?" );
   
   // Needs enter when longer than --------------------------------
   npc20110_dialogue.push( "I love looking in the water and seeing\n"+
                           "my reflection looking back!" );
   npc20110_dialogue.push( "It's kinda creepy when she smiles back\n"+
                           "and I'm not...");
   
   // Needs enter when longer than --------------------------------
   npc27110_dialogue.push( "My wife accused me of sneaking off to\n"+
                           "try and slay the monster!" );
   npc27110_dialogue.push( "All I was trying to do was surprise\n"+
                           "her with flowers..." );
   
   // Needs enter when longer than --------------------------------
   npc27123_dialogue.push( "I am unsure how I am able to walk on\n"+
                           "water..." );
   npc27123_dialogue.push( "This is a precarious situation. \n"+
                           "One second me and Billy were\n" +
                           "walking around the pond. I tried\n" );
   npc27123_dialogue.push( "to splash him by jumping.\n"  +
                           "Low and behold the water did not \n" +
                           "move. I ventured slightly further\n" );
   npc27123_dialogue.push( "and ended up here.\n" +
                           "Where did Billy dash off to though?\n" +
                           "In my glee of waterwalking, he\n" );
   npc27123_dialogue.push( "vanished... I hope a monster did\n" +
                           "not get him!\n" +
                           "I must go, if the others see this\n");
   npc27123_dialogue.push( "I may be tried for witchcraft.\n" +
                           "They cannot comprehend my gift. \n" );
   
   // Needs enter when longer than --------------------------------
   npc33121_dialogue.push( "You look injured! Let me patch you\n" +
                           "up!");
   npc33121_dialogue.push( "Your health and armor has been \n"+
                           "restored!" );
   
   // Needs enter when longer than --------------------------------
   npc34107_dialogue.push( "Hello citizen, have no fear, Town\n" +
                           "Guard is here! Oh, you are going\n" +
                           "to be a hero and slay the monster?" );
   npc34107_dialogue.push( "Right... good luck with that." );
   
   // Needs enter when longer than --------------------------------
   npc43107_dialogue.push( "Hey I recognize that sword! It's the \n" +
                           "hero sword right? The one that gets\n"+
                           "stronger the more monsters you kill?" );
   npc43107_dialogue.push( "You best be careful out there, the King\n" +
                           "is absorbing monsters to power up...\n"+
                           "If you flee from a monster, it will get" );
   npc43107_dialogue.push( "absorbed by the Shadow King to \n" +
                           "power his world ending attack! Better \n"+
                           "kill them while you have the chance." );
   npc43107_dialogue.push( "I'll say nice things at your funeral.\n" +
                           "It's too dangerous for anyone to \n"+
                           "survive out there." );
   
   // Needs enter when longer than --------------------------------
   npc4123_dialogue.push( "Oh my, a dashing young hero to save\n" +
                          "us all! Thank you youngster. Now I\n"+
                          "can tend to my crops again." );
   
   // Needs enter when longer than --------------------------------
   npc40121_dialogue.push( "I wish I could still adventure like\n"+
                           "you! You inspire me, please take my\n" +
                           "knowledge of defense!" );
   npc40121_dialogue.push( "Your armor has increased!" );
   
   // Needs enter when longer than --------------------------------
   npc40121X_dialogue.push( "You've already taken my knowledge...\n" + 
                            "What more do you want of me!?" ); 
   
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


/**
	Builds the different screens of the game
*/
function buildScreens() {
   startScreen.visible = true;
   instructScreen.visible = false;
   creditScreen.visible = false;
   winScreen.visible = false;
   loseScreen.visible = false;
   statsScreen.visible = false;

    // Text for titles
   var gameStatsText = new PIXI.Text( "Stats", {fill : 0x000000} );
   var playerAttackText = new PIXI.Text( "Attack:" , {fill : 0xFFFFFF} );
   var playerHealthText = new PIXI.Text( "Health:", {fill : 0xFFFFFF} );
   var playerArmorText = new PIXI.Text( "Armor:", {fill : 0xFFFFFF} );
   var gameTitleText = new PIXI.Text( "RPG!", {fill : 0xFFFFFF} );
   var gameInstructTitleText = new PIXI.Text( "Instructions", {fill : 0xFFFFFF} );
   var gameCreditTitleText = new PIXI.Text( "Credits", {fill : 0xFFFFFF} );
   var gameWinText = new PIXI.Text( "Game over!\nYou win!", {fill : 0xFFFFFF} );
   var gameLoseText = new PIXI.Text("Game over!\nThe Shadow King has conquered Terra.", {fill : 0xFFFFFF} );

   // Text for title screen options
   var gameStartText = new PIXI.Text( "Start", {fill : 0xFFFFFF} );
   var gameInstructText = new PIXI.Text( "Instructions", {fill : 0xFFFFFF} );
   var gameCredText = new PIXI.Text( "Credits", {fill : 0xFFFFFF} );  
   var gameCredBackText = new PIXI.Text( "<- Back", {fill : 0xFFFFFF} );
   var gameStatsBackText = new PIXI.Text( "Back", {fill : 0xFFFFFF} );
   var gameInstructBackText = new PIXI.Text( "<- Back", {fill : 0xFFFFFF} );
   var gameRestartText = new PIXI.Text( "Play again", {fill : 0xFFFFFF} );
   var gameReturnTitleText = new PIXI.Text( "Back to title screen", {fill : 0xFFFFFF} );
   var gameLoseRestartText = new PIXI.Text( "Play again", {fill : 0xFFFFFF} );
   var gameLoseReturnTitleText = new PIXI.Text( "Back to title screen", {fill : 0xFFFFFF} );

   
   // Adds regular text -----------------------------------------------------
   var gameInstructDesc = new PIXI.Text( "The hero must defeated the Shadow\n" + 
                                         "King and save the world! Use WASD\n" + 
                                         "to navigate the world. Talk to as\n" +
                                         "many people as you can in order to\n" + 
                                         "gather as much info as possible!\n\n" + 
                                         "Some townsfolk can even help you\n" + 
                                         "by making you stronger!", {fill : 0xFFFFFF} );
   var gameCredDesc = new PIXI.Text( "Authors: \nJohn Jacobelli\nJesse Rodriguez\nTyler "+
                                     "Pehringer\n\nRenderer used: PixiJS", {fill : 0xFFFFFF} );

   // Declare texts interactable
   gameStatsText.interactive = true;
   gameStatsBackText.interactive = true;
   gameStartText.interactive = true;
   gameInstructText.interactive = true;
   gameCredText.interactive = true;
   gameCredBackText.interactive = true;
   gameInstructBackText.interactive = true;
   gameRestartText.interactive = true;
   gameReturnTitleText.interactive = true;
   gameLoseRestartText.interactive = true;
   gameLoseReturnTitleText.interactive = true;

   
   // Declares interactable text functions
   gameStatsText.click = function(event) { statsScreen.visible = true;
                                           playerAttackText.setText( "Attack: " + player_attack );
                                           currentHealthSprite = createSprite( 103, 437, 1, 1, "ex_meter" + 
                                                                  player_health + ".png" );
                                           statsScreen.addChild( currentHealthSprite );
                                           
                                           for( var i = 0; i < player_armor; i++)
                                           {
                                              playerArmorArray[i] = createSprite( 100 + i * 25, 467, 1, 1, "armor.png" );
                                           }
                                           
                                           for( armor of playerArmorArray )
                                           {
                                              statsScreen.addChild( armor );
                                           }
                                           
                                           }
   
   gameStatsBackText.click = function(event) { statsScreen.visible = false; 
                                               statsScreen.removeChild( currentHealthSprite );
                                               for( var armor of playerArmorArray )
                                               {
                                                  statsScreen.removeChild( playerArmorArray[armor] );
                                               }  
                                           }
                                           
   gameStartText.click = function(event) { startScreen.visible = false; 
                                           game_stage.visible = true;
                                           gameStatsText.visible = true; }
                                           
   gameInstructText.click = function(event) { instructScreen.visible = true;
                                              startScreen.visible = false; }
                                              
   gameCredText.click = function(event) { creditScreen.visible = true;
                                          startScreen.visible = false; }
                                          
   gameCredBackText.click = function(event) { startScreen.visible = true;
                                              creditScreen.visible = false; }
                                              
   gameInstructBackText.click = function(event) { startScreen.visible = true;
                                                  instructScreen.visible = false; }
                                                  
   gameRestartText.click = function(event) { winScreen.visible = false;
                                             loseScreen.visible = false; }
                                             
   gameReturnTitleText.click = function(event) { startScreen.visible = true;
                                                 winScreen.visible = false;
                                                 loseScreen.visible = false; }
                                                 
   gameLoseRestartText.click = function(event) { winScreen.visible = false;
                                                 loseScreen.visible = false; }
                                             
   gameLoseReturnTitleText.click = function(event) { startScreen.visible = true;
                                                     winScreen.visible = false;
                                                     loseScreen.visible = false;  }
    
   
   // Create background for screens screen
   var graphics1 = createShape();
   var graphics2 = createShape();
   var graphics3 = createShape();
   var graphics4 = createShape();
   var graphics5 = createShape();
   var graphics6 = new PIXI.Graphics();
   graphics6.beginFill('0x000000');
   graphics6.drawRect(0, 400, 500, 100);
   graphics6.endFill();
   
   startScreen.addChild( graphics1 );
   instructScreen.addChild( graphics2 );
   creditScreen.addChild( graphics3 );
   winScreen.addChild( graphics4 );
   loseScreen.addChild( graphics5 );
   statsScreen.addChild( graphics6 );

   // Add text to screens
   startScreen.addChild( gameTitleText );
   startScreen.addChild( gameStartText );
   startScreen.addChild( gameInstructText );
   startScreen.addChild( gameCredText );
   instructScreen.addChild( gameInstructTitleText );
   instructScreen.addChild( gameInstructDesc );
   instructScreen.addChild( gameInstructBackText );
   creditScreen.addChild( gameCredBackText );
   creditScreen.addChild( gameCreditTitleText );
   creditScreen.addChild( gameCredDesc );
   winScreen.addChild( gameWinText );
   winScreen.addChild( gameRestartText );
   winScreen.addChild( gameReturnTitleText );
   loseScreen.addChild( gameLoseText );
   loseScreen.addChild( gameLoseRestartText );
   loseScreen.addChild( gameLoseReturnTitleText );
   statsScreen.addChild( gameStatsBackText );
   statsScreen.addChild( playerAttackText );
   statsScreen.addChild( playerHealthText );
   statsScreen.addChild( playerArmorText );
   master_stage.addChild( gameStatsText );
   
   // Set anchors for text
   gameStatsText.anchor.set( 1 );
   gameStatsBackText.anchor.set( 1 );
   gameTitleText.anchor.set( .5 );
   gameStartText.anchor.set( .5 );
   gameInstructText.anchor.set( .5 );
   gameCredText.anchor.set( .5 );
   gameInstructTitleText.anchor.set( .5 );
   gameInstructBackText.anchor.set( 1 );
   gameCredBackText.anchor.set( 1 );
   gameCreditTitleText.anchor.set( .5 );
   gameWinText.anchor.set( .5 );
   gameRestartText.anchor.set( .5 );
   gameReturnTitleText.anchor.set( .5 );
   gameLoseRestartText.anchor.set( .5 );
   gameLoseReturnTitleText.anchor.set( .5 );

   // Place Text
   gameStatsText.x = GAME_WIDTH - 15; gameStatsText.y = GAME_HEIGHT - 15;
   gameStatsBackText.x = GAME_WIDTH - 15; gameStatsBackText.y = GAME_HEIGHT - 15;
   playerAttackText.x = 5; playerAttackText.y = 405;
   playerHealthText.x = 5; playerHealthText.y = 435;
   playerArmorText.x = 5; playerArmorText.y = 465;
   gameTitleText.x = GAME_WIDTH/2; gameTitleText.y = GAME_HEIGHT/4;
   gameStartText.x = GAME_WIDTH/6; gameStartText.y = GAME_HEIGHT/4 * 3;
   gameInstructText.x = GAME_WIDTH/2 ; gameInstructText.y = GAME_HEIGHT/4 * 3;
   gameCredText.x = GAME_WIDTH/6 * 5; gameCredText.y = GAME_HEIGHT/4 * 3;
   gameInstructTitleText.x = GAME_WIDTH/2; gameInstructTitleText.y = GAME_HEIGHT/4;
   gameInstructDesc.x = 25; gameInstructDesc.y = GAME_HEIGHT * 1.5 /4;
   gameCreditTitleText.x = GAME_WIDTH/2; gameCreditTitleText.y = GAME_HEIGHT/4;
   gameCredDesc.x = 25; gameCredDesc.y = GAME_HEIGHT/2;
   gameInstructBackText.x = GAME_WIDTH - 25; gameInstructBackText.y = GAME_WIDTH - 25;
   gameCredBackText.x = GAME_WIDTH - 25; gameCredBackText.y = GAME_WIDTH - 25;
   gameWinText.x = GAME_WIDTH/2; gameWinText.y = GAME_HEIGHT/3 + 10;
   gameLoseText.x = GAME_WIDTH/8; gameLoseText.y = GAME_HEIGHT/3 + 10;
   gameRestartText.x = GAME_WIDTH/2; gameRestartText.y = GAME_HEIGHT/2 + 50;
   gameReturnTitleText.x = GAME_WIDTH/2; gameReturnTitleText.y = GAME_HEIGHT/2 + 100;
   gameLoseRestartText.x = GAME_WIDTH/2; gameLoseRestartText.y = GAME_HEIGHT/2 + 50;
   gameLoseReturnTitleText.x = GAME_WIDTH/2; gameLoseReturnTitleText.y = GAME_HEIGHT/2 + 100;
   
   // Add screens to stage
   master_stage.addChild( startScreen );
   master_stage.addChild( instructScreen );
   master_stage.addChild( creditScreen );
   master_stage.addChild( winScreen );
   master_stage.addChild( loseScreen );
   master_stage.addChild( statsScreen );
}


/**
*/
function createShape() {
   var graphics = new PIXI.Graphics();
   graphics.beginFill('0x000000');
   graphics.drawRect(0, 0, 500, 500);
   graphics.endFill();
   return graphics;
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
		//alert("Your attack hit the enemy for " + player_attack + " damage.");
		/**
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
		
		foe.onComplete = animationFinished;*/

		foe.health -= player_attack;
		
		if( player_boost ) {
			player_health--;
		}

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
			if ( player_armor <= 1 ) {
				game_stage.removeChild( player ); 
				game_stage.removeChild( health_meter );
				player.stop();
				player_alive = false;
				endBattle( foe );
			}
         player_armor--;
		}
	}
}

/**
	Helper function that handles steal action in combat
*/
function steal( foe ) {
	if( player_speed > foe.speed ) {
			if(!player_boost) {
			player_boost = true;
			player_attack *= 2;
	}
	
		if ( player_alive && foe.is_alive ) {
			enemyAttack( foe ); //Pass in enemy
		}
	}

	else {
		if ( player_alive && foe.is_alive ) {
			enemyAttack( foe ); //Pass in enemy
		}
	
		if(!player_boost) {
			player_boost = true;
			player_attack *= 2;
		}
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
	
	if ( player_armor > 0 ) {
		if ( player_health <= 0 ) { player_health += 10; }
	}
	
	player_threat_stage.removeChildren();
	
	for ( var i = player_armor; i > 0; i-- ) {
				danger_level = createSprite( (i*25) - 25, player.position.y + 210, 1.5, 1.5, "armor.png");
				
				player_threat_stage.addChild( danger_level );
	}
	
	if ( player_health < 0 ) { player_health = 0; }

	if ( player_health > 10 ) { player_health = 10; }

	if ( player_alive ) {
		health_meter = createSprite( player.position.x - 100, player.position.y + 200, .5, .5, ( "ex_meter" + ( Math.round( player_health ) ) + ".png" ) );
		battle_stage.addChild( health_meter );
	}
}

/**
	Helper function that ends the battle
*/
function endBattle ( foe ) {
	battle_active = false;
	foe.is_hit = false;
	player_boost = false;
	player_attack /= 2;
	moveHand(hand.position.x, menu_text.position.y + 
                           menu_text.height - 10);
	mode = RUN;
	count = 1;
	foe.removeEnemy();
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
		this.num_charges = 4;
		this.x = 750;
		this.y = 500;
        this.state = createMovieClip( this.x, this.y, .6, .6, "Bat", 1, 7 );
		this.state.animationSpeed = 0.25;
        this.name = "Bat";
		this.health = 10;
		this.health_meter = createSprite( 350, 400, .5, .5, ( "ex_meter10.png" ) );
		this.attack = 4;
		this.speed = 8;
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
		this.health_meter = createSprite( 350, 400, .5, .5, ( "ex_meter" + ( Math.round( this.health ) ) + ".png" ) );
		battle_stage.addChild( this.health_meter );
	}
};

Enemy.prototype.addCharge = function () {
	this.num_charges++;
};

Enemy.prototype.loseCharge = function () {
	this.num_charges--;
};

Enemy.prototype.removeEnemy = function () {
	this.state.visible = false;
	this.state.stop();
	this.state.destroy();
	game_stage.removeChild( this.state );
};


