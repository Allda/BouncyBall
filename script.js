(function(){
    var canv = document.getElementById('myCanvas'),
    c = canv.getContext('2d');

    window.addEventListener('keydown',mouseListener,false);
    var ball = new Ball(canv.width/2-20,canv.height-20,20);

    var pads = [];

    var bg = new Image();
    bg.src = 'img/bg2.jpg';

    var offset = 0;
    var animationOffset = 0;
    var animationStep = 0;
    var lastBounce = canv.height;

    var score = 0;
    var gameStatus = 'start';


  // This function is called 60 times each second
function executeFrame(){
    var i, j, circle;
    c.fillStyle = 'rgba(255,255,255,1)';
    c.fillRect(0, 0, canv.width, canv.height);
    c.drawImage(bg,0,0);
    c.drawImage(bg,0,409);

    if(gameStatus != 'Over'){
        ball.update();
        if(ball.bounce(pads) === 'GameOver'){
            gameStatus = 'Over';
        }

        // count animation step and add to animation offset
        animationStep = ball.countMovePerFrame(offset, animationOffset);
        animationOffset += animationStep;

        
    
    }
    else{
        c.font = "100px Helvetica";
        c.fillStyle = 'rgba(120,120,0,1)';
        c.fillText('Game\nOver',50, canv.height/2);
    }
    ball.draw(animationOffset);

    for (var i = 0; i < pads.length; i++) {
        pads[i].draw(animationOffset);
    };
    c.font = "30px Helvetica";

    c.fillText('Score: '+score.toString(),10,50);


    // Schedule the next frame
    requestAnimFrame(executeFrame);
}

function initializePads(){
    last = canv.height;
    for (var i = 0; i < 10; i++) {
        var dist = getRandomPadStep();
        console.log(dist);
        if(pads.length == 0){
            var nPad = new Pad(Math.random()*(canv.width-100),canv.height-dist);
            pads.push(nPad);
            last = nPad.y;
        }
        else{
            var nPad = new Pad(Math.random()*(canv.width-100),last-dist);
            pads.push(nPad);
            last = nPad.y;
        }

    }
}

function getRandomPadStep(){
    return Math.random() * 50 +150;
}

Array.prototype.last = function () {
  return this[this.length - 1];
};

function mouseListener(e){
    console.log(e.keyCode);
    var code = e.keyCode;
    // left
    if(code === 37){
        ball.moveLeft();
    }
    // right
    else if(code === 39){
        ball.moveRight()
    }
}

function Pad(x, y){
    this.x = x;
    this.y = y;

    this.width = 100;
    this.height = 15;
    this.steped = false;

    this.draw = function(offset){
        c.beginPath();
        //console.log("Pad at: " + this.y + ", offset: " +offset)
        c.rect(this.x, this.y + offset, this.width, this.height);
        c.closePath();
        c.fillStyle = 'white';
        c.fill();
    }

}

function Ball(x, y, radius){
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = radius;
    this.gravity = 0.25;
    this.dampening = 0.99;
    this.timeOut;
    this.state = 'start';
    this.fallingEdge = undefined;

    this.draw = function(offset){
        c.beginPath();
        c.arc(this.x, this.y + offset, this.radius, 0, 2*Math.PI);
        c.closePath();
        c.fillStyle = 'cyan';
        c.fill();
    }

    this.bounce = function(pads){
        // botom
        if(animationOffset == 0){
            if(this.y + this.radius > canv.height){
              this.y = canv.height - this.radius;
              this.vy = -12;
                
            }
        }
        else{
            if(this.y + this.radius + animationOffset > canv.height){
                console.log("Game over");
                this.y = canv.height - this.radius - animationOffset;
                this.vy = -12;
                return 'GameOver';
            }
            // right
        }
        if(this.x + this.radius > canv.width){
            this.x = canv.width - this.radius;
            this.vx = -Math.abs(this.vx);
        }
            // top
        /*if(this.y - this.radius < 0){
            this.y = this.radius;
            this.vy = Math.abs(this.vy);
        }*/
            // left
        if(this.x - this.radius < 0){
            this.x = this.radius;
            this.vx = Math.abs(this.vx);
        }
        if(this.vy >= 0){
            for (var i = 0; i < pads.length; i++) {
                if(this.x > pads[i].x && this.x < pads[i].x + pads[i].width)
                    if(this.y + this.radius > pads[i].y && this.y + this.radius < pads[i].y + pads[i].height){
                        if(this.state == 'start')
                            this.state = 'inGame';

                        this.vy = -12;
                        // count new offset after bounce ball to pad
                        // every frame animation count new animation step
                        offset = lastBounce - pads[i].y - 100;
                        //animationStep = this.countMovePerFrame(offset,animationOffset);

                        if(!pads[i].steped){
                            var lastPad = pads.last();
                            var nPadStep = getRandomPadStep();
                            var nPad = new Pad(Math.random()*(canv.width-100),lastPad.y-nPadStep);
                            pads.push(nPad);
                            pads[i].steped = true;
                            if(pads.length > 15)
                                pads.shift();
                            score++;

                        }
                    }
            };
            if(this.state != 'start'){
                if(this.state == 'falling'){
                    
                    console.log(this.fallingEdge + 200, this.y + animationOffset);
                    if(this.fallingEdge - 300 > this.y + animationOffset){
                        console.log("Padam");
                        
                    }
                    else{
                        console.log('shift');
                        offset = this.y + animationOffset-50;
                    }
                }
                if(this.y + animationOffset > canv.height-75 && this.state == 'inGame'){
                    this.state = 'falling';
                    this.fallingEdge = this.y + animationOffset;
                    //console.log("Je pod");
                    offset = this.y + animationOffset-50;
                    console.log('Offset: '+offset);
                }
            }
            console.log(this.state);
        }
    }

    this.countMovePerFrame = function(offset, animationOffset){
        var diff = offset - animationOffset;
        return diff * 0.05; // 5% of difference betwen real offset and shown offset
    }
    this.update = function(){
        this.x += this.vx;
        this.y += this.vy;

        // Increment Gravity
        this.vy += this.gravity;

        // Slow it down
        this.vy *= this.dampening;
        this.vx *= this.dampening;
    }
    this.moveLeft = function(){
        if(this.vx > 0){
            this.vx = 0.0;
        }
        else
            this.vx -= 0.75;
        if(this.vx < -5)
            this.vx = -5;
        //console.log("Left " + this.vx);
        //window.clearTimeout(this.timeOut);
        //this.timeOut = setTimeOut(this.slowDown(),500)
    }
    this.moveRight = function(){
        if(this.vx < 0){
            this.vx = 0.0;
        }
        else
            this.vx += 0.75;
        if(this.vx > 5)
            this.vx = 5;
        //console.log("Right " + this.vx);
        //window.clearTimeout(this.timeOut);
        //this.timeOut = setTimeOut(this.slowDown(),500)
    }

    this.slowDown = function(){
        console.log("slowDown");
    }
}

    initializePads();
    // Start animation
    executeFrame();

})();