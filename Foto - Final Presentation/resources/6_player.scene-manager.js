
//#region polyfills
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}

//#endregion


EM.scenemanager = (function($){
    
    var isStatic = $('html').data('static') === true,
        isCompatible = true,
        slidedeck,//parsed slidedeck
        attempt = 0, //presentation object fetching attempts
        isSlideBox,
        imageOptimizer = {
            screenScaleFactor: 1, //the max scale factor if user goes full screen used for image optimization
            enableResize: true,
            enableLazyload: true,
            disableGifs: true          
        },
        optimizer = { //object that holds optimization settings about the presentation
            hasVideos: false,
            preLoadSlides: 1, //numeric for future support of multiple slides. currently supports just the next slide. set to zero to de-activate
            $preLoader : null
        };
    optimizer.analyzeSlide =  function(slideHtml) { //if any slide is encountered that has videos in it, set hasVideos to true to enable (inefficient) video bugfix woraround in chrome
        if(slideHtml.indexOf('<video') !== -1) {
            optimizer.hasVideos = true;
        }
    }

    /*** Public methods ***/

    function init( id ){
        
        imageOptimizer.enableResize = !EM.player.context.isDownload && window.location.href.indexOf('fullsizeimages') === -1;
        imageOptimizer.screenScaleFactor = Math.round(Math.min(window.screen.width / 1920, window.screen.height / 1080) * 100) / 100;
       
        if(optimizer.preLoadSlides) {
            $preLoader = $('<div id="pre-loader">').appendTo('#scene');
            $('#scene').on('transitionDone', function () {
                var slideNum = scene.currentSlideNum();
                var slides = slidedeck.sections.reduce(function (prev, current) { return prev.concat(current.slides) }, []); //TODO do this only once every time slide deck changes.
                var $slide;
                //TODO: problems: 1. the image optimizer will wipe out the image urls, making this useless until image src is set from data-src. possible alternate implementatrion is ot have the scen expore a getslidehtml function that returnt he html that it has stored for that slide.
                var targetSlide = slides[slideNum]; //no need to do plus one to get next slide because slidies is zero based but slide num is 1 based.
                if(targetSlide) {
                    $slide = $(targetSlide);
                    if (imageOptimizer.enableLazyload) { //amke sure the images are there for preloading
                        $slide.find('img[src="//resources.emaze.com/vbplayer/images/blanky.png"]').each(function () {
                            this.setAttribute('src', this.getAttribute('data-src'));
                        });
                    }
                    $preLoader.empty().append($slide);
                }
            });
        }

        /* Set listeners */
        
        // Presentation Object is ready, start setting the presentation technology and assets
        $(window).one( 'presentationObjectReady', technologyWorker.init );
        

        //show the custom theme loader when relevant.
        $(window).one('presentationObjectReady', function () {
            if(EM.scenemanager.presentation.theme.logoImage){
                $('.emazeloader').css('background-image', ['url(', EM.scenemanager.presentation.theme.logoImage, ')'].join(''));
            }
        });

        // invoke DOM setup for the current presentation slidedeck
        $(window).one('technologyReady', slidesWorker.init );

        // ezload slidedeck images
        $(window).on('sceneReady', function(){ 
            if (imageOptimizer.enableLazyload) {
                gradualImageLoader('#slide-box');
            }
        });

        // Get presentation thumbnail image and set in loader background
        setLoaderThumb( id );

        // Get the presentation object and start initialization
        getPresentationObject( id );
    }

    // Clear and reset scene and it's required assets
    // in order for editor and player being synched during play from editor
    // Called from EM.player.reload();
    function reload ( updatedSlideDeck ) {
        //get prev slide count
        var slideCount =  slidedeck.sections.reduce(function (prev, current) {
            return prev + current.slides.length;
        }, 0);

        // Clear current slides.
        while (slideCount) {
            scene.deleteSlide(1);
            slideCount--;
        }

        // Set global slide deck to edtior's provided slide deck
        slidedeck = updatedSlideDeck;

        // Set the provided slides
        slidesWorker.setSlides();
        
    }

    // Change a given slidedeck images src to data-src attribute
    function changeSlidedeckImgSrcToDataAttr (sd) {
        for (i = 0; i < sd.sections.length; i++) {
            sections = sd.sections[i];

            for (var j = 0; j < sections.slides.length; j++) {
                if (isCompatible) {  //CODEREVIEW: why is this being checked inside the loop? seems like first like of function should be if !isCompatible return; OR check before calling this function.
                    sections.slides[j] = changeSlideImgSrcToDataAttr(sections.slides[j]);
                }
            }
        }

        return sd;
    }


    /*** Private methods ***/

    // method will set EM.scenemanager.presentation according to data
    // recieved from getPresentation method from PresentController
    function getPresentationObject(id) {
           var canContinue = true;

        if ( !isStatic ){
            // Fetch presentation object using AJAX
            $.post("/present/getPresentation", { presentationID: id, key: getUrlParameter('key') }, function (data) {
                EM.scenemanager.presentation = data;
                
                canContinue = errorHandler.init( EM.scenemanager.presentation.core.message );

                if ( canContinue ){
                    // Check if browser compatible with presentation
                    isCompatible = EM.compatibility.isCompatible();
                   // isCompatible = false; //TODO REMOVE!
                    $(window).trigger('presentationObjectReady');
                } 

            })
            // Not 404 error, might worth to retry fetching the presentation object
            .fail(function(error) {            
                // retry up to 3 times
                if ( attempt < 3 ){
                    console.error('Server responded with ' + error.status + " performing retry #" + (attempt + 1) );
                    attempt++;
                    getPresentationObject( id );

                } else {
                   window.dispatchEvent( new CustomEvent('error', { 'detail': error.status }) );
                   errorHandler.error500();
                   $(window).off('keydown');
                   console.error("Oh my, a " + error.status + " just occured.");
                }

            });

        } else {
            // Fetch presentation object from a static variable
            EM.scenemanager.presentation = presentation.Data;

            // Check if browser compatible with presentation
            isCompatible = EM.compatibility.isCompatible();
            
            // Change files path for offline
            if ( EM.player.context.isDownload ){
                resources = "resources";
            }

            if ( canContinue ) $(window).trigger('presentationObjectReady');
        }

    }

    // Get URI parameter value by parameter name
    function getUrlParameter (sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) 
        {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) 
            {
                return sParameterName[1];
            }
        }

        return '';
    }

    // will set presentation thumbnail based on presentation ID
    function setLoaderThumb ( id ) {
        if ( !isStatic ){
            // Fetch using ajax
            $.ajax({
                url: '/getThumbnail/' + id,
                type: 'GET'
            })
            .done(function(data) {
                $('#thumb-img').css('opacity', 0).attr('src', data).animate({'opacity': 1}, 'slow');
            })
            .fail(function(error) {
                console.error("Unable to retrieve Presentation thumbnail, A " + error.status +" error just occured");
            });

        } else {
            // just animate. image is already there
           $('#thumb-img').css('opacity', 0).animate({'opacity': 1}, 'slow');
        }   
    }

   

    function appendLink(id, href) {
        var head = document.getElementsByTagName('head')[0],
            link = document.createElement('link');

            link.id = id;
            link.href = href;

            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.media = 'all';

            head.appendChild(link);
    }

    function appendScript(className, src, isAsync) {
        var script = document.createElement('script');

        script.className = className;
        script.setAttribute('src', src);
        script.async = isAsync || false;
        document.body.appendChild(script);

    }

    // technologyWorker.init triggers on 'slidedeckReady' event.
    // get the DOM ready for the current presentation technology data
    var technologyWorker  = {
        init: function () {
          //  if (!$('html').data('download')) {
                technologyWorker.setMeta();
                technologyWorker.setCSS(EM.scenemanager.presentation.theme.cssUrl);
                technologyWorker.setThemeCSS(EM.scenemanager.presentation.theme.themeUrl);
                technologyWorker.setScripts(EM.scenemanager.presentation.theme.jsUrl);
          //  }
        },
        // setMeta will append/update meta tags (fb, twitter, etc.)
        setMeta: function(){
            var pName = EM.scenemanager.presentation.core.name,//presentation name
                oName = EM.scenemanager.presentation.userInfo.userName,//owner name
                playerUrl = EM.scenemanager.presentation.theme.playerUrl,
                thumbUrl = EM.scenemanager.presentation.theme.imageUrl,
                description = EM.scenemanager.presentation.core.description;

            $('title').html( pName + ' by ' + oName + ' on emaze');

          //  $('link[rel="canonical"]').attr('href', playerUrl);
            
            // Facebook meta
            $('meta[name="og:url"]').attr("content", playerUrl);
            $('meta[name="og:title"]').attr("content", pName);
            $('meta[name="og:image"]').attr("content", thumbUrl);
            $('meta[name="og:description"]').attr("content", thumbUrl);

            // Twitter meta
            $('meta[name="twitter:url"]').attr("content", playerUrl);
            $('meta[name="twitter:title"]').attr("content", "watch my amazing presentation on emaze-" + pName);
            $('meta[name="twitter:description"]').attr("content", "@emaze_tweets is the leading online #presentation software for the business presenter");
            $('meta[name="twitter:image"]').attr("content", thumbUrl);

            $('meta[name="description"]').attr("content", description);            

        },
        // setCSS will append/update given CSS paths to the DOM
        // @params: path to the CSS file, id to recognize the CSS (technology/theme)
        // TODO: verify if any chance for multiple files in the path or always will be singular
        setCSS: function( path ){
            if (!EM.player.context.isDownload ){ //downloadable player has links already in place
                appendLink('technologyCSS', environment + '/' + path);
            }
        },
        // get the DOM ready for the current presentation theme files
        setThemeCSS: function( path ){  //CODEREVIEW: create appendCSSLink function and re-use it below

            if (!isCompatible) { 
                appendLink('GenericThemeCSS', EM.player.context.isDownload ? $('#generic-css').attr('src') : environment + '/Technologies/Generic/css/generic.css');
            }

            if (!EM.player.context.isDownload) {
                appendLink('themeCSS', resources + '/' + path + '.css');

                if (EM.scenemanager.presentation.theme.customCssUrl) {
                    appendLink('CustomThemeCSS', EM.scenemanager.presentation.theme.customCssUrl);
                }
            } 
        },
        // setScripts will append/update given scripts paths to the DOM
        setScripts: function( paths ){
            
            if (!isCompatible) {
                appendScript('technologyjs', EM.player.context.isDownload ? $('#generic-js').attr('src') : environment + '/Technologies/Generic/js/generic.js');
            }

            if ( !EM.player.context.isDownload ){
                //Theme specific js
                appendScript('themejs', resources + '/' + EM.scenemanager.presentation.theme.themeUrl + '.js');

                if (EM.scenemanager.presentation.theme.customJsUrl) {
                    $.ajax({
                        url: EM.scenemanager.presentation.theme.customJsUrl, //or your url
                        success: function (data) {
                                appendScript('customThemejs', EM.scenemanager.presentation.theme.customJsUrl);
                        },
                        error: function (data) {
                            console.error('Custom JS file does not exist');
                        },
                    });
                }
                if (isCompatible) {
                    // parse paths to an array
                    var pathsArray = paths.split(',');

                    // append each given script to the DOM
                    for (var i = 0; i < pathsArray.length; i++) {
                        appendScript('technologyjs', environment + '/' + pathsArray[i]);
                    };

                    if (paths.indexOf('zoomer') != -1) {  //CODEREVIEW: what if movement.js is already in the array? check if contains movement.js and dont add twice OR fix the technology strings in the database OR merge the two files into zoomer.js and dont load 2 files
                        appendScript('technologyjs', environment + '/Technologies/Zoomer/js/movement.js');
                    }
                }
            }

            // Listen to scene init loadfinished event and continue with
            // scene setup
            $('body').on('loadfinished', function(){  //CODEREVIEW: why are we listening to one event just to fire another event?
                // report technologyReady event
                $(window).trigger('technologyReady');
            });

            // check if loaded scene object is ready and init the scene
            var interval = setInterval(function(){

                if ((isCompatible || typeof(window.scene.isFallback) === "function") && typeof( window.scene.init ) === "function"){ // if not compatible, make sure scene is fallback. otherwise, the scene object is still set to the original scene
                    clearInterval( interval );
                    scene.init('scene', { resourcesURL: resources, themeURL: EM.scenemanager.presentation.theme.themeUrl, forceSlideUpdate: EM.player.context.isEditor });
                    isSlideBox = $('#slide-box').length;
                }

            }, 100);
        },
        // Clearing all implemented scripts
        clearScripts: function(){
            $('.technologyjs').remove();
            $('.themejs').remove();
        },
        // Clearing current theme CSS
        clearThemeCSS: function(){
            $('#themeCSS').remove();
        }
    }

    // slidesWorker.init triggers on 'presentationObjectReady' event.
    // sets the scene
    var slidesWorker = {
        init: function(){
            // Build slidedeck from raw presentation object slidedeck
            if (EM.player.context.isDownload) {
                slidedeck = EM_slideDeck.getSlideDeckFromDocument();
                EM_slideDeck.decompressSectionTitles(slidedeck);
            }else {
                slidedeck = EM_slideDeck.getSLideDeckFromString(EM.scenemanager.presentation.theme.slides);
            }
            slidesWorker.setSlides();
        },
        // Method get raw (compressed) slide deck,
        // Parse it and add the slides to the DOM
        setSlides: function(){
            var totalNumOfSlides = 0, section, slideHtml;

            imageOptimizer.enableLazyload = isSlideBox && isCompatible; // &!EM.player.context.isEditor

            for (i = 0; i < slidedeck.sections.length; i++) {
                section = slidedeck.sections[i];

                for (var j = 0; j < section.slides.length; j++) {
                    slideHtml = section.slides[j];
                    optimizer.analyzeSlide(slideHtml);
                    section.slides[j] = processSlideString(slideHtml);
                    window.scene.addSlide(section.slides[j]);
                }
                totalNumOfSlides += section.slides.length;
            }
            
            // For now add comaptibility msg display here, until better place is found
            if (!isCompatible && EM.compatibility.getDevice() != 'mobile') {
                $('.compatability-msg').removeClass('hidden');
                $('.compatability-button').click(function(){
                     $('.compatability-msg').addClass('hidden'); 
                });    
            }

            $(window).trigger('sceneReady', [slidedeck, totalNumOfSlides]); 

        }
    }

    function ensureYoutubeSSLbackwardsCompatability(html) {

        var match = html.match(/<iframe.*?sd-element-video.*?http.*?>/g), updated;

        if (match) {
            updated = match.map(function (elm) {
                // Replace src with data-src & set default blank image in the src
                return elm.replace('http://', 'https://');
            });

            // Update the html
            for (var i = 0; i < updated.length; i++) {
                html = html.replace(match[i], updated[i]);
            };
        }
        return html;

    }

    function changeIFrameSrcToDataAttr(html) {
        //doing with regex rather than parsing as html because parsing it as html causes the resources to load.
        var match = html.match(/<iframe.*?>/g), updated;

        if (match) {
            updated = match.map(function (elm) {

                // Replace src with data-src & set default blank in the src
                return elm.replace(' src', ' src="about:blank" data-src');
            });

            // Update the html
            for (var i = 0; i < updated.length; i++) {
                html = html.replace(match[i], updated[i]);
            };
        }
        return html;

    }



    //consider using this: https://github.com/ressio/lazy-load-xt

    //enable disable videos in slide.
    function processVideos(html) {

        var videos = html.match(/<video.*[^-]src="[^"+]".*>/g), videosUpdated;  //regex matches all videos that have a src attribute that is not "" should also handle sighe quotes just in case...

        if (videos) {
            videosUpdated = videos.map(function (elm) {
                // Replace src with data-src & set default blank image in the src
                return elm.replace('src', 'src="" data-src');
            });
            // Update the html
            for (var i = 0; i < videosUpdated.length; i++) {
                html = html.replace(videos[i], videosUpdated[i]);
            };
        }

        return html;
           
    }
    

    function processSlideString(slideHtml) {

        slideHtml = processVideos(slideHtml);

        slideHtml = ensureYoutubeSSLbackwardsCompatability(slideHtml);


        if (imageOptimizer.enableLazyload || imageOptimizer.enableResize) {
            slideHtml = changeSlideImgSrcToDataAttr(slideHtml);
        }
        
        slideHtml = changeIFrameSrcToDataAttr(slideHtml);

        //now that all src attributes have been safely neutralized, we can run the following function that parses the dom to optimize with cloudinary
        if (imageOptimizer.enableResize || imageOptimizer.freezeGifs) { 
            slideHtml = optimizeSlideImgDataSrcWithCloudinary(slideHtml);
        }

        if (!imageOptimizer.enableLazyload && imageOptimizer.enableResize) { //if we are not lazy-loading but we moved the src to data-src, we need to move it back now.
            slideHtml = changeSlideImgDataAttrToSrc(slideHtml);
        }

        return slideHtml;
    }


    // Change src attribute to data-src with img URL.
    function changeSlideImgSrcToDataAttr ( html) {
      //  var device = EM.compatibility.getDevice(), imagesFolder;
       
        // var images = html.match(/<img(.*?src=.*?layoutimages).*?>/g),  // Target all the layout images, user content will be unaffected
        var images = html.match(/<img.*?>/g), imagesUpdated;  //target all images
        
        if (images){
            imagesUpdated = images.map(function(elm){
                // Replace src with data-src & set default blank image in the src
                return elm.replace('src', imageOptimizer.enableLazyload ? 'src="//resources.emaze.com/vbplayer/images/blanky.png" data-src' : "data-src");
            });
           
            //if (device == EM.compatibility.Devices.MOBILE) {
            //    imagesFolder = 'layoutimages_mobile';
           // }else if (device == EM.compatibility.Devices.TABLET) {
           //     imagesFolder = 'layoutimages_tablet';
           // }else {
           //     imagesFolder = false;
           // }

            // Update the html
            for (var i = 0; i < imagesUpdated.length; i++) {
              //  if (imagesFolder) {
                    // In case of mobile change image path to mobile layout images
               //     imagesUpdated[i] = imagesUpdated[i].replace('layoutimages', imagesFolder);
               // }
                    html = html.replace(images[i], imagesUpdated[i]);
                };
        }

        return html;
    }

    // Change src attribute to data-src with img URL.
    function changeSlideImgDataAttrToSrc(html) {
        // var images = html.match(/<img(.*?src=.*?layoutimages).*?>/g),  // Target all the layout images, user content will be unaffected
        var images = html.match(/<img.*?>/g), imagesUpdated;  //target all images

        if (images) {
            imagesUpdated = images.map(function (elm) {
                // Replace src with data-src & set default blank image in the src
                return elm.replace('data-src', 'src');
            });

            // Update the html
            for (var i = 0; i < imagesUpdated.length; i++) {
               
                html = html.replace(images[i], imagesUpdated[i]);
            };
        }

        return html;
    }

    function addCloudinaryDimentionParam(params, key, val) {
        if (val) {
            params.push(key + Math.ceil(Math.round(val * imageOptimizer.screenScaleFactor) / 10) * 10);  //round up to closest 10 pixels  consider: multiply by the scale factor of the scene
        }
    }

    function generateCloudinaryImgUrl($img, src) {
        var w, h, isOptimized = false, params = ['c_limit', 'a_ignore'], img = $img[0], sizeAttr, size, isGif, sizeFactor; //size is an array [width,height] of the image's natural size, saved by the editor


        if (!src) {
            return src;
        }

        sizeAttr = $img.attr('data-img-size');
        isGif = imageOptimizer.disableGifs && src.endsWith('.gif');

        if (sizeAttr) {

            size = sizeAttr.split(',');
            if (size && size.length == 2) {

                w = parseInt(img.style.width.indexOf('%') === -1 ? img.style.width : img.parentElement.style.width);
                h = parseInt(img.style.height.indexOf('%') === -1 ? img.style.height : img.parentElement.style.height);

                sizeFactor = isGif ? 1.1 : 1.7; // 1 = 100% 2= 50% 

                if (size[0] / (w * imageOptimizer.screenScaleFactor) > sizeFactor || size[1] / (h * imageOptimizer.screenScaleFactor) > sizeFactor) {
                    addCloudinaryDimentionParam(params, 'w_', w);
                    addCloudinaryDimentionParam(params, 'h_', h);
                    isOptimized = true;
                }
            }
        }

        if (isGif) {
            params.push('f_png');
            isOptimized = true;
        }

        if (isOptimized) {
            if (src.indexOf('//') === 0) {
                src = window.location.protocol + src; //can't send relative protocol to cloudinary
            }
            return 'https://res.cloudinary.com/emazecom/image/fetch/' + (params.length ? params.join(',') : '') + '/' + encodeURIComponent(src);
        } else {
            return src; //don't change the src if there is nothign to optimize.
        }
    }


    function optimizeSlideImgDataSrcWithCloudinary(slideHtml)
    {
        var $tempDomFragment =  $('<div>').html(slideHtml);
        
        $tempDomFragment.find('.sd-element-image').each(function () {
            var $this = $(this),
                src = generateCloudinaryImgUrl($this, $this.attr('data-src'));
                $this.attr('data-src', src);
        });

        return $tempDomFragment.html();
    }

    function loadMyImage($images, i) {
        var image = $images.eq(i),
            imageSrc = image.attr('data-src');  

        $('<img />').load(function () {
            // remove data-src & set image src
            image.removeAttr('data-src');

            image.attr('src', imageSrc);

            if (i < $images.length) loadMyImage($images, i + 1);

        }).error(function () {//Even if image missing continue with the rest
            if (i < $images.length) loadMyImage($images, i + 1);
        }).attr('src', imageSrc);//Start the loading chain
    }


    // Forcing sync load of slide images in a given container
    function gradualImageLoader ( containerID ) {
        var $slides = $(containerID).find('.slide');

        $.each($slides, function(index, slide) {
            //get all blanked-out images in slide, and 
            loadMyImage($('img[src*=blanky]', slide), 0);
        });
    }

    var errorHandler = {
        init: function ( msg ) {
            var scale_factor = $(window).width() / 1920;

            function handleError(callBack, errorMessage ) {
                callBack.call();
                $(window).off('keydown');
            }

            function adjustViewForMobile() {
                if (EM.compatibility.getDevice() === ('mobile')) {
                    scale_factor = 0.6;
                    $('#the-error').css('left', '-25px');
                }
            }
            switch( msg ){
                case 'E403'://No permission to view presentation
                    handleError(errorHandler.notAllowed, 'presentation is private');
                break;
                case 'E404'://Presentation not found
                    handleError(errorHandler.error404, 'presentation not found');
                break;
                case 'E500'://Server Error 500
                    handleError(errorHandler.error500, 'server error');
                break;
                case 'NA'://Presentation Deleted
                    handleError(errorHandler.notAvailable, 'presentation deleted');
                break;
                case 'login':
                    handleError(errorHandler.login, 'login requried to view this presentation');
                    adjustViewForMobile();
                break;
                case 'password':
                    handleError(errorHandler.password, 'presentation is password protected');
                    adjustViewForMobile();
                break;
                default:
                    return true; //no error;
            }
         
            // Scale the error to fit the screen
            $('body').css('background', 'black');
            EM.player.setScale($('#the-error'), scale_factor);
            return false;
        },
        hideError: function () {
            $('#menu-container').removeClass('hidden');
            $('#the-error').fadeOut(300);
        },
        error404: function(){
            $('#menu-container').addClass('hidden');
            EM.player.removeLoader();

            $('.error-image').addClass('error-404');
            $('.error-header').text('DOH!');
            $('.error-text').text("We looked everywhere and we're unable to find the requested presentation.");
            $('.close-button').on('click', function(){
                window.location.href = '/mypresentations';
            });
            $('.error-info').append('<p class="server-msg">' + EM.scenemanager.presentation.core.details + '</p>');
            
            $('#the-error').fadeIn(300);

            window.dispatchEvent(new CustomEvent('playerError', {
                detail: {
                    type: "E404",
                    image: 'error-404',
                    header: 'DOH!',
                    text: "We looked everywhere and we're unable to find the requested presentation.",
                    clickUrl: '/mypresentations',
                    details: EM.scenemanager.presentation.core.details
                }
            }));

        },
        error500: function(){
            $('#menu-container').addClass('hidden');
            EM.player.removeLoader();
            
            $('.error-image').addClass('error-500');
            $('.error-header')
                .html("TOTO,<br/><span>we're not in Kansas anymore...</span>")
                .css('font-size', '6em');
            $('.error-text').text("A server error occured and unexplained things are happening around us.");
            $('.close-button').on('click', function(){
                window.location.href = '/mypresentations';
            });
            if ( EM.scenemanager.presentation != undefined ){
                $('.error-info').append('<p class="server-msg">' + EM.scenemanager.presentation.core.details + '</p>');
            }
            $('#the-error').fadeIn(300);

            window.dispatchEvent(new CustomEvent('playerError', {
                detail: {
                    type: "E500",
                    image: 'error-500',
                    header: "TOTO,<br/><span>we're not in Kansas anymore...</span>",
                    text: "A server error occured and unexplained things are happening around us.",
                    clickUrl: '/mypresentations',
                    details: EM.scenemanager.presentation.core.details
                }
            }));

        },
        login: function(title, description){
            title = title === undefined ? "PRIVATE: PLEASE LOGIN" : title;
            description = description === undefined ? "This presentation is private, login to view it" : description;

            window.dispatchEvent(new CustomEvent('playerError', {
                detail: {
                    type: "login",
                    title: title,
                    description: description
                }
            }));

            $('#regform > .form-header').text(title);
            $('#regform > .description').text(description);

            $('#menu-container').addClass('hidden');
            EM.player.removeLoader();

            $('.close-button').hide();

            $('#the-error').fadeIn(300);
           // $('.form-header p').text('Private: Please Login');
           // $('.description').text('This presentation is private, login to view it');
            $('#regform').show();
        },
        notAllowed: function(){
            $('#menu-container').addClass('hidden');
            EM.player.removeLoader();

            $('.error-image').addClass('error-allow');
            $('.error-header').text('Shhhhh...');
            $('.error-text').text("The presentation you are trying to access is private, you do not have permission to view it.");
            $('.close-button').on('click', function(){
                window.location.href = '/mypresentations';
            });
            $('.error-info').append('<p class="server-msg">' + EM.scenemanager.presentation.core.details + '</p>');

            $('#the-error').fadeIn(300);

            window.dispatchEvent(new CustomEvent('playerError', {
                detail: {
                    type: "E403",
                    image: 'error-allow',
                    header: "Shhhhh...",
                    text: "The presentation you are trying to access is private, you do not have permission to view it.",
                    clickUrl: '/mypresentations',
                    details: EM.scenemanager.presentation.core.details
                }
            }));

        },
        notAvailable: function(){
            $('#menu-container').addClass('hidden');
            EM.player.removeLoader();

            $('.error-image').addClass('error-deleted');
            $('.error-header').text('So sorry!');
            $('.error-text').text("This presentation has been deleted.");
            $('.close-button').on('click', function(){
                window.location.href = '/mypresentations';
            });
            $('.error-info').append('<p class="server-msg">' + EM.scenemanager.presentation.core.details + '</p>');

            $('#the-error').fadeIn(300);

            window.dispatchEvent(new CustomEvent('playerError', {
                detail: {
                    type: "NA",
                    image: 'error-deleted',
                    header: "So sorry!",
                    text: "This presentation has been deleted.",
                    clickUrl: '/mypresentations',
                    details: EM.scenemanager.presentation.core.details
                }
            }));
        },
        password: function(){
            $('#menu-container').addClass('hidden');
            EM.player.removeLoader();

            $('#the-error').fadeIn(300);

            $('.close-button').hide();

            $('#the-error').fadeIn(300);
            $('.form-header p').text('Password Protected');
            $('.description').text('This presentation is password protected. Please enter your password:');

            $('#passwordProtected').show();

            $('.gopassgo').on('click', function(event) {
                event.preventDefault();

                $.ajax({
                    url: "/Password/index",
                    type: "POST",
                    data: {
                        presentationId: presentationId,
                        password: $('.passy').val()
                    },
                    success: function(data){

                        if ( data === 'true') {                            
                                setTimeout(function () {
                                    window.location.reload(); // clear cache
                                }, 1000);                            
                                //window.location.href = "/" + presentationId;
                        } else {
                            $('#passwordProtected .field-validation-error-password')
                            .hide()
                            .text( 'Wrong Password' )
                            .show()
                            .animate({'bottom': '0px'}, 300, 'easeOutBounce', function(){
                                // Hide error messages on input focus
                                $('input').one('focus', function(){
                                    $('.field-validation-error-password')
                                    .add('.field-validation-error-user')
                                    .delay(300)
                                    .animate({'bottom': '-40px'}, 300).empty();

                                });
                            });
                        }
                    }
                });

            });

            window.dispatchEvent(new CustomEvent('playerError', {
                detail: {
                    type: "password",
                    header: "Password Protected",
                    text: "This presentation is password protected. Please enter your password:",
                }
            }));
        }
    }

    // Return slide
    function getSlideByPosition (pos) {
        var counter = 0;

        for (i = 0; i < slidedeck.sections.length; i++) {
            sections = slidedeck.sections[i];

            for (var j = 0; j < sections.slides.length; j++) {
                
                if ( counter == pos ){
                    return sections.slides[j];
                }

                counter++;
            }
        }
    }

    // Return slide
    function getSectionNameBySlide (pos) {
        var counter = 0;

        for (i = 0; i < slidedeck.sections.length; i++) {
            sections = slidedeck.sections[i];

            for (var j = 0; j < sections.slides.length; j++) {
                
                if ( counter == pos ){
                    return sections.title;
                }

                counter++;
            }
        }

    }

    // return parsed slidedeck
    function getSlidedeck () {
        return slidedeck;
    }

    //public methods
    return {
        init: init,
        reload: reload,
        clearTheme: technologyWorker.clearThemeCSS,
        setTheme: technologyWorker.setThemeCSS,
        getSlidedeck: getSlidedeck,
        getSlideByPosition: getSlideByPosition,
        getSectionNameBySlide: getSectionNameBySlide,
        ezLoadImages: gradualImageLoader,
        changeSlideImgSrcToDataAttr: changeSlideImgSrcToDataAttr,
        changeSlidedeckImgSrcToDataAttr: changeSlidedeckImgSrcToDataAttr,
        errorHandler: errorHandler,
        processSlideString: processSlideString,
        imageOptimizer: imageOptimizer,
        optimizer: optimizer
    }

}(jQuery));
