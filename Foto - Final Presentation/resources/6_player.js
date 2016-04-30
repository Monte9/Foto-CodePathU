
var EM = EM || {};
EM.player = (function ($) {

    // Globals
    var firstLoad = true, //indicate if player loaded already or not
        isEventServer = true, // if 'True' it's mean that works event server, if 'False' - works Local Event Server (change by hand)
        pastSlideNumber = 0,
        presentSlideNumber = setSlideNumberFromURL(), //Set hash value if exists as slide num, 1 if not
        sectionsSize = 0, //total number of sections - set in sceneIsReady()
        slidesSize = 0, //total number of slides - set in sceneIsReady()
        slidedeck = null, //slidedeck object, init when scene is ready
        $currentSlide = null,
        isAutoplay = false, //permission to autoplay
        isPlaying = false, //show if autoplay active,
        isAutoplayButtonClicked = false,
        defaultStopDuration = 4, //default duration in autoplay   **IMPORTANT:  if thisis ever changed it must also be changed in  apicontroller/getPresentationLength
        isFullscreen = false,
        showingSections = false, //does the sections screen showing
        hash = window.location.hash, //keep hash parameters
        timeout = null, //GUI hide timeout
        mouseThreshold = 0,
        infoTimeout = null,
        isReload = false, //Are we in reload process
        isSharePopUpShowing = false, //Does the social share pop up showing
        limitShowInDesktop = false,
        viewDurationStart = 0,
        prevSlideNumberForAnalytics = 0,
        keyusername = null,
        keyusernameflag = false,
        isOfflineAnalytics = false, 
        OFFLINE_ANALYTICS_KEY = presentationId + '_offline_analytics',
        context = { //where the player window is playing
            isStandalone: false,
            isPresentationPage: false,
            isEditor: false,
            isMyPres: false,
            isDownload: false,
            init: function () {
                try {
                    if (window.parent === window) {
                        this.isStandalone = true;
                    } else if (isPresentationPage()) {
                        this.isPresentationPage = true;
                    }
                    else if (window.parent.EM_MyPresentations) {
                        this.isMyPres = true;
                    } else if (window.parent.EM_Editor) {
                        this.isEditor = true;
                    }
                } catch (e) {
                    //error here is a way of determening that its an embedded player outside of emaze.
                }

                this.isDownload =  $('html').data('download') === true;
            }
        },
        options = {
            navigateViaHashChange : true
        }

    if (EM.compatibility.getDevice() == 'mobile' || EM.compatibility.getDevice() == 'tablet') {
        options.navigateViaHashChange = false;
    }
    

    function browserPrefix(prop, val) {
        var result = {};
        ['-webkit-', '-moz-', '-ms-', ''].forEach(function (prefix) {
            result[prefix + prop] = val;
        });
        return result;
    }

     function setScale($element, scaleFactor) {
         $element.css(browserPrefix('transform', 'scale(' + scaleFactor + ')'));
     }

    // user info from url for Analytics

     function GetUserName() {
         var keyUN = GetParameterFromUrl('kun0|');

         if (keyUN != null) {
             $.post("/present/ConvertUserName", { key: keyUN }, function (result) {
                 keyusername = result;
                 keyusernameflag = true;
             });
         }
     }
     function GetParameterFromUrl(sParam) {
         var lenParameter = sParam.length;
         var sPageURL = window.location.search.substring(1);
         var hasQind = sPageURL.indexOf("?");
         if (hasQind != -1) {
             sPageURL = sPageURL.substring(0, hasQind);
         }
         var sURLVariables = sPageURL.split('&');
         var start = sParam;
         var end = start.indexOf('kun0|') != -1 ? reverse(sParam) : null;
         var i;
         if (end != null) {
             for (i = 0; i < sURLVariables.length; i++) {
                 if (sURLVariables[i].indexOf(start) != -1 && sURLVariables[i].indexOf(end) != -1) {
                     var len = sURLVariables[i].length;
                     var temp = sURLVariables[i].substring(0, len - lenParameter);
                     return temp.substring(lenParameter);
                 }
             }
         } else {
             for (i = 0; i < sURLVariables.length; i++) {
                 if (sURLVariables[i].indexOf(start) != -1) {
                     return sURLVariables[i];
                 }
             }
         }

         return null;
     }

     function reverse(s) {
         var o = '';
         for (var i = s.length - 1; i >= 0; i--)
             o += s[i];
         return o;
     }
    //Get user name before sending analytic event
     GetUserName();

    // End info of user from url

    /*** Public methods***/

    // initialize player
     function init ( id ){

         context.init();

         // Set enable for auto play for media elements
         EM.Media.toggleEnabled(true);

         if (!context.isDownload && EM.compatibility.getDevice() != "tablet" && EM.compatibility.getDevice() != "mobile") {
             /*** Set listeners ***/
             $(window).on('presentationObjectReady', setPlayerSidebarButtons);
             $(window).on('presentationObjectReady', setPlayerGUIbyDevice);
         }

         

         //reload the player in http mode if clicking on non https iframe in https mode
         if (window.location.href.indexOf('https://') !== -1) { 

            $('#scene').on('click', '.embed-wrapper', function () {
                if ($('.sd-element-embed[src*="http://"]', this).length) { //if this wrapper contains an hhtp iframe
                    if (context.isPresentationPage) {
                        window.parent.postMessage('reloadAsHttp', '*');
                    } else if (context.isEditor) {
                        window.top.location.href = window.top.location.href.replace('https://', 'http://');
                    } else {
                        window.location.href = window.location.href.replace('https://', 'http://');
                    }
                }
            });
            
         }

         // scene-manager is done and the scene is ready to be played
         $(window).on('sceneReady', sceneIsReady);

         if (context.isEditor || context.isPresentationPage) {
            
             $(window).one('sceneReady', function () {
                 try {
                     window.parent.postMessage('playerReady', '*');
                 } catch (e) {
                     console.log(e);
                     //TODO send error to logger in server;
                 }
             });
         }

         // unload handler for slideEvent
         $(window).unload(function () {
             if (!context.isEditor && viewDurationStart !== 0) {
                 var viewDurationEnd = new Date(),
                     totalSlideViewDuration = Math.round((viewDurationEnd - viewDurationStart) / 1000);

                 sendEventSlideClose(prevSlideNumberForAnalytics, totalSlideViewDuration);
                 sendEventClosePresentation();
             }
             return "Bye now!";
         });

         // perform action when hash changes
         $(window).on('hashchange', stateCalled);

         // Implement slide settings if exist on $currentSlide
         $('#scene')
         .on('transitionStart', checkSlideAutoplay)
         .on('transitionDone', checkSlideScroll)
         .on('transitionDone', enableHeavyContent)
          .on('transitionDone', sendSlideChangeAnalytics);

         if (!context.isDownload) {
             $('#scene').on('transitionDone', redrawCharts);

             //patch to remove the redraw charts event handler of transiton doen in zoomer chrome because in some zoomer themes redrawing the charts causes the entire slide to disappear.
             $('#scene').one('transitionStart', function () {
                 var isVideoTheme = window.EM_theme && EM_theme.sceneSettings && EM_theme.sceneSettings.video,
                     isZoomer = window.zoomerInit;
                 if (EM.compatibility.getBrowser().indexOf('chrome') !== -1 && (isVideoTheme || isZoomer)) {
                     $('#scene').off('transitionDone', redrawCharts);
                 }
             });
         }

         // Player control
         if (EM.compatibility.getDevice() != "tablet" && EM.compatibility.getDevice() != "mobile") {
             $('.playButton').on('click', playWrap);
         }
         
         $('.leftButton').on('click', prev);
         $('.rightButton').on('click', next);
         //$('.voiceButton').on('click', voiceControl);
         $('.sectionsButton').on('click', sectionsScreen);
         $('.fullscreenButton').on('click', fullScreen);

         // Share popup
         $('.replay').on('click', rewind);

         // Set keyboard control listener
         $(window).on('keydown', onKeyPress);

         // Init the Scene
         EM.scenemanager.init( id );
        

         if (context.isDownload) {
             $('<div id="offline-analytics-indicator"><span class="text">Sync Data</span><span class="icon sync"></span></div>').insertAfter("#buttonsPanel").click(sendOffLineAnalytics);
             if (getOfflineAnalytics()) {
                 $('#offline-analytics-indicator').addClass("on");
                 sendOffLineAnalytics(); //send any offline analyics that may have been gathered previously
             }
         }
     
    }

    // Go to a specific slide number
    function go ( targetSlideNumber ) {
        presentSlideNumber = targetSlideNumber;
        updateState();
    }


    // Letting us know if autoplay initiated alone or by user action
    function playWrap () {
        ( isAutoplayButtonClicked && isAutoplay) ? isAutoplayButtonClicked = false : isAutoplayButtonClicked = true;
        play();
    }

    // Autoplay presentation
    function play () {
        if ( isAutoplay ){
            isAutoplay = false;
            stopAutoplay();
            $('.pauseButton').removeClass('pauseButton').addClass('playButton');
        } else {
            try {
                window.dispatchEvent( new CustomEvent('start', { 'detail': 'presentation_autoplay_started' }) );    
            } catch(e){

            }
            isAutoplay = true;
            startAutoplay();
            $('.playButton').removeClass('playButton').addClass('pauseButton');
        }

    }

    // Go to the next slide
    function next () {
        // Don't exceed total number of slides
        if ( presentSlideNumber + 1 > slidesSize ) {
            // Report end of presentation to who's interested
            try {
                window.parent.postMessage('presentationEnded', '*');
                window.dispatchEvent(new CustomEvent('presentationEndedOpenShare', { 'detail': 'presentation_ended' }));
            } catch (e) {
                console.log(e);
                //TODO send error to logger in server;
            }

            // show the share pop up only if user triggered next
            if ( !isAutoplay ) showSharePopUp();
            
            presentSlideNumber = slidesSize;
        } else {
            presentSlideNumber++;
        }

        updateState();

    }
    
    // Go to the previous slide
    function prev () {
        
        if ( isSharePopUpShowing ){
            hideSharePopUp();
            return;
        }

        // Limit slide number to 1
        if ( presentSlideNumber - 1 < 1 ) {
            presentSlideNumber = 1;
        } else {
            presentSlideNumber--;
        }

        updateState();

    }

    // Register voice commands and trigger voice control on/off
    //function voiceControl(){
    //    if (annyang) {
    //        // Commands action
    //        var commands = {
    //            'next': function () {
    //                next();
    //            },
    //            'back': function () {
    //                prev();
    //            },
    //            'agenda': function () {
    //                sectionsScreen();
    //            },
    //            'slide': function () {
    //                sectionsDisplaySlides();
    //            },
    //            'close': function () {
    //                hideSectionsFrame();
    //            },
    //            'play': function () {
    //                playWrap(); //changed on 23/7/15 used to be  set to 'play()' but that only worked for one slide
    //            },
    //            'stop': function () {
    //                play();
    //            },
    //            'amaze': function () {//emaze parsed to amaze/amazed usually
    //                play();
    //                hideGUI();
    //            },
    //            'amazed': function () {//emaze parsed to amaze/amazed usually
    //                play();
    //                hideGUI();
    //            }

    //        };

    //        // Initialize annyang with the commands
    //        annyang.init(commands);
            
    //        // Make sure commands were added, might be issue with init this ver
    //        annyang.addCommands(commands);

    //        var $status = $('.voiceButton').attr('data-listen');

    //        if ( $status === "false" ){
    //            // Start listening.
    //            annyang.start({ autoRestart: false });
    //            $('.voiceButton').attr('data-listen', 'true');
    //            $('.voiceButton').addClass('buttonVoiceOn').addClass('voice-active');

    //            annyang.addCallback('end', function () {
    //                annyang.abort();
    //                $('.voiceButton').attr('data-listen', 'false'); 
    //                $('.voiceButton').removeClass('buttonVoiceOn').removeClass('voice-active');
    //            });
    //        } else {
    //            annyang.abort();
    //            $('.voiceButton').attr('data-listen', 'false'); 
    //            $('.voiceButton').removeClass('buttonVoiceOn').removeClass('voice-active');
    //        }
    //    }
    //}

    // Triggers sections screen, "Agenda"
    function sectionsScreen() {
        if ( isAutoplay ){
            play();//Stop autoplay if active
        }
        
        if ( !showingSections ){
            buildSectionsScreen();
            $("#sectionsFrame").css("visibility", "visible");
            showingSections = true;
        } else{
            $("#sectionList").add('#sectionsTitle').empty();
            $("#sectionsFrame").css("visibility", "hidden");
            showingSections = false;
        }
        
    }

    function riseScroll(interval, max) {
        if (interval < max) {
            setTimeout(function () {
                window.scrollTo(0, interval);
                interval = interval + 10;
                riseScroll(interval, max);
            }, 100);
        } else {
            return;
        }
    }

    // Turn on/off fullscreen mode
    function fullScreen () {
        var localStorageVal;
        // emaze viewer fullscreen handling
        if (typeof winformFullScreen != typeof undefined) { //Check if we got winform
            // check if enterFullScreen method available and we are not in fullscreen
            if (!isFullscreen ){
                isFullscreen = true;
                winformFullScreen('enterFullScreen');
            // check if leaveFullScreen method available and we are in fullscreen
            } else if ( isFullscreen ){
                isFullscreen = false;
                winformFullScreen('leaveFullScreen');
            }
        } else {
            if (EM.compatibility.getDevice() == 'mobile' && EM.compatibility.getType() == 'iphone') {
                var $b = $('body');
                if ($b.hasClass('iphone-fullscreen')) {
                    $b.removeClass('iphone-fullscreen');
                } else {
                    $b.addClass('iphone-fullscreen');
                }
                
                return;
            }
            isFullscreen = window.innerHeight == screen.height;

            try { //in case local storage throws error
                localStorageVal = localStorage.getItem('iefs');
            } catch (e) {

                localStorageVal = null;
            }

            var s = "";
            if (!isFullscreen && (localStorageVal === "false" || localStorageVal == null)) {
                s = localStorageVal == null ? "null" : localStorageVal.toString();
                requestFullScreen( document.body );
                $('.fullscreenButton').addClass('fullscreen-active');
            } else {
                s = localStorageVal == null ? "null" : localStorageVal.toString();
                cancelFullScreen( document.body );
                $('.fullscreenButton').removeClass('fullscreen-active');
            }
            
            // Firefox spacebar cause clicking on the focused button
            $('.fullscreenButton').blur();
        }
    }

    // Return to first slide
    function rewind() {
        if ( presentSlideNumber == 1 ){
            hideSharePopUp();
        }

        window.scene.rewind();
        presentSlideNumber = 1;
        updateState();
    }
    function getSlideCount() {
        return slidesSize;
    }
    /*** Private methods ***/

    // handles sceneReady event, revealing the presentation
    // and making adjustments
    function sceneIsReady(e, slideDeck, slideLength) {
        // Update Globals
        sectionsSize = slideDeck.sections.length;
        slidesSize = slideLength;
        
        // Update global slidedeck from returned object.
        // On reload editor sends us the slidedeck via client side
        if ( !isReload ){
            slidedeck = slideDeck;
        }

        username = EM.scenemanager.presentation.userInfo.userName;
        isPremium = EM.scenemanager.presentation.userInfo.isPremiumUser;
        isLoggedIn = EM.scenemanager.presentation.userInfo.isUserLoggedIn;
        
        // Display presentation info
        setPresentationInfo();


        if ( isReload ){
            // Reset audio module
            EM.Audio.reset( slidedeck );
        }else {
            // Init audio module with presentation slidedeck
            EM.Audio.init(slidedeck, context.isDownload? {loadInterval: 10} : {}); //in download version, reduce the load interval since the audio is not being loaded over http
        }

        // Go to the requested slide (or first one if none mentioned)
        go( presentSlideNumber );

        // Use scene scaling for now
        setTimeout(function(){
            window.scene.resizeWinner();
        }, 600);
        
        // Don't display the menu since functionality not available offline
        if ( context.isDownload ) $('#menu-container').addClass('hidden');

        $('html').on("mouseenter", showGUI).on("mouseleave", hideGUI);

        $('#toggle').on('click', function(){
            displayUserAndPresentationInfo(5);
        });

        // Trigger GUI once if mouse moved
        $('#scene').on('mousemove', mouseMoveGUIHandler );

        if ( EM.compatibility.getDevice() != "desktop" || window.location.href.indexOf('enabletouch') > 0 ){
            // we are on tablet or mobile or any other touch
            // supported device
            //TODO: Removed this from player, because use other library for mobile and tablet devices (by Sergey)
            /*$('html')
            .hammer().on("tap swipeup", showGUI)
            .hammer().on("swipedown", hideGUI)
            .hammer().on("swiperight", prev)
            .hammer().on("swipeleft", next);*/
        }

        // all should be set, we can remove the loader
        //Remove loader from my-presentations/explore/shared player iframe
        removeLoader();

        // This event is for the video robot to catch 
        window.dispatchEvent(new CustomEvent('playerReady', {detail: { 'slideCount': slidesSize }}));
        
        try {
            if (window.top && (window.self !== window.top) && window.parent.playerReady) {
                window.parent.playerReady();
            }
        } catch (err) {
            console.error(err);
        }

        // After scene is ready we can surely say player is also ready
        firstLoad = false;
        
        // Trigger any existing parameters actions
        triggerParamsActions();

        showGUI();
        displayUserAndPresentationInfo(5);

        if ( isReload && context.isEditor ){
            isReload = false;
            try {
                setTimeout(function(){
                    window.parent.postMessage('playerReloaded', '*');    
                }, 300);
            } catch (e) {
                console.log(e);
                //TODO send error to logger in server;
            }
        }

        setPlayerCookies();

        // Send emaze analytics event
        if (!context.isEditor) {
            sendEventOpenPresentation();
            if (!context.isDownload) {
                var login_username = $.cookie('ezlogged') === $.undefined ? 'NA' : $.cookie('ezlogged');
                var label = login_username + ',' + presentationId;
                dataLayer.push({ 'label': label, 'event': 'eventViewPresentation' });
            }
        }
    }

    // First run, setting of player elements according to given user permissions
    function setPlayerSidebarButtons () {
        var permissions = EM.scenemanager.presentation.userInfo;

        // Should watermark be displayed
        $('#pl-watermark').toggleClass('hidden', !permissions.showLogo);

        if (permissions.userImage) {
            $('#player-logo img').attr('src', permissions.userImage);
        } else {
            $('#player-logo img')
            .attr('src', '//resources.emaze.com/vbplayer/images/logo.png').addClass('logo');
        }

        // Is user allowed to edit
        if ( permissions.isUserLoggedIn && !context.isEditor){  //CODEREVIEW: streamline this code into a simple frm once the spec is understood
            if ( permissions.canEdit ) {
                if (!context.isPresentationPage && !context.isMyPres) {
                    $('#edit-button').hide();
                }
            } else {
                if ( context.isMyPres ){
                    $('#edit-button').remove();
                } else {
                    try{
                        if (window.top.location.origin.indexOf('app.emaze') != -1){ //CONDEREVIEW: assuming this is meant to check !context.isPresentationPage 
                            $('#edit-button').off('click');
                            $('#edit-button').attr('id', 'clone-button');
                        } else {
                            $('#edit-button').hide();
                        }
                    } catch(e){
                        $('#edit-button').hide();
                    }
                }
            }
        } else {
            $('#edit-button').addClass('hidden');
        }

        // Is user allowed to duplicated
        if ( permissions.canDuplicate ) {
            $('#duplicate-button').removeClass('hidden');
            try{
                window.parent.postMessage('canduplicate', '*');
            } catch(e){
                console.error(e);
            }
        } else {
            try{
                window.parent.postMessage('noduplicate', '*');
            } catch(e){
                console.error(e);
            }
            $('#duplicate-button').add('#clone-button').addClass('hidden');
        }

        //show/hide buttons according to permissions
        $('#delete-button').toggleClass('hidden', !permissions.isUserOwner ||context.isEditor);
        $('#download-button').toggleClass('hidden', !permissions.canDownload);
        $('#print-button').toggleClass('hidden', !permissions.canPrint);

    }

    // Set CSS to according to device
    function setPlayerGUIbyDevice () {
        var device = EM.compatibility.getDevice(),
            $device;
           
        if (device !== 'desktop') {
            $device = $('.device'),
            $device.attr('href', $device.attr('href').replace('desktop', device));
        }
    }

    // Set control panel slider
    function playerSlider(){
        var $preview = $('.preview');
        $("#slider").slider({
            min: 1,
            max: slidesSize,
            value: presentSlideNumber,
            slide: function( event, ui ) {
              go( ui.value );
            }
        });

        if ( firstLoad || isReload){
            setSliderMarks();
        }

        // Calculate and prepare preview thumbnail with slide
        $('.ui-state-default').on('mouseover', previewPosition)
        .hover(function () { // Display the preview thumbnail
            $preview.fadeIn(150);
        }, function() {
            $preview.fadeOut(150);
        });
    }

    // Update hash with current slide number
    function updateState(){
        // If we already have hash on URL it won't trigger hash change
        // So I force a hash change
        //if (EM.compatibility.getDevice() != 'mobile') {
            if (firstLoad && hash || isReload) {
                window.location.hash = '#';
            }

        if (options.navigateViaHashChange) {
            window.location.hash = '#' + presentSlideNumber;
        } else {
            window.dispatchEvent(new CustomEvent('changeslide', { 'detail': { slideNumber: presentSlideNumber } }));
            stateCalled();
        }
        updateCurrentSlide();
    }

    // trigger by hashchange event
    function stateCalled(e){  
        hideSharePopUp();

        // update current slide number with history state slide number value
        if (options.navigateViaHashChange) {
            presentSlideNumber = setSlideNumberFromURL();
        }
        if (presentSlideNumber != pastSlideNumber) {
            // using scene go slide since we update state in our go method
            disableHeavyContent(); //disable iframes in current slide before exit.  videos are diabled in emaze.media_player on transition start.

            window.scene.goSlide(presentSlideNumber);
            pastSlideNumber = presentSlideNumber;
        }

       // updateState();
        updateGUI();
    }

    // Start and recurse autoplay
    function startAutoplay () {
        // Recurse on transitionDone
        $("#scene").one('transitionDone', startAutoplay);

        // Set stop duration time according to slide settings or default one
        var seconds = getSlideSettingValue( presentSlideNumber, 'stopduration') || defaultStopDuration;
        
        if (isPlaying !== false) {
            clearTimeout(isPlaying);
        }

        // Perform transition
        isPlaying = setTimeout( autoplay, seconds * 1000 );

    }

    // Perform autoplay transition
    function autoplay () {

        if (!isAutoplay) { return; }

        // stop playing embedded videos during play
        EM_YoutubePlayer.stopVideoPlayers();
        // For some reason autoplay causes mouse threshold to rise, reset it then
        mouseThreshold = 0;

        ( presentSlideNumber >= slidesSize ) ? go(1) : next();
        
        if ( presentSlideNumber >= slidesSize ) {
            // Report end of presentation to who's interested
            try {
                if ( slidesSize === 1 ){
                    window.parent.postMessage('presentationEnded', '*');
                    window.dispatchEvent( new CustomEvent('finish', { 'detail': 'presentation_autoplay_finished' }) );
                } else {
                    // Get slide duration and reduce a bit to prevent last slide transition start
                    var sec = (getSlideSettingValue( presentSlideNumber, 'stopduration') || defaultStopDuration) - 0.3;

                    $('#scene').one('transitionDone', function(){
                        setTimeout(function(){
                            window.parent.postMessage('presentationEnded', '*');
                            window.dispatchEvent( new CustomEvent('finish', { 'detail': 'presentation_autoplay_finished' }) );
                        }, sec * 1000);
                    });
                }
            } catch (e) {
                console.log(e);
                //TODO send error to logger in server;
            }
        }
    }

    // Stop the autoplay
    function stopAutoplay () {
        if (isPlaying !== false) {
            clearTimeout(isPlaying);
        }

    }

    // Set fullscreen with fallback to OLD IE (version 9) using activeX if enabled
    function requestFullScreen(element) {
        // Supports most browsers and their versions.

        var requestMethod = element.requestFullScreen || 
                            element.webkitRequestFullScreen || 
                            element.mozRequestFullScreen || 
                            element.msRequestFullScreen;

        if (requestMethod) { // Native full screen.
            requestMethod.call(element);
        } else {
            window.open( window.location.href, 'emaze Fullscreen', 'fullscreen=yes' );

            try {
                localStorage.setItem('iefs', true);
            } catch (e) {
                //in case local storage throws error
            } 
           
        }
    }

    // If fullscreen is active, disable it
    function cancelFullScreen () {
        var cancelMethod = document.exitFullscreen ||
                           document.mozCancelFullScreen ||
                           document.webkitExitFullscreen || 
                           document.msExitFullscreen;

        if (cancelMethod) {
            cancelMethod.call(document);
        } else {//the infamous IE handling
            try {
                localStorage.setItem('iefs', false);
                window.close();
            } catch (e) {
                //in case local storage throws error
            }
        }
    }

    //Get settings object of a requested slide
    function getSlideSettings(slideNum) {
        try {
            return slidedeck.slideSettings[slideNum - 1] || {};
        } catch (e) {
            return {};
        }
    }
    
    // Get specific value from settings object of a requested slide
    function getSlideSettingValue(slideNum, key) {
        var slideSettings = getSlideSettings(slideNum);
        if (slideSettings[key]) {
            return slideSettings[key];
        } else {
            return null;
        }
    }

    // Triggers autoplay if slide has autoplay setting
    function checkSlideAutoplay(event, slideNum) {
        var settings = getSlideSettings(slideNum);
        
        // If we are not in autoplay mode and slide settings want to, toggle autoplay on
        if ( !isAutoplay ){
            if ( settings['autoplay'] ) { 
                play();
            }
        }

        // If we are in autoplay mode and slide settings don't want to, toggle autoplay off
        if ( isAutoplay ){
            if ( !settings['autoplay'] && !isAutoplayButtonClicked){
                play();
            }
        }

    }

    // Toggle scroll if slide has scroll setting set to true
    function checkSlideScroll() {
        var settings = getSlideSettings( presentSlideNumber );

        updateCurrentSlide();

        if ($currentSlide) {

            EM.slideOptions.setScroll(settings, $currentSlide);
            //Set focus on the slide so keyboard scrolling will work right away
            $currentSlide.focus();

            EM.slideOptions.toggleHorizontalScroll(settings.scroll || settings.scroll_x, $currentSlide);
          
        }
    }

    function sendSlideChangeAnalytics() {
        if ($currentSlide) {
        if (!context.isEditor && prevSlideNumberForAnalytics != presentSlideNumber) {
            if (viewDurationStart != 0) {
                var viewDurationEnd = new Date(),
                    totalSlideViewDuration = Math.round((viewDurationEnd - viewDurationStart) / 1000);

                sendEventSlideClose(prevSlideNumberForAnalytics, totalSlideViewDuration);
                viewDurationStart = new Date();
                prevSlideNumberForAnalytics = presentSlideNumber;

            } else {
                viewDurationStart = new Date();
                prevSlideNumberForAnalytics = presentSlideNumber;
            }
        }
        }
    }

    // load iframe on first time that slide is navigated to
    function enableHeavyContent() {
        $('.current-active-slide .sd-element-embed').each(function () { //dont handle all iframe because the sd-element-vidoe iframes are hanlded separately
            var dataSrc = this.getAttribute('data-src');
            if (dataSrc) {
                this.src = dataSrc;
            }
        });
        if (EM.scenemanager.imageOptimizer.disableGifs) {
            $currentSlide.find('[src*="f_png"]').each(function () {
                this.setAttribute('src', this.getAttribute('src').replace('f_png', 'f_gif'));
            });
        }
    }
   
    function redrawCharts() {
        EM_Graphs.redrawChartsInSlide($('.current-active-slide'));  // must re-draw the charts for hover effects to work on the chart. 
    }

    function disableHeavyContent() {
        if ($currentSlide) {
            $currentSlide.find('iframe').attr('src', '');
            if (EM.scenemanager.imageOptimizer.disableGifs) {
                $currentSlide.find('[src*="f_gif"]').each(function () {
                    this.setAttribute('src', this.getAttribute('src').replace('f_gif', 'f_png')); //assems gif disabled in the data-src of the image
                });
            }
        }
    }


    // Reload the player to sync with editor
    function reload(slideDeck, slideNum, themeUrl) {
        try{
            // Let the player know we are entering reload process
            isReload = true;

            changeTheme(themeUrl);

            // Set present slide number to the requested slide number
            pastSlideNumber = 0;
            presentSlideNumber = slideNum;

            slidedeck = slideDeck;//update the global slidedeck with updated one given by editor

            // Hide sections screen in case it was opened
            hideSectionsFrame();

            // Clear the slider marks since slide deck size could be changed
            clearSliderMarks();

            // Reload #scene and it's related assets
            EM.scenemanager.reload( slidedeck );

            // Disable auto play in player from editor in case of autoplay active
            if ( isAutoplay ){
                play();
            }

        } catch(e){
            console.log(e.message)
            $.post("/present/logError", { source: "player.js/relaod", message: e.message });
        }

    }

    //change the theme css file in order to sync with change in editor
    function changeTheme(url) {
        EM.scenemanager.clearTheme();
        EM.scenemanager.setTheme(url);
    }

    // Bind keyboard keys to their corresponding actions
    function onKeyPress (e) {
        mouseThreshold = 0;//Resolve wierd behaviour where keypress (or something else) trigger mousemove in Chrome    
        var code = e.keyCode;

        switch (code){
            case 27: //ESCape
                if ( isFullscreen ){
                    fullScreen();
                }
            break;
            
            case 35: //End
                go( slidesSize );
            break;
            
            case 36: //Home
                rewind();
            break;

            case 38://Up
                try {
                    if ( !scene.getCurrentSlide().hasClass('sd-page-scroll') ){
                        e.preventDefault();
                        prev();
                    }
                } catch(e){
                    console.error(e);
                }
            break;
            case 37://Left Arrow
            case 33://PageUp
            case 37://Backspace
                e.preventDefault();
                prev();
            break;

            case 40://Down
                try {
                    if ( !scene.getCurrentSlide().hasClass('sd-page-scroll') ){
                        e.preventDefault();
                        next();
                    }
                } catch(e){
                    console.error(e);
                }
            break;
            
            case 39://Right Arrow
            case 34://PageDown
            case 32://Space bar
                e.preventDefault();
                next();
            break;

            case 13://Return
                fullScreen();
            break;
            case 122://F11
                e.preventDefault();
                fullScreen();
            break;

        }
    }

    // Show the share pop up screen
    function showSharePopUp () {

        // Trigger share pop up since we were in last slide
        if ( !isSharePopUpShowing && EM.scenemanager.presentation.userInfo.isPublic ){
            $('.pop-container').show();
            isSharePopUpShowing = true;

            $('.rightButton').prop('disabled', true);
            $('.leftButton').prop('disabled', false);

            var scale_factor = $('#slide-box').attr('scale-factor') || ( $(window).width() / 1920);

            setScale($('.wrap-pop'), scale_factor);
        }
    }

    // Hide the share pop up screen
    function hideSharePopUp () {
        if ( isSharePopUpShowing ){
            $('.pop-container').hide();
            isSharePopUpShowing = false;
            $('.rightButton').prop('disabled', false);

            // Disable previous functionality since we have only 1 slide
            if ( slidesSize == 1 ){
                $('.leftButton').prop('disabled', true);
            }
        }
    }

    // Popping up the share option selected and set it
    function sharePopup(width, height, net) {
        var leftPosition, topPosition;
        leftPosition = (window.screen.width / 2) - ((width / 2) + 10);
        topPosition = (window.screen.height / 2) - ((height / 2) + 50);

        var windowFeatures = "status=no,height=" + height + ",width=" + width + ",resizable=yes,left=" + leftPosition + ",top=" + topPosition + ",screenX=" + leftPosition + ",screenY=" + topPosition + ",toolbar=no,menubar=no,scrollbars=no,location=no,directories=no";
            u = window.location.href.replace('app', 'www').replace('staging', ''),
            t = document.title;

        url = u.substring(0, u.indexOf('#'));

        switch(net){
            case 'fb':
                share = "http://www.facebook.com/sharer.php?u=";
                var label = 'Player, Facebook, ' + username + ', ' + presentationId;
                ga('send', 'event', 'Player', 'LastSlide-facebook', label);
                dataLayer.push({ 'label': label, 'event': 'eventShare-Player' });
                break;
            case 'tw':
                share = "https://twitter.com/share?text=Check out this emazing presentation&via=emaze_tweets&url=";
                var label = 'Player, Twitter, ' + username + ', ' + presentationId;
                ga('send', 'event', 'Player', 'LastSlide-twitter', label);
                dataLayer.push({ 'label': label, 'event': 'eventShare-Player' });
                break;
            case 'in':
                share = 'http://www.linkedin.com/shareArticle?mini=true&title=' + encodeURIComponent(EM.scenemanager.presentation.core.name) + '&summary=' + encodeURIComponent(EM.scenemanager.presentation.core.description) + '&source=emaze&url=';
                var label = 'Player, Linkedin, ' + username + ', ' + presentationId;
                ga('send', 'event', 'Player', 'LastSlide-linkedin', label);
                dataLayer.push({ 'label': label, 'event': 'eventShare-Player' });
                break;
            case 'gp':
                share = "https://plus.google.com/share?url=";
                var label = 'Player, Googleplus, ' + username + ', ' + presentationId;
                ga('send', 'event', 'Player', 'LastSlide-googleplus', label);
                dataLayer.push({ 'label': label, 'event': 'eventShare-Player' });
                break;
            case 'pt':
                share = "https://pinterest.com/pin/create/button/?media=" + encodeURIComponent(EM.scenemanager.presentation.theme.imageUrl) + "&description=Watch this amazing presentation on emaze.com - The website that lets you create and share stunning presentations within minutes.&url=";
                var label = 'Player, Pinterest, ' + username + ', ' + presentationId;
                ga('send', 'event', 'Player', 'LastSlide-pinterest', username + ', ' + presentationId);
                dataLayer.push({ 'label': label, 'event': 'eventShare-Player' });
                break;
        }

        $.ajax({
            type: 'POST', url: '/Share/sendEvent', dataType: 'json',
            data: { presid: presentationId, sharefrom: 'lastslide' , sharetype: net }
        });

        window.open(share + encodeURIComponent(url) + '&t=' + encodeURIComponent(t),'sharer', windowFeatures);
        return false;
    }

    // player event dispatcher (wrapper)
    function on(event, callback){
        switch (event){
            case 'start': 
                window.addEventListener('start', callback);
            break;
            case 'finish': 
                window.addEventListener('finish', callback);
            break;
            case 'error': 
                window.addEventListener('error', callback);
            break;
        }
    }

    /*** Utilities ***/

    // return slide number (as integer)
    function setSlideNumberFromURL () {

        var hash = window.location.hash,
            slideNumber;

        hash = hash.substr(1);//trim out the #

        // Slide number backwards compatibility
        if ( /slidenum=/i.test(hash) ){
            hash = hash.replace('slidenum=', '');
        }

        // check for that prev, next, last, first in the hash
        if ( isNaN( +hash ) ){
            switch ( hash ) {
                case 'prev':
                    slideNumber = presentSlideNumber - 1;
                    break;
                case 'next':
                    slideNumber = presentSlideNumber + 1;
                    break;
                case 'first':
                    slideNumber = 1;
                    break;
                case 'last':
                    slideNumber = slidesSize;
                    break;
            }

        } else {
            slideNumber = hash ? +hash : 1;
        }

        // smaller then 1
        if ( slideNumber < 1 ){
            slideNumber = 1;
        }

        // larger then total number of slides
        if ( slideNumber > slidesSize ){
            slideNumber = slidesSize;
        }

        // unknown value of hash
        if ( isNaN(slideNumber) ){
            if ( $('a[href="#' + hash + '"]').length > 0 ){
                slideNumber = hash;
            } else {
                slideNumber = 1;
            }
        }

        return slideNumber;

    }

    // remove player loader when scene is ready
    function removeLoader () {
        $('#player-loader').fadeOut(600, function(){
            $(this).addClass('hidden');
        });
    }

    // Update the $currentSlide global var and mark current slide with a class
    function updateCurrentSlide () {
        try {

      
        // Update current Slide
        $currentSlide = scene.getCurrentSlide();

        // Generic scene handle it's own current-active-slide
        if ($currentSlide && $currentSlide.length) {
            if( !$currentSlide.hasClass('slide_g') ){
                // Update current-active-slide class on required slide
                $('.current-active-slide').removeClass('current-active-slide');
                $currentSlide.addClass('current-active-slide');
              
                //moved this code to scene transition done 
              //  if (!context.isDownload) {
                    // must re-draw the charts for hover effects to work on the chart. 
             //       EM_Graphs.redrawChartsInSlide($currentSlide); 
             //   }
            }
        }

        playerSlider();

        } catch (e) {
            console.error(e);
        }

    }

    // Updating the player GUI during presentation run
    function updateGUI () {
        var isPublic = EM.scenemanager.presentation.userInfo.isPublic;

        // First slide
        if ( presentSlideNumber == 1 ){
            $('.leftButton').prop('disabled', true);

            if ( slidesSize > 1 ){
                $('.rightButton').prop('disabled', false);
            } else {
                if ( isPublic ){
                    $('.rightButton').prop('disabled', false);
                } else {
                    $('.rightButton').prop('disabled', true);    
                }
            }
            // We are somewhere in the middle
        } else if ( presentSlideNumber > 1 && presentSlideNumber < slidesSize  ){
            $('.leftButton').add('.rightButton').prop('disabled', false);

            // Last slide
        } else if ( presentSlideNumber == slidesSize ){
            // We have more then one slide, so we can go back to one
            // and move forward to pop sharing div
            $('.leftButton').prop('disabled', false);
            if ( !isPublic ){
                $('.rightButton').prop('disabled', true); 
            } else {
                $('.rightButton').prop('disabled', false); 
            }

            // We shouldn't get here, but if we do enable control
        } else {
            $('.leftButton').add('.rightButton').prop('disabled', false);
        }

    }

    // Setting the presentation scale marks on the GUI slider
    function setSliderMarks () {
        var $slider = $('#slider'),
            step = 100 / (slidesSize - 1),//Steps for mark positioning
            position = 0,//current mark position
            isSection = false;// Mark to add next mark as a section mark

        for (i = 0; i < sectionsSize; i++) {
            var sections = slidedeck.sections[i];
            
            isSection = true;

            for (var j = 0; j < sections.slides.length; j++) {
                // Add regular slide mark
                
                if ( isSection ){
                    $slider.append('<a href="#" class="ui-slider-mark-section ui-state-default ui-corner-all" style="left:' + position + '%;"></a>');
                } else{
                    $slider.append('<a href="#" class="ui-slider-mark ui-state-default ui-corner-all" style="left:' + position + '%;"></a>');    
                }
                
                position += step;
                isSection = false;
            }
        }

    }

    function clearSliderMarks () {
        $('.ui-slider-mark').remove();
    }

    // Create the Sections screen (agenda)
    function buildSectionsScreen() {
        var WIDTH = 1920;
        var SCALED = 185 / WIDTH;
        var HEIGHT = 1080;

        $("#agendaButton").css("background", "#515151");
        $("#slidesButton").css("background", "#ee4c4e");

        if ( slidedeck ) {
            $("#sectionsTitle").html( EM.scenemanager.presentation.core.name );
            var $sectionList = $("#sectionList");
            $sectionList.empty();
            var counter = 0;
            var sCounter = 0; //Sections counter

            for (var i = 0; i < slidedeck.sections.length; i++) {
                var section = slidedeck.sections[i];
                var aSection = '<div id="section_' + (i + 1) + '" data-slide="' + (sCounter + 1) + '" class="sectionsSlidesSectionNames">\n' + section.title + '</div>';
                
                $sectionList.append(aSection);

                sCounter += section.slides.length;
                $("#section_" + (i + 1)).click(function () {
                    hideSectionsFrame();
                    go( +this.getAttribute("data-slide") );
                });

                $sectionList.append("<div id='dummy_" + (i + 1) + "' class='agenda-slides-wrapper'></div><div class='clearfix' style='height: 15px;'></div>");
                
                var $section = $("#dummy_" + (i + 1));

                for (var j = 0; j < counter; j++) {
                    $section.append("<div class='slide-wrapper' style='display:none'></div>");
                }

                for (var s = 0; s < section.slides.length; s++) {
                    counter++;
                    var aSlide = '<div id="slider_' + (counter) + '" data-slide="' + (counter) + '" class="aSectionSlide slide-wrapper">\n' +
                             '</div>';
                    $section.append(aSlide);
                    var $slideFrame = $('#slider_' + (counter));
                    $slideFrame.append(section.slides[s]);
                    var $theSlide = $slideFrame.children(":first");

                    toggleTransformOnSlideElements( $theSlide );

                    $theSlide.css('width', '' + WIDTH + 'px');
                    $theSlide.css('height', '' + HEIGHT + 'px');
                    $theSlide.css('-webkit-transform-origin', '0 0 0');
                    $theSlide.css('-moz-transform-origin', '0 0 0');
                    $theSlide.css('-ms-transform-origin', '0 0 0');
                    $theSlide.css('transform-origin', '0 0 0');
                    $theSlide.css('-webkit-transform', 'scale(' + SCALED + ')');
                    $theSlide.css('-moz-transform', 'scale(' + SCALED + ')');
                    $theSlide.css('-ms-transform', 'scale(' + SCALED + ')');
                    $theSlide.css('transform', 'scale(' + SCALED + ')');

                    $slideFrame.click(function () {
                        hideSectionsFrame();
                        go( +this.getAttribute("data-slide") );
                    });

                    $('#sectionsClose').click(function () {
                        hideSectionsFrame();
                    });
                }
            }

            EM.scenemanager.ezLoadImages('#sectionList');
        }
    }

    // Hide the sections frame
    function hideSectionsFrame() {
        $("#sectionList").add('#sectionsTitle').empty();
        $("#sectionsFrame").css("visibility", "hidden");
        showingSections = false;
    }

    // Helper method for scaling slide elements
    function toggleTransformOnSlideElements($container, toggle) {
        if ($container && $container.length) {
            var $elements = $container.find('[data-transform]');
            
            if (toggle) {
                $elements.each(function () {
                    var transformVal = $(this).attr('data-transform');
                    var $this = $(this);
                    var trnsformStr = ['transform:', transformVal, '; -webkit-transform:', transformVal, '; -moz-transform:', transformVal, '; -ms-transform:', transformVal].join('');
                    $this.css('transform', '');
                    var styleAttr = $this.attr('style') || '';
                    $this.attr('style', styleAttr.concat(trnsformStr));
                });

            } else {
                $elements.css({ 
                    'transform': 'none',
                    '-webkit-transform': 'none',
                    '-moz-transform': 'none',
                    '-ms-transform': 'none' 
                });
            }
        }
    }

    function displayUserAndPresentationInfo (timeToDisplayInSec) {
        $('#player-logo').add('#presentation-info').addClass('show');
        clearTimeout(infoTimeout);
        infoTimeout = setTimeout(function(){
            $('#player-logo').add('#presentation-info').removeClass('show');
        }, timeToDisplayInSec * 1000);
    }

    // Show the GUI and hide presentation information & logo after 3 seconds
    function showGUI (e) {

        if ( EM.compatibility.getDevice() === "tablet" ){
            $('#buttonsPanel')
            .add('.leftButton')
            .add('.rightButton')
            .add('#offline-analytics-indicator')
            .add('#menu-container').addClass('show tablet');

            $('#timelinebutton').addClass('show hometablet');

        } else {
            $('#buttonsPanel')
            .add('.leftButton')
            .add('.rightButton')
            .add('#offline-analytics-indicator')
            .add('#menu-container')
            .add('#timelinebutton').addClass('show');

            // Click is triggering tap, and we want to disable logo and info
            // visibility to once, so it won't trigger on clicks
            if ( !limitShowInDesktop ){
                $('#player-logo').add('#presentation-info').addClass('show');
                limitShowInDesktop = true;
            }
        }

    }

    // Hide GUI
    function hideGUI () {
        $('#buttonsPanel')
        .add('.leftButton')
        .add('.rightButton')
        .add('#menu-container')
        .add('#offline-analytics-indicator')
        .add('#timelinebutton').removeClass('show');

        clearTimeout(timeout);
    }

    // Hide GUI and never show it again
    function hideGUIForever () {
        $('#buttonsPanel')
        .add('.leftButton')
        .add('.rightButton')
        .add('#timelinebutton')
        .add('#player-logo')
        .add('#menu-container')
        .add('#presentation-info').removeClass('show').addClass('hidden');
    }

    // Hide player controls
    function hideControls (option) {
        switch (option){
            // hide all but slider
            case 1:
                $('.leftButton')
                .add('.rightButton')
                .add('#timelinebutton').removeClass('show').addClass('hidden');
            break;
            // hide all but arrows
            case 2:
                $('#buttonsPanel')
                .add('#timelinebutton').removeClass('show').addClass('hidden');
            break;
            // hide all
            case 0:
            default:
                $('#buttonsPanel')
                .add('.leftButton')
                .add('.rightButton')
                .add('#timelinebutton').removeClass('show').addClass('hidden');
            break;

        }
    }

    // Hide top right menu
    function hideMenu () {
        $('#menu-container').removeClass('show').addClass('hidden');
    }
    
    // Handle GUI appearance when mouse move
    // GUI will be hidden after 1 seconds
    function mouseMoveGUIHandler (e) {
        mouseThreshold++;
        
        if ( mouseThreshold > 2 ){
            if ( e.type != undefined ){
                $(['#buttonsPanel',
                    '.leftButton',
                    '.rightButton',
                    '#menu-container',
                    '#offline-analytics-indicator',
                    '#timelinebutton'].join(', ')).addClass('show');    
            }
            mouseThreshold = 0;
        }

        resetTimer();
    }

    function resetTimer () {
        clearTimeout(timeout);
        timeout = setTimeout( hideOnTimeExpire ,1000);

    }

    function hideOnTimeExpire() {
        // If user interact with any of player controls, reset timeout timer

        var hoverSelector = ".player-button:hover, #buttonsPanel:hover, .ui-state-default:hover, .rightButton:hover, .leftButton:hover, #menu-container:hover, #offline-analytics-indicator:hover";

        if ($(hoverSelector).length) {
            resetTimer();
        } else {
            hideGUI();
        }
    }

    // TODO: make more organized with separate function
    $('#slider').slider().mousemove(function(e) {
        var width = $(this).width(),
            offset = $(this).offset(),
            options = $(this).slider('option'),
            value = Math.round(((e.clientX - offset.left) / width) * (options.max - options.min)) + options.min;
        
        $('.the-content').empty();

        setPreviewContentByPosition( value - 1 );

    });

    // Position the preview thumbnail above hovered tick mark
    function previewPosition (e) {
        var $this = $(this),
            position = $this.position().left,  // get tick position in slider
            offset = $(this).offset().left,  // get tic offset from the left of the player
            $preview = $('.preview'),
            $chupchik = $('.chupchik');
        // if the oofset biger then half of the preview div
        if( offset > 150 ) {
            $preview.css('left', position - 150);
            $chupchik.css('left', '50%');
        } else {
            $preview.css('left', -($('#slider').position().left) + 4);
            // if the current slide circle on the tick
            $chupchik.css('left', offset - $this.hasClass('ui-slider-handle') ? 1 : 5);
        }    
    }

    // Set scaled slide in the preview thumb when hovering slider tick mark
    function setPreviewContentByPosition (pos) {
        var slide = EM.scenemanager.getSlideByPosition(pos),
            $content = $('.the-content'),
            $slides;

        
        $('.preview > .slide-wrapper:not(.the-content)').remove();

        for (var i = 0; i < pos; i++) {
            $('.preview').prepend('<div class="slide-wrapper"></div>');
        };

        $content.addClass('slide-wrapper');

        $(slide).appendTo($content);

        $slides = $content.children('.slide');
        $slides.css(browserPrefix('transform-origin', '0 0'));

        scaleElement($slides, $content, 0);

        $('.section-name').text( EM.scenemanager.getSectionNameBySlide(pos) );
        $('.slide-number').text( (pos + 1) + '/' + slidesSize );
    }

    // Scale element and return it's scale factor
    function scaleElement($element, $context, margin) {
        margin = margin || 0;
        var
            w = $element.width(),
            h = $element.height(),
            dw = $context.width() - margin,
            dh = $context.height() - margin,
            widthDelta,
            heightDetla,
            minDelta;

        widthDelta = dw / w;
        heightDetla = dh / h;
        minDelta = Math.min(widthDelta, heightDetla);

        setScale($element, minDelta);

        $element.attr('scale-factor', minDelta); //CODEREVIEW:  this may/maynot be needed here. copy/pasted from editor where it is relevant for draggable operations

        return minDelta;
    }

    // Check params existence in URL and perform matching actions
    function triggerParamsActions () {
        if ( checkURLParam('autoplay') || checkURLParam('isAutoPlay') ) playWrap();
        if ( checkURLParam('agenda') ) sectionsScreen();
        if ( checkURLParam('hidebuttons') || checkURLParam('isHideButtons') ) hideGUIForever();
        if ( checkURLParam('hidecontrols') ) hideControls( +getParameterByName('hidecontrols') );
        if ( checkURLParam('hidemenu') ) hideMenu();
        if (checkURLParam('stop')) defaultStopDuration = +getParameterByName('stop');
        if (checkURLParam('hideprofile')) $('#player-logo, #presentation-info').hide();
    }

    // Returns parameter value by it's name
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    // return true if term located in URL
    function checkURLParam ( term ) {
        var url = window.location.href;

        if( url.indexOf('?' + term) != -1 )
            return true;
        else if (url.indexOf('~' + term) != -1 || url.indexOf('&' + term) != -1)
            return true;

        return false;
    }

    function setPresentationInfo () {
        var pName = EM.scenemanager.presentation.core.name,
            oName = EM.scenemanager.presentation.userInfo.userName,
            oPage = EM.scenemanager.presentation.userInfo.userPage,
            oImage = EM.scenemanager.presentation.userInfo.userImage;

        $('.presentation-title').text( pName ).attr('title', pName);
        $('.presentation-author').text( oName );

        if ( !context.isDownload ){
            // update author name to serve as link to his personal page
            $('.presentation-author').attr('href', oPage);
            if ( oImage ){
                $('#player-logo').attr('href', oPage);
            }
        } else {
            $('#player-logo').remove();
            $('<p class="presentation-author">' + oName + '</p>').appendTo('#presentation-info');
            $('#presentation-info').css('left', '14px');
        }
        

    }

    function setPlayerCookies () {
        var isPureUser = $.cookie('ezaffid') === undefined && $.cookie('ezcampid') === undefined && $.cookie('ezsubid') === undefined;
        if ( isPureUser && !context.isEditor){
            $.cookie('ezaffid', 'player', { expires: 365, domain: 'emaze.com' });
            $.cookie('ezcampid', EM.scenemanager.presentation.core.presentationId, { expires: 365, domain: 'emaze.com' });
            $.cookie('ezsubid', EM.scenemanager.presentation.userInfo.userID, { expires: 365, domain: 'emaze.com' });
            $.cookie('ezaffidOriginal', 'player', { expires: 365, domain: 'emaze.com' });
            $.cookie('ezcampidOriginal', EM.scenemanager.presentation.core.presentationId, { expires: 365, domain: 'emaze.com' });
            $.cookie('ezsubidOriginal', EM.scenemanager.presentation.userInfo.userID, { expires: 365, domain: 'emaze.com' });
        }
    }

    function isPresentationPage() {
        try {
            var url = (window.location != window.parent.location) ? document.referrer : document.location;
            return url.indexOf("www.emaze.com/@") != -1 || url.indexOf("presid") != -1;
        } catch (e) {
            return false;
        }
    }

    //=============== Functions For Analytics =======================
   function getOfflineAnalytics() {
       try { return localStorage.getItem(OFFLINE_ANALYTICS_KEY); } catch (e) { return null; };  //try/catch in case localstorage not supported
   }

    function storeAnalyticsInLocalStorage(label) {
        var labels = JSON.parse(getOfflineAnalytics()) || [];
            label.IsOffline = true;
            labels.push(label);
            localStorage.setItem(OFFLINE_ANALYTICS_KEY, JSON.stringify(labels));
            $('#offline-analytics-indicator').addClass('on');
    }

    function sendOffLineAnalytics() {
        var labelsString = getOfflineAnalytics();

        if (labelsString) {         //TODO: create this function in the event server
            var url = isEventServer ? "https://event.emaze.com/analytic/Batch" : "http://127.0.0.1:81/analytic/Batch";
            $.post(url, { eventsString: labelsString }, function (data) {
                if (!data.error) {
                    localStorage.removeItem(OFFLINE_ANALYTICS_KEY); //clear the data from local storage since its been sent to server TODO: what if more data is gathered whle waiting for server response? it will be lost here
                    $('#offline-analytics-indicator').removeClass('on'); //if there are offline analytics, show the button, else hide
                    isOfflineAnalytics = false;
                } else {
                    console.log(data.error);
                }
                
            }).fail(function () {
                //TODO: inform user that sending the analytics failed, check network connection OR jut try on next load of player
            }).always(function () {
               
            });
        }
    }

    function sendAnalyticsEvent(type, slideData) {
        var datetime = new Date();

        var label = {
            PresentationId: EM.scenemanager.presentation.core.presentationId,
            DateView: datetime,
            GmtZone: datetime.getTimezoneOffset(),
            Type: type,
            IsOffline: false,
            IsPremium: EM.scenemanager.presentation.userInfo.isOwnerPremium
    };
         
        if (!context.isDownload) {
            label = $.extend(label, {
                UserName: $.cookie('ezlogged') === $.undefined ? keyusername : $.cookie('ezlogged'),
                VApp: domainName,
                FullName: $.cookie("ezfullname"),
                Alias: $.cookie("ezalias")
            });
        } else {
            label = $.extend(label, {
                UserName: EM.scenemanager.presentation.userInfo.userEmail,
                VApp: EM.scenemanager.presentation.userInfo.domain,
                FullName: EM.scenemanager.presentation.userInfo.userName,
                Alias: EM.scenemanager.presentation.userInfo.userAlias
            });
        }

        if (slideData) {
            label = $.extend(label, slideData);
        }
        if (isOfflineAnalytics) {
            storeAnalyticsInLocalStorage(label);
        } else {
            var url = isEventServer ? "https://event.emaze.com/analytic" : "http://127.0.0.1:81/analytic";
            $.post(url, { eventString: JSON.stringify(label) }, function (data) {
                console.log(data);
            }).fail(function () {
                if (context.isDownload) { //in download player, switch to offline analytics on first ajax fail for the duration of the sesstion.
                    isOfflineAnalytics = true;
                    storeAnalyticsInLocalStorage(label);
                }
            });
        }
    }

    function sendEventOpenPresentation() {
        sendAnalyticsEvent("open");
    }

    function sendEventSlideClose(slideNum, viewDuration) {
        sendAnalyticsEvent("slide", { SlideNumber: slideNum, TimeView: viewDuration});
    }

    function sendEventClosePresentation() {
        sendAnalyticsEvent("close");
    }

    //=============== End Functions For Analytics ===================

    return {
        init: init,
        goToSlide: go,
        nextSlide: next,
        prevSlide: prev,
        playButton: play,//left here in case its being called from somewhere
        play: play, //! interface provided to the emaze to vidoe convert service
        reload: reload,
        changeTheme: changeTheme,
        removeLoader: removeLoader,
        getSlideNumber: setSlideNumberFromURL,
        sharePopup: sharePopup,
        isPresentationPage : isPresentationPage,
        on: on,
        setScale: setScale,
        context: context,
        getSlideCount: getSlideCount,
        fullScreen: fullScreen
    }

}(jQuery));

