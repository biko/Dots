/**
 * @class This class defines all functionalities for how section
 * @author Sebastian Romero
 * 
 */


window.SectionStates = {
    'PLAYING' : 0,
    'PAUSED' : 1,
    'ERASED' : 2
  };

function Dots($, canvas){
  /** @type {String} Defines the path of the image */
  var mapImagePath = 'static/images/1m.png';
  var dataPaths = ['static/json/world.json', 
    'static/json/1m.json'];
  var patternImage;
  var processCanvas;
  var data = [];
  var pixelSize = 1;
  var scaleFactor = 2;
  var canvasSize;
  var context = canvas.getContext('2d');
  var shapes = [];
  var start;
  var state;
  var animationTimeout;
  var loadedScene = false;
  var ocupedPositions = [];
  var timeoutAnimation;


  /**
   * This method loads image into a temporary canvas so as to get image data
   * @return {Object} Image context
   */
  function createDrawCanvas(){
    if (!processCanvas){
      processCanvas = $('<canvas />').get(0);
      processCanvas.width = patternImage.width;
      processCanvas.height = patternImage.height;
    }
    processCanvas.getContext('2d').drawImage(patternImage, 0, 0, patternImage.width, patternImage.height);
    return processCanvas.getContext('2d');
  }



  /**
   * This method processes the image and returns its data representation
   * @return {Object}
   */
  function processMap(){
    var contextMap;
    var currentX = 0;
    var currentY = 0;
    var lineX = [];
    if (patternImage){
      contextMap = createDrawCanvas();
      while (currentY < patternImage.height) {
        lineX = [];
        while (currentX < patternImage.width) {
          var pixel = contextMap.getImageData(currentX, currentY, pixelSize, pixelSize).data;
          if (pixel[3] > 250){
            lineX.push(1);
          } else {
            lineX.push(0);
          }
          currentX = currentX + pixelSize;
        }
        console.log(lineX.length);
        data.push(lineX);
        currentX = 0;
        currentY = currentY + pixelSize;
      }
      console.log(JSON.stringify(data));
      draw();
      enterFrame();
    } else {
      throw new Error('Implementation error - The pattern image is not loaded.');
    }
  }


  function rand(first, second){
    return Math.floor(Math.random() * second) + first;
  }


  function draw(){
    if(canvas){
      var sizeItem;
      var marginMap;
      var marginFactor = 2;
      var shape;
      var index=0;
      if (!sizeItem){
        sizeItem = (canvasSize['width'])/600;
        sizeItem = sizeItem*scaleFactor;
      }
      if(shapes.length === 0){
        start = Date.now();
        marginMap = (canvasSize['height']-((sizeItem*data.length)/2));
        for(var y=0; y<data.length; y++){
          for (var x=0; x<data[y].length; x++){
            if (data[y][x] === 1){
              shape = new Shape(context, 
                x*(sizeItem/marginFactor), 
                (y*(sizeItem/marginFactor)) + (marginMap/2), 
                sizeItem/1.3);
              shape.setIndex(index);
              shape.setPosition();
              shapes.push(shape);
              index++;
            }
          }
        }
        //pause();
        play();
        data = null;
      } else {
        animate();
      }
    }
  }


  function animate(finalX, finalY){
    if (!data){
      data = ['0'];
      secondScene();
    }
    if (!loadedScene){
      $(shapes).each(function(index, shape){
        shape.move(shape.initialPosition().x, shape.initialPosition().y);
      });
      /*
      if (!timeoutAnimation){
        timeoutAnimation = setTimeout(function(){
          console.log(111);
          firstScene();
          timeoutAnimation = null;
        }, 5000);
      }
      */
    } else {
      var sizeItem;
      var marginMap;
      var marginFactor = 2;
      var count = 0;
      if (!sizeItem){
        sizeItem = (canvasSize['width'])/600;
        sizeItem = sizeItem*scaleFactor;
      }
      var targetEntity = shapes[0];
      marginMap = (canvasSize['height']-((sizeItem*data.length)/2));
      for(var y=0; y<data.length; y++){
        for (var x=0; x<data[y].length; x++){
          if (data[y][x] === 1){
            var dx = targetEntity.initialPosition().x - shapes[count].initialPosition().x;
            var dy = targetEntity.initialPosition().y - shapes[count].initialPosition().y;
            var distance = Math.sqrt( dx * dx + dy * dy );
            shapes[count].move(x*(sizeItem/marginFactor), 
              (y*(sizeItem/marginFactor)) + (marginMap/2), null, distance * 1.2);
            count++;
            ocupedPositions.push({
              'x':x*(sizeItem/marginFactor), 
              'y':(y*(sizeItem/marginFactor)) + (marginMap/2)
            });
          }
        }
      }
      if (count<shapes.length){
        var elementIndex = 0;
        $(shapes).each(function(index, shape){
          if (index>count){
            var dx = targetEntity.initialPosition().x - shape.initialPosition().x;
            var dy = targetEntity.initialPosition().y - shape.initialPosition().y;
            var distance = Math.sqrt( dx * dx + dy * dy );
            shape.move(ocupedPositions[elementIndex].x, 
              ocupedPositions[elementIndex].y, null, distance * .5);
            elementIndex++;
            if (elementIndex === count){
              elementIndex = 0;
            }
          }
        });
      }
      
    }
  }


  function firstScene(){
    $.getJSON(dataPaths[0], function(response) {
        if(response){
          data = response;
          loadedScene = true;
        }
    });
  }


  function secondScene(){
    $.getJSON(dataPaths[1], function(response) {
        if(response){
          data = response;
          loadedScene = true;
        }
    });
  }


  function clear(){
    context.clearRect(0, 0, canvasSize['width'], canvasSize['height']);
  }


  function adjustCanvasSize(){
    canvasSize = {
      'width':$(canvas).parent().width(),
      'height':$(canvas).parent().height()
    };
    $(canvas).css('width', canvasSize['width']);
    $(canvas).css('height', canvasSize['height']);
    $(canvas).attr('width', canvasSize['width'] * scaleFactor);
    $(canvas).attr('height', canvasSize['height'] * scaleFactor);
    if (context) {
      context.scale(scaleFactor, scaleFactor);
    }
  }


  function enterFrame(){
    if (state === SectionStates.PLAYING){
      clear();
      draw();
    }
    requestAnimFrame(enterFrame);
  }


  /**
   * This method loads the pattern image used for the map
   * @return void
   */
  function loadPatternImage(){
    patternImage = new Image();
    patternImage.addEventListener('load', function(){
      adjustCanvasSize();
      //processMap();
      $.getJSON(dataPaths[0], function(response) {
        if(response){
          data = response;
          draw();
          enterFrame();
        }
      });
      
    });
    patternImage.src = mapImagePath;

  }

  function play(){
    state = SectionStates.PLAYING;
  }


  function pause(){
    state = SectionStates.PAUSED;
  }


  function addEvents(){
    $( window ).on('orientationchange', function( event ) {
      clear();
      adjustCanvasSize();
    });
  }


  /** @constructor */
  (function(){
    loadPatternImage();
    addEvents();
  }());
  

  return {
    'play' : play,
    'pause' : pause
  }

};

function Shape(ctx, x, y, radius){

  var degrees = 0;
  var iteration = 0;
  var totalIterations = 50;
  var easingValue;
  var index; 
  var finalX;
  var finalY;
  var isMoving = false;
  var initialPos = {
    'x':0,
    'y':0
  };

  function draw(){
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
  }


  function move(valX, valY, finished, iterations){
    isMoving = true;
    if (iterations && totalIterations !== iterations){
      totalIterations = Math.round(iterations);
      if(totalIterations<=0){
        totalIterations = 1;
      } else if (totalIterations>80){
        totalIterations = 80;
      }
    }
    finalX = 0;
    finalY = 0;
    if(valX<initialPos.x){
      finalX = (initialPos.x - valX)*-1;
    } else if(valX>initialPos.x){
      finalX = valX - initialPos.x;
    }
    if(valY<initialPos.y){
      finalY = (initialPos.y - valY)*-1;
    } else if(valY>initialPos.y){
      finalY = valY - initialPos.y;
    }
    x = ease(iteration, initialPos.x, finalX, totalIterations);
    y = ease(iteration, initialPos.y, finalY, totalIterations);
    if (iteration < totalIterations) {
      iteration++;
    } else {
      iteration = 0;
      setPosition();
      isMoving = false;
      if(finished){
        finished(index);
      }
    }
    draw();
  }


  function hitTest(element){
    var distance = 0; 
    if (x < element.x()) {
      distance += Math.pow(x - element.x(), 2);
    } else if (x > element.x() + element.width()) {
      distance += Math.pow(x - element.x() - element.width(), 2);
    } 
    if (y < element.y()) {
      distance += Math.pow(y - element.y(), 2);
    } else if (y > element.y() + element.height()) {
      distance += Math.pow(y - element.y() - element.height(), 2);
    }
    return distance <= Math.pow(radius, 2);
  }


  function getX(){
    return x;
  }

  function getY(){
    return y;
  }

  function getSize(){
    return radius*2;
  }

  function setAngle(currX, currY, endX, endY){
    var angle = Math.atan2(currX - endX, currY - endY) * (180 / Math.PI);
    if (angle < 0) {
      angle = Math.abs(angle);
    } else {
      angle = 360 - angle;
    }
    return angle;
  }

  function ease(t, b, c, d, s) {
    if(!s){
      s=1.70158
    }
    if (t==0) return b;
    if (t==d) return b+c;
    if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
    return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
  }

  function setPosition(){
    initialPos['x'] = x;
    initialPos['y'] = y;
  }

  function initialPosition(){
    return initialPos;
  }


  function setIndex(indexValue){
    index = indexValue;
  }

  function getIndex(){
    return index;
  }


  (function(){
    draw();
  }());


  return {
    'draw' : draw,
    'move' : move,
    'x' : getX,
    'y' : getY,
    'width' : getSize,
    'height': getSize,
    'angle' : setAngle,
    'ease' : ease,
    'setPosition' : setPosition,
    'initialPosition' : initialPosition,
    'setIndex' : setIndex,
    'index' : getIndex
  };

};