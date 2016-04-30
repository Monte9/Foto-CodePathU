var EM = EM || {};
EM.compatibility = (function ($) {

    // Globals
    var ua = navigator.userAgent.toLowerCase(),
        device = "",
        type = "",
        browser = "",
        version = "";



    var Devices = {
        MOBILE : 'mobile',
        TABLET: 'tablet',
        DESKTOP: 'desktop'
    }

    // Return if device and browser compatible with current presentation
    function isCompatible () {
        device = detectDevice();
        browser = detectBrowser();

        return checkCompatibility( EM.scenemanager.presentation.core.supportedBrowsers );
    }

    function isCompatible_DemocraticVersion(compatabilitysTring) {
        device = detectDevice();
        browser = detectBrowser();

        return checkCompatibility(compatabilitysTring);
    }


    /** Private methods **/

    // Returns device name and set it's type (global vars)
    function detectDevice () {
        if ( /android/i.test(ua) ){
            type = "android";

            if (/mobile/i.test(ua)) {
                return Devices.MOBILE;
            } else {
                return Devices.TABLET;
            }
        }

        if ( /ipad/i.test(ua) ){
            type = "ipad";
            return Devices.TABLET;
        }

        if ( /iphone/i.test(ua) ){
            type = "iphone";
            return Devices.MOBILE;
        }

        if (ua.indexOf('Mac OS X') != -1){
            type = "mac";
        } else {
            type = "pc";
        }
        
        return Devices.DESKTOP;
    }

    // Returns browser name, other if none trivial one
    function detectBrowser () {

        if (/\sedge\/\d+/i.test(ua)) {
            $('body').addClass('edge');
            return "edge";
        }

        if (/chrome/i.test(ua)) {
            $('body').addClass('chrome');
            return "chrome";
        }

        if (/firefox/i.test(ua)) {
            $('body').addClass('firefox');
            return "firefox";
        }

        if (/safari/i.test(ua)) {
            $('body').addClass('safari');
            return "safari";
        }

        if (/msie/i.test(ua) || /trident/i.test(ua)) {
            $('body').addClass('explorer');
            return "ie";
        }

        $('body').addClass('other');
        return "other";
    }

    // returns true if user device & browser can support presentation dependencies
    function checkCompatibility ( str ) {
        var dependencies = JSON.parse(str);

        // If we don't know the browser we will support
        if ( browser === "other" ){
            return true;
        }

        if ( device === Devices.DESKTOP ){

            // In case browser type isn't supported (IE for example) we use 0
            if ( dependencies[device][type][browser] === 0 ){
                return false;
            }

            // Return true if browser version >= to the dependecy
            return dependencies[device][type][browser] <= getBrowserVersion();
        }

        // tablet & mobile will have 1 or 0 as "version"; 1 means supporting
        return dependencies[device][type][browser] > 0;
        
    }

    // Returns browser version as an integer
    // Returns browser version as an integer
    function getBrowserVersion() {
        var tem, regExp;

        if (browser == "edge") // edge also include chrome in its user agent so we need to play tough (Amir)
            regExp = /(edge(?=\/))\/?\s*(\d+)/i;
        else
            regExp = /(edge|opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i;

        M = ua.match(regExp) || [];

        // IF IE 11
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return +tem[1];
        }

        // Is it chrome or Opera
        if (M[1] === 'Chrome') {
            tem = ua.match(/\bOPR\/(\d+)/)
            if (tem != null) return tem[1];
        }
     
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];

        // Get version
        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);

        return +M[1];

    }

    // Simple getters

    // return device
    function getDevice () {
        device = detectDevice();
        
        return device;

    }

    // return device firm
    function getType () {
        detectDevice();
        
        return type;

    }

    // return browser;version
    function getBrowser () {
        browser = detectBrowser();
        version = getBrowserVersion();

        return browser + ';' + version;
    }

    return {
        isCompatible: isCompatible,
        getDevice: getDevice,
        getType: getType,
        getBrowser: getBrowser,
        isCompatible_DemocraticVersion: isCompatible_DemocraticVersion,
        Devices: Devices
    }

}(jQuery));