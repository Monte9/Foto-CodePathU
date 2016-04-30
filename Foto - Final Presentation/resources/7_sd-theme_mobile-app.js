var EM_theme = {
	enableCustomTransition: true,
    // Following methods will be used within the technology goSlide() method
    goForward: function ($origin, $target, targetNum, $viewportDiv) {
        EM.TransitionsLibrary.backgroundFadesContentInnerElementsMiscEffects($origin, $target, targetNum, $viewportDiv);
    },
    goBackward: function ($origin, $target, targetNum, $viewportDiv) {
        EM.TransitionsLibrary.backgroundFadesContentInnerElementsMiscEffects($origin, $target, targetNum, $viewportDiv);
    },
    sceneSettings: {
        foreground: 0, // number of foreground elements required
        background: 0, // number of background elements required
        isDark: false  // theme dark or bright
    }
}