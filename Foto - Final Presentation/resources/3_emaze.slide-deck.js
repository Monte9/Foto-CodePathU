//compression mini-library. *using it to compress slides in base64 format
var LZString = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", _f: String.fromCharCode, compressToBase64: function (e) { if (e == null) return ""; var t = ""; var n, r, i, s, o, u, a; var f = 0; e = LZString.compress(e); while (f < e.length * 2) { if (f % 2 == 0) { n = e.charCodeAt(f / 2) >> 8; r = e.charCodeAt(f / 2) & 255; if (f / 2 + 1 < e.length) i = e.charCodeAt(f / 2 + 1) >> 8; else i = NaN } else { n = e.charCodeAt((f - 1) / 2) & 255; if ((f + 1) / 2 < e.length) { r = e.charCodeAt((f + 1) / 2) >> 8; i = e.charCodeAt((f + 1) / 2) & 255 } else r = i = NaN } f += 3; s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + LZString._keyStr.charAt(s) + LZString._keyStr.charAt(o) + LZString._keyStr.charAt(u) + LZString._keyStr.charAt(a) } return t }, decompressFromBase64: function (e) { if (e == null) return ""; var t = "", n = 0, r, i, s, o, u, a, f, l, c = 0, h = LZString._f; e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); while (c < e.length) { u = LZString._keyStr.indexOf(e.charAt(c++)); a = LZString._keyStr.indexOf(e.charAt(c++)); f = LZString._keyStr.indexOf(e.charAt(c++)); l = LZString._keyStr.indexOf(e.charAt(c++)); i = u << 2 | a >> 4; s = (a & 15) << 4 | f >> 2; o = (f & 3) << 6 | l; if (n % 2 == 0) { r = i << 8; if (f != 64) { t += h(r | s) } if (l != 64) { r = o << 8 } } else { t = t + h(r | i); if (f != 64) { r = s << 8 } if (l != 64) { t += h(r | o) } } n += 3 } return LZString.decompress(t) }, compressToUTF16: function (e) { if (e == null) return ""; var t = "", n, r, i, s = 0, o = LZString._f; e = LZString.compress(e); for (n = 0; n < e.length; n++) { r = e.charCodeAt(n); switch (s++) { case 0: t += o((r >> 1) + 32); i = (r & 1) << 14; break; case 1: t += o(i + (r >> 2) + 32); i = (r & 3) << 13; break; case 2: t += o(i + (r >> 3) + 32); i = (r & 7) << 12; break; case 3: t += o(i + (r >> 4) + 32); i = (r & 15) << 11; break; case 4: t += o(i + (r >> 5) + 32); i = (r & 31) << 10; break; case 5: t += o(i + (r >> 6) + 32); i = (r & 63) << 9; break; case 6: t += o(i + (r >> 7) + 32); i = (r & 127) << 8; break; case 7: t += o(i + (r >> 8) + 32); i = (r & 255) << 7; break; case 8: t += o(i + (r >> 9) + 32); i = (r & 511) << 6; break; case 9: t += o(i + (r >> 10) + 32); i = (r & 1023) << 5; break; case 10: t += o(i + (r >> 11) + 32); i = (r & 2047) << 4; break; case 11: t += o(i + (r >> 12) + 32); i = (r & 4095) << 3; break; case 12: t += o(i + (r >> 13) + 32); i = (r & 8191) << 2; break; case 13: t += o(i + (r >> 14) + 32); i = (r & 16383) << 1; break; case 14: t += o(i + (r >> 15) + 32, (r & 32767) + 32); s = 0; break } } return t + o(i + 32) }, decompressFromUTF16: function (e) { if (e == null) return ""; var t = "", n, r, i = 0, s = 0, o = LZString._f; while (s < e.length) { r = e.charCodeAt(s) - 32; switch (i++) { case 0: n = r << 1; break; case 1: t += o(n | r >> 14); n = (r & 16383) << 2; break; case 2: t += o(n | r >> 13); n = (r & 8191) << 3; break; case 3: t += o(n | r >> 12); n = (r & 4095) << 4; break; case 4: t += o(n | r >> 11); n = (r & 2047) << 5; break; case 5: t += o(n | r >> 10); n = (r & 1023) << 6; break; case 6: t += o(n | r >> 9); n = (r & 511) << 7; break; case 7: t += o(n | r >> 8); n = (r & 255) << 8; break; case 8: t += o(n | r >> 7); n = (r & 127) << 9; break; case 9: t += o(n | r >> 6); n = (r & 63) << 10; break; case 10: t += o(n | r >> 5); n = (r & 31) << 11; break; case 11: t += o(n | r >> 4); n = (r & 15) << 12; break; case 12: t += o(n | r >> 3); n = (r & 7) << 13; break; case 13: t += o(n | r >> 2); n = (r & 3) << 14; break; case 14: t += o(n | r >> 1); n = (r & 1) << 15; break; case 15: t += o(n | r); i = 0; break } s++ } return LZString.decompress(t) }, compress: function (e) { if (e == null) return ""; var t, n, r = {}, i = {}, s = "", o = "", u = "", a = 2, f = 3, l = 2, c = "", h = 0, p = 0, d, v = LZString._f; for (d = 0; d < e.length; d += 1) { s = e.charAt(d); if (!Object.prototype.hasOwnProperty.call(r, s)) { r[s] = f++; i[s] = true } o = u + s; if (Object.prototype.hasOwnProperty.call(r, o)) { u = o } else { if (Object.prototype.hasOwnProperty.call(i, u)) { if (u.charCodeAt(0) < 256) { for (t = 0; t < l; t++) { h = h << 1; if (p == 15) { p = 0; c += v(h); h = 0 } else { p++ } } n = u.charCodeAt(0); for (t = 0; t < 8; t++) { h = h << 1 | n & 1; if (p == 15) { p = 0; c += v(h); h = 0 } else { p++ } n = n >> 1 } } else { n = 1; for (t = 0; t < l; t++) { h = h << 1 | n; if (p == 15) { p = 0; c += v(h); h = 0 } else { p++ } n = 0 } n = u.charCodeAt(0); for (t = 0; t < 16; t++) { h = h << 1 | n & 1; if (p == 15) { p = 0; c += v(h); h = 0 } else { p++ } n = n >> 1 } } a--; if (a == 0) { a = Math.pow(2, l); l++ } delete i[u] } else { n = r[u]; for (t = 0; t < l; t++) { h = h << 1 | n & 1; if (p == 15) { p = 0; c += v(h); h = 0 } else { p++ } n = n >> 1 } } a--; if (a == 0) { a = Math.pow(2, l); l++ } r[o] = f++; u = String(s) } } if (u !== "") { if (Object.prototype.hasOwnProperty.call(i, u)) { if (u.charCodeAt(0) < 256) { for (t = 0; t < l; t++) { h = h << 1; if (p == 15) { p = 0; c += v(h); h = 0 } else { p++ } } n = u.charCodeAt(0); for (t = 0; t < 8; t++) { h = h << 1 | n & 1; if (p == 15) { p = 0; c += v(h); h = 0 } else { p++ } n = n >> 1 } } else { n = 1; for (t = 0; t < l; t++) { h = h << 1 | n; if (p == 15) { p = 0; c += v(h); h = 0 } else { p++ } n = 0 } n = u.charCodeAt(0); for (t = 0; t < 16; t++) { h = h << 1 | n & 1; if (p == 15) { p = 0; c += v(h); h = 0 } else { p++ } n = n >> 1 } } a--; if (a == 0) { a = Math.pow(2, l); l++ } delete i[u] } else { n = r[u]; for (t = 0; t < l; t++) { h = h << 1 | n & 1; if (p == 15) { p = 0; c += v(h); h = 0 } else { p++ } n = n >> 1 } } a--; if (a == 0) { a = Math.pow(2, l); l++ } } n = 2; for (t = 0; t < l; t++) { h = h << 1 | n & 1; if (p == 15) { p = 0; c += v(h); h = 0 } else { p++ } n = n >> 1 } while (true) { h = h << 1; if (p == 15) { c += v(h); break } else p++ } return c }, decompress: function (e) { if (e == null) return ""; if (e == "") return null; var t = [], n, r = 4, i = 4, s = 3, o = "", u = "", a, f, l, c, h, p, d, v = LZString._f, m = { string: e, val: e.charCodeAt(0), position: 32768, index: 1 }; for (a = 0; a < 3; a += 1) { t[a] = a } l = 0; h = Math.pow(2, 2); p = 1; while (p != h) { c = m.val & m.position; m.position >>= 1; if (m.position == 0) { m.position = 32768; m.val = m.string.charCodeAt(m.index++) } l |= (c > 0 ? 1 : 0) * p; p <<= 1 } switch (n = l) { case 0: l = 0; h = Math.pow(2, 8); p = 1; while (p != h) { c = m.val & m.position; m.position >>= 1; if (m.position == 0) { m.position = 32768; m.val = m.string.charCodeAt(m.index++) } l |= (c > 0 ? 1 : 0) * p; p <<= 1 } d = v(l); break; case 1: l = 0; h = Math.pow(2, 16); p = 1; while (p != h) { c = m.val & m.position; m.position >>= 1; if (m.position == 0) { m.position = 32768; m.val = m.string.charCodeAt(m.index++) } l |= (c > 0 ? 1 : 0) * p; p <<= 1 } d = v(l); break; case 2: return "" } t[3] = d; f = u = d; while (true) { if (m.index > m.string.length) { return "" } l = 0; h = Math.pow(2, s); p = 1; while (p != h) { c = m.val & m.position; m.position >>= 1; if (m.position == 0) { m.position = 32768; m.val = m.string.charCodeAt(m.index++) } l |= (c > 0 ? 1 : 0) * p; p <<= 1 } switch (d = l) { case 0: l = 0; h = Math.pow(2, 8); p = 1; while (p != h) { c = m.val & m.position; m.position >>= 1; if (m.position == 0) { m.position = 32768; m.val = m.string.charCodeAt(m.index++) } l |= (c > 0 ? 1 : 0) * p; p <<= 1 } t[i++] = v(l); d = i - 1; r--; break; case 1: l = 0; h = Math.pow(2, 16); p = 1; while (p != h) { c = m.val & m.position; m.position >>= 1; if (m.position == 0) { m.position = 32768; m.val = m.string.charCodeAt(m.index++) } l |= (c > 0 ? 1 : 0) * p; p <<= 1 } t[i++] = v(l); d = i - 1; r--; break; case 2: return u } if (r == 0) { r = Math.pow(2, s); s++ } if (t[d]) { o = t[d] } else { if (d === i) { o = f + f.charAt(0) } else { return null } } u += o; t[i++] = f + o.charAt(0); r--; f = o; if (r == 0) { r = Math.pow(2, s); s++ } } } }; if (typeof module !== "undefined" && module != null) { module.exports = LZString }

EM_slideDeck = (function () {

    //video converter does nto work with relative paths. changing them to absolute;
    function setEmazeProductionToHttps(str) {
        str = str.split('"//resources.emaze.com').join('"https://resources.emaze.com');
        str = str.split('"//userscontent2.emaze.com').join('"https://userscontent2.emaze.com');
        return str;
    }

    function settingsObjFromHtml($settingsHtml) {
        if ($settingsHtml && $settingsHtml.length) {
            var settings = $settingsHtml.data() || {};
            settings.stops = [];

            $settingsHtml.find('stop').each(function () {
                settings.stops.push($(this).data());
            });
            return settings;
        }

        return new Error('invalid $settingsHtml param. must be jquery object with tagname = settings');
    }

    function decompressSlidesInDeck(slideDeck) {
        var section;
        try {
        for (var i = 0; i < slideDeck.sections.length; i++) {
            section = slideDeck.sections[i];
            for (var j = 0; j < section.slides.length; j++) {
                section.slides[j] = LZString.decompressFromBase64(section.slides[j]) || section.slides[j]; //if not comressed, decompress returns undefined and therefore we return the slide as it is
                section.slides[j] = setEmazeProductionToHttps(section.slides[j]); //fix for video convertion support
            }
        }

        } catch (e) {
            console.error(e);
            if (EM_Editor)
            {
                EM_Editor.reportError('emaze.slide-deck.js/decompressSlidesInDeck', e);
            }
        }
    }

    function decompressSectionTitles(slideDeck) {
        var section;
        try {
            for (var i = 0; i < slideDeck.sections.length; i++) {
                section = slideDeck.sections[i];
                if(section.title){
                    section.title = LZString.decompressFromBase64(section.title) || section.title;
                }
            }

        } catch (e) {
            console.error(e);
            if (EM_Editor) {
                EM_Editor.reportError('emaze.slide-deck.js/decompressSectionTitles', e);
            }
        }
    }

    function compressSlidesInDeck(slideDeck) {
        //console.error("testing that we reached compressSlidesInDeck");
        var section;
        try {
        for (var i = 0; i < slideDeck.sections.length; i++) {
            section = slideDeck.sections[i];
            for (var j = 0; j < section.slides.length; j++) {
                section.slides[j] = LZString.compressToBase64(section.slides[j]);
            }
        }
        } catch (e) {
            console.error("we reached compressSlidesInDeck ERRRRRRRRRRRRRRRRRROR!!@!!");
            console.error(e);
            if (EM_Editor) {
                EM_Editor.reportError('emaze.slide-deck.js/decompressSlidesInDeck', e);
            }
        }
    }

    function getSlideDeckFromDocument() {
        var $dataContainer = $('#slidedeck > xmp'),
            hasData = $dataContainer.length > 0,
            slideDeckString;
        if (hasData) {
            slideDeckString = $dataContainer.html().trim();
            return getSLideDeckFromString(slideDeckString);
        } else {
            return { sections: [] }; // initialize empty slide deck with no sections.
        }
    }

    function getSLideDeckFromString(slideDeckString) {
        var hasData = (slideDeckString && slideDeckString.length > 0),
            isJson, slideDeck;

        if (hasData) {
            slideDeckString = slideDeckString.trim();
            isJson = slideDeckString.indexOf('{') === 0;
            if (isJson) {
                slideDeck = jQuery.parseJSON(slideDeckString);
                decompressSlidesInDeck(slideDeck);
                return slideDeck;
            } else {
                return buildSlideDeckFromHtml($(slideDeckString));
            }
        } else {
            return { sections: [] }; // initialize empty slide deck with no sections.
        }
    }
    
    function buildSlideDeckFromHtml($slidesHtml) {
        var slideDeck, $settingsHtml, $allSlides, $addedSlides = $(), $misplacedSlides, lastsection;
        try {
            //if ($slidesHtml.is('presentation')) { //not in use at this time. work in progress
            //    return buildSlideDeckFromXML($slidesHtml);
            //}

            slideDeck = { sections: [], slideSettings: [] }

            $slidesHtml.find('a').attr('rel', 'nofollow'); //make sure no links are followed by search engines;

            $slidesHtml.find('.section').each(function () {
                var $this = $(this),
                    title = $this.data('title'),
                    $slides = $this.find('.slide'),
                    slides = [];
                $slides.each(function () {
                    slides.push(this.outerHTML);
                    slideDeck.slideSettings.push($(this).data());
                    $addedSlides = $addedSlides.add(this); //add it to the list of added slides;
                });
                slideDeck.sections.push({ title: title, slides: slides });
            });

            try {
                $allSlides = $slidesHtml.find('.slide');
                $misplacedSlides = $allSlides.not($addedSlides);
              //  $misplacedSlides = $slidesHtml.find(':not(.section) .slide');  //this does not reliably get the misplaced slides!

            if ($misplacedSlides.length) { //error, there are slides outside of a section. add these to the last section, and set error propery to be reported by editor.

                slideDeck.error = { message: "misplaced slides: " + $misplacedSlides.length };

                lastsection = slideDeck.sections[slideDeck.sections.length - 1];

                $misplacedSlides.each(function () {
                    lastsection.slides.push(this.outerHTML);
                    slideDeck.slideSettings.push($(this).data());
                });
            }
            } catch (e) {
                e.message = e.message + ' step: misplaced slides';
                slideDeck.error = e;
            }

            $settingsHtml = $slidesHtml.children('settings');
            if ($settingsHtml.length) {
                $settingsHtml.appendTo('#slide-container'); //only for editor. 
                slideDeck.PresentationSettings = settingsObjFromHtml($settingsHtml);
            }
            return slideDeck;

        } catch (e) {
            slideDeck.error = e;
            return slideDeck;  //return empty slide deck if there is error. TODO: decide on how to hande this case. show message to user? currently being handled down the line in editor.
        }
    }

    function slideDeckToHtml(slideDeck) {
        var section, $section, $slideList, slide, $slidewrapper, $slidesHtml = $('<div>');

        for (var i = 0; i < slideDeck.sections.length; i++) {
            section = slideDeck.sections[i];
            $section = $('<div class="section">').attr('data-title', section.title);
            $slideList = $('<ul class="slide-list">').appendTo('<ul class="slide-list">');
            $slidesHtml.append($section);

            for (var j = 0; j < section.slides.length; j++) {
                slide = section.slides[j];
                $slidewrapper = $('<ul class="slide-wrapper">').html(slide);
                $slidewrapper.appendTo($slideList);
            }
        }
        return $slidesHtml;
    }
    //no sections
    function slideDeckToHtmlFlat(slideDeck, processingFunc) {
        var section, slide, $slidewrapper, $slidesHtml = $('<ul>');

        for (var i = 0; i < slideDeck.sections.length; i++) {
            section = slideDeck.sections[i];
            for (var j = 0; j < section.slides.length; j++) {
                slide = section.slides[j];

                if (processingFunc) {
                    slide = processingFunc(slide);
                }

                $slidewrapper = $('<li class="slide-wrapper">').html(slide);
                $slidewrapper.appendTo($slidesHtml);
            }
        }
        return $slidesHtml;
    }

    return {
        getSlideDeckFromDocument: getSlideDeckFromDocument,
        buildSlideDeckFromHtml: buildSlideDeckFromHtml,
        slideDeckToHtml: slideDeckToHtml,
        slideDeckToHtmlFlat: slideDeckToHtmlFlat,
        getSLideDeckFromString: getSLideDeckFromString,
        decompressSlidesInDeck: decompressSlidesInDeck,
        compressSlidesInDeck: compressSlidesInDeck,
        decompressSectionTitles: decompressSectionTitles
        //getSlideDeckfromUncompressedBase64slides: getSlideDeckfromUncompressedBase64slides

    }

})();

//slidedeck: { sections : [{ title: 'title', slides: [] }, { title: 'title', slides: [] }] settings: obj }


