var land;

var shadow;
var tank;
var turret;

var enemies;
var enemyBullets;
var enemiesTotal = 0;
var enemiesAlive = 0;
var playerHealth = 0;
var explosions;
var coins;
var box;
var points = 0;
var newLevel = 10;

var logo;
var mushroom;

var currentSpeed = 0;
var cursors;

var bullets;
var fireRate = 500;
var nextFire = 0;


function create () {

    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(-1000, -1000, 2000, 2000);

    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, 1200, 800, 'earth');
    land.fixedToCamera = true;

    //  The base of our tank
    tank = game.add.sprite(0, 0, 'tank', 'tank1');
    tank.anchor.setTo(0.5, 0.5);
    tank.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);

    //  This will force it to decelerate and limit its speed
    game.physics.enable(tank, Phaser.Physics.ARCADE);
    tank.body.drag.set(0.2);
    tank.body.maxVelocity.setTo(400, 400);
    tank.body.collideWorldBounds = true;

    //  Finally the turret that we place on-top of the tank body
    turret = game.add.sprite(0, 0, 'tank', 'turret');
    turret.anchor.setTo(0.3, 0.5);

    //  The enemies bullet group
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(100, 'bullet');
    
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 0.5);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //  Create some baddies to waste :)
    enemies = [];

    enemiesTotal = 10;
    enemiesAlive = 5;
    playerHealth = 20;

    for (var i = 0; i < enemiesTotal; i++)
    {
        enemies.push(new Mage(i, game, tank, enemyBullets));
    }

    //  A shadow below our tank
    shadow = game.add.sprite(0, 0, 'tank', 'shadow');
    shadow.anchor.setTo(0.5, 0.5);

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet', 0, false);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    //  Explosion pool
    explosions = game.add.group();

    for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    tank.bringToTop();
    turret.bringToTop();
    
    coins = game.add.sprite(40, 100, 'coin');

    coins.animations.add('walk');

    coins.animations.play('walk', 15, true);
    
    addWalls();

    
    //What I have learned
    //To create a object, do the code below
    mushroom = game.add.sprite(Math.floor(Math.random() * 2000) + -1000, Math.floor(Math.random() * 2000) + -1000, 'mushroom');

    //To enable Physics with that object, do code below
    game.physics.enable(mushroom, Phaser.Physics.ARCADE);
    
    
    //Make it so the object cant move, do this below
    mushroom.body.immovable = true;



    
    game.camera.follow(tank);
    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();

}


function addWalls(){
    box = game.add.sprite(Math.floor(Math.random() * 2000) + -1000, Math.floor(Math.random() * 2000) + -1000, 'box');
    game.physics.enable(box, Phaser.Physics.ARCADE);
    box.body.immovable = true;
    game.physics.arcade.collide(tank, box);
}

function update () {
    if(newLevel == points){
        addWalls();
        newLevel = newLevel * 2;
    }
    if(playerHealth == 0){
        background = game.add.tileSprite(game.camera.x+400, game.camera.y+200, 400, 185, "gameover"); 
    }
    if(enemiesAlive == 0){
        background = game.add.tileSprite(32, 32, 400, 185, "gameover");    
    }
    
    game.physics.arcade.collide(tank, box);
    game.physics.arcade.collide(enemies, box)
    game.physics.arcade.overlap(enemyBullets, tank, bulletHitPlayer, null, this);
    //If tank touches shroom, call buffOverlap function
    game.physics.arcade.overlap(tank, mushroom, mushroomBuff, null, this);

    enemiesAlive = 0;

    for (var i = 0; i < enemies.length; i++)
    {
        if (enemies[i].alive)
        {
            enemiesAlive++;
            game.physics.arcade.collide(tank, enemies[i].tank);
            game.physics.arcade.overlap(bullets, enemies[i].tank, bulletHitEnemy, null, this);
            enemies[i].update();
        }
    }

    if (cursors.left.isDown)
    {
        tank.angle -= 4;
    }
    else if (cursors.right.isDown)
    {
        tank.angle += 4;
    }

    if (cursors.up.isDown)
    {
        //  The speed we'll travel at
        currentSpeed = 300;
        
    }
    else
    {
        if (currentSpeed > 0)
        {
            currentSpeed -= 4;
        }
    }

    if (currentSpeed > 0)
    {
        game.physics.arcade.velocityFromRotation(tank.rotation, currentSpeed, tank.body.velocity);
    }

    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;

    //  Position all the parts and align rotations
    shadow.x = tank.x;
    shadow.y = tank.y;
    shadow.rotation = tank.rotation;

    turret.x = tank.x;
    turret.y = tank.y;

    turret.rotation = game.physics.arcade.angleToPointer(turret);

    if (game.input.activePointer.isDown)
    {
        //  Boom!
        fire();
    }
    
    if(playerHealth == 0){
        tank.kill();
        turret.kill();
        shadow.kill();
        var explosionAnimation = explosions.getFirstExists(false);
        explosionAnimation.reset(tank.x, tank.y);
        explosionAnimation.play('kaboom', 30, false, true);
    }

}

function bulletHitPlayer (tank, bullet) {

    bullet.kill();
    playerHealth--;

}

function bulletHitEnemy (tank, bullet) {

    bullet.kill();
    points++;

    var destroyed = enemies[tank.name].damage();

    if (destroyed)
    {
        var explosionAnimation = explosions.getFirstExists(false);
        explosionAnimation.reset(tank.x, tank.y);
        explosionAnimation.play('kaboom', 30, false, true);
        
    }

}

function fire () {

    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstExists(false);

        bullet.reset(turret.x, turret.y);

        bullet.rotation = game.physics.arcade.moveToPointer(bullet, 1000, game.input.activePointer, 500);
    }

}

function render () {

    // game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.length, 32, 32);
    game.debug.text('Enemies: ' + enemiesAlive + ' / ' + enemiesTotal, 32, 32);
    game.debug.text('Health:' + playerHealth, 32, 45);
    
}


    