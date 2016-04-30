var scene = (function () {

    var config = {
        layers: 3
    };

    var ourDiv;

    var currentTimeout;
    var $currentElement;
    var isIpad = navigator.userAgent.match(/iPad/i) != null;
    var $viewportDiv; //the div suppied by editor or player in which in scene runs. 
    var $world; //the outermost container of the scene
    var $layerbox;  //container for x number of layer elements. 
    var $slideBox;  //container for slides. same size as slides.
    var $currentSlide; //slide in view.    
    var $bgBox;
    var $bgLayers;
    var templates = {
        world: '<div id="world">',
        layerbox: '<div id="layer-box">',
        layer: '<div class="layer">',
        slideBox: '<div id="slide-box">',
        slide: '<div class="slide_g">',
        bgBox: '<div id="bg-box">',
        bgLayer: '<div class="bg-layer">'
    };

    function init(viewportDivID) {
        clearParams(); // in case of editor=>player reset
        ourDiv = document.getElementById(viewportDivID);
        $viewportDiv = $('#' + viewportDivID);
        $world = $(templates.world).appendTo($viewportDiv);
        $layerbox = $(templates.layerbox).appendTo($world);
        $layerbox.addClass('fallback-background');
        $slideBox = $(templates.slideBox).appendTo($world);
        $bgBox = $(templates.bgBox).appendTo($world);

        $viewportDiv.css({ height: $viewportDiv.parent().height + 'px', width: $viewportDiv.parent().width + 'px' });

        var TO = false;
        $(window).resize(function (event) {
            if (this != event.target)
                return;
            if (TO !== false)
                clearTimeout(TO);
            TO = setTimeout(scale, 600); //200 is time in miliseconds
        });

        for (var i = 0; i < config.layers; i++) {
            $(templates.layer).appendTo($layerbox);
        }

        scale();

        loadFinished();

    };

    //TODO make more intelligent
    function loadFinished() {
        $('body').triggerHandler('loadfinished');

    }


    function scale() {
        // in any case, do not use in iPad
        if (navigator.userAgent.match(/MSIE 9/i) != null)
            centerScale();
        else // somehow works better in ipad
            oldScale();

    }

    function insertSlide(slideNum, html) {
        var tempPlace = addSlide(html);

        if (tempPlace == slideNum)
            return;

        moveSlide(tempPlace, slideNum);

    }

    function centerScale() {
        // older version, doesn't work in explorer for some reason
        var wW = ourDiv.parentNode.offsetWidth;
        var wH = ourDiv.parentNode.offsetHeight;

        wW = window.innerWidth;
        wH = window.innerHeight;

        var scaler = Math.min(wW / 1920, wH / 1080); // original screen was designed in full HD Chrome
        var w = wW / scaler;
        var h = wH / scaler;
        var left = (w - scaler * w) / 2 - (w - 1920) / 2 * scaler;
        var top = (h - scaler * h) / 2 - (h - 1080) / 2 * scaler;


        //var style = "width:" + w + "px; height:" + h + "px;" + allStyles("-webkit-transform:  scale(" + scaler + ");");
        var style = "width:" + w + "px; height:" + h + "px;" + allStyles("-webkit-transform:  translate(-" + left + "px,-" + top + "px) scale(" + scaler + ");");

        ourDiv.setAttribute("style", style);

    }

    // should get a line with a single webkit command, and will multiply it and add other extensions
    function allStyles(style) {
        var styles = style;
        styles += " " + style.replace(/webkit/g, "moz");// mozilla
        styles += " " + style.replace(/webkit/g, "ms");// Microsoft Explorer
        styles += " " + style.replace(/webkit/g, "o");// Opera
        styles += " " + style.replace(/-webkit-/g, "");// generic

        return styles;
    }

    //old scale function
    function oldScale() {
        ourDiv.setAttribute("style", ""); // might cause problems with future scenes? maybe better do it somehow in the css
        $slideBox.css('margin', '0');

        var margin = parseInt($slideBox.css('margin'));
        scaleElement($slideBox, $world, margin);
        centerInParent($slideBox);
    }

    function getSLideBoundingClientRect() {
        return $slideBox.get(0).getBoundingClientRect();

    }

    //centers absolutley positioned element in parent
    function centerInParent($element) {
        var $parent = $element.parent();
        var scaleFactor = $element.attr('scale-factor') || 1;  //TODO use boundingclientrect instead of scalefactor
        var wdelta = $parent.width() - ($element.width() * scaleFactor);
        var hdelta = $parent.height() - ($element.height() * scaleFactor);

        $element.css({
            left: wdelta / 2 + 'px',
            top: hdelta / 2 + 'px'
        });

    }

    function scaleElement($element, $context, margin) {
        margin = margin || 0;

        var w = $element.width(),
            h = $element.height(),
            dw = $context.width() - margin,
            dh = $context.height() - margin,
            widthDelta,
            heightDelta,
            minDelta,
            maxDelta,
            transform;

        widthDelta = dw / w;
        heightDelta = dh / h;
        minDelta = Math.min(widthDelta, heightDelta);

        transform = 'scale(' + minDelta + ',' + minDelta + ')';

        $element.css('-webkit-transform', transform).attr('scale-factor', minDelta);
        $element.css('-moz-transform', transform).attr('scale-factor', minDelta);
        $element.css('-ms-transform', transform).attr('scale-factor', minDelta);
        $element.css('transform', transform).attr('scale-factor', minDelta);

        return minDelta;

    }

    function addSlide(html) {

        var $slide = $(html || '');
        var $bgLayer;

        $slide.addClass('slide-wrapper');
        $slide.addClass('slide-image');
        $slide.addClass('current-active-slide');

        $slide.appendTo($slideBox);

        $bgLayer = $(templates.bgLayer).appendTo($bgBox);

        $slide.data('bgLayer', $bgLayer);

        $bgLayers = $('.bg-layer');

        return $slide.index() + 1; //return new slide count in convention with other scenes.
    }

    function removeSlide() {
        $slideBox.empty();
    }

    function currentSlideNum() {
        return EM.player.getSlideNumber();

    }

    //slides are not zero indexed
    function getSlide(num) {
        return $($slideBox.children()[num - 1]);

    }

    function withBgLayer($slide) {
        return $slide.add($slide.data('bgLayer'));

    }

    function goSlide(num) {

        var $targetSlide = EM.scenemanager.getSlideByPosition(num - 1);

        $targetSlide = $targetSlide.replace('class="slide"', 'class="slide_g"');

        removeSlide();

        for (var i = 0; i < num - 1; i++) {
            $slideBox.append('<div></div>')
        };

        $currentSlide = $targetSlide;

        $viewportDiv.trigger('transitionStart', [num - 1]);

        addSlide($currentSlide);

        endTransition();
    }

    function getTransitionTime($element) {
        return 1;

        if (!$element) {
            console.warn("scene getTransitionTime function recevied empty element");
            return 0;
        }

        var duration = parseInt($element.css('-webkit-transition-duration') || $element.css('-moz-transition-duration') || $element.css('transition-duration') || $element.css('ms-transition-duration'));
        var delay = parseInt($element.css('-webkit-transition-delay') || $element.css('-moz-transition-delay') || $element.css('transition-delay') || $element.css('ms-transition-delay'));

        return duration + delay;

    }

    function delayTranstionDone(delay, $element) {
        $currentElement = $element;

        currentTimeout = setTimeout(function () {
            endTransition($element);
            $currentElement = null;
            currentTimeout = null;
        }, delay);

    }

    function resetClass($element) {
        if (!$element) {
            return;
        }

        withBgLayer($element).addClass('hide').removeClass('exit_g').addClass('pre-enter_g').removeClass('hide');

    }

    function endTransition($element) {
        $viewportDiv.trigger('transitionDone');

    }

    function setSlideHTML(slideNum, html) {
        getSlide(slideNum).html(html);

    }

    function removeHTML(slideNum) {
        getSlide(slideNum).addClass('hide-elements');

    }

    function restoreHTML(slideNum) {
        getSlide(slideNum).removeClass('hide-elements');

    }

    function rewind() {
        goSlide(1);

    }

    function nextSlide() {
        goSlide(currentSlideNum() + 1);

    }

    function prevSlide() {
        goSlide(currentSlideNum() - 1);

    }

    function moveSlide(fromIdx, toIdx) {
        var $targetslide = getSlide(fromIdx);

        if ($targetslide && $targetslide.length === 1) {
            if (toIdx === 1) {
                $slideBox.prepend($targetslide);
            } else if (toIdx < fromIdx) {
                getSlide(toIdx).before($targetslide);
            } else {
                getSlide(toIdx).after($targetslide);
            }
        }

        resetBgLayers();

    }

    function resetBgLayers() {
        $bgLayers = $bgLayers || $bgBox.find('.bg-layer');

        $slideBox.find('.slide_g').each(function (index) {
            $(this).data('bgLayer', $($bgLayers[index]));
        });

    }


    function deleteSlide(slideNum) {
        withBgLayer(getSlide(slideNum)).remove();

    }

    function manualMove() {
        //empty function to prevent bugs when player calls this method. TODO: have player check if method exists.
    }

    function clearParams() {
        ourDiv = null;
        currentTimeout = null;
        $currentElement = null;
        isIpad = navigator.userAgent.match(/iPad/i) != null;
        $viewportDiv = null;
        $world = null;
        $layerbox = null;  //container for x number of layer elements. 
        $slideBox = null;  //container for slides. same size as slides.
        $currentSlide = null; //slide in view.  
        $bgBox = null;
        $bgLayers = null;
    }

    function isFallback() {
        return true;
    }

    function getCurrentSlide() {

        return $currentSlide;
    }

    return {
        init: init,
        addSlide: addSlide,
        currentSlideNum: currentSlideNum,
        getCurrentSlide: getCurrentSlide,
        goSlide: goSlide,
        rewind: rewind,
        nextSlide: nextSlide,
        prevSlide: prevSlide,
        setSlideHTML: setSlideHTML,
        removeHTML: removeHTML,
        restoreHTML: restoreHTML,
        moveSlide: moveSlide,
        manualMove: manualMove,
        getSLideBoundingClientRect: getSLideBoundingClientRect,
        deleteSlide: deleteSlide,
        resizeWinner: scale,
        insertSlide: insertSlide,
        isFallback: isFallback
    };


})();


$(document).triggerHandler('generic-scene-ready');  //scene.init can now safely be called.