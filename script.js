(function(){
    var canv = document.getElementById('myCanvas'),
    c = canv.getContext('2d');

    window.addEventListener('keydown',mouseListener,false);
    var ball = new Ball(canv.width/2-20,canv.height-20,20);

    var pads = [];

    pads.push(new Pad(150,450));
    pads.push(new Pad(300,300));
    pads.push(new Pad(200,150));


  // This function is called 60 times each second
function executeFrame(){
    var i, j, circle;
    c.fillStyle = 'rgba(255,255,255,1)';
    c.fillRect(0, 0, canv.width, canv.height);

    ball.update();
    ball.bounce(pads);
    ball.draw();

    for (var i = 0; i < pads.length; i++) {
        pads[i].draw();
    };


    // Schedule the next frame
    requestAnimFrame(executeFrame);
}


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

    this.draw = function(){
        c.beginPath();
        c.rect(this.x, this.y, this.width, this.height);
        c.closePath();
        c.fillStyle = 'black';
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

    this.draw = function(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
        c.closePath();
        c.fillStyle = 'black';
        c.fill();
    }

    this.bounce = function(pads){
        // botom
        if(this.y + this.radius > canv.height){
          this.y = canv.height - this.radius;
          this.vy = -12;
        }
            // right
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
                        this.vy = -12;
                    }
            };
        }
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
        console.log("Left " + this.vx);
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
        console.log("Right " + this.vx);
        //window.clearTimeout(this.timeOut);
        //this.timeOut = setTimeOut(this.slowDown(),500)
    }

    this.slowDown = function(){
        console.log("slowDown");
    }
}


    // Start animation
    executeFrame();

})();