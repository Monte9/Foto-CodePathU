window.EM_YoutubePlayer = (function () {
    var globals = {
        isTransitionHandled : false,
        $scene : $()
    } //ensures handling only once in case a bug in the scene fires multiple transition done events
   
    //https://developers.google.com/youtube/iframe_api_reference
    function callPlayer($videoElement, func, args) {
        console.log(func);
        $videoElement.each(function () {
            this.contentWindow.postMessage(JSON.stringify({
                'event': 'command',
                'func': func,
                'args': args || []
            }), "*");
        });
    }

    function getVideoElementsFromSlide($slide) {
        return $slide.find('.sd-element-video');
    }

   
    function stopVideoPlayers() {
        //untill its possible to get a valid currentslide, stoppping all videos in all slides.
        var $videoElements = getVideoElementsFromSlide( /*$currentSlide*/ globals.$scene);
        $videoElements.attr('src', 'about:blank');
    }

  function onTransitionStart() {
      globals.isTransitionHandled = false;
     // stopVideoPlayers();
  }
  
    function onTransitionDone() {
        var $slide;
        try {
            if (globals.isTransitionHandled) {
                return; //don't handle twice
            }
            globals.isTransitionHandled = true;

            $slide = scene.getCurrentSlide();

            if (!$slide || !$slide.length) {
                return;
            }
             getVideoElementsFromSlide($slide).each(function () {
                    var src = this.getAttribute('data-src');
                    
                    if (!src) {
                        console.error('video element is missing a data-src attribute', this);
                        return; 
                    }

                    if (src.indexOf('enablejsapi=1') == -1) { //add jsapi param to old videos for retroactive support
                        src =  src + (src.indexOf('?') === -1 ? "?" : "&") + 'enablejsapi=1';
                    }

                    if (this.getAttribute('data-videoautoplay') === 'true' && src.indexOf('autoplay=1') === -1) { //add the autoplay param if needed
                        src += '&autoplay=1';
                    }
                    this.src = src;
                });

        } catch (e) {

            console.log(e);
            $.post("/present/logError", { source: "emaze.youtube-player.js/onTransitionDone", message: e });
        }
    }

    $(document).ready(function () {
        globals.$scene = $('#scene');

        globals.$scene.on('transitionDone', onTransitionDone);
        globals.$scene.on('transitionStart', onTransitionStart);

        // globals.$scene.on('beforeTransitionStart', stopVideoPlayers);  //for efficiency, reacivate this one once valid currentslide param is available
        //beforeTransitionStart
    });

    return {
      stopVideoPlayers: stopVideoPlayers
    }
})();