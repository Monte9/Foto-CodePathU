
EM.Audio = (function () {
    var enabled = false;
    var isEditor = false;
    //var slidedeDeckInstance;
    // var stopDurations;
    var prevSlideNum = 0; // the slide that the player was on during the last slide change;
    var $jukebox;
    var IV_progress = false; //progress bar interval
    var loadingTracker = {
        counter: 0,
        decrement: function () {
            this.counter--;
            //console.log('load counter', this.counter);
            if (this.counter === 0) {
                $('body').triggerHandler('em-audio-loadfinish');
                // console.log('em-audio-loadfinish');
            }
        },
        increment: function () {
            this.counter++;
            // console.log('load counter', this.counter);
        },
        getCount: function () {
            return counter;
        }

    }

    var settings = {
            loadInterval: 3000  // slows down the loading of audio resorces to prevent choking the browser on load of player
        };

    var audioQue = []; //list of all audio elements that are waiting to be added to dom, rather than all at once to prevent overloading the browser

    function toggleEnabled(isEnabled) {
        enabled = isEnabled;
    }

    function init(slideDeck, options) {
        enabled = (window === window.top); //audio enabled by default if not in iframe
        // slidedeDeckInstance = slideDeck;
        // stopDurations = slidedeDeckInstance.slideSettings.map(function (i) {return i.stopduration || 4 });

        if(options) {
            settings = $.extend(settings.options);
        }

        if (window["EM_Editor"] !== undefined) {
            isEditor = true;

        } else {
            $jukebox = $('<div id="jukebox" style="display:none;">');

            $(document.body).append($jukebox);
            attachJuekboxEvents();
            loadAllAudioFromSlideDeck(slideDeck);
        }

        attachEventHandlers();
    }

    function getEditWrapper(audio) {
        var data = $(audio).data();
        return $('#scene [data-uid="' + data.parentUid + '"]') || $();
    }

    function loadsettings(data) {
        //audiostop: audiostop, audioautoplay: data.audioautoplay, audiostarttime: data.audiostarttime, audiostoptime: data.audiostoptime, audiosrc: data.audiosrc, audioloop: data.audioloop, isedit: data.isedit };
        $('#audio-url-txt').val(data.audiosrc).attr('title', getfileName(data.audiosrc));
        $('#select-audio-stop').val(data.audiostop);
        $('#audio-loop').prop('checked', data.audioloop);
        $('#audio-auto').prop('checked', data.audioautoplay);
        $('#audio-start-time').val(data.audiostarttime);
        $('#audio-stop-time').val(data.audiostoptime);
        $('#audio-stop-others').prop('checked', data.audiostopothers);
        $('#audio-save-btn').html(data.isedit ? 'UPDATE' : 'ADD');
    }

    function checkIncompatibles() {
        var data = getSettings();
        var isIncompatible = (data.audioloop && (data.audiostoptime.trim().length > 0 || data.audiostarttime.trim().length) > 0);

        $('#audio-incompatible').toggle(isIncompatible);
    }

    function getSettings() {
        var data = {};
        data.audiosrc = $('#audio-url-txt').val();
        data.audiostop = $('#select-audio-stop').val();
        data.audioloop = $('#audio-loop').prop('checked');
        data.audioautoplay = $('#audio-auto').prop('checked');
        data.audiostarttime = $('#audio-start-time').val();
        data.audiostoptime = $('#audio-stop-time').val();
        data.audiostopothers = $('#audio-stop-others').prop('checked');
        return data;
    }

    function clearAudioControls() {
        $('#audio-url-txt').val('');
        $('#select-audio-stop').val(-1);
        $('#audio-loop').prop('checked', false);
        $('#audio-auto').prop('checked', false);
        $('#audio-start-time').val('');
        $('#audio-stop-others').prop('checked', false);
    }

    function popuplateSlideselector() {
        var $Select = $('#select-audio-stop'),
        slideCount = EM_Document.$slideContainer.find('.slide-wrapper').length;

        $Select.empty();
        $Select.append('<option value="-1">none</option><option value="0">current slide</option>');
        for (var i = 1; i <= slideCount; i++) {
            $('<option></option>').attr("value", i).text(i).appendTo($Select);
        }
    }

    function getfileName(audiosrc) {
        var segments = [];
        if (!audiosrc) { return ''; }
        if (audiosrc.indexOf('&title=') !== -1) { //audio url with params..
            return audiosrc.split('&title=').pop();
        }
        if (audiosrc.indexOf('_emazeaudio_') !== -1) { // '_emazeaudio_'  is located between guid and originial file name for uploaded files
            return audiosrc.split('_emazeaudio_')[1];
        }
        segments = audiosrc.split('/');   // audio files linked to source outside of emaze storage
        return segments.length ? segments[segments.length - 1] : '';
    }

    function attachJuekboxEvents() {
        $jukebox.on('ended, pause', 'audio', function () {

            var $wrapper;
            try {

                $wrapper = getEditWrapper(this);
                $wrapper.removeClass('sd-audio-play');
                if (!$wrapper.length) {
                    console.log('no wrapper');
                }
            } catch (e) {
                console.error(e);
            }
        }).on('play', 'audio',function () {
            var $wrapper;
            try {

                $wrapper = getEditWrapper(this);
                $wrapper.addClass('sd-audio-play');

                if (!$wrapper.length) {
                    console.log('no wrapper');
                }
            } catch (e) {
                console.error(e);
            }
        });
    }

    function addAudioToJukeboxMultiple(dataArr, slideNum) {
        dataArr.forEach(function (data) {
            addAudioToJukebox(data, slideNum);
        });
    }

    function addAudioToJukebox(data, slideNum) {
        var urlParams = "", tStart, tEnd;

        try {


            tStart = data.audiostarttime ? getSecondsFromTimeSpan(data.audiostarttime) : false;
            tEnd = data.audiostoptime ? getSecondsFromTimeSpan(data.audiostoptime) : false;

            if (tStart || tEnd) {
                urlParams = "#t=" + (tStart ? tStart : 0) + (tEnd ? "," + tEnd : "");
            }

            $audio = $('<audio controls>').attr({ 'data-parent-uid': data.uid, 'data-audiostop': data.audiostop, 'data-slidenum': slideNum });
            $audio.data({ audiostop: data.audiostop, audioautoplay: data.audioautoplay, slidenum: slideNum });
            // $('<source>').attr('src', data.audiosrc.replace('https:', 'http:')).appendTo($audio);
            if (data.audioloop) {
                $audio.prop('loop', true);
                $audio.prop('loopStart', tStart);
                $audio.prop('loopEnd', tEnd);
            }

            $jukebox.append($audio);
            loadingTracker.increment();
            //console.log('audio elements loading: ', loadingTracker);

            $audio.one('abort canplaythrough', function () {
                loadingTracker.decrement();
            });

            if (data.audio_ytid) //re-fetch youtube link that may expire...
            {
                (function ($audio, urlParams) {
                    $.get("../editor/getYoutubeMP4", { videoID: data.audio_ytid }, function (data) {
                        if (data !== "ERROR") {
                            $audio.attr('src', data + urlParams);
                        } else {
                            $.post("../present/logError", { source: "emaze.audio.js/getYoutubeMP4", message: "user tried to use a copyright resticted video: " + data.audio_ytid });
                        }
                    });
                })($audio, urlParams);
            } else { // use exisitng src since no need to refresh the link
                $audio.attr('src', data.audiosrc + urlParams);
            }

        } catch (e) {
            $.post("../present/logError", { source: "emaze.audio.js/addAudioToJukebox", message: e.message });
        }

    }

    function addSlideAudioElementsToQue(slideNum, $slide) { //TODO: use setinterval here so that if there are many audio elements in one slide, it won't stall in chrome
        var slideAudio = [];
        $slide.find('.sd-audio').each(function () {
            var $this = $(this);
            var data = $this.data();
            if (!$jukebox.children('[data-parent-uid="' + data.uid + '"]').length) { //if not already added (unlikely event)
                slideAudio.push(data);
            }
        });
        if (slideAudio.length) {
            audioQue.push({ slideNum: slideNum, slideAudio: slideAudio });
        }
    }


    function loadAllAudioFromSlideDeck(slideDeck) {
        var $slidesHtml, $slides, audioQueItem;

        try {
            $slidesHtml = EM_slideDeck.slideDeckToHtmlFlat(slideDeck);
            $slides = $slidesHtml.children();
           
            $slides.each(function (index) {
                addSlideAudioElementsToQue(index+1, $(this));
            });

            //addSlideAudioElementsToQue

            var interval = setInterval(function () { //space out adding of sound files to prevent chrome fro getting stuck in pending
                //  var d = new Date();
                if (!audioQue.length) { //stop the interval and attach events to the newly appended audio elements
                    clearInterval(interval);
                   
                } else {
                    audioQueItem = audioQue.pop();
                    addAudioToJukeboxMultiple(audioQueItem.slideAudio, audioQueItem.slideNum);
                }

            }, settings.loadInterval);

        } catch (e) {
            $.post("../present/logError", { source: "emaze.audio.js/loadAllAudioFromSlideDeck", message: e.message });
        }

    }

    function attachEventHandlers() {
       

        $('#audio-url-txt').on('change', function () {
            this.title = getfileName(this.value);
        }).dblclick(function () { this.select(); });

        if (!isEditor) { //remove first to prevent multiple event bindings on re-load
            $('#scene').off('click', '.sd-audio', handleAudioClick).on('click', '.sd-audio', handleAudioClick);

            $('#scene').off('contextmenu', '.sd-audio', handleContextMenu).on('contextmenu', '.sd-audio', handleContextMenu);

            $("#scene").off('transitionStart', handleSlideChange).on('transitionStart', handleSlideChange);



        } else {

            $("#audio-loop, #audio-start-time, #audio-stop-time").change(checkIncompatibles);
            //   debugInEditor();
            $('#btn-audio').on('sd-show', function () {
                var data, isedit;
                clearAudioControls();
                isedit = EM_Document.selected.$editWrapper.is('.sd-audio');

                //   if (EM_Document.selected.$editWrapper.is('.sd-audio')) {
                data = EM_Document.selected.$editWrapper.data();
                data.isedit = isedit;
                popuplateSlideselector();
                loadsettings(data);

                //  $(this).addClass('edit-audio'); //needed?
                //  $('#audio-save-btn > .title').html('UPDATE');
                //  } else {
                // clearAudioControls();
                //  $(this).removeClass('edit-audio'); //needed?
                //  $('#audio-save-btn > .title').html('SAVE');
                // }
            });


            function extractYoutubeVideoId(url) {
                var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                var match = url.match(regExp);
                if (match && match[2].length == 11) {
                    return match[2];
                } else {
                    return false;
                }
            }
            
            $('#audio-save-btn').on('click', function () {
                var audioData = getSettings(), videoID;

                videoID = extractYoutubeVideoId(audioData.audiosrc);

                if (videoID) {

                    (function ($editWrappers) { //closure to ensure that when ajax finishes the effects will be applied to the selected elements at tthe time that the function was called.
                        $.get("/editor/getYoutubeMP4", { videoID: videoID }, function (data) {
                            if (data === "ERROR") {
                                EM_Dialog.showError("Unable to convert the youtube link to audio format due to copyright restrictions. <br/> Please select a different sound source", "Copyright Notice");
                            } else {
                                //  console.log(data);
                                //  data = decodeURIComponent(data);
                                console.log(data);
                                audioData.audiosrc = data;
                                audioData.audio_ytid = videoID;
                                updateAudioElement($editWrappers, audioData);
                                $editWrappers.addClass('sd-audio');
                                window.setTimeout(EM_Menu.deSelectDropdown, 100);
                            }
                        }).error(function () {
                            EM_Dialog.showError("Unable to convert the youtube link to audio format.", "Error");
                        });

                    }(EM_Document.selected.$bothEditWrappers));

                } else {
                    audioData.audio_ytid = false;
                    updateAudioElement(EM_Document.selected.$bothEditWrappers, audioData);
                    EM_Document.selected.$bothEditWrappers.addClass('sd-audio');
                    window.setTimeout(EM_Menu.deSelectDropdown, 100);
                }
            });

            $('#audio-remove-btn').click(function () {
                removeAudio(EM_Document.selected.$bothEditWrappers);
                window.setTimeout(EM_Menu.deSelectDropdown, 100);
            });


        }

    }


    //#region editor

    function serializeDataByPrefix($obj, prefix) { //save an object into an element's data attributes. it filters properties of the object that are relevant to be saved.
        var data = $obj.data();
        var attributes = {};
        for (var prop in data) {
            if (prop.indexOf(prefix === 0)) {
                attributes["data-" + prop] = data[prop];
            }
        }
        $obj.attr(attributes);
    }

    //function serializeAudioData($audioWrapper) {
    //    var data = $audioWrapper.data();

    //    $audioWrapper.attr(serializeDataByPRefix(data, 'audio'));

    //    //$audioWrapper.attr({ 'data-audiostop': data.audiostop, 'data-audioautoplay': data.audioautoplay, 'data-audiostarttime': data.audiostarttime, 'data-audiostoptime': data.audiostoptime, 'data-audiosrc': data.audiosrc, 'data-audioloop': data.audioloop, 'data-audio_ytid': data.audio_ytid });
    //}

    function updateAudioSrc($wrapper, src) {
        var isAdd = !$wrapper.is('.sd-audio'),
            prevData = $wrapper.data(),
            audioData = prevData;

        audioData.audiosrc = src;

        if (isAdd) {
            $wrapper.addClass('sd-audio');
            $('#btn-audio').addClass('active');
        }

        $wrapper.data(audioData);
        serializeDataByPrefix($wrapper, "audio");

        if ($wrapper.is('.slide > .edit-wrapper')) { //this function is bering called using $.each on audio upload done event. so we check to see if its bering applied to a wrapper in a slide before logging in history.
            EM_Editor.history.recordAction(isAdd ? audioUndoRedo : audioEditUndoRedo, { $wrapper: $wrapper.filter('.slide > .edit-wrapper'), audioData: audioData, prevData: prevData });
        }
        EM_Workspace.isDirty();
    }

    function updateAudioElement($wrapper, audioData, dontLogInHistory) {
        var isAdd = !$wrapper.is('.sd-audio'), data = $wrapper.data(),
            prevData = { audiostop: data.audiostop, audioautoplay: data.audioautoplay, audiostarttime: data.audiostarttime, audiostoptime: data.audiostoptime, audiosrc: data.audiosrc, audioloop: data.audioloop, audiostopothers: data.audiostopothers, /*isedit: data.isedit, */ audio_ytid: data.audio_ytid };

        if (isAdd) {
            $wrapper.addClass('sd-audio');
            $('#btn-audio').addClass('active');
        }

        $wrapper.data(audioData);
        serializeDataByPrefix($wrapper, "audio");

        if (!dontLogInHistory) {
            EM_Editor.history.recordAction(isAdd ? audioUndoRedo : audioEditUndoRedo, { $wrapper: $wrapper.filter('.slide > .edit-wrapper'), audioData: audioData, prevData: prevData });
        }
        EM_Workspace.isDirty();
    }



    function removeAudio($wrapper, dontLogInHistory) {
        var data = $wrapper.data();
        audioData = { audiostop: data.audiostop, audioautoplay: data.audiostop, audiostarttime: data.audiostop, audiosrc: data.audiostop, audioloop: data.audiostop }

        $wrapper.removeClass('sd-audio');
        $wrapper.removeAttr('data-audiostop data-audioautoplay data-audiostarttime data-audiosrc data-audioloop');
        $wrapper.data({ audiostop: null, audioautoplay: null, audiostarttime: null, audiosrc: null, audioloop: null });

        if (!dontLogInHistory) {
            EM_Editor.history.recordAction(audioUndoRedo, { $wrapper: $($wrapper.filter('.slide > .edit-wrapper')), audioData: audioData });
        }
        EM_Workspace.isDirty();
    }

    function audioUndoRedo(data) {
        var $bothEditWrappers = EM_Workspace.withEditSurfaceWrapper(data.$wrapper);

        if (data.$wrapper.is('.sd-audio')) {
            removeAudio($bothEditWrappers, true);
        } else {
            $bothEditWrappers.data(data.audioData);
            serializeDataByPrefix($bothEditWrappers, "audio");
            $bothEditWrappers.addClass('sd-audio');
        }
    }
    function audioEditUndoRedo(data, isUndo) {
        var $bothEditWrappers = EM_Workspace.withEditSurfaceWrapper(data.$wrapper);

        $bothEditWrappers.data(isUndo ? data.prevData : data.audioData);
        serializeDataByPrefix($bothEditWrappers, "audio");
    }



    //#endregion

   

    function playAudio(audio, $editWrapper) {
        try {
            // audio.pause();//addeed ths hoping that it will help with setting current time

            //    audio.src = audio.src; //this sets start time to whatever its supposed to be in the case that its set in url or not. should also help to ensure that audio is availalble each time.

            //  if (startTime !== null && startTime !== undefined) {
            //      audio.currentTime = getSecondsFromTimeSpan(startTime);
            //  } else {
            //      audio.currentTime = 0;
            //  }
            //   audio.src = audio.src;
            audio.play();
            //  $editwRapper.addClass('sd-audio-play');

            if ($editWrapper.data().audiostopothers) { //stop all audio that is currently playing
                $jukebox.children().each(function () {
                    if (this !== audio && !this.paused && !this.ended) {
                        updateAudioElement
                        stopAudio(this, getEditWrapper(this));
                    }
                });
            }

        } catch (e) {
            console.log("audio play error", e);
        }

    }

    function stopAudio(audio, $editwRapper) {
        audio.pause();
        //audio.currentTime = 0;
        audio.src = audio.src; //this sets start time to whatever its supposed to be in the case that its set in url or not. should also help to ensure that audio is availalble each time.

        $editwRapper.removeClass('sd-audio-play');
    }

    function handleContextMenu(e) {
        var $wrapper = $(this), data = $wrapper.data(), $audio, audio;
        $audio = $jukebox.children('[data-parent-uid="' + data.uid + '"]');
        audio = $audio[0];
        if (!audio.paused) {
            stopAudio(audio, $wrapper);
        }
        e.preventDefault();
    }

    function handleAudioClick() {
        var $wrapper = $(this), data = $wrapper.data(), $audio, audio;
        $audio = $jukebox.children('[data-parent-uid="' + data.uid + '"]');
        audio = $audio[0];
        playAudio(audio, $wrapper);
    }
   
    function addSlideAudioFromQue(slideNum){
        var audioQueItem;
       
        for (var i = 0; i < audioQue.length; i++) {
            audioQueItem = audioQue[i];

            if (audioQueItem.slideNum == slideNum) {
                audioQue.splice(i, 1); //remove it from the que
                addAudioToJukeboxMultiple(audioQueItem.slideAudio, slideNum); //add all the audio 
            }
        }

    }

    function handleSlideChange(event, slideNum) {
        var currentSlideNum = scene.currentSlideNum();
       

        if(slideNum === 0) {
            slideNum = 1; //on first load, 3-d lounge, perhpas other themes as well, are returning 0 for the slide num. 
        }

        addSlideAudioFromQue(slideNum);

        $jukebox.children('audio').each(function () {
            var $this = $(this),
                data = $this.data(),
                $wrapper = $('#scene [data-uid="' + data.parentUid + '"]');

            // if it belongs to the current slide, autoplay if needed.
            if (data.audioautoplay === true && this.paused && Number(data.slidenum) === slideNum) {
                console.log('playAudio', this);
                playAudio(this, $wrapper);
            }   //handle current slide, forwards, and backwards navigation
            else if (!this.paused && data['audiostop'] !== undefined && data['audiostop'] !== -1 && (data.audiostop === 0 || data.audiostop < slideNum || slideNum < currentSlideNum)) {
                console.log('stopAudio', this);
                stopAudio(this, $wrapper);
            }
            $wrapper.toggleClass('sd-audio-play', !this.paused);
        });
    }

    function reset(slideDeck) {
        stopAllAudio();
        $jukebox.html('');
        loadAllAudioFromSlideDeck(slideDeck);
    }

    function stopAllAudio() {
        $('audio , video').each(function () { this.pause() });
    }


    function getSecondsFromTimeSpan(str) {
        var p, s, m;
        try {
            
            if (!str) {
                return 0;
            }
            p = String(str).split(':');
            s = 0;
            m = 1;

            while (p.length > 0) {
                s += m * parseInt(p.pop(), 10);
                m *= 60;
            }
            return s;

        } catch (e) {
            $.post("../present/logError", { source: "emaze.audio.js/getSecondsFromTimeSpan", message: e.message + " str: " + str });
            return 0;
        }
    }

    function debugInEditor() {
        $('#edit-surface').on('click', '.sd-audio', handleAudioClick);
        $("#scene").on('transitionStart', handleSlideChange);

    }
    //#endregion
    return {
        init: init,
        reset: reset,
        handleSlideChange: handleSlideChange,
        stopAllAudio: stopAllAudio,
        loadingTracker: loadingTracker,
        updateAudioElement: updateAudioElement,
        toggleEnabled: toggleEnabled,
        updateAudioSrc: updateAudioSrc
    }

})();


//function dk() {

//    $('#jukebox').css({
//        position: 'absolute',
//        'z-index': '100',
//        top: '100px',
//        left: '400px'
//    }).children('audio').prop('controls', true);
//}









