

var EM = window['EM'] || {};

if (window['EM_Editor']) {

    var emazeApp = window['emazeApp'] || angular.module('emazeApp', []);


    emazeApp.controller('slideOptionsController', function ($scope) {

        $scope.scroll_x = false;
        $scope.scroll_y = false;
        $scope.autoPlay = false;
        $scope.stopDuration = 0;

        $scope.stopDurationAll = false;

        $scope.getSettings = function () {

            return { scroll_x: $scope.scroll_x, scroll_y: $scope.scroll_y, autoplay: $scope.autoPlay, stopduration: $scope.stopDuration };
        }

        $scope.setSettings = function (data) {
            $scope.$apply(function () {
                $scope.scroll_x = data.scroll_x || data.scroll; //backwards comp for when it was one property
                $scope.scroll_y = data.scroll_y || data.scroll; //backwards comp for when it was one property
                $scope.autoPlay = data.autoplay;
                $scope.stopDuration = data.stopduration;
                $scope.stopDurationAll = false;
            });
        }
    });
}

EM.slideOptions = (function(){

    var $scrollTarget; //the slide or edit surface that horzontal scroll feature is applied to
    var scroll_l; //left bound of scrollable area
    var scroll_r; //right bound of scrollable area
    
    function init() {
        attachEventHandlers();
    }

    function setScroll(data, $target) {
        if (data.scroll || (data.scroll_x && data.scroll_y)) {//both
            $target.removeClass("sd-page-scroll_y sd-page-scroll_x").addClass("sd-page-scroll"); 
        }else if(data.scroll_x) { //horizontal
                $target.removeClass("sd-page-scroll sd-page-scroll_y").addClass("sd-page-scroll_x");
        } else if (data.scroll_y) {  //vertical
            $target.removeClass("sd-page-scroll sd-page-scroll_x").addClass("sd-page-scroll_y");
        }else { //none
            $target.removeClass("sd-page-scroll sd-page-scroll_y sd-page-scroll_x");
        }
        
    }

    function animateHorizontalScroll(duration, targetVal) {
        console.log('animateHorizontalScroll');
        TweenLite.to($scrollTarget[0], duration/1000, { scrollTo: { x: targetVal } });
     
    }

    function scrollRight(e) {
        var x = window.innerWidth + 3 - e.pageX; //+ 3 to elimiate zero and small numbers
        var duration = (x * 30) + $scrollTarget[0].scrollWidth / 7;  //factor in the the distance we need to cover and allow more time for greater distances
        animateHorizontalScroll(duration, $scrollTarget[0].scrollWidth - $scrollTarget.width());
    }

    function scrollLeft(e) {
        var x = e.pageX + 3; //+ 3 to elimiate zero and small numbers
        var duration = (x * 30 ) + $scrollTarget[0].scrollWidth/7;  //factor in the the distance we need to cover and allow more time for greater distances
        animateHorizontalScroll(duration, 0);
    }


    function doScroll(e) {
        var x = e.pageX;

        scroll_l = $scrollTarget[0].getBoundingClientRect().left + 100;
        scroll_r = window.innerWidth - scroll_l;

        if (x < scroll_l) {
            scrollLeft(e);
        } else if (x > scroll_r) {
            scrollRight(e);
        } else {
            endScroll();
        }
    }

    function endScroll() {
        TweenLite.killTweensOf($scrollTarget[0]);
    }

    function toggleHorizontalScroll(isScroll, $target) {

        if (!$target || !$target.length) {
            console.error('invalid $target', $target);
            return;
        }
         if($target.css('overflow-x') === 'hidden'){

             isScroll =false;
         }

        $scrollTarget = $target; //external scope var to be acessed in mouse move events
        scroll_l = $scrollTarget[0].getBoundingClientRect().left + 100;
        scroll_r = window.innerWidth - scroll_l;
       
        if (isScroll && $target[0].scrollWidth > $target.width()) { 
            $(document).on('mousemove', doScroll);
        } else {
            $(document).off('mousemove', doScroll);
        }
    }

    function saveSettingsToSlide() {
        var scope = EM.slideOptionsControllerScope();
        var settings = scope.getSettings();

        var $allSllides = $('#slide-container .slide');

        EM_SlideManager.getSelectedSlide().data(settings).attr({ 'data-scroll_x': settings.scroll_x, 'data-scroll_y': settings.scroll_y, 'data-autoplay': settings.autoplay, 'data-stopduration': settings.stopduration }).removeAttr('data-scroll').removeData('scroll'); //remove depreciated property

        if (scope.stopDurationAll) {
            $allSllides.each(function () {
                $(this).data('stopduration', settings.stopduration).attr('data-stopduration', settings.stopduration);

            });
        }
        setScroll(settings, EM_Document.$editSurface[0]);
        EM_Menu.setSavedStatus(false);
    }

    function loadSettingsFromSlide() {
        EM.slideOptionsControllerScope().setSettings(EM_SlideManager.getSelectedSlide().data());
    }

    function attachEventHandlers() {
        $('#slide-options-form').emazeDialog('init', { title: 'Slide Options', okText: 'APPLY', okFunc: saveSettingsToSlide, cssClass: 'slide-options' });

        $('#slide-container').on('click', '.menu-slide', function () {
            loadSettingsFromSlide();
            $('#slide-options-form').emazeDialog('show');

            $("#scene").one('transitionStart', function () { //hide the dialog if user changes slide
                $('#slide-options-form').emazeDialog('close');
            });
        });

    }

    return {
        init: init,
        loadSettingsFromSlide: loadSettingsFromSlide,
        setScroll: setScroll,
        toggleHorizontalScroll: toggleHorizontalScroll,
        animateHorizontalScroll: animateHorizontalScroll
    }

})();







