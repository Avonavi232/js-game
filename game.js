'use strict';

function wrt(data) {
    console.log(data);
}

function extender(base, props = {}) {
    const result = class extends base {};
    Object.defineProperties(result.prototype, props);
    return result;
}

/*Test OK*/
class Vector{
    constructor(posX = 0, posY = 0){
        this.x = posX;
        this.y = posY;
    }
    plus(vector){
        if ( !(vector instanceof Vector) ){
            throw new Error ('Можно прибавлять к вектору только вектор типа Vector');
        }
        return new Vector( (this.x + vector.x), (this.y + vector.y) );
    }
    times(rate){
        return new Vector( (this.x * rate), (this.y * rate) );
    }
}


/*Test OK*/
class Actor{
    constructor(pos = new Vector(), size = new Vector(1,1), speed = new Vector()){
        if ( !(pos instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector) ){
            throw new Error ('Исключение брошено из конструктора класса Actor');
        }
        this.pos = pos;
        this.size = size;
        this.speed = speed;
    }
    get left(){
        return this.pos.x;
    }
    get right(){
        return this.pos.x + this.size.x;
    }
    get top(){
        return this.pos.y;
    }
    get bottom(){
        return this.pos.y + this.size.y;
    }
    act(){

    }
    isIntersect(actor){
        if ( !(actor instanceof Actor) ){
            throw new Error ('Исключение брошено из метода isIntersect класса Actor');
        }
        if (actor === this){
            return false;
        }
        return !( this.top >= actor.bottom || this.bottom <= actor.top || this.right <= actor.left || this.left >= actor.right );


    }
}
Object.defineProperties(Actor.prototype, {
    'type': {
        value: 'actor',
        configurable: true,
    }
});

/*Test OK*/
class Level{
    constructor(grid, actors){
        if(grid){
            this.grid = grid;
            this.height = grid.length;
            this.width = grid.reduce(function(prevVal, curVal, index){
                if (curVal.length > prevVal)
                    return curVal.length;
                else
                    return prevVal;
            }, 0);
        } else {
            this.height = 0;
            this.width = 0;
        }

        if(actors){
            this.actors = actors;
            this.player = (this.actors.find(function (el) {
                return (el.type === 'player');
            }));
        }


        this.status = null;
        this.finishDelay = 1;
    }

    isFinished(){
        return ( (this.status !== null) && ( this.finishDelay < 0) );
    }

    actorAt(pos){
        if ( !(pos instanceof Actor) || pos === undefined ){
            throw new Error ('Исключение брошено из метода actorAt класса Level');
        }
        if(this.actors){
            for(let actor of this.actors){
                if (pos.isIntersect(actor)){
                    return actor;
                }
            }
        }
    }

    obstacleAt(moveTo, size){

        if ( !(moveTo instanceof Vector) || !(size instanceof Vector) ){
            throw new Error ('Исключение брошено из метода obstacleAt класса Level');
        }

        let newActor = new Actor(moveTo, size);

        if (newActor.bottom > this.height){
            return 'lava';
        } else if ( (newActor.left < 0) || (newActor.right > this.width) || (newActor.top < 0) ){
            return 'wall';
        }

        let i = Math.floor(newActor.top);
        let iTo = Math.ceil(newActor.bottom);
        let j = Math.floor(newActor.left);
        let jTo = Math.ceil(newActor.right);

        for(let I = i; I < iTo; I++){
            for(let J = j; J < jTo; J++){
                if(this.grid[I][J]){
                    return this.grid[I][J];
                }
            }
        }
    }

    removeActor(actor){
        let toDelete = (this.actors).findIndex(function (el, i) {
            return (el === actor);
        });
        this.actors.splice(toDelete, 1);
    }

    noMoreActors(type){
        if (!(this.actors)){
            return true;
        }

        return !( this.actors.find(function (el) {
            return (el.type === type);
        }) );

    }

    playerTouched(obstacle, actor){

        if(this.status === null){

            if ( (obstacle === 'lava') || (obstacle === 'fireball') ){
                this.status = 'lost';
            } else if ( (obstacle === 'coin') && (actor.type === 'coin') ) {

                this.removeActor(actor);

                if(this.noMoreActors('coin')){
                    this.status = 'won';
                }
            }
        }
    }
}

const Player = class extends Actor{
    constructor(pos = new Vector(), size = new Vector(0.8, 1.5), speed = new Vector()){
        super();
        this.pos = pos.plus(new Vector(0, -0.5));
        this.size = size;
    }
};
Object.defineProperties(Player.prototype, {
    type: {
        value: 'player'
    },
    title: {
        value: 'Игрок'
    }
});

/*Test OK*/
class LevelParser{
    constructor(dict){
        this.dict = dict;
    }

    actorFromSymbol(str){
        if (!str)
            return;
        const key = ((Object.keys(this.dict)).find(function (el) {
            return (str === el);
        }));
        return this.dict[key];
    }

    obstacleFromSymbol(str){
        if (!str)
            return;
        switch (str){
            case 'x':
                return 'wall';
            case '!':
                return 'lava';
            default:
                return;
        }
    }

    createGrid(grid){
        if(!grid)
            return;
        const newGrid = [];
        for(let row of grid){
            newGrid.push([]);
            for(let item of row.split('')){
                newGrid[newGrid.length-1].push(this.obstacleFromSymbol(item));
            }
        }
        return newGrid;
    }

    createActors(grid){
        if(!grid)
            return;
        if(!this.dict)
            return [];
        const actors = [];
        const self = this;
        grid.forEach( function (row, i) {
            row.split('').forEach( function(item, j){
                if(typeof self.actorFromSymbol(item) === 'function') {
                    if ((self.actorFromSymbol(item)).prototype instanceof Actor || (self.actorFromSymbol(item)) === Actor) {
                        let creator = self.actorFromSymbol(item);
                        actors.push(new creator(new Vector(j, i)));
                    }
                }
            });
        });
        return actors;
    }

    parse(grid){
        return new Level(this.createGrid(grid), this.createActors(grid));
    }
}

const Fireball = class extends Actor{
    constructor(pos = new Vector(0, 0), speed = new Vector(0,0)){
        super(pos);
        this.size = new Vector(1,1);
        this.speed = speed;
        Object.defineProperties(this, {
            type: {
                value: 'fireball'
            },
            title: {
                value: 'Fireball'
            }
        });
    }

    getNextPosition(time = 1){
        return new Vector(this.pos.x + time*this.speed.x, this.pos.y + time*this.speed.y);
    }

    handleObstacle(){
        this.speed.x = -this.speed.x;
        this.speed.y = -this.speed.y;
    }

    act(time, level){
        let newPos = this.getNextPosition(time);
        if(level.obstacleAt(newPos, this.size)){
            this.handleObstacle();
        } else {
            this.pos = newPos;
        }
    }
};
const HorizontalFireball = class extends Fireball{
    constructor(pos = new Vector(0, 0), speed = new Vector(2,0)){
        super(pos, speed);
    }
};
const VerticalFireball = class extends Fireball{
    constructor(pos = new Vector(0, 0), speed = new Vector(0,2)){
        super(pos, speed);
    }
};
const FireRain = class extends Fireball{
    constructor(pos = new Vector(0, 0)){
        super(pos);
        this.speed = new Vector(0,3);
        this.initialPos = pos;
    }

    handleObstacle(){
        this.pos = this.initialPos;
    }
};
const Coin = class extends Actor{
    constructor(pos = new Vector()){
        super();
        this.size = new Vector(0.6, 0.6);
        this.pos = pos.plus(new Vector(0.2, 0.1));
        Object.defineProperties(this, {
            type: {
                value: 'coin'
            },
            title: {
                value: 'Золотая монетка'
            },
            spring: {
                value: Math.random() * 2*Math.PI,
                writable: true
            },
            springSpeed: {
                value: 8
            },
            springDist: {
                value: 0.07
            }
        });
    }

    updateSpring(time = 1){
        this.spring += this.springSpeed*time;
        // while(this.spring >= 2*Math.PI){
        //     this.spring -= 2*Math.PI;
        // }
    }

    getSpringVector(){
        let y = Math.sin(this.spring) * this.springDist;
        return new Vector(0, y);
    }

    getNextPosition(time = 1){
        this.updateSpring(time);
        return this.pos.plus(this.getSpringVector());
    }

    act(time){
        this.pos = this.getNextPosition(time);
    }
};



/*Запуск*/

const actorDict = {
    '@': Player,
    'v': FireRain,
    'o': Coin,
    '=': HorizontalFireball,
    '|': VerticalFireball
};
const parser = new LevelParser(actorDict);
loadLevels()
    .then((levels) => {
        let sch;
        try{
            sch = JSON.parse(levels);
            runGame(sch, parser, DOMDisplay);
        } catch (err){
            console.error(err);
        }
    });


























