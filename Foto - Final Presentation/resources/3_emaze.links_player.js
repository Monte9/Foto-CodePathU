var EM = EM || {};

EM.links = (function () {

    var isSameSlide = false;//Indicating if target is on same slide or not

    function scrollToTarget($link) {
        var selector = '#scene [data-element-link-id="' + $link.attr('href').substring(1) + '"]';
        var $target = $(selector).first();

        if ($target && $target.length) {
            scrollIntoView($target, $target.closest('.slide'));
        }
        
    }


    function scrollIntoView($target, $slide) {
        var $parent = $slide,
            top = parseInt($target.css('top')),
            left = parseInt($target.css('left')),
            height = $target.height(),
            width = $target.width(),
            pWidth = $parent.width(),
            pHeight = $parent.height(),
            destLeft, destTop; // the destination values for scroll left and top of the parent

        // if element does not overfow on an axis, scroll to zero for that axis;
        destTop = top + height / 2 - pHeight / 2;
        destLeft = left + width / 2 - pWidth / 2;

        // Using jQuery.animate on scroll doesn't get to finish animation
        // for some odd reason, simple solution is now set instead.
        // Animating Top and left seperatly since calculations
        // will be different considering destenation
        scrollToTop($('.current-active-slide')[0], destTop, 1000);
        scrollToLeft($('.current-active-slide')[0], destLeft, 1000);

        // Add zoomOutIn effect on same slide
        if ( isSameSlide ){
            // Adding zoom effect to any template which defined zoomOnTarget class
            $('.current-active-slide').children().addClass('zoomOnTarget');
            setTimeout(function () {
                $('.current-active-slide').children().removeClass('zoomOnTarget');
            }, 1000);
        }

    }

    function goToElementInSlide(e) {
        var $this = $(this);
        var slideNum = parseInt($this.attr('data-element-link-slide-num'));
        if (slideNum) {
            if (slideNum != scene.currentSlideNum()) { //go to slide, then go to link one slide is ready
                
                isSameSlide = false;

                $('#scene').one('transitionDone', function () {
                    scrollToTarget($this);
                });
                EM.player.goToSlide(parseInt(slideNum));

            } else { //link and element and in same slide, so need for goslide
                isSameSlide = true;
                scrollToTarget($this);
            }
        } else {
            //todo: handle erorr
        }
        e.preventDefault();
    }

    $(document).ready(function () {
        $(document.body).on('click', '.sd-element-link', goToElementInSlide);
    });


    /*** Utilities ***/

    // Scrolling to left using vanilla js
    function scrollToLeft(element, to, duration) {
        var start = element.scrollLeft,
            change = to - start,
            currentTime = 0,
            increment = 20;
            
        var animateScroll = function(){        
            currentTime += increment;
            var val = Math.easeInOutQuad(currentTime, start, change, duration);
            element.scrollLeft = val;
            if(currentTime < duration) {
                setTimeout(animateScroll, increment);
            }
        };
        animateScroll();
    }

    // Scrolling to top using vanilla js
    function scrollToTop(element, to, duration) {
        var start = element.scrollTop,
            change = to - start,
            currentTime = 0,
            increment = 20;
            
        var animateScroll = function(){        
            currentTime += increment;
            var val = Math.easeInOutQuad(currentTime, start, change, duration);
            element.scrollTop = val;
            if(currentTime < duration) {
                setTimeout(animateScroll, increment);
            }
        };
        animateScroll();
    }

    //t = current time
    //b = start value
    //c = change in value
    //d = duration
    Math.easeInOutQuad = function (t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    };

    return {
        scrollToTarget: scrollToTarget
    }

})();