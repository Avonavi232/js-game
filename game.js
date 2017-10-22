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
        this.x = Math.round(posX);
        this.y = Math.round(posY);
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

        for(let i = newActor.top; i <= newActor.bottom; i++){
            for(let j = newActor.left; j<= newActor.right; j++){
                return(this.grid[i][j]);
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


/*Тестовый код*/

const Player = extender(Actor, { type: { value: 'player' }});
let player = new Player(new Vector(4,0));
player.title = 'Игрок';



const grid = [

    [undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined],
    ['wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
    [undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined],
    ['wall', 'wall', 'wall', 'wall', 'wall', 'wall'],

];



const GoldCoin = extender(Actor, {
    type: {
        value: 'coin'
    },
    title: {
        value: 'Золото'
    }
});
const BronzeCoin = extender(Actor, {
    type: {
        value: 'coin'
    },
    title: {
        value: 'Бронза'
    }
});
const WallMaker = extender(Actor, {
    type: {
        value: 'wall'
    },
    title: {
        value: 'стена'
    }
});

const gold = new GoldCoin(new Vector(3,5));
const bronze = new BronzeCoin(new Vector(3,9));
const fireball = new Actor(new Vector(0,6));

const level = new Level(grid, [ gold, bronze, player]);

runLevel(level, DOMDisplay)
    .then(status => console.log(`Игрок ${status}`));






























