(function(){
    var canv = document.getElementById('myCanvas'),
    c = canv.getContext('2d');

    /* flip y coordinate
    [0,height]  [width,height]
    +-----------+
    |           |
    |           |
    |           |
    |           |
    |           |
    |           |
    |           |
    +-----------+
    [0;0]       [width,0]
    */
    c.translate(0,canv.height); 
    c.scale(1,-1);

    window.addEventListener('keydown',mouseListener,false);



    var game = new Game();
    game.initializePads();

    /*var bg = new Image();
    bg.src = 'img/bg2.jpg';*/


  // This function is called 60 times each second
function executeFrame(){
    if(game.gameStatus == 'playing'){
        game.update();
        game.draw();
    }
    if(game.gameStatus == 'gameOver'){
        game.drawResult();
        $("#score").fadeIn('slow');

    }


    // Schedule the next frame
    requestAnimFrame(executeFrame);
}

function Game(){
    this.ball = new Ball(canv.width/2-20,30,30);
    this.offset = 0;
    this.animationOffset = 0;
    this.animationStep = 0;
    this.lastBounce = 0;
    this.score = 0;
    this.pads = [];
    this.gameStatus = 'playing';
    this.resultBG = false;

    this.initializePads = function(){
        var last = 0;
        for (var i = 0; i < 1; i++) {
            var dist = this.getRandomPadStep();

            var nPad = new Pad(Math.random()*(canv.width-100),last+dist);
            this.pads.push(nPad);
            last = nPad.y;


        }
    }

    this.getRandomPadStep = function(){
        return Math.random() * 50 +150;
    }

    this.update = function(){
        this.ball.update();
        if(this.ball.bounce(this.pads) == 'gameOver')
            this.gameStatus = 'gameOver';

        //every frame update offset and get offset step and add to animationOffset
        this.animationStep = this.countMovePerFrame(this.offset, this.animationOffset);
        this.animationOffset += this.animationStep;

        
    }

    this.draw = function(){
        c.fillStyle = 'rgba(255,255,255,0.8)';
        c.fillRect(0, 0, canv.width, canv.height);

        for (var i = 0; i < this.pads.length; i++) {
            this.pads[i].draw(this.animationOffset);
        };

        this.ball.draw();
        c.save();
        c.font = "30px Helvetica";
        c.scale(1,-1);
        c.translate(0,-canv.height); 
        c.fillStyle = "#000";
        c.fillText('Score: '+this.score.toString(),10,50);
        c.restore();

    }

    this.countMovePerFrame = function(offset, animationOffset){
        var diff = this.offset - this.animationOffset;
        return diff * 0.05; // 5% of difference betwen real offset and shown offset
    }

    this.drawResult = function(){
        if(!this.resultBG){
            c.fillStyle = 'rgba(255,0,0,0.5)';
            c.fillRect(0, 0, canv.width, canv.height);
            this.resultBG = true;
            $("#history").hide();
            $("#myScore").show();
            $('#numScore').html(game.score);
            $('#scoreTable').empty();
            $(".showSc").hide();
            $(".showH").show();
            $.getJSON("score.php",function(data){
                var items = [];
                if(data.length == 0){
                    $("#history").append('<H2>Empty rank</H2>')
                }
                else{
                    $("#scoreTable").append('<tr id="header"><td>Rank</td><td>Nickname</td><td>Score</td></tr>');
                        var i = 1;
                    data.forEach(function(val){
                        console.log(val)
                        $("#scoreTable").append('<tr><td>'+i+'</td><td>'+val['nick']+'</td><td>'+val['score']+'</td>');
                        i++;
                    });
                }
                /*$.each(data, function(key,val){
                    console.log(key,val + "......");
                    $(".players").append('<div class="player">'+data['nick']+'</div> <div class="score">'+data['score']+'</div>');
                });*/
            });
            //$("#score").fadeToggle('slow');
            
            

        }
    }

    this.restart = function() {
        this.ball = new Ball(canv.width/2-20,30,30);
        this.offset = 0;
        this.animationOffset = 0;
        this.animationStep = 0;
        this.lastBounce = 0;
        this.score = 0;
        this.pads = [];
        this.gameStatus = 'playing';
        this.resultBG = false;
        this.initializePads();
    }
}



Array.prototype.last = function () {
  return this[this.length - 1];
};

function mouseListener(e){
    var code = e.keyCode;
    // left
    if(code === 37){
        game.ball.moveLeft();
    }
    // right
    else if(code === 39){
        game.ball.moveRight()
    }
    

}

canv.addEventListener('touchmove', function(event) {
  for (var i = 0; i < event.touches.length; i++) {
    var touch = event.touches[i];
    ctx.beginPath();
    ctx.arc(touch.pageX, touch.pageY, 20, 0, 2*Math.PI, true);
    ctx.fill();
    ctx.stroke();
  }
}, false);

function Pad(x, y, broken){
    this.x = x;
    this.y = y;

    this.width = 100;
    this.height = 15;
    this.steped = false;

    this.damage = 1;
    this.broken = broken;

    this.draw = function(offset){
        c.beginPath();
        c.rect(this.x, this.y - offset, this.width, this.height);
        c.closePath();
        c.fillStyle = this.getColor();
        c.fill();

    }

    this.getColor = function(){
        if(this.damage == 0)
            return 'rgba(150,150,150,1)';
        else if(this.damage == 1)
            return 'rgba(0,0,0,1)';
        else
            return 'rgba(0,0,0,1)';
    }

}

function Ball(x, y, size){
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.size = size
    this.state = 'normal';
    //this.radius = radius;
    this.gravity = -0.25;
    this.dampening = 0.99;
    this.originalvy = 12;
    this.angle = 0;
    this.rotateDirection = '';

    this.snd = new Audio("sound/BounceYoFrankie.wav"); // buffers automatically when created


    this.draw = function(offset){
        c.beginPath();
        if(this.state == 'rotate'){
            c.save();
            c.translate(this.x + this.size/2,this.y- game.animationOffset +this.size/2);
            c.rotate(this.angle*Math.PI/180);
            c.translate(-(this.x + this.size/2),-(this.y- game.animationOffset +this.size/2));
        }
        c.rect(this.x, this.y - game.animationOffset, this.size, this.size);
        c.closePath();
        c.fillStyle = 'cyan';
        c.fill();
        if(this.state == 'rotate'){
            c.restore();
            if(this.rotateDirection == 'left')
                this.angle += 4;
            else
                this.angle -= 4;
            if(this.angle == 180 || this.angle == -180){

                this.angle = 0;
                this.state = 'normal';
            }
        }
    }

    this.bounce = function(pads){
        // botom
        if(game.offset == 0){
            if(this.y < 0){
                  this.y =  0;
                  this.vy = this.originalvy;
            }
        }
        else{
            if(this.y + this.size - game.animationOffset < -10){
                  return 'gameOver';
            }
        }
        if(this.x + this.size > canv.width){
            this.x = canv.width - this.size;
            this.vx = -Math.abs(this.vx);
        }
        // left
        if(this.x < 0){
            this.x = 0;
            this.vx = Math.abs(this.vx);
        }
        if(this.vy <= 0){ // ball is falling down
            for (var i = 0; i < pads.length; i++) {
                var p = pads[i];
                if(this.x + this.size > p.x && this.x < p.x + p.width){
                    //console.log('yes');
                    if(this.y < p.y +p.height && this.y  > p.y){
                        this.vy = this.originalvy;
                        this.state = 'rotate';
                        if(this.vx < 0)
                            this.rotateDirection = 'left';
                        else
                            this.rotateDirection = 'right';
                        this.snd.curentTime = 0;
                        this.snd.play();

                        // count new offset after bounce ball to pad
                        // every frame animation count new animation step
                        game.offset = game.lastBounce + game.pads[i].y + game.pads[i].height - 100;
                        //animationStep = this.countMovePerFrame(offset,animationOffset);
                        if(p.broken){
                            p.damage--;
                            if(p.damage < 0){
                                var index = pads.indexOf(p);
                                if(index > -1)
                                    pads.splice(index,1);
                            }
                        }

                        if(!game.pads[i].steped){
                            var lastPad = game.pads.last();
                            var nPadStep = game.getRandomPadStep();
                            var broken = false;
                            if(Math.random() > 0.8)
                                broken = true
                            var nPad = new Pad(Math.random()*(canv.width-100),lastPad.y+nPadStep, broken);
                            game.pads.push(nPad);
                            game.pads[i].steped = true;
                            if(game.pads.length > 15)
                                game.pads.shift();
                            game.score++;

                        }
                    }
                }
            };

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
            this.vx = -0.75;
        }
        else
            this.vx -= 0.75;
        if(this.vx < -5)
            this.vx = -5;
    }
    this.moveRight = function(){
        if(this.vx < 0){
            this.vx = 0.75;
        }
        else
            this.vx += 0.75;
        if(this.vx > 5)
            this.vx = 5;

    }

}
    $(document).ready(function(){
        $("#history").hide();
        $(".showSc").hide();
        $(".showH").show();
        var hist = false;
        $("#showHistory").click(function(){
            $("#myScore").slideToggle("slow");
            $("#history").slideToggle("slow");
            if(!$(".showH").is(":visible")){
                $(".showSc").fadeToggle('slow', function() {
                    $(".showH").fadeToggle('slow');
                });
            }
            else{
                $(".showH").fadeToggle('slow', function() {
                    $(".showSc").fadeToggle('slow');
                });
            }

        });

        $("#restart").click(function(){
            var clientIP = '';
            
            $.getJSON("clientInfo.php",function(d){
                var data = {'nick':$("#inputScore").val(),'score':$("#numScore").html()};
                data['ip'] = d['ip'];
                data['resolution'] = window.screen.width + "x" + window.screen.height;

                if(data['nick'] == ""){
                    data['nick'] = 'Anonymous';
                }
                console.log(data);
                $.get("score.php",data).done(function(data){
                    console.log(data);
                    console.log('response');
                });
            });

            $("#score").fadeOut('slow');
            game.restart();
        });
    })
    
    // Start animation
    executeFrame();


})();