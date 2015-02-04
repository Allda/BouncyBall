(function(){
    var canv = document.getElementById('myCanvas'),
    c = canv.getContext('2d');

    var ball = new Ball(canv.width/2-20,canv.height-20,20);



  // This function is called 60 times each second
function executeFrame(){
    var i, j, circle;
    c.fillStyle = 'rgba(255,255,255,1)';
    c.fillRect(0, 0, canv.width, canv.height);

    ball.update();
    ball.bounce();
    ball.draw();


    // Schedule the next frame
    requestAnimFrame(executeFrame);
}





function Ball(x, y, radius){
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = radius;
    this.gravity = 0.1;
    this.dampening = 0.99;

    this.draw = function(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
        c.closePath();
        c.fillStyle = 'black';
        c.fill();
    }

    this.bounce = function(){
        // botom
        if(this.y + this.radius > canv.height){
          this.y = canv.height - this.radius;
          this.vy = -10;
        }
            // right
        if(this.x + this.radius > canv.width){
            this.x = canv.width - this.radius;
            this.vx = -Math.abs(this.vx);
        }
            // top
        if(this.y - this.radius < 0){
            this.y = this.radius;
            this.vy = Math.abs(circle.vy);
        }
            // left
        if(this.x - this.radius < 0){
            this.x = this.radius;
            this.vx = Math.abs(this.vx);
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
}


    // Start animation
    executeFrame();

})();