var EM = EM || {};

EM.Media = (function () {

    var enabled = false;


    function slideEnter() {
        var $slide;
        try {

        
        if (!enabled) {
            return;
        }

        $slide = scene.getCurrentSlide();

        if (!$slide || !$slide.length) {
            console.warn('no slide returned by scene.getCurrentSlide() function');
            return;
        } 
      
        $slide.find('video').each(function () {
            var $this = $(this);
            var dataSrc = $this.attr('data-src');
            var src = $this.attr('src');
           this.autoplay = $this.attr('data-mediaautoplay') === 'true';
           this.preload = "auto";
          
           if (!src && dataSrc) {
                this.src = dataSrc;
           }else {
                //TODO: report error
            }
        });

        } catch (e) {
            console.error(e);
        }
    }
    function allVideosInTarget(e) {
        var $target = $(e.target);
        return $target.filter('video').add($target.find('video'));
    }

    function loadVideo() {
        var dataSrc = this.getAttribute('data-src');
        if (dataSrc && !this.getAttribute('src')) {
            this.src = dataSrc;
        }
    }

    function unloadVideo() {
        var src = this.getAttribute('src');
        if (src) {
            this.pause();
            this.setAttribute('data-src', src);
            this.src = "";
            this.load();
        }
    }

    function loadVideosOnInsert(e) {
        allVideosInTarget(e).each(loadVideo);
    }
   
    function unloadVideosOnRemoval(e) {
        allVideosInTarget(e).each(unloadVideo);
    }

    function implementChromeVideoUnloadFix() { //checking in scene manager if there are videos in the presentation so as not to burned presentations that do not have videos with this expensive event handler.

        $(document).off('DOMNodeInserted', loadVideo).off('DOMNodeRemoved', unloadVideo);

        if (window.EM && EM.scenemanager && EM.scenemanager.optimizer && EM.scenemanager.optimizer.hasVideos && $('body').is('.chrome')) {//http://stackoverflow.com/questions/3258587/how-to-properly-unload-destroy-a-video-element
            $(document).on('DOMNodeInserted', loadVideosOnInsert).on('DOMNodeRemoved', unloadVideosOnRemoval); //removing event handlers before adding to prevetn adding multiple times upon reload in editor.
        }
    }

    $(window).on('sceneReady', function () {
        $('#scene')
           .on('transitionDone', slideEnter)
           .on('transitionStart', stopAllMedia) //stop all videos/audio from playing in other slides
           .on('click', '.slide video', function () {
            if(this.paused) {
                this.play();
            }else {
                this.pause();
            }
        });

        implementChromeVideoUnloadFix();

    });


    //stops mp3 and mp4 files from playing inside of the sd-element-media elements
  

    function stopAllMedia() {
        $('video.sd-element-media').each(unloadVideo);
    }

    function toggleEnabled(isEnabled) {
        enabled = isEnabled;
    }

    return {
        stopAllMedia: stopAllMedia,
        toggleEnabled: toggleEnabled
    }

})();
