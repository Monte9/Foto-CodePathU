

function closeAllPopups() {
    $('.menu-popup').hide();
    $('.iframe-popup-container').hide();
    $('.iframe-popup').remove();
    toggleOverlay(false);
}

// create and show overlay behind popups - and destroy and hide overlay

function showWithTransition(element) {
    if ($('body').hasClass('ipad')) {
        element.show();
    } else {

        element.css('opacity', 1);
        element.css('visibility', 'visible');
    }
}

function hideWithTransition(element) {
    if ($('body').hasClass('ipad')) {
        element.hide();
    } else {
        element.css('opacity', 0);
        element.css('visibility', 'hidden');
    }
}

function toggleOverlay(toggle) {
    var $overlay = $('#overlay');
    if (toggle) {
        showWithTransition($overlay);
    } else {
        hideWithTransition($overlay);
    }
}

function togglePopupAndOverlay(popupSelector, toggle) {
    if (toggle) {
        closeAllPopups();
    }
    $(popupSelector).toggle(toggle);
    toggleOverlay(toggle);
}

//                                                        <Duplicate>

function duplicate() {
    var isMypres = false;
    try {
        isMypres = window.top.location.pathname && (window.top.location.pathname).toLowerCase().indexOf("/mypresentations") != -1;
        ga('send', 'event', 'PresentationActions', 'Duplicate-btn', username + ", " + presentationId);
    } catch (e) { }

    $.cookie("tab", "#my-menu-button", { path: '/' });
    $('#duplicate-popup').hide();

    if (isMypres) {
        $('#download-loader').append(loader);
        $('#download-loader').show();
        $.ajax({
            type: 'POST',
            url: '/MyPresentations/duplicate',
            dataType: 'json',
            data: { 'presentationId': presentationId },
            success: function (presentation) {
                window.parent.addNewPresentation(presentation);
                window.parent.$('#player-container').hide();
                //window.parent.$('#overlay').hide();
                window.parent.hideWithTransition(window.parent.$('#overlay'));
                window.parent.$('body').scrollTop(0);
                if (!window.parent.$('#my-menu-button').hasClass('clicked-menu-button')) {
                    window.parent.$('#my-menu-button').click();
                }
                window.parent.$('#player-iframe').remove();
                $('#download-loader').hide();
            }
        });
    } else if (!isLoggedIn) {
        //this code was intended for the presentation page ot handle log in. replaced with original login code of player
        // window.parent.postMessage('watcherNotLoggedIn', '*');
       // toggleOverlay(false);

        try {
            EM.scenemanager.errorHandler.login("PLEASE LOGIN", "Please login to duplicate this presentation.");
            $('#regform').prepend('<div class="popup-close"></div>');
            $('#regform .popup-close').on('click', function () {
                $('#the-error').add('#overlay').fadeOut(300);
                $('#menu-container').removeClass('hidden');
            });

        } catch (e) { //go to homepage login
            window.location = "//www.emaze.com";
        }

    }
    else if (isLoggedIn && EM.player.isPresentationPage()) {
        $.ajax({
            type: 'POST',
            url: '//app.emaze.com/MyPresentations/duplicate',
            dataType: 'json',
            data: { 'presentationId': presentationId },
            success: function () {
                // Show duplicate success though don't redirect
                var success_msg = '<div id="pop-success" class="menu-popup presentation-menu-popup"> <div class="popup-close"></div> <div class="popup-header">Success</div> <span class="popup-message">Presentation has been duplicated successfully.</span> <span class="popup-button-ok" style="top: 120px;">OK</span> </div>';
                $('body').append(success_msg);
                $('#pop-success').fadeIn(300);
                $('#pop-success popup-close').add('#pop-success .popup-button-ok').one('click', function (event) {
                    $('#pop-success').add('#overlay').fadeOut(300);
                    // open in new tab
                    window.open('//app.emaze.com/mypresentations', '_blank');
                });
            },
            error: function (e) {
                // TODO : something... show error.... 
            }
        });
    }
    else if (isLoggedIn) {
        $.post('/MyPresentations/duplicate', { 'presentationId': presentationId }, function (presentation) {
            try {
                if (window.top.location.origin.indexOf('app.emaze') != -1) {
                    window.top.location = "/mypresentations";
                } else {
                    // Show duplicate success though don't redirect
                    var success_msg = '<div id="pop-success" class="menu-popup presentation-menu-popup"> <div class="popup-close"></div> <div class="popup-header">Success</div> <span class="popup-message">Presentation has been duplicated successfully.</span> <span class="popup-button-ok" style="top: 120px;">OK</span> </div>';
                    $('body').append(success_msg);
                    $('#pop-success').fadeIn(300);
                    $('#pop-success popup-close').add('#pop-success .popup-button-ok').one('click', function (event) {
                        $('#pop-success').add('#overlay').fadeOut(300);
                        // open in new tab
                        window.open('//app.emaze.com/mypresentations', '_blank');
                    });
                }
            } catch (e) {
                // Show duplicate success though don't redirect
                var success_msg = '<div id="pop-success" class="menu-popup presentation-menu-popup"> <div class="popup-close"></div> <div class="popup-header">Success</div> <span class="popup-message">Presentation has been duplicated successfully.</span> <span class="popup-button-ok" style="top: 120px;">OK</span> </div>';
                $('body').append(success_msg);
                $('#pop-success').fadeIn(300);
                $('#pop-success popup-close').add('#pop-success .popup-button-ok').one('click', function (event) {
                    $('#pop-success').add('#overlay').fadeOut(300);
                    // open in new tab
                    window.open('//app.emaze.com/mypresentations', '_blank');
                });
            }
        });
    } else {
        //  window.top.location = "/home/index?url=/MyPresentations/duplicate/" + presentationId;
        try {
            EM.scenemanager.errorHandler.login("PLEASE LOGIN", "Please login to duplicate this presentation.");
            $('#regform').prepend('<div class="popup-close"></div>');
            $('#regform .popup-close').on('click', function () {
                $('#the-error').add('#overlay').fadeOut(300);
                $('#menu-container').removeClass('hidden');
            });

        } catch (e) { //go to homepage login
            window.location = "//www.emaze.com";
        }
    }
}

$('#duplicate-button').click(function () {
    closeAllPopups();
    toggleOverlay(true);
    $('#duplicate-popup').show();
    try {
        ga('send', 'event', 'PresentationActions', 'Duplicate', username + ", " + presentationId);
    } catch (e) { }
});

$('body').on('click', '.duplicate-quick-button', function () { // my-presentations
    //closeAllPopups();
    presentationId = this.parentNode.getAttribute("presentation-id");
    toggleOverlay(true);
    $('#duplicate-popup').show();
    try {
        ga('send', 'event', 'PresentationActions', 'Duplicate', username + ", " + presentationId);
    } catch (e) { }
});

$('#cancel-duplicate, #duplicate-close').click(function () {
    toggleOverlay(false);
    $('#duplicate-popup').hide();
});


$('#ok-duplicate').click(duplicate);
//                                                        </Duplicate>

function openUpgradePopup() {
    $('#generic-upgrade-popup').removeClass('sleep');
    $('#generic-upgrade-popup').addClass('active');
}

function openPricingPage(source, sourceStr) {
    var d = new Date().getTime();
    $.cookie("ezfunnel", 1, { domain: domainName });
    $.cookie("ezorigin", 'APP', { path: '/' });
    ga('send', 'event', 'Premium', sourceStr, EM.scenemanager.presentation.userInfo.userName);
    //window.open(pricingPageUrl + d, '_blank');
    $('#pricing-overlay').show();
    $('#pricing-iframe').attr('src', pricingPageUrl + d);
    $('#pricing-iframe-container').show().removeClass('sleep');
    if (!(window.self === window.top) && parent.document.URL.toLowerCase().indexOf("mypresentations") != -1) {
        parent.closeUpgradePopup();
    } else {
        closeUpgradePopup();
    }
}

function openPrivateUpgradePopup() {
    if (!(window.self === window.top) && parent.document.URL.toLowerCase().indexOf("mypresentations") != -1) {
        parent.openPrivateUpgradePopup();
    } else if (EM_Upgrade) {
        EM_Upgrade.open("private", "openPricingPage('2', 'private-btn')");
    } else {
        $('#upgrade-popup-title').html("<h1>Your presentation is public</h1>");
        $('#upgrade-popup-text').html("<h3>To make it private and gain other premium features</h3>");
        $('#upgrade-popup-btn').html("<img src='" + resources + "/mypres/css/images/btn_upgrade_normal.png' alt=\"\" onmouseover=\"this.src='" + resources + "/mypres/css/images/btn_upgrade_hover.png'\" onmouseout=\"this.src='" + resources + "/mypres/css/images/btn_upgrade_normal.png'\" onclick=\"openPricingPage('2', 'private-btn');\" />");
        openUpgradePopup();
    }
}

function openAnalyticUpgradePopup() {
    if (!(window.self === window.top) && parent.document.URL.toLowerCase().indexOf("mypresentations") != -1) {
        parent.openAnalyticUpgradePopup();
    } else if (EM_Upgrade) {
        EM_Upgrade.open("analytic", "openPricingPage('2', 'private-btn')");
    } else {
        $('#upgrade-popup-title').html("<h1>Get premium\naudience insights</h1>");
        $('#upgrade-popup-text').html("<h3>Upgrade to get more detailed insights about\nwho is watching your presentation.</h3>");
        $('#upgrade-popup-btn').html("<img src=\"" + contentBlobUrl + "/mypres/css/images/btn_upgrade_normal.png\" alt=\"\" onmouseover=\"this.src='" + contentBlobUrl + "/mypres/css/images/btn_upgrade_hover.png'\" onmouseout=\"this.src='" + contentBlobUrl + "/mypres/css/images/btn_upgrade_normal.png'\" onclick=\"openPricingPage('2', 'private-btn');\" />");
        openUpgradePopup();
    }
}

function openPasswordUpgradePopup() {
    if (!(window.self === window.top) && parent.document.URL.toLowerCase().indexOf("mypresentations") != -1) {
        parent.openPasswordUpgradePopup();
    } else {
        $('#generic-upgrade-popup').addClass('style-upgrade-popup');
        $('#upgrade-popup-title').html("<h1>Upgrade to Premium</h1>");
        $('#upgrade-popup-text').html("<h3>To protect your presentations with a password <br />and ensure only specific people have access to it</h3>");
        $('#upgrade-popup-btn').html("<img src='" + resources + "/mypres/css/images/btn_tell_normal.png' alt=\"\" onmouseover=\"this.src='" + resources + "/mypres/css/images/btn_tell_hover.png'\" onmouseout=\"this.src='" + resources + "/mypres/css/images/btn_tell_normal.png'\" onclick=\"openPricingPage('3', 'password-btn');\" />");
        openUpgradePopup();
    }
}

function openCollaborateUpgradePopup() {
    if (!(window.self === window.top) && parent.document.URL.toLowerCase().indexOf("mypresentations") != -1) {
        parent.openCollaborateUpgradePopup();
    } else if (EM_Upgrade) {
        EM_Upgrade.open("private", "openPricingPage('6', 'collaborate-btn')");
    } else {
        $('#generic-upgrade-popup').addClass('style-upgrade-popup');
        $('#upgrade-popup-title').html("<h1>Upgrade to Premium</h1>");
        $('#upgrade-popup-text').html("<h3>Collaborate your presentation with other users <br />and work on it together</h3>");
        $('#upgrade-popup-btn').html("<img src='" + resources + "/mypres/css/images/btn_tell_normal.png' alt=\"\" onmouseover=\"this.src='" + resources + "/mypres/css/images/btn_tell_hover.png'\" onmouseout=\"this.src='" + resources + "/mypres/css/images/btn_tell_normal.png'\" onclick=\"openPricingPage('6', 'collaborate-btn');\" />");
        openUpgradePopup();
    }
}

function openDownloadUpgradePopup() {
    try {
        if (!(window.self === window.top) && parent.document.URL.toLowerCase().indexOf("mypresentations") != -1) {
            parent.openDownloadUpgradePopup();
        } else if (EM_Upgrade) {
            EM_Upgrade.open("private", "openPricingPage('4', 'download-btn')");
        } else {
            $('#generic-upgrade-popup').addClass('style-upgrade-popup');
            $('#upgrade-popup-title').html("<h1>Upgrade to Premium</h1>");
            $('#upgrade-popup-text').html("<h3>Download your presentation to your computer <br />and create even more fun and easy presentations</h3>");
            $('#upgrade-popup-btn').html("<img src='" + resources + "/mypres/css/images/btn_tell_normal.png' alt=\"\" onmouseover=\"this.src='" + resources + "/mypres/css/images/btn_tell_hover.png'\" onmouseout=\"this.src='" + resources + "/mypres/css/images/btn_tell_normal.png'\" onclick=\"openPricingPage('4', 'download-btn');\" />");
            openUpgradePopup();
        }
    } catch (e) { }
    if (EM.player.isPresentationPage()) {
        if (EM_Upgrade) {
            EM_Upgrade.open("private", "openPricingPage('4', 'download-btn')");
        } else {
            $('#generic-upgrade-popup').addClass('style-upgrade-popup');
            $('#upgrade-popup-title').html("<h1>Upgrade to Premium</h1>");
            $('#upgrade-popup-text').html("<h3>Download your presentation to your computer <br />and create even more fun and easy presentations</h3>");
            $('#upgrade-popup-btn').html("<img src='" + resources + "/mypres/css/images/btn_tell_normal.png' alt=\"\" onmouseover=\"this.src='" + resources + "/mypres/css/images/btn_tell_hover.png'\" onmouseout=\"this.src='" + resources + "/mypres/css/images/btn_tell_normal.png'\" onclick=\"openPricingPage('4', 'download-btn');\" />");
            openUpgradePopup();
        }
    }
}

function closeUpgradePopup() {
    $('#download-popup').hide();
    $('#generic-upgrade-popup').removeClass('style-upgrade-popup');
    $('#upgrade-popup-title').html("");
    $('#upgrade-popup-text').html("");
    $('#upgrade-popup-text').html("");
    $('#generic-upgrade-popup').removeClass('active');
    toggleOverlay(false);
    setTimeout(function () {
        $('#generic-upgrade-popup').addClass('sleep');
    }, 1000);
}

function SharePopupClose(id, isPublic, isCollaborated, isTeam) {
    $('#newshare-iframe-container').hide();
    $('#newshare-iframe').remove();
}


function setNewSharePopupheight(height) {
    $('#newshare-iframe-container').height(height);
    $('#newshare-iframe-container').css('margin-top', height / 2 * (-1) + 'px');
}

$(function () {
    var loader = '<svg viewBox="0 0 640 560" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; width: 300px; height: 300px; top: 50%; left: 50%; margin-left: -150px; margin-top: -150px; position: absolute; z-index: 9999;" preserveAspectRatio="xMidYMid meet">' +
    '<g><text fill="#B3B4B5" stroke="#000000" stroke-width="0" x="50%" y="95%" id="svg_7" font-size="60" font-family="Sans-serif" text-anchor="middle" xml:space="preserve" font-weight="">Loading</text></g><g>' +
        '<path d="m111.85732,266.79645c-26.644,-19.93291 -65.41533,-15.79179 -86.62042,9.23016c-21.21291,25.03644 -16.8213,61.47571 9.8227,81.40872c12.15833,9.09888 70.95533,34.21552 128.88334,60.28c52.388,23.5784 103.66667,48.15561 126.2683,58.11465l1.61392,-1.89545c-15.26184,-18.28531 -52.97781,-60.04681 -88.7851,-102.32596c-40.38522,-47.66711 -78.92355,-95.64026 -91.18275,-104.81213zm-1.45859,72.96609c-15.62649,18.40924 -44.17139,21.44223 -63.78601,6.79504c-19.59119,-14.6691 -22.8344,-41.50641 -7.23112,-59.92288c15.60305,-18.40915 44.17139,-21.44211 63.77039,-6.79495c19.60658,14.66898 22.8344,41.49896 7.24674,59.92279z" fill="#B3B4B5">' +
            '<animate id="a1" attributeName="fill" from="#B3B4B5" values="#fcd14c;#B3B4B5" begin="0s; a5.end - 0.1" dur="0.5s" keySplines=".5 0 .5 1" /></path>' +
        '<path d="m230.73161,144.09282c-17.20158,-33.79279 -60.29442,-48.06082 -96.24921,-31.89712c-35.9626,16.17817 -51.16998,56.68568 -33.96841,90.47836c7.87517,15.40544 56.10454,70.11534 102.94495,125.43767c42.3638,49.97095 82.98155,100.50327 101.37791,121.87985l2.71567,-1.23941c-6.09076,-26.5968 -23.09061,-88.71417 -37.81683,-150.45966c-16.58096,-69.58302 -31.06688,-138.64841 -39.00407,-154.19969zm-41.20758,76.13754c-26.47328,11.90579 -58.20718,1.40707 -70.86205,-23.46904c-12.68588,-24.86143 -1.50523,-54.69534 24.97588,-66.58656c26.45007,-11.90579 58.20741,-1.39249 70.86203,23.48363c12.67026,24.8542 1.48961,54.68799 -24.97586,66.57198z" fill="#B3B4B5">' +
            '<animate id="a2" attributeName="fill" from="#B3B4B5" values="#f39348;#B3B4B5" begin="a1.end - 0.1" dur="0.5s" keySplines=".5 0 .5 1" /></path>' +
        '<path d="m393.59875,71.95798c0,-37.46721 -32.30811,-67.82597 -72.16553,-67.82597c-39.88089,0 -72.22,30.35877 -72.22,67.82597c0,17.25728 18.66797,85.41132 35.70663,154.91425c15.06769,61.67261 28.25793,124.57007 35.00031,151.05737l3.00266,0c6.78903,-26.72794 20.24304,-88.80148 35.47388,-151.05737c16.82889,-68.88316 35.20206,-137.81739 35.20206,-154.91425zm-72.15796,51.94672c-29.35187,0 -53.16394,-22.33888 -53.16394,-49.91255c0,-27.58101 23.80426,-49.92723 53.16394,-49.92723c29.32083,0 53.11752,22.33888 53.11752,49.92723c-0.00781,27.56632 -23.79645,49.91255 -53.11752,49.91255z" fill="#B3B4B5">' +
            '<animate id="a3" attributeName="fill" from="#B3B4B5" values="#ee4c4e;#B3B4B5" begin="a2.end - 0.1" dur="0.5s" keySplines=".5 0 .5 1" /></path>' +
        '<path d="m542.3136,202.67416c17.21698,-33.79268 2.00177,-74.30017 -33.953,-90.47846c-35.9548,-16.1636 -79.06326,-1.89556 -96.2724,31.89712c-7.92181,15.55128 -22.41556,84.60944 -38.99628,154.19981c-14.68765,61.74545 -31.70288,123.8555 -37.80927,150.45953l2.74667,1.23941c18.36536,-21.37646 59.01437,-71.90878 101.35474,-121.87973c46.82501,-55.32233 95.06198,-110.02501 102.92953,-125.43768zm-113.96268,-49.00854c12.66245,-24.87611 44.40414,-35.38942 70.85422,-23.48352c26.48889,11.89122 37.66956,41.72502 25.01471,66.58656c-12.68567,24.87611 -44.42737,35.37485 -70.86206,23.46893c-26.4967,-11.89122 -37.67737,-41.72501 -25.00687,-66.57198z" fill="#B3B4B5">' +
            '<animate id="a4" attributeName="fill" from="#B3B4B5" values="#c94b50;#B3B4B5" begin="a3.end - 0.1" dur="0.5s" keySplines=".5 0 .5 1" /></path>' +
        '<path d="m439.7951,371.60126c-35.79187,42.27911 -73.54669,84.04074 -88.80072,102.32596l1.62955,1.89566c22.60165,-9.95193 73.89569,-34.52914 126.25269,-58.11478c57.97464,-26.05725 116.74063,-51.18121 128.89871,-60.28012c26.64423,-19.93289 31.06665,-56.37216 9.82294,-81.40869c-21.18188,-25.02187 -59.97638,-29.16309 -86.62042,-9.23007c-12.2746,9.17911 -50.7897,57.15225 -91.18274,104.81204zm99.89587,-91.7616c19.59119,-14.65442 48.11292,-11.62146 63.755,6.79504c15.62628,18.40915 12.36768,45.25378 -7.24695,59.92276c-19.59119,14.65442 -48.15955,11.62146 -63.77039,-6.79492c-15.60309,-18.42383 -12.35986,-45.25381 7.26233,-59.92288z" fill="#B3B4B5">' +
            '<animate id="a5" attributeName="fill" from="#B3B4B5" values="#954352;#B3B4B5" begin="a4.end - 0.1" dur="0.5s" keySplines=".5 0 .5 1" /></path>' +
    '</g></svg>';

    var fromEditor;
    try {
        //Throws exception if inside iframe that is embedded in a page from another domain
        fromEditor = (window.top.location.pathname).toLowerCase().indexOf('/editor/') != -1 || $(document)[0].referrer.indexOf('/editor/') != -1;
    } catch (err) {
        fromEditor = false;
    }

    if ($('#zip-img').length > 0) {
        $('#zip-img').remove();
    }

    var isEmazeDomain = false;
    try {
        var isEmazeDomain = window.parent.location.href.indexOf('.emaze') > -1 || window.parent.location.href.indexOf('localhost') > -1;
    } catch (e) {

    }

    if (EM.compatibility.getDevice() != 'desktop' && !EM.player.isPresentationPage() || !isEmazeDomain && !EM.player.isPresentationPage()) {
        $('#buttons')
        .children()
        .not('#newshare-button')
        .not('#google_translate_element')
        .not('#analytic-button')
        .css('display', 'none');
    }

    if (!isEmazeDomain) {
        $('#analytic-button').css('display', 'none');
    }
    // if (navigator.userAgent.indexOf("iPad") != -1) { 
    //     try {
    //         $('#google_translate_element').hide();
    //         // $('#menu-container').css('left', window.parent.$('#player-container').width() - 92 + 'px');
    //         $('.menu-popup').css('top', '250px');
    //         $('.menu-popup').css('left', '450px');
    //         $('.iframe-popup-container').css('top', '250px');
    //         $('.iframe-popup-container').css('left', '450px');
    //     } catch (err) {
    //     }
    // }

    //If the player was opened from the editor, adjust the menu
    // if (fromEditor) {
    //     $('#menu-container').hide();
    //     $('#menu-container').css('top', '56px');
    //     $('#menu-container').css('right', '7px');
    //     $('#edit-button').hide();
    //     $('#delete-button').hide();
    //     $('#menu-container').show();
    //     //$('.menu-views').hide();
    // }

    //CSS hover doesn't work in IE
    // if (navigator.userAgent.indexOf("MSIE") != -1) {
    //     $(".menu-button").mouseenter(function () {
    //         $(this).css('background-color', '#c94b50');
    //     })

    //     $(".menu-button").mouseleave(function () {
    //         $(this).css('background-color', 'black');
    //     })
    // }

    if (navigator.userAgent.toLowerCase().indexOf("webkit") != -1) {
        $('body').addClass('webkit');
        //$('#google_translate_element').css('margin-left', '2px');
    }

    //Edit - closes player iFrame
    $('#edit-button').click(function () {
       window.open('/editor/' + presentationId);
        ga('send', 'event', 'PresentationActions', 'Edit', EM.scenemanager.presentation.userInfo.userName + ", " + presentationId);
        if (!(window.self === window.top)) {
            //window.parent.$('#player-container').hide();
            //window.parent.hideWithTransition(window.parent.$('#overlay'));
            ////window.parent.$('#overlay').hide();
            //window.parent.$('#player-iframe').remove();
            window.parent.playeriFrameEdit(presentationId);
        }
    })

    //Delete
    $('#delete-button').click(function () {
        closeAllPopups();
        toggleOverlay(true);
        $('#delete-popup').show();
        ga('send', 'event', 'PresentationActions', 'Delete', EM.scenemanager.presentation.userInfo.userName + ", " + presentationId);
    })

    $('#cancel-delete, #delete-close').click(function () {
        toggleOverlay(false);
        $('#delete-popup').hide();
    })

    $('#ok-delete').click(function () {
        if (window.self === window.top) {
            $.post('/MyPresentations/delete', { presentationID: presentationId });
            ga('send', 'event', 'PresentationActions', 'Delete-btn', EM.scenemanager.presentation.userInfo.userName + ", " + presentationId);
            //From the player's page
            //$.cookie("tab", "#my-menu-button", { path: '/' });
            //$.cookie("scrollPos", window.parent.$("#presentations-container").scrollTop(), { path: '/' });
            $('#delete-popup').hide();
            window.location = "/mypresentations";
        } else if (EM.player.isPresentationPage() && isLoggedIn) {
            $.post('/MyPresentations/delete', { presentationID: presentationId });
            ga('send', 'event', 'PresentationActions', 'Delete-btn', EM.scenemanager.presentation.userInfo.userName + ", " + presentationId);
            window.parent.postMessage('presentationDeleted', '*');
            toggleOverlay(false);
        } else if (EM.player.isPresentationPage() && !isLoggedIn) {
            window.parent.postMessage('watcherNotLoggedIn', '*');
            toggleOverlay(false);
        } else {
            //From iFrame
            window.parent.deletePresentation(presentationId);
            window.parent.$('#player-container').hide();
            window.parent.hideWithTransition(window.parent.$('#overlay'));
            //window.parent.$('#overlay').hide();
            window.parent.$('#player-iframe').remove();
        }
    });

    $('#newshare-button').click(function () {
        closeAllPopups();

        EM_Share.open(presentationId);

        ga('send', 'event', 'PresentationActions', 'Permit', EM.scenemanager.presentation.userInfo.userName + ", " + presentationId);
    });

    $('#analytic-button').click(function () {
        if (isLoggedIn) {
            EM_Analytic.open(EM.scenemanager.presentation.core.presentationId, EM.scenemanager.presentation.core.name);
        } else {
            try {
                EM.scenemanager.errorHandler.login("PLEASE LOGIN", "Please login to receive audience insights.");
                $('#regform').prepend('<div class="popup-close"></div>');
                $('#regform .popup-close').on('click', function () {
                    $('#the-error').add('#overlay').fadeOut(300);
                    $('#menu-container').removeClass('hidden');
                });
            } catch (e) { //go to homepage login
                window.location = "//www.emaze.com";
            }


        }
    });

    $('#permit-close').click(function () {
        closePermitPopup();
    });

    ////Collaborate
    //$('#collaborate-button').click(function () {
    //    closeAllPopups();
    //    //$('#collaborate-iframe').attr("src", "/collaborations/index/" + presentationId);
    //    $('#collaborate-iframe-container').append('<iframe id="collaborate-iframe" class="iframe-popup" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" src="/collaborations/index/' + presentationId + '" seamless></iframe>');
    //    $('#collaborate-iframe-container').show();
    //    ga('send', 'event', 'PresentationActions', 'Collaborate', EM.scenemanager.presentation.userInfo.userName + ", " + presentationId);
    //})

    //$('#collaborate-close').click(function () {
    //    closeCollaboratePopup();
    //})

    ////Share
    //$('#share-button').click(function () {
    //    closeAllPopups();
    //    //$('#share-iframe').attr("src", "/share/index/" + presentationId);
    //    $('#share-iframe-container').append('<iframe id="share-iframe" class="iframe-popup" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" src="/share/index/' + presentationId + '" seamless></iframe>');
    //    $('#share-iframe-container').show();
    //    ga('send', 'event', 'PresentationActions', 'Share', EM.scenemanager.presentation.userInfo.userName + ", " + presentationId);
    //})

    //$('#share-close').click(function () {
    //    closeSharePopup();
    //})

    //Translate
    $('#google_translate_element').click(function () {
        closeAllPopups();
        $(".goog-te-menu-frame").contents().find(".goog-te-menu2").css({ 'background': 'black', 'opacity': '0.95', 'border': 'none' });
        $(".goog-te-menu-frame").contents().find(".goog-te-menu2-item div, .goog-te-menu2-item:link div, .goog-te-menu2-item:visited div, .goog-te-menu2-item:active div, .goog-te-menu2 *").css({ 'background': 'black', 'opacity': '0.95', 'color': 'white', 'font-family': '"emaze-font", sans-serif, Arial, Helvetica' });
        $(".goog-te-menu-frame").contents().find(".goog-te-menu2-item-selected").find('span.text').css({ 'color': '#fcd14c' });
        $(".goog-te-menu-frame").contents().find(".goog-te-menu2-item div").hover(function () {
            $(this).css('background-color', '#c94b50').find('span.text').css('background-color', '#c94b50');
        }, function () {
            $(this).css('background-color', 'black').find('span.text').css('background-color', 'black');
        });
        ga('send', 'event', 'PresentationActions', 'Translate', EM.scenemanager.presentation.userInfo.userName + ", " + presentationId);
    })

    $('#pricing-overlay').click(function () {
        $('#pricing-iframe-container').hide().addClass('sleep');
        $('#pricing-iframe').attr('src', '');
        $('#pricing-overlay').hide();
    })

    window.addEventListener("message", receiveMessage, false);
    function receiveMessage(event) {
        if (event.data == "removepaymentiframe") {
            $('#pricing-overlay').hide();
            $('#pricing-iframe-container').hide().addClass('sleep');
        }
    }

    $(window).on('resize', function () {
        var isFullScreen = screen.width == window.innerWidth && screen.height == window.innerHeight;
        var checkFullScreen = document.fullscreenenabled || window.fullScreen;
        if (isFullScreen || checkFullScreen) { //|| fromEditor) {
            // $('#menu-container').hide();
            // $('.menu-views').hide();
        } else {
            // $('#menu-container').show();
            // $('.menu-views').show();
        }

        var w = $(this).width(); //window width
        if (w > 980) {
            $('#newshare-iframe-container').css('-webkit-transform', 'scale(1)');
            $('#newshare-iframe-container').css('-moz-transform', 'scale(1)');
            $('#newshare-iframe-container').css('-ms-transform', 'scale(1)');
            $('#newshare-iframe-container').css('transform', 'scale(1)');
        } else if (w < 980 && w > 768) {
            $('#newshare-iframe-container').css('-webkit-transform', 'scale(0.9)');
            $('#newshare-iframe-container').css('-moz-transform', 'scale(0.9)');
            $('#newshare-iframe-container').css('-ms-transform', 'scale(0.9)');
            $('#newshare-iframe-container').css('transform', 'scale(0.9)');
        } else if (w < 768 && w > 480) {
            $('#newshare-iframe-container').css('-webkit-transform', 'scale(0.6)');
            $('#newshare-iframe-container').css('-moz-transform', 'scale(0.6)');
            $('#newshare-iframe-container').css('-ms-transform', 'scale(0.6)');
            $('#newshare-iframe-container').css('transform', 'scale(0.6)');
        } else { // < 480
            $('#newshare-iframe-container').css('-webkit-transform', 'scale(0.4)');
            $('#newshare-iframe-container').css('-moz-transform', 'scale(0.4)');
            $('#newshare-iframe-container').css('-ms-transform', 'scale(0.4)');
            $('#newshare-iframe-container').css('transform', 'scale(0.4)');
        }
    });


    try {
        if (window.parent.location.href.indexOf('editor') !== -1) {
            $('html').on("mouseenter", function () {
                $('#menu-container').css('right', '82px');
            });
        }
    } catch (e) {
        //must do try catch when attempting to read property on window.parent. no know way to check if its ok to do so before trying
    }
    });

function closeSharePopup() {
    $('#share-iframe-container').hide();
    $('#share-iframe').remove();
    //$('#share-iframe').attr('src', '');
}

function closeCollaboratePopup() {
    $('#collaborate-iframe-container').hide();
    $('#collaborate-iframe').remove();
    //$('#collaborate-iframe').attr('src', '');
}

function CollaboratePopupOk() {
    var frm = $("#collaborate-iframe").contents().find("form");
    $.ajax({
        type: frm.attr('method'),
        url: frm.attr('action'),
        data: frm.serialize()
    });

    closeCollaboratePopup();
}

function closePermitPopup() {
    $('#permit-iframe-container').hide();
    $('#permit-iframe').remove();
}

function permitPopupOk(id, isPublic) {
    var frm = $("#permit-iframe").contents().find("form");
    $.ajax({
        type: frm.attr('method'),
        url: frm.attr('action'),
        data: frm.serialize()
    });

    var $permit = $('#permit-button');
    if ($permit.hasClass('public') && !isPublic) {
        $permit.removeClass('public');
        $permit.addClass('private');
    } else if ($permit.hasClass('private') && isPublic) {
        $permit.removeClass('private');
        $permit.addClass('public');
    }

    closePermitPopup();
}

function twitterShare() {
    !function (d, s, id) { var js, fjs = d.getElementsByTagName(s)[0]; if (!d.getElementById(id)) { js = d.createElement(s); js.id = id; js.src = "//platform.twitter.com/widgets.js"; fjs.parentNode.insertBefore(js, fjs); } }(document, "script", "twitter-wjs");
}

function shareOnSocialNet(url) {
    window.open(url, '_blank');
}

function shareOnTwitter(url) {
    twitterShare();
    shareOnSocialNet(url);
}

$(document).on('click', '#clone-button', clone);
function clone(e) {
    // window.open("/PleaseWait", "editCopiedPresentation");
    e.preventDefault();

    $('#player-loader').removeClass('hidden');

    $("body").css("cursor", "progress");

    $.ajax({
        type: 'POST',
        url: '/MyPresentations/duplicate',
        dataType: 'json',
        data: { 'presentationId': presentationId },
        success: function (presentation) {
            $('#download-loader').hide();
            presentationId = presentation.presentationID;

            if (window.top != window.self) {
                window.open('/editor/' + presentationId, '_blank');
            } else {
                window.location.href = '/editor/' + presentationId;
            }

            try {
                ga('send', 'event', 'PresentationActions', 'Clone', username + ", " + presentationId);
            } catch (ee) {
            }
        },
        asynch: false
    });
}
//              <print popup section> 

var printPopup = (function () {

    function selectPrintOption($printOption) {
        $printOption.addClass('print-option-clicked').siblings().removeClass('print-option-clicked');
    }

    //function scalePopup($Popup) { -- IN progress
    //    var scale_factor = $('#slide-box').attr('scale-factor') || ($(window).width() / 1920);
    //    scale_factor += 0.44;
    //    if (scale_factor > 1) { scale_factor = 1; }
    //    if (scale_factor <= 1) { scale_factor - 0.1; }

    //    $Popup.css('-webkit-transform', 'scale(' + scale_factor + ')');
    //    $Popup.css('-moz-transform', 'scale(' + scale_factor + ')');
    //    $Popup.css('-ms-transform', 'scale(' + scale_factor + ')');
    //    $Popup.css('transform', 'scale(' + scale_factor + ')');


    //    //var
    //    //    w = $Popup.width(),
    //    //    h = $Popup.height(),
    //    //    widthDelta,
    //    //    heightDetla,
    //    //    minDelta,
    //    //    maxDelta,
    //    //    transform;
    //    //    maxWidth = $Popup.closest('html').width();
    //    //    maxHeight = $Popup.closest('html').height();

    //    //widthDelta = maxWidth / w;
    //    //heightDetla = maxHeight / h;
    //    //minDelta = Math.min(widthDelta, heightDetla);

    //    //if (minDelta > 1) { minDelta = 1; }

    //    //transform = 'scale(' + minDelta + ',' + minDelta + ')';
    //    //$Popup.css({ '-webkit-transform': transform, '-moz-transform': transform, 'transform': transform }).attr('scaleFactor', minDelta).data('scaleFactor', minDelta);

    //    //return minDelta;
    //}

    function init() {

        $('.print-option').click(function () {
            selectPrintOption($(this));
        });

        $('#landscape-view-btn').click(function () {
            $('#print-popup').removeClass('print-popup-portrait');
        });

        $('#portrait-view-btn').click(function () {
            $('#print-popup').addClass('print-popup-portrait');
        });

        //scalePopup($('#print-popup'));

        //$(function windowResizeEvent () {
        //    var $window = $(window);
        //    var width = $window.width();
        //    var height = $window.height();

        //    setInterval(function () {
        //        if ((width != $window.width()) || (height != $window.height())) {
        //            width = $window.width();
        //            height = $window.height();

        //            scalePopup($('#print-popup'));
        //        }
        //    }, 30);
        //});

        function generatePrintUrl(data) {

            var isPortrait = $('#print-popup').is('.print-popup-portrait');
            var preference = parseInt($('.print-option-clicked').data('preference')) + (isPortrait ? 4 : 0);
            var params = [];

            params.push('pdf=' + data.pdf); //TODO add data attribute
            params.push('preference=' + preference); //TODO add data attribute

            return data.href + "?" + params.join('&');
        }

        $('#print-pdf-btn').on('click', function () {
            var data = $(this).data(),
                 printUrl = generatePrintUrl(data),
                token = (new Date).getTime(),
                fileDownloadCheckTimer,
                printUrl;

                $('#download-loader').append(loader);
                $('#download-loader').show();

                togglePopupAndOverlay('#print-popup', false);

                printUrl = generatePrintUrl(data) + "&token=" + token;
                window.location = printUrl;

                fileDownloadCheckTimer = window.setInterval(function () {
                    var cookieValue = $.cookie('fileDownloadToken');
                    if (cookieValue == token) {
                        window.clearInterval(fileDownloadCheckTimer);
                        $.removeCookie('fileDownloadToken');
                        $('#download-loader').hide();
                        $('#download-loader').empty();
                    }
                }, 1000);
        });

        $('#ok-print').on('click', function () {
            var data = $(this).data(),
                printUrl = generatePrintUrl(data);

            window.open(printUrl);

            // logic that uses iframe to hide print tab
            // add this element to DOM:
            //<iframe id="print-iframe"  name="print-iframe" src="www.emaze.com" height:0; width:0;></iframe>
            // 
            //$('#print-iframe').attr('src', printUrl);
            //
            //var printWindow = $('#print-iframe').contentWindow.document;
            //window.frames["print-iframe"].focus();
            //window.frames["print-iframe"].print();

        });

        $('#print-button').click(function () {
            togglePopupAndOverlay('#print-popup', true);
            adjustPrintPopupForPlayerIframe();
            ga('send', 'event', 'PresentationActions', 'Print', EM.scenemanager.presentation.userInfo.userName + ", " + presentationId);
        });

        $('#print-close, #cancel-print').click(function () {
            toggleOverlay(false);
            $('#print-popup').hide();
        });

        //              </print popup section> 
    }

    return {
        init: init
    }

})();


function adjustPrintPopupForPlayerIframe() {
    // deside if player is in an iframe on mypresentation page
    if (window.location !== window.parent.location) {
        // decide if user is using a laptop based on screen resolution
        if (window.screen.availWidth <= 1366) {
            // adjust printpopup css
            $('#print-popup').addClass('print-popup-laptop');
        }
    }
}

$(document).ready(function () {

    $('#toggle').toggle(function () {
        $(this).addClass('toggle-active');

        $('#buttons').removeClass('hidden').animate({
            'marginRight': '5px'
        },
            300, "easeOutSine", function () {
                // Can do something after it's opened
            });

    }, function () {
        $('#buttons').animate({
            'marginRight': '-600px'
        },
            300, function () {
                $('#toggle').removeClass('toggle-active');
                $(this).addClass('hidden');
            });
    });

    printPopup.init();

});