function mushroomBuff (tank, bullet) {

    mushroom.kill();
    fireRate = 100;
    game.time.events.add(Phaser.Timer.SECOND * 10, reset, this);
    game.time.events.add(Phaser.Timer.SECOND * Math.floor(Math.random() * 50) + 10, spawnshroom, this);
}


function reset(){
    fireRate = 500;
}

function spawnshroom(){
    mushroom = game.add.sprite(Math.floor(Math.random() * 2000) + -1000 , Math.floor(Math.random() * 2000) + -1000 , 'mushroom');
    game.physics.enable(mushroom, Phaser.Physics.ARCADE);
    mushroom.body.immovable = true;
}