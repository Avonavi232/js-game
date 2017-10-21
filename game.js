'use strict';

function wrt(data) {
    console.log(data);
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
        this.actors = actors;
        const Player = class extends Actor {
            constructor(){
                super();
                this.title = 'Игрок';
            }
        };
        Object.defineProperties(Player.prototype, { type: { value: 'player' }});

        this.player = new Player();
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
        if(this.grid){

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
            for(let j = newActor.left; i<= newActor.right; i++){
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
        if (!(this.actors))
            return true;
        
        for(let el of this.actors){
            if(el.type === type){
                return false;
            }
        }
        return true;
    }
}






/*Тестовый код*/
const items = new Map();
const player = new Actor();
items.set('Игрок', player);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));

function position(item) {
    return ['left', 'top', 'right', 'bottom']
        .map(side => `${side}: ${item[side]}`)
        .join(', ');
}

function movePlayer(x, y) {
    player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
    console.log(`${title}: ${position(item)}`);
    if (player.isIntersect(item)) {
        console.log(`Игрок подобрал ${title}`);
    }
}

// items.forEach(status);
// movePlayer(10, 10);
// items.forEach(status);
// movePlayer(5, -5);
// items.forEach(status);


let grid = [
    [1, 2, 3, 4, 5],
    [1, 2, 3, 4, 5],
    [1, 2, 3, 4, 5],
    [1, 2, 3, 4, 5],
    [1, 2, 3, 4, 5],
    [1, 2, 3, 4, 5],
    [1, 2, 3, 4, 5],
    [1, 2, 3, 4, 5],
    [1, 2, 3, 4, 5],
    [1, 2, 3, 4, 5],
];

//let lev = new Level(grid);

//lev.obstacleAt(new Vector(4,0), new Vector(1,1));

//wrt(lev.player);





























