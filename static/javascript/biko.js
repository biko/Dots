;(function($, window){

  $(function(){

    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          function( callback ){
            window.setTimeout(callback, 1000/60);
          };
    })();

    /**
     * Main Controller for the site
     */
    window.Biko = function(){
      var howSection;
      var dotsCanvas = $('#dots-canvas');



      function howSectionActions(){
        dotsCanvas.attr({
          'height' : $(window).height() - 200
        });
      }



      /** @constructor */
      function init(){
        howSectionActions();
        howSection = new Dots($, dotsCanvas.get(0));
      }
      
      init();

    }();

    
  });
}(jQuery, window));