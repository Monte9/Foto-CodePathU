var scene = (function () {

    var ourDiv,
        $viewportDiv, //the div suppied by editor or player in which in scene runs. 
        $world, //the outermost container of the scene
        $fgBox,  //container for x number of bacground layer elements.
        $slideBox,  //container for slides, same size as slides.
        $currentSlide, //slide in view.       
        $bgBox,
        previous_slide_number = 0,
        scene_type = '2d', //2d, video
        templates = {
            world: '<div id="world">',
            fgBox: '<div id="fg-box">', // Foreground
            fgLayer: '<div class="fg-layer">',
            slideBox: '<div id="slide-box">', // Main slides
            slide: '<div class="slide">',        
            bgBox: '<div id="bg-box">', // Background
            bgLayer: '<div class="bg-layer">'
        };
    
    function init(viewportDivID) {
        clearParams(); // in case of editor=>player reset
        ourDiv = document.getElementById(viewportDivID);
        $viewportDiv = $('#' + viewportDivID);

        // Add #world div wrapping all layer containers
        $world = $(templates.world).appendTo($viewportDiv);
        
        // Add background if required
        if ( EM_theme.sceneSettings.background > 0 ){
            $bgBox = $(templates.bgBox).appendTo($world);

            for (var i = 0; i < EM_theme.sceneSettings.background; i++) {
                $bgBox.append(templates.bgLayer);
            }
        }

        // Add #slide-box div containing presentation slides
        $slideBox = $(templates.slideBox).appendTo($world);

        // Add foreground if required
        if ( EM_theme.sceneSettings.foreground > 0 ){
            $fgBox = $(templates.fgBox).appendTo($world);

            for (var i = 0; i < EM_theme.sceneSettings.foreground; i++) {
                $fgBox.append(templates.fgLayer);
            }
        }
        
        // Check for video scene
        if ( typeof EM_theme.sceneSettings.video != typeof undefined){
            scene_type = 'video';

            EM_theme.sceneSettings.video.transitions_set.forEach(function (t) {
                //previously, the transition in started after the transition out. now, they start at same time. 
                //adding the delay an duration out to the delay of in so that transition in starts after transition out in video tech, as expected and as previously configured
                //this also eliminates the need to tweak the numbers manuall each time a transition is being fine-tuned. 
                t.delayin += t.delayout + t.transout;
            });

            EM.videotech.init();
        }

        // Invoke theme custom function if defined
        if ( typeof EM_theme.customFunction === typeof(Function) ){
            EM_theme.customFunction();
        }

        var TO = false;
        $(window).resize(function (event) {
            if (this != event.target)
                return;
            if (TO !== false)
                clearTimeout(TO);
            TO = setTimeout(scale, 600); //200 is time in miliseconds
        });
        
        scale();
        setTimeout(scale, 1500); //to solve issue of scale not allways occuring when player is in iframe in mypresentations, happens with empty cache. there must be aracing condition here. 

        $('body').triggerHandler('loadfinished');
        
    };

    function clearParams() {
        ourDiv = null;
        $viewportDiv = null;
        $world = null;
        $fgBox = null;
        $slideBox = null;
        $bgBox = null;
        $currentSlide = null;
    }

    // Scale slide box in given world context
    function scale() {
        var margin = parseInt($slideBox.css('margin'));

        ourDiv.setAttribute("style", "");
        $slideBox.css('margin', '0');
        scaleElement($slideBox, $world, margin);
        centerInParent($slideBox);
    }

    function scaleElement($element, $context, margin) {
        margin = margin || 0;

        var w = $element.width(),
            h = $element.height(),
            dw = $context.width() - margin,
            dh = $context.height() - margin,
            widthDelta,
            heightDetla,
            minDelta,
            maxDelta,
            transform;

        widthDelta = dw / w;
        heightDetla = dh / h;
        minDelta = Math.min(widthDelta, heightDetla);

        transform = 'scale(' + minDelta + ',' + minDelta + ')';

        $element.css('-webkit-transform', transform);
        $element.css('-moz-transform', transform);
        $element.css('-ms-transform', transform);
        $element.css('-o-transform', transform);
        $element.css('transform', transform).attr('scale-factor', minDelta);
        
        return minDelta;
    }

    //centers absolutley positioned element in parent
    function centerInParent($element) {
        var $parent = $element.parent();
        var scaleFactor = $element.attr('scale-factor') || $('#slide-box').attr('scale-factor') || 1;
        var wdelta = $parent.width() - ($element.width() * scaleFactor);
        var hdelta = $parent.height() - ($element.height() * scaleFactor);
        
        $element.css({
            left: wdelta / 2 + 'px',
            top: hdelta / 2 + 'px'
        });
    }

    // Get slidebox bounding client rectangle (used by editor)
    function getSLideBoundingClientRect() {
        return $slideBox.get(0).getBoundingClientRect();
    }

    // Add slide to slide box using given HTML.
    // Return new slide count in convention with other scenes.
    function addSlide(html) {
        var $toAdd = $(html || ''),
            $slide;

        $slide = $toAdd.is('.slide') ? $toAdd : $(templates.slide).append($toAdd);
        
        if ( scene_type === 'video' ){
            var num_of_slide = $('#slide-box').children('.slide').length,
                total_stops = EM_theme.sceneSettings.video.stops.length,
                pos = num_of_slide % total_stops,
                trans_set = EM_theme.sceneSettings.video.transitions_set[pos];
            
            $slide.attr('data-trans-in-duration', trans_set.transin);
            $slide.attr('data-trans-out-duration', trans_set.transout);
            $slide.attr('data-trans-in-delay', trans_set.delayin);
            $slide.attr('data-trans-out-delay', trans_set.delayout); 
        }

        $slide
        .addClass('sd-slide-background-color_1') //Custom theme class
        .addClass('sd-slide-background-image_1') //Custom theme class
        .appendTo($slideBox);

        setPreEnters();
        
        // We got a single slide, lets set it to be the current slide
        if ( $slideBox.children('.slide').length === 1 ){
            $currentSlide = $slideBox.children('.slide');
        }

        $viewportDiv.trigger('slideAdded', [$slide]);
        return $slide.index() + 1;
    }

    // Remove requested slide by number
    function deleteSlide(slideNum) {
        getSlide(slideNum).remove();
        $viewportDiv.trigger('slideRemoved');
    }

    // Get requested slide by number, returned as jQuery object
    function getSlide(num) {
        return $( $slideBox.children()[num - 1] );
    }

    // Get the current slide as jQuery object
    function getCurrentSlide() {
        return $currentSlide ? $currentSlide : getSlide(1);
    }

    // Return current slide index as int; default is first slide
    function currentSlideNum() {
        //handle null and empty jquery object
        return !$currentSlide ? 0 : $currentSlide.index() + 1;
    }

    // Go to requested slide number, perform transition while doing so
    function goSlide(num) {
        var data = {};

        // There is no transition if going to the same slide
        if (currentSlideNum() == num) {
            $viewportDiv.trigger('beforeTransitionStart', [getSlide(currentSlideNum()), currentSlideNum()]);
            $viewportDiv.trigger('transitionStart', [num]);
            $viewportDiv.trigger('transitionDone', [num]);
            return;
        }

        $viewportDiv.trigger('beforeTransitionStart', [getSlide(currentSlideNum()), currentSlideNum()]);
        var $targetSlide = getSlide(num),
            back = false; // Assume we go forward

        // In case we started from other slide then the 1st
        if (!$currentSlide && num != 1){
            $currentSlide = getSlide(1);
        }

        // Check for the direction
        if ($currentSlide && num < $currentSlide.index() + 1) {
            back = true;
        }

        if ( typeof EM_theme.transition != typeof undefined && EM_theme.transition != false ){
            data = prepareTransitionDataObject(data, $currentSlide, $targetSlide, num, $viewportDiv);    
        }

        // Perform transition using transitions library, proxied using scene js.
        if ($currentSlide) {
            // Handle special scene transition handling
            if ( scene_type === 'video' && (back || (num - currentSlideNum() != 1 || $currentSlide.parents().is('#edit-area'))) ){
                data = disableTransitionInObject(data);
            }
            
            if (back){
                if ( ! $.isEmptyObject(data) ){
                    data.direction = 'backward';
                    EM.TransitionsLibrary.animate(data);
                } else {
                    EM_theme.goBackward($currentSlide, $targetSlide, num, $viewportDiv);
                }
            } else {
                if ( ! $.isEmptyObject(data) ){
                    data.direction = 'forward';
                    EM.TransitionsLibrary.animate(data);
                } else {
                    EM_theme.goForward($currentSlide, $targetSlide, num, $viewportDiv);
                }
            }
        }
        
        // currentSlide is now the requested target slide (transition performed)
        $currentSlide = $targetSlide;
    }

    // Does what it says
    function prepareTransitionDataObject (obj, $origin, $target, targetNum, $context) {
        obj.origin      = $origin;
        obj.target      = $target;
        obj.originNum   = currentSlideNum();
        obj.targetNum   = targetNum;
        obj.context     = $context;
        obj.effectIn    =  $target.attr('data-trans-in-effect')    ||  EM_theme.transition.in.effect;
        obj.effectOut   =  $origin.attr('data-trans-out-effect')   ||  EM_theme.transition.out.effect;
        obj.durationIn  = +$target.attr('data-trans-in-duration')  ||  +EM_theme.transition.in.duration; //adding + prefix to cast string to number. 
        obj.durationOut = +$origin.attr('data-trans-out-duration') ||  +EM_theme.transition.out.duration;
        obj.delayIn     = +$target.attr('data-trans-in-delay')     ||  +EM_theme.transition.in.delay;
        obj.delayOut    = +$origin.attr('data-trans-out-delay')    ||  +EM_theme.transition.out.delay;

        return obj;
    }
 
    function disableTransitionInObject (data) {
        data.effectIn = data.effectOut = 'cut';
        data.durationIn = data.durationOut = 0;
        data.delayIn = data.delayOut = 0;
 
        return data;
    }

    // Prepare scene slides corresponding current slide number
    function setPreEnters() {
        var current = 1;
        
        if ($currentSlide)
            current = ($currentSlide.index() + 1 > 0) ? $currentSlide.index() + 1 : 1;

        for (var i = 1; i <= $slideBox.children().length ; i++) {
            var $s = getSlide(i);
            
            if (i < current){
                $s.addClass('past');
                if ( $s.hasClass('future') )
                    $s.removeClass('future');
            }

            if (i > current){
                $s.addClass('future');
                if ( $s.hasClass('past') )
                    $s.removeClass('past');
            }
        }

    }

    // Set given HTML in requested slide
    function setSlideHTML(slideNum, html) {
        // Add .slide recognition same as add method
        var $toAdd = $(html || ''),
            $slide;

        getSlide(slideNum).html( $toAdd.is('.slide') ?  $toAdd.html() : html);
    }

    // Hide requested slide using hide-elements class (used by editor)
    function removeHTML(slideNum) {
        //not actually removing html, but keeping name for compatability with other scenes.
        getSlide(slideNum).addClass('hide-elements');
    }

    // Show requested slide using hide-elements class (used by editor)
    function restoreHTML(slideNum) {
        getSlide(slideNum).removeClass('hide-elements');
    }

    // Change slide position (used by editor)
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
        
        $viewportDiv.trigger('slideMoved', [$targetslide]);
        goSlide(toIdx);
    }

    // Insert slide in middle of slides context
    function insertSlide(slideNum, html) {
        var tempPlace = addSlide(html);
        if (tempPlace == slideNum)
            return;
        moveSlide(tempPlace, slideNum);
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

    function manualMove() {
        //empty function to prevent bugs when player calls this method.
        // TODO: have player check if method exists.
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
        centerInParent: centerInParent,
        insertSlide: insertSlide,
        setPreEnters: setPreEnters
    };

})();
