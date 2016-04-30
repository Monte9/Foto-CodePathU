// transitionData.effectIn //Method Name
// transitionData.effectOut //Method Name
// transitionData.direction //Forward/Backward
// transitionData.origin //jQuery object
// transitionData.target //jQuery object
// transitionData.originNum //Origin slide #
// transitionData.targetNum //target slide #
// transitionData.durationIn //Transition duration in seconds
// transitionData.durationOut //Transition duration in seconds
// transitionData.delayIn //Transition delay amount in seconds
// transitionData.delayOut //Transition delay amount in seconds
// transitionData.context //ViewportDIV sent from scene usually (#scene)
// transitionData.callee // show which part of the transition are we in (in/out)

var EM = EM || {};

EM.TransitionsLibrary = (function () {

    function sortElementsGeneric($slide, elementsArray) {
        var $wrappers = $slide.children('.edit-wrapper'), result = {};

        elementsArray.push('misc');

        for (var i = 0; i < elementsArray.length; i++) {
            result[elementsArray[i]] = $();
        }

        $wrappers.each(function () {
            var $this = $(this),
                elementClass = $this.children('[class*=sd-element]').attr('class');

            for (var i = 0; i < elementsArray.length; i++) {
                var item = elementsArray[i];
                if (elementClass.indexOf(item) !== -1 || item === 'misc') {
                    result[item] = result[item].add($this);
                    break;
                }
            }

        });
        return result;
    }

    this.td = {};

    this.animateOut = function () {
        td.context.trigger('transitionStart', [td.targetNum, td.originNum]);
        td.callee = 'out';
        effects[td.effectOut].call(td);
    }

    this.animateIn = function () {
        td.callee = 'in';
        effects[td.effectIn].call(td);
    }

    this.finishTransition = function (in_finished) {
        if (typeof in_finished != undefined && in_finished) {
            td.context.trigger('transitionDone', [td.targetNum, td.originNum]);
        }
        scene.setPreEnters();
    }

    // Effects
    // TODO: Consider seperating prep to different methods for better control
    this.effects = {
        cut: function () {
            if (td.callee === 'in') {
                setTimeout(function () {
                    td.target.removeClass('past').removeClass('future');
                    finishTransition(true);
                }, (td.delayIn + td.delayOut) * 1000);
            } else {
                setTimeout(function () {
                    // finishTransition();
                }, (td.durationOut + td.delayOut) * 1000);
            }
        },
        fade: function () {
            if (td.callee === 'out') {
                // Prepare
                TweenLite.set(td.origin, { alpha: 1 });

                TweenLite.to(td.origin, td.durationOut, {
                    alpha: 0,
                    delay: td.delayOut,
                    onComplete: function () {
                        finishTransition();
                    },
                    clearProps: 'all'
                });
            } else {
                // Prepare
                TweenLite.set(td.target, { alpha: 0 });
                td.target.removeClass('past').removeClass('future');

                TweenLite.to(td.target, td.durationIn, {
                    alpha: 1,
                    delay: td.delayIn + td.delayOut,
                    onComplete: function () {
                        finishTransition(true);
                    },
                    onOverwrite: function () {
                        TweenLite.killTweensOf(td.target);//Consider move to prepare
                        finishTransition(true);
                    },
                    clearProps: 'all'
                });
            }
        },
        scale: function () {
            if (td.callee === 'out') {
                // Prepare
                TweenLite.set(td.origin, { scale: 1 });

                TweenLite.to(td.origin, td.durationOut, {
                    scale: 0,
                    delay: td.delayOut,
                    onComplete: function () {
                        finishTransition();
                    },
                    clearProps: 'all'
                });
            } else {
                // Prepare
                TweenLite.set(td.target, { scale: 0 });
                td.target.removeClass('past').removeClass('future');

                TweenLite.to(td.target, td.durationIn, {
                    scale: 1,
                    delay: td.delayIn + td.delayOut,
                    onComplete: function () {
                        finishTransition(true);
                    },
                    onOverwrite: function () {
                        TweenLite.killTweensOf(td.target);//Consider move to prepare
                        finishTransition(true);
                    },
                    clearProps: 'all'
                });
            }
        },
        sourceScale: function () {
            if (td.callee === 'out') {
                // Prepare
                TweenLite.set(td.origin, { scale: 1 });

                TweenLite.to(td.origin, td.durationOut, {
                    scale: 0,
                    transformOrigin: "50% 100%",
                    ease: new Ease(BezierEasing(0.6, 0, 0.4, 1)),
                    delay: td.delayOut,
                    onComplete: function () {
                        finishTransition();
                    },
                    clearProps: 'all'
                });
            } else {
                // Prepare
                TweenLite.set(td.target, { scale: 0 });
                td.target.removeClass('past').removeClass('future');

                TweenLite.to(td.target, td.durationIn, {
                    scale: 1,
                    transformOrigin: "50% 0%",
                    ease: new Ease(BezierEasing(0.6, 0, 0.4, 1)),
                    delay: td.delayIn + td.delayOut,
                    onComplete: function () {
                        finishTransition(true);
                    },
                    onOverwrite: function () {
                        TweenLite.killTweensOf(td.target);//Consider move to prepare
                        finishTransition(true);
                    },
                    clearProps: 'all'
                });
            }
        },
        scaleUpAndFade: function () {
            if (td.callee === 'out') {
                // Prepare
                TweenLite.set(td.origin, { scale: 1, alpha: 1 });

                TweenLite.to(td.origin, td.durationOut, {
                    scale: 1.4,
                    alpha: 0,
                    delay: td.delayOut,
                    onComplete: function () {
                        finishTransition();
                    },
                    clearProps: 'all'
                });
            } else {
                // Prepare
                var props = { scale: 1.4, alpha: 0 };
                if (typeof EM_theme.sceneSettings.video.extraProps != typeof undefined) {
                    var total_stops = EM_theme.sceneSettings.video.stops.length;
                    $.extend(props, EM_theme.sceneSettings.video.extraProps[(td.targetNum - 1) % total_stops]);
                }

                TweenLite.set(td.target, props);
                td.target.removeClass('past').removeClass('future');

                TweenLite.to(td.target, td.durationIn, {
                    scale: 1,
                    alpha: 1,
                    delay: td.delayIn + td.delayOut,
                    onComplete: function () {
                        finishTransition(true);
                    },
                    onOverwrite: function () {
                        TweenLite.killTweensOf(td.target);//Consider move to prepare
                        finishTransition(true);
                    },
                    clearProps: 'all'
                });
            }
        },
        softScale: function () {
            if (td.callee === 'out') {
                // Prepare
                TweenLite.set(td.origin, { scale: 1, alpha: 1 });

                TweenLite.to(td.origin, td.durationOut, {
                    scale: 1.2,
                    alpha: 0,
                    ease: new Ease(BezierEasing(0.7, 0, 0.3, 1)),
                    delay: td.delayOut,
                    onComplete: function () {
                        finishTransition();
                    },
                    clearProps: 'all'
                });
            } else {
                // Prepare
                TweenLite.set(td.target, { scale: 1.2, alpha: 0 });
                td.target.removeClass('past').removeClass('future');

                TweenLite.to(td.target, td.durationIn, {
                    scale: 1,
                    alpha: 1,
                    ease: new Ease(BezierEasing(0.7, 0, 0.3, 1)),
                    delay: td.delayIn + td.delayOut,
                    onComplete: function () {
                        finishTransition(true);
                    },
                    onOverwrite: function () {
                        TweenLite.killTweensOf(td.target);//Consider move to prepare
                        finishTransition(true);
                    },
                    clearProps: 'all'
                });
            }
        },
        semiScaleWithFade: function () {
            if (td.callee === 'out') {
                // Prepare
                TweenLite.set(td.origin, { scale: 1, alpha: 1 });

                TweenLite.to(td.origin, td.durationOut, {
                    scale: 0.5,
                    alpha: 0,
                    delay: td.delayOut,
                    onComplete: function () {
                        finishTransition();
                    },
                    clearProps: 'all'
                });
            } else {
                // Prepare
                var props = { scale: 0.5, alpha: 0 };
                if (typeof EM_theme.sceneSettings.video != typeof undefined && typeof EM_theme.sceneSettings.video.extraProps != typeof undefined) {
                    var total_stops = EM_theme.sceneSettings.video.stops.length;
                    $.extend(props, EM_theme.sceneSettings.video.extraProps[(td.targetNum - 1) % total_stops]);
                }

                TweenLite.set(td.target, props);
                td.target.removeClass('past').removeClass('future');

                TweenLite.to(td.target, td.durationIn, {
                    scale: 1,
                    alpha: 1,
                    delay: td.delayIn + td.delayOut,
                    onComplete: function () {
                        finishTransition(true);
                    },
                    onOverwrite: function () {
                        TweenLite.killTweensOf(td.target);//Consider move to prepare
                        finishTransition(true);
                    },
                    clearProps: 'all'
                });
            }
        },
        rotateFromLeft: function () {
            $('#slide-box').addClass('tl-perspective-1600');

            if (td.direction === 'backward') {
                effects.rotateFromLeftReverse();
            } else {
                if (td.callee === 'out') {
                    // Prepare
                    TweenLite.set(td.origin, { x: '0%', scale: 1, alpha: 1 });

                    TweenLite.to(td.origin, td.durationOut, {
                        x: '-100%',
                        alpha: 0,
                        scale: 0.9,
                        ease: new Ease(BezierEasing(0.7, 0, 0.3, 1)),
                        delay: td.delayOut,
                        onComplete: function () {
                            finishTransition();
                        },
                        clearProps: 'all'
                    });
                } else {
                    // Prepare
                    TweenLite.set(td.target, { x: '100%', rotationY: -55, scale: 1, alpha: 1 });
                    td.target.removeClass('past').removeClass('future');

                    TweenLite.to(td.target, td.durationIn, {
                        transformOrigin: "0% 50%",
                        x: '0%',
                        rotationY: 0,
                        ease: new Ease(BezierEasing(0.7, 0, 0.3, 1)),
                        delay: td.delayIn + td.delayOut,
                        onComplete: function () {
                            finishTransition(true);
                            $('#slide-box').removeClass('tl-perspective-1600');
                        },
                        onOverwrite: function () {
                            TweenLite.killTweensOf(td.target);//Consider move to prepare
                            finishTransition(true);
                        },
                        clearProps: 'all'
                    });
                }
            }
        },
        rotateFromLeftReverse: function () {
            if (td.callee === 'out') {
                // Prepare
                TweenLite.set(td.origin, { x: '0%', scale: 1, alpha: 1 });

                TweenLite.to(td.origin, td.durationOut, {
                    x: '100%',
                    alpha: 0,
                    scale: 0.9,
                    ease: new Ease(BezierEasing(0.7, 0, 0.3, 1)),
                    delay: td.delayOut,
                    onComplete: function () {
                        finishTransition();
                    },
                    clearProps: 'all'
                });
            } else {
                // Prepare
                TweenLite.set(td.target, { x: '-100%', rotationY: 55, scale: 1, alpha: 1 });
                td.target.removeClass('past').removeClass('future');

                TweenLite.to(td.target, td.durationIn, {
                    transformOrigin: "100% 50%",
                    x: '0%',
                    rotationY: 0,
                    ease: new Ease(BezierEasing(0.7, 0, 0.3, 1)),
                    delay: td.delayIn + td.delayOut,
                    onComplete: function () {
                        finishTransition(true);
                        $('#slide-box').removeClass('tl-perspective-1600');
                    },
                    onOverwrite: function () {
                        TweenLite.killTweensOf(td.target);//Consider move to prepare
                        finishTransition(true);
                    },
                    clearProps: 'all'
                });
            }
        },
        rotateFromRight: function () {
            $('#slide-box').addClass('tl-perspective-1600');

            TweenLite.set($('#slide-box'), { transformPerspective: 1600 });
            if (td.direction === 'backward') {
                effects.rotateFromRightReverse();
            } else {
                if (td.callee === 'out') {
                    // Prepare
                    TweenLite.set(td.origin, { x: '0%', scale: 1, alpha: 1 });

                    TweenLite.to(td.origin, td.durationOut, {
                        x: '100%',
                        alpha: 0,
                        scale: 0.9,
                        ease: new Ease(BezierEasing(0.7, 0, 0.3, 1)),
                        delay: td.delayOut,
                        onComplete: function () {
                            finishTransition();
                        },
                        clearProps: 'all'
                    });
                } else {
                    // Prepare
                    TweenLite.set(td.target, { x: '-100%', rotationY: 55, scale: 1, alpha: 1 });
                    td.target.removeClass('past').removeClass('future');

                    TweenLite.to(td.target, td.durationIn, {
                        transformOrigin: "100% 50%",
                        x: '0%',
                        rotationY: 0,
                        ease: new Ease(BezierEasing(0.7, 0, 0.3, 1)),
                        delay: td.delayIn + td.delayOut,
                        onComplete: function () {
                            finishTransition(true);
                            $('#slide-box').removeClass('tl-perspective-1600');
                        },
                        onOverwrite: function () {
                            TweenLite.killTweensOf(td.target);//Consider move to prepare
                            finishTransition(true);
                        },
                        clearProps: 'all'
                    });
                }
            }
        },
        rotateFromRightReverse: function () {
            if (td.callee === 'out') {
                // Prepare
                TweenLite.set(td.origin, { x: '0%', scale: 1, alpha: 1 });

                TweenLite.to(td.origin, td.durationOut, {
                    x: '-100%',
                    alpha: 0,
                    scale: 0.9,
                    ease: new Ease(BezierEasing(0.7, 0, 0.3, 1)),
                    delay: td.delayOut,
                    onComplete: function () {
                        finishTransition();
                    },
                    clearProps: 'all'
                });
            } else {
                // Prepare
                TweenLite.set(td.target, { x: '100%', rotationY: -55, scale: 1, alpha: 1 });
                td.target.removeClass('past').removeClass('future');

                TweenLite.to(td.target, td.durationIn, {
                    transformOrigin: "0% 50%",
                    x: '0%',
                    rotationY: 0,
                    ease: new Ease(BezierEasing(0.7, 0, 0.3, 1)),
                    delay: td.delayIn + td.delayOut,
                    onComplete: function () {
                        finishTransition(true);
                        $('#slide-box').removeClass('tl-perspective-1600');
                    },
                    onOverwrite: function () {
                        TweenLite.killTweensOf(td.target);//Consider move to prepare
                        finishTransition(true);
                    },
                    clearProps: 'all'
                });
            }
        },
        tiltAndFade: function () {
            $('#slide-box').addClass('tl-perspective-1600');
            if (td.callee === 'out') {
                // Prepare
                TweenLite.set(td.origin, { z: 0, scale: 1, alpha: 1 });

                var tout = new TimelineLite();
                tout.add(TweenLite.to(td.origin, td.durationOut * 0.6, { alpha: 0.6, scale: 1, rotationX: 15, ease: Ease.easeIn }));
                tout.add(TweenLite.to(td.origin, td.durationOut * 0.4, { alpha: 0, scale: 0.8, z: 200, rotationX: 0, ease: Ease.easeIn, clearProps: 'all' }));
                tout.play();
            } else {
                // Prepare
                TweenLite.set(td.target, { z: -200, scale: 0.8, alpha: 0 });
                td.target.removeClass('past').removeClass('future');

                var tin = new TimelineLite({
                    onComplete: function () {
                        finishTransition(true);
                        $('#slide-box').removeClass('tl-perspective-1600');
                    }
                });

                tin.add(TweenLite.to(td.target, td.durationIn * 0.6, { alpha: 0.6, z: 0, scale: 1, rotationX: -15, ease: Ease.easeIn }));
                tin.add(TweenLite.to(td.target, td.durationIn * 0.4, { alpha: 1, scale: 1, rotationX: 0, ease: Ease.easeIn, clearProps: 'all' }));
                tin.play();

            }
        },
        slideBottom: function () {
            if (td.direction === 'backward') {
                effects.slideBottomReverse();
            } else {
                if (td.callee === 'out') {
                    // Prepare
                    TweenLite.set(td.origin, { y: '0%', x: '0%' });

                    TweenLite.to(td.origin, td.durationOut, {
                        y: '100%',
                        ease: Ease.easeInOut,
                        delay: td.delayOut,
                        onComplete: function () {
                            finishTransition();
                        },
                        clearProps: 'all'
                    });
                } else {
                    // Prepare
                    TweenLite.set(td.target, { y: '100%', x: '0%' });
                    td.target.removeClass('past').removeClass('future');

                    TweenLite.to(td.target, td.durationIn, {
                        y: '0%',
                        ease: Ease.easeInOut,
                        delay: td.delayIn + td.delayOut,
                        onComplete: function () {
                            finishTransition(true);
                        },
                        onOverwrite: function () {
                            TweenLite.killTweensOf(td.target);//Consider move to prepare
                            finishTransition(true);
                        },
                        clearProps: 'all'
                    });
                }
            }
        },
        slideBottomReverse: function () { //Same as slideTop
            if (td.callee === 'out') {
                // Prepare
                TweenLite.set(td.origin, { y: '0%', x: '0%' });

                TweenLite.to(td.origin, td.durationOut, {
                    y: '-100%',
                    ease: Ease.easeInOut,
                    delay: td.delayOut,
                    onComplete: function () {
                        finishTransition();
                    },
                    clearProps: 'all'
                });
            } else {
                // Prepare
                TweenLite.set(td.target, { y: '-100%', x: '0%' });
                td.target.removeClass('past').removeClass('future');

                TweenLite.to(td.target, td.durationIn, {
                    y: '0%',
                    ease: Ease.easeInOut,
                    delay: td.delayIn + td.delayOut,
                    onComplete: function () {
                        finishTransition(true);
                    },
                    onOverwrite: function () {
                        TweenLite.killTweensOf(td.target);//Consider move to prepare
                        finishTransition(true);
                    },
                    clearProps: 'all'
                });
            }
        },
        slideTop: function () {
            if (td.direction === 'backward') {
                effects.slideTopReverse();
            } else {
                if (td.callee === 'out') {
                    // Prepare
                    TweenLite.set(td.origin, { y: '0%', x: '0%' });

                    TweenLite.to(td.origin, td.durationOut, {
                        y: '-100%',
                        ease: Ease.easeInOut,
                        delay: td.delayOut,
                        onComplete: function () {
                            finishTransition();
                        },
                        clearProps: 'all'
                    });
                } else {
                    // Prepare
                    TweenLite.set(td.target, { y: '-100%', x: '0%' });
                    td.target.removeClass('past').removeClass('future');

                    TweenLite.to(td.target, td.durationIn, {
                        y: '0%',
                        ease: Ease.easeInOut,
                        delay: td.delayIn + td.delayOut,
                        onComplete: function () {
                            finishTransition(true);
                        },
                        onOverwrite: function () {
                            TweenLite.killTweensOf(td.target);//Consider move to prepare
                            finishTransition(true);
                        },
                        clearProps: 'all'
                    });
                }
            }
        },
        slideTopReverse: function () { //Same as slideBottom
            if (td.callee === 'out') {
                // Prepare
                TweenLite.set(td.origin, { y: '0%', x: '0%' });

                TweenLite.to(td.origin, td.durationOut, {
                    y: '100%',
                    ease: Ease.easeInOut,
                    delay: td.delayOut,
                    onComplete: function () {
                        finishTransition();
                    },
                    clearProps: 'all'
                });
            } else {
                // Prepare
                TweenLite.set(td.target, { y: '100%', x: '0%' });
                td.target.removeClass('past').removeClass('future');

                TweenLite.to(td.target, td.durationIn, {
                    y: '0%',
                    ease: Ease.easeInOut,
                    delay: td.delayIn + td.delayOut,
                    onComplete: function () {
                        finishTransition(true);
                    },
                    onOverwrite: function () {
                        TweenLite.killTweensOf(td.target);//Consider move to prepare
                        finishTransition(true);
                    },
                    clearProps: 'all'
                });
            }
        },
        slideRight: function () {
            if (td.direction === 'backward') {
                effects.slideRightReverse();
            } else {
                if (td.callee === 'out') {
                    // Prepare
                    TweenLite.set(td.origin, { x: '0%', y: '0%' });

                    TweenLite.to(td.origin, td.durationOut, {
                        x: '100%',
                        ease: Ease.easeInOut,
                        delay: td.delayOut,
                        onComplete: function () {
                            finishTransition();
                        },
                        clearProps: 'all'
                    });
                } else {
                    // Prepare
                    TweenLite.set(td.target, { x: '100%', y: '0%' });
                    td.target.removeClass('past').removeClass('future');

                    TweenLite.to(td.target, td.durationIn, {
                        x: '0%',
                        ease: Ease.easeInOut,
                        delay: td.delayIn + td.delayOut,
                        onComplete: function () {
                            finishTransition(true);
                        },
                        onOverwrite: function () {
                            TweenLite.killTweensOf(td.target);//Consider move to prepare
                            finishTransition(true);
                        },
                        clearProps: 'all'
                    });
                }
            }
        },
        slideRightReverse: function () { //Same as slideTop
            if (td.callee === 'out') {
                // Prepare
                TweenLite.set(td.origin, { x: '0%', y: '0%' });

                TweenLite.to(td.origin, td.durationOut, {
                    x: '-100%',
                    ease: Ease.easeInOut,
                    delay: td.delayOut,
                    onComplete: function () {
                        finishTransition();
                    },
                    clearProps: 'all'
                });
            } else {
                // Prepare
                TweenLite.set(td.target, { x: '-100%', y: '0%' });
                td.target.removeClass('past').removeClass('future');

                TweenLite.to(td.target, td.durationIn, {
                    x: '0%',
                    ease: Ease.easeInOut,
                    delay: td.delayIn + td.delayOut,
                    onComplete: function () {
                        finishTransition(true);
                    },
                    onOverwrite: function () {
                        TweenLite.killTweensOf(td.target);//Consider move to prepare
                        finishTransition(true);
                    },
                    clearProps: 'all'
                });
            }
        },
        slideLeft: function () {
            if (td.direction === 'backward') {
                effects.slideLeftReverse();
            } else {
                if (td.callee === 'out') {
                    // Prepare
                    TweenLite.set(td.origin, { x: '0%', y: '0%' });

                    TweenLite.to(td.origin, td.durationOut, {
                        x: '-100%',
                        ease: Ease.easeInOut,
                        delay: td.delayOut,
                        onComplete: function () {
                            finishTransition();
                        },
                        clearProps: 'all'
                    });
                } else {
                    // Prepare
                    TweenLite.set(td.target, { x: '-100%', y: '0%' });
                    td.target.removeClass('past').removeClass('future');

                    TweenLite.to(td.target, td.durationIn, {
                        x: '0%',
                        ease: Ease.easeInOut,
                        delay: td.delayIn + td.delayOut,
                        onComplete: function () {
                            finishTransition(true);
                        },
                        onOverwrite: function () {
                            TweenLite.killTweensOf(td.target);//Consider move to prepare
                            finishTransition(true);
                        },
                        clearProps: 'all'
                    });
                }
            }
        },
        slideLeftReverse: function () { //Same as slideBottom
            if (td.callee === 'out') {
                // Prepare
                TweenLite.set(td.origin, { x: '0%', y: '0%' });

                TweenLite.to(td.origin, td.durationOut, {
                    x: '100%',
                    ease: Ease.easeInOut,
                    delay: td.delayOut,
                    onComplete: function () {
                        finishTransition();
                    },
                    clearProps: 'all'
                });
            } else {
                // Prepare
                TweenLite.set(td.target, { x: '100%', y: '0%' });
                td.target.removeClass('past').removeClass('future');

                TweenLite.to(td.target, td.durationIn, {
                    x: '0%',
                    ease: Ease.easeInOut,
                    delay: td.delayIn + td.delayOut,
                    onComplete: function () {
                        finishTransition(true);
                    },
                    onOverwrite: function () {
                        TweenLite.killTweensOf(td.target);//Consider move to prepare
                        finishTransition(true);
                    },
                    clearProps: 'all'
                });
            }
        },
        counterClockwise: function () {
            if (td.direction === 'backward') {
                effects.clockwise();
            } else {
                if (td.callee === 'out') {
                    // Prepare
                    TweenLite.set(td.origin, { x: '0%', y: '0%', rotation: 0, transformOrigin: "50% 400%" });

                    TweenLite.to(td.origin, td.durationOut, {
                        x: '-100%',
                        rotation: -20,
                        transformOrigin: "50% 400%",
                        ease: new Ease(BezierEasing(0.7, 0, 0.3, 1)),
                        delay: td.delayOut,
                        onComplete: function () {
                            finishTransition();
                        },
                        clearProps: 'all'
                    });
                } else {
                    // Prepare
                    TweenLite.set(td.target, { x: '100%', y: '0%', rotation: 20, transformOrigin: "50% 400%" });
                    td.target.removeClass('past').removeClass('future');

                    TweenLite.to(td.target, td.durationOut, {
                        x: '0%',
                        rotation: 0,
                        transformOrigin: "50% 400%",
                        ease: new Ease(BezierEasing(0.7, 0, 0.3, 1)),
                        delay: td.delayIn + td.delayOut,
                        onComplete: function () {
                            finishTransition(true);
                        },
                        onOverwrite: function () {
                            TweenLite.killTweensOf(td.target);//Consider move to prepare
                            finishTransition(true);
                        },
                        clearProps: 'all'
                    });
                }
            }
        },
        clockwise: function () {
            if (td.callee === 'out') {
                // Prepare
                TweenLite.set(td.origin, { x: '0%', y: '0%', rotation: 0, transformOrigin: "50% 400%" });

                TweenLite.to(td.origin, td.durationOut, {
                    x: '100%',
                    rotation: 20,
                    transformOrigin: "50% 400%",
                    ease: new Ease(BezierEasing(0.7, 0, 0.3, 1)),
                    delay: td.delayOut,
                    onComplete: function () {
                        finishTransition();
                    },
                    clearProps: 'all'
                });
            } else {
                // Prepare
                TweenLite.set(td.target, { x: '-100%', y: '0%', rotation: -20, transformOrigin: "50% 400%" });
                td.target.removeClass('past').removeClass('future');

                TweenLite.to(td.target, td.durationOut, {
                    x: '0%',
                    rotation: 0,
                    transformOrigin: "50% 400%",
                    ease: new Ease(BezierEasing(0.7, 0, 0.3, 1)),
                    delay: td.delayIn + td.delayOut,
                    onComplete: function () {
                        finishTransition(true);
                    },
                    onOverwrite: function () {
                        TweenLite.killTweensOf(td.target);//Consider move to prepare
                        finishTransition(true);
                    },
                    clearProps: 'all'
                });
            }
        }
    }

    return {
        // Animations list provided for the Editor
        animations: [
            { nameIn: 'Cut', nameOut: 'Cut', effect: 'cut' },
            { nameIn: 'Fade in', nameOut: 'Fade out', effect: 'fade' },
            { nameIn: 'Rotate from right', nameOut: 'Rotate to the right', effect: 'rotateFromRight' },
            { nameIn: 'Rotate from left', nameOut: 'Rotate to the left', effect: 'rotateFromLeft' },
            { nameIn: 'Slide from left', nameOut: 'Slide to the left', effect: 'slideLeft' },
            { nameIn: 'Slide from right', nameOut: 'Slide to the right', effect: 'slideRight' },
            { nameIn: 'Slide from top', nameOut: 'Slide to the top', effect: 'slideTop' },
            { nameIn: 'Slide from bottom', nameOut: 'Slide to the bottom', effect: 'slideBottom' },
            { nameIn: 'Scale', nameOut: 'Scale', effect: 'scale' },
            { nameIn: 'Scale from top', nameOut: 'Scale to bottom', effect: 'sourceScale' },
            { nameIn: 'Soft scale', nameOut: 'Soft scale', effect: 'softScale' },
            { nameIn: 'Semi scale with fade', nameOut: 'Semi scale with fade', effect: 'semiScaleWithFade' },
            { nameIn: 'Tilt', nameOut: 'Tilt', effect: 'tiltAndFade' },
            { nameIn: 'Counter clockwise in', nameOut: 'Counter clockwise out', effect: 'counterClockwise' }
        ],
        animate: function (transitionData) {
            td = transitionData;
            animateOut(td);
            animateIn(td);
        },

        /***********************************
        *   Regular transitions (legacy?)  *
        ************************************/

        /*Used in: 24 Hours, Fashion/Pattern/Travel HD*/
        backgroundFadeContentSlideOnXAxisForward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Current slide
            var $currentInnerElements = $origin.children('.edit-wrapper:not(.fixed-edit-wrapper)'),
                $currentBackground = $origin.children('.fixed-edit-wrapper'),
                // Target slide
                $targetInnerElements = $target.children('.edit-wrapper:not(.fixed-edit-wrapper)'),
                $targetBackground = $target.children('.fixed-edit-wrapper');

            // Prepare target & Remove hiding class from it
            TweenLite.set($target, { zIndex: 2 });
            TweenLite.set($origin, { zIndex: 1 });
            TweenLite.set($targetBackground, { alpha: 0 });
            TweenLite.set($targetInnerElements, { x: "2500px", alpha: 1 });
            $target.removeClass('future');

            // Animate origin slide out
            if ($currentBackground.length > 0) TweenLite.to($currentBackground, 0.6, { alpha: 0 });
            if ($currentInnerElements.length > 0) TweenLite.to($currentInnerElements, 0.6, { alpha: 0 });

            // Animate target slide In
            TweenLite.to($targetBackground, 0.6, {
                alpha: 1, onComplete: function () {
                    TweenLite.to($targetInnerElements, 0.6, {
                        x: "0px", force3D: true, onComplete: function () {
                            scene.setPreEnters();
                            $viewportDiv.trigger('transitionDone', [targetNum]);
                        }
                    });
                }
            });
        },
        /*Used in: 24 Hours, Fashion/Pattern/Travel HD*/
        backgroundFadeContentSlideOnXAxisBackward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Current slide
            var $currentInnerElements = $origin.children('.edit-wrapper:not(.fixed-edit-wrapper)'),
                $currentBackground = $origin.children('.fixed-edit-wrapper'),
                // Target slide
                $targetInnerElements = $target.children('.edit-wrapper:not(.fixed-edit-wrapper)'),
                $targetBackground = $target.children('.fixed-edit-wrapper');

            // Prepare target & Remove hiding class from it
            TweenLite.set($target, { zIndex: 2 });
            TweenLite.set($origin, { zIndex: 1 });
            TweenLite.set($targetInnerElements, { x: "-2500px", alpha: 1 });
            TweenLite.to($targetBackground, { alpha: 0 });
            $target.removeClass('past');

            // Animate origin slide out
            if ($currentBackground.length > 0) TweenLite.to($currentBackground, 0.6, { alpha: 0 });
            if ($currentInnerElements.length > 0) TweenLite.to($currentInnerElements, 0.6, { alpha: 0 });

            // Animate target slide In
            TweenLite.to($targetBackground, 0.6, {
                alpha: 1, onComplete: function () {
                    TweenLite.to($targetInnerElements, 0.6, {
                        x: "0px", force3D: true, onComplete: function () {
                            scene.setPreEnters();
                            $viewportDiv.trigger('transitionDone', [targetNum]);
                        }
                    });
                }
            });
        },
        /*Used by Parallax*/
        ParallaxTransitionsForward: function ($origin, $target, targetNum, $viewportDiv) {
            ////////////////////
            $viewportDiv.trigger('transitionStart', [targetNum]);
            $('.transition-start').removeClass("transition-start");
            $origin.addClass("transition-start");
            $target.removeClass('future').addClass("transition-start");
            TweenLite.set($origin, { x: '0%',y: '0%' });
            TweenLite.set($target, { x: '0%', y: '0%' });
            $origin.show();
            $target.show();


            var $targetInnerElements = $target.children('.edit-wrapper:not(.fixed-edit-wrapper)'),
                $targetBackground = $target.children('.fixed-edit-wrapper');
            switch ((targetNum-2)%5) 
            {
                case 0:
                    {
                        TweenLite.set($target, { scale: 20 });
                        $origin.hide();
                        TweenLite.to($target, 2, {
                            scale: 1, ease: Power4.easeOut, onComplete: function () {
                                scene.setPreEnters();
                                $origin.removeClass("transition-start");
                                $viewportDiv.trigger('transitionDone', [targetNum]);
                                //$origin.show();

                            }
                        });
                        break;

                    }

                case 1:
                    {
                        TweenLite.set($target, { y: '100%', zIndex: 1, scale: 1 });
                        TweenLite.set($origin, { y: '0%', zIndex: 2, scale: 1 });
                        TweenLite.to($target, 1.35, {
                            y: '0%', scale: 1.02, ease: Power2.easeInOut, onComplete: function () {
                                scene.setPreEnters();
                                $origin.removeClass("transition-start");
                                //$viewportDiv.trigger('transitionDone', [targetNum]);
                            }
                        });
                        TweenLite.to($origin, 1.35, {
                            y: '-100%', scale: 1.02, ease: Power2.easeInOut, onComplete: function () {
                                scene.setPreEnters();
                                $viewportDiv.trigger('transitionDone', [targetNum]);
                                //TweenLite.set($origin, { y: '0%' });
                            }
                        });
                        break;

                    }

                case 2:
                    {
                        TweenLite.set($target, { x: '-100%', zIndex: 2, scale: 1 });
                        TweenLite.set($origin, { x: '0%', zIndex: 1, scale: 1 });
                        TweenLite.to($target, 1.35, {
                            x: '0%', scale: 1.02, ease: Power2.easeInOut, onComplete: function () {
                                scene.setPreEnters();
                                $origin.removeClass("transition-start");
                                //$viewportDiv.trigger('transitionDone', [targetNum]);
                            }
                        });
                        TweenLite.to($origin, 1.35, {
                            x: '100%', scale: 1.02, ease: Power2.easeInOut, onComplete: function () {
                                scene.setPreEnters();
                                $viewportDiv.trigger('transitionDone', [targetNum]);
                                //TweenLite.set($origin, { x: '0%' });
                            }
                        });
                        break;
                    }
                case 3:
                    {
                        TweenLite.set($target, { y: '-100%', zIndex: 2, scale: 1 });
                        TweenLite.set($origin, { y: '0%', zIndex: 1, scale: 1 });
                        TweenLite.to($target, 1.35, {
                            y: '0%', scale: 1.02, ease: Power2.easeInOut, onComplete: function () {
                                scene.setPreEnters();
                                $origin.removeClass("transition-start");
                                //$viewportDiv.trigger('transitionDone', [targetNum]);                            
                            }
                        });
                        TweenLite.to($origin, 1.35, {
                            y: '100%', scale: 1.02, ease: Power2.easeInOut, onComplete: function () {
                                scene.setPreEnters();
                                $viewportDiv.trigger('transitionDone', [targetNum]);
                                //TweenLite.set($origin, { y: '0%' });
                            }
                        });
                        break;
                    }
                case 4:
                    {
                        TweenLite.set($target, { x: '100%', zIndex: 2, scale: 1.02 });
                        TweenLite.set($origin, { x: '0%', zIndex: 1, scale: 1.02 });
                        TweenLite.to($target, 1.35, {
                            x: '0%', scale: 1, ease: Power2.easeInOut, onComplete: function () {
                                scene.setPreEnters();
                                $origin.removeClass("transition-start");
                                //$viewportDiv.trigger('transitionDone', [targetNum]);
                            }
                        });
                        TweenLite.to($origin, 1.35, {
                            x: '-100%', scale: 1, ease: Power2.easeInOut, onComplete: function () {
                                scene.setPreEnters();
                                $viewportDiv.trigger('transitionDone', [targetNum]);
                                //TweenLite.set($origin, { x: '0%' });
                            }
                        });
                        break;
                    }
                //case 5:
                //    {
                //        TweenLite.set($target, { scale: 20 });
                //        $origin.hide();
                //        TweenLite.to($target, 2, {
                //            scale: 1, ease: Ease.easeOut, onComplete: function () {
                //                scene.setPreEnters();
                //                $viewportDiv.trigger('transitionDone', [targetNum]);
                //                $origin.show();

                //            }
                //        });
                //        break;

                //    }
            }
        },
        ParallaxTransitionsBackward: function ($origin, $target, targetNum, $viewportDiv) {
            ////////////////////
            $viewportDiv.trigger('transitionStart', [targetNum]);
            $('.transition-start').removeClass("transition-start");
            $origin.addClass("transition-start");
            $target.removeClass('future').addClass("transition-start");
            $target.removeClass('past');
            TweenLite.set($origin, { x: '0%', y: '0%' });
            TweenLite.set($target, { x: '0%', y: '0%' });
            $origin.show();
            $target.show();
            var $targetInnerElements = $target.children('.edit-wrapper:not(.fixed-edit-wrapper)'),
                $targetBackground = $target.children('.fixed-edit-wrapper');
            switch ((targetNum-1)%5) // todo: ADD MODULUS
            {
                case 0:
                {
                    TweenLite.set($target, { scale: 20 });
                    $origin.hide();
                    TweenLite.to($target, 2, {
                        scale: 1, ease: Power4.easeOut, onComplete: function () {
                            scene.setPreEnters();
                            $origin.removeClass("transition-start");
                            $viewportDiv.trigger('transitionDone', [targetNum]);
                            //$origin.show();

                        }
                    });
                    break;
                }
                case 1:
                    {
                        TweenLite.set($target, { y: '-100%', zIndex: 2, scale: 1.02 });
                        TweenLite.set($origin, { y: '0%', zIndex: 1, scale: 1.02 });
                        TweenLite.to($target, 1.35, {
                            y: '0%', scale:1, ease: Power2.easeInOut, onComplete: function () {
                                scene.setPreEnters();
                                $origin.removeClass("transition-start");
                                //$viewportDiv.trigger('transitionDone', [targetNum]);
                            }
                        });
                        TweenLite.to($origin, 1.35, {
                            y: '100%', scale:1, ease: Power2.easeInOut, onComplete: function () {
                                scene.setPreEnters();
                                $viewportDiv.trigger('transitionDone', [targetNum]);
                                //TweenLite.set($origin, { y: '0%' });
                            }
                        });
                        break;

                    }
                case 2:
                    {
                        TweenLite.set($target, { x: '100%', zIndex: 2, scale:1.02 });
                        TweenLite.set($origin, { x: '0%', zIndex: 1, scale: 1.02 });
                        TweenLite.to($target, 1.35, {
                            x: '0%', scale:1, ease: Power2.easeInOut, onComplete: function () {
                                scene.setPreEnters();
                                $origin.removeClass("transition-start");
                                //$viewportDiv.trigger('transitionDone', [targetNum]);
                            }
                        });
                        TweenLite.to($origin, 1.35, {
                            x: '-100%', scale:1, ease: Power2.easeInOut, onComplete: function () {
                                scene.setPreEnters();
                                $viewportDiv.trigger('transitionDone', [targetNum]);
                                //TweenLite.set($origin, { x: '0%' });
                            }
                        });
                        break;

                    }
                case 3:
                    {
                        TweenLite.set($target, { y: '100%', zIndex: 2, scale:1.02 });
                        TweenLite.set($origin, { y: '0%', zIndex: 1, scale:1.02 });
                        TweenLite.to($target, 1.35, {
                            y: '0%', scale:1, ease: Power2.easeInOut, onComplete: function () {
                                scene.setPreEnters();
                                $origin.removeClass("transition-start");
                                //$viewportDiv.trigger('transitionDone', [targetNum]);
                            }
                        });
                        TweenLite.to($origin, 1.35, {
                            y: '-100%', scale: 1, ease: Power2.easeInOut, onComplete: function () {
                                scene.setPreEnters();
                                $viewportDiv.trigger('transitionDone', [targetNum]);
                                //TweenLite.set($origin, { y: '0%' });
                            }
                        });
                        break;
                    }
                case 4:
                    {
                        TweenLite.set($target, { x: '-100%', zIndex: 2, scale:1 });
                        TweenLite.set($origin, { x: '0%', zIndex: 1, scale:1 });
                        TweenLite.to($target, 1.35, {
                            x: '0%', scale: 1.02, ease: Power2.easeInOut, onComplete: function () {
                                scene.setPreEnters();
                                $origin.removeClass("transition-start");
                                //$viewportDiv.trigger('transitionDone', [targetNum]);
                            }
                        });
                        TweenLite.to($origin, 1.35, {
                            x: '100%', scale: 1.02, ease: Power2.easeInOut, onComplete: function () {
                                scene.setPreEnters();
                                $viewportDiv.trigger('transitionDone', [targetNum]);
                                TweenLite.set($origin, { x: '0%' });
                            }
                        });
                        break;

                    }
                //case 5:
                //    {
                //        TweenLite.set($target, { scale: 20 });
                //        $origin.hide();
                //        TweenLite.to($target, 2, {
                //            scale: 1, ease: Ease.easeOut, onComplete: function () {
                //                scene.setPreEnters();
                //                $viewportDiv.trigger('transitionDone', [targetNum]);
                //                $origin.show();

                //            }
                //        });
                //        break;


                //    }
            }
        },

        /*Used by Parallax*/
/*        ParallaxTransitionsBackward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Prepare target
            $target.removeClass('past');
            //TweenLite.set($target, { scale: 0.6, y: '200%' });
            TweenLite.set($target, { scale: 20 });
            $origin.hide();

            TweenLite.to($target, 2, {
                scale:1, ease: Ease.easeOut, onComplete: function () {                    
                            scene.setPreEnters();
                            $viewportDiv.trigger('transitionDone', [targetNum]);
                    $origin.show();

                }
            });

            //$viewportDiv.trigger('transitionStart', [targetNum]);

            //// Current slide
            //var $currentInnerElements = $origin.children('.edit-wrapper:not(.fixed-edit-wrapper)'),
            //    $currentBackground = $origin.children('.fixed-edit-wrapper'),
            //    // Target slide
            //    $targetInnerElements = $target.children('.edit-wrapper:not(.fixed-edit-wrapper)'),
            //    $targetBackground = $target.children('.fixed-edit-wrapper');

            //// Prepare target & Remove hiding class from it
            //TweenLite.set($target, { zIndex: 2 });
            //TweenLite.set($origin, { zIndex: 1 });
            //TweenLite.set($targetInnerElements, { x: "-2500px", alpha: 1 });
            //TweenLite.to($targetBackground, { alpha: 0 });
            //$target.removeClass('past');

            //// Animate origin slide out
            //if ($currentBackground.length > 0) TweenLite.to($currentBackground, 0.6, { alpha: 0 });
            //if ($currentInnerElements.length > 0) TweenLite.to($currentInnerElements, 0.6, { alpha: 0 });

            //// Animate target slide In
            //TweenLite.to($targetBackground, 0.6, {
            //    alpha: 1, onComplete: function () {
            //        TweenLite.to($targetInnerElements, 0.6, {
            //            x: "0px", force3D: true, onComplete: function () {
            //                scene.setPreEnters();
            //                $viewportDiv.trigger('transitionDone', [targetNum]);
            //            }
            //        });
            //    }
            //});
        },
        */
        /*Used in: Investors Pitch, Travel agency */
        backgroundAndContentZoomOutThenIn: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Prepare target & Remove hiding class from it
            $target.removeClass('past').removeClass('future');
            TweenLite.set($target, { alpha: 0, scale: 0.8 });

            // Animate origin slide out
            TweenLite.to($origin, 0.3, {
                scale: 1.2, alpha: 0.5, ease: Quad.easeIn, onComplete: function () {
                    TweenLite.to($origin, 0.3, { scale: 0.8, alpha: 0, ease: Quad.easeOut });
                    // Animate target slide In
                    TweenLite.to($target, 0.3, {
                        scale: 1, alpha: 1, ease: Quad.easeOut, onComplete: function () {
                            scene.setPreEnters();
                            $viewportDiv.trigger('transitionDone', [targetNum]);
                        }
                    });
                }
            });
        },
        /*Used in: Tutorial*/
        backgroundColorChangeContentInnerElementsMiscEffects: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            var $title = $target.children('.wrapper-style-sd-text_1'),
                $subtitle = $target.children('.wrapper-style-sd-text_2'),
                $text = $target.children('.wrapper-style-sd-text_4'),
                $otherElements = $target.children()
                            .not('.wrapper-style-sd-text_1')
                            .not('.wrapper-style-sd-text_2')
                            .not('.wrapper-style-sd-text_4'),
                seq = new TimelineLite(),
                seqSub = new TimelineLite(),
                seqText = new TimelineLite(),
                isTransitionRunning = false;

            // Prepare target & Remove hiding class from it
            $target.removeClass('past').removeClass('future');

            // Hide current slide & expose target
            TweenLite.set($origin, { alpha: 0 });
            TweenLite.set($target, { alpha: 1 });

            // Animate title in
            if ($title.length > 0) {
                isTransitionRunning = true;
                TweenLite.set($title, { y: '-3000px' });
                seq.add(TweenLite.to($title, 0.9, { y: '25px', ease: new Ease(BezierEasing(0.215, 0.610, 0.355, 1.000)) }));
                seq.add(TweenLite.to($title, 0.225, { y: '-10px', ease: new Ease(BezierEasing(0.215, 0.610, 0.355, 1.000)) }));
                seq.add(TweenLite.to($title, 0.225, { y: '5px', ease: new Ease(BezierEasing(0.215, 0.610, 0.355, 1.000)) }));
                seq.add(TweenLite.to($title, 0.15, { y: 0, ease: new Ease(BezierEasing(0.215, 0.610, 0.355, 1.000)), onComplete: finishHim }));
                seq.restart();
                seq.play();
            }

            // Animate sub-title in
            if ($subtitle.length > 0) {
                isTransitionRunning = true;
                TweenLite.set($subtitle, { y: '-3000px' });
                seqSub.add(TweenLite.to($subtitle, 0.9, { y: '25px', ease: new Ease(BezierEasing(0.215, 0.610, 0.355, 1.000)) }));
                seqSub.add(TweenLite.to($subtitle, 0.225, { y: '-10px', ease: new Ease(BezierEasing(0.215, 0.610, 0.355, 1.000)) }));
                seqSub.add(TweenLite.to($subtitle, 0.225, { y: '5px', ease: new Ease(BezierEasing(0.215, 0.610, 0.355, 1.000)) }));
                seqSub.add(TweenLite.to($subtitle, 0.15, { y: 0, ease: new Ease(BezierEasing(0.215, 0.610, 0.355, 1.000)), onComplete: finishHim }));
                seqSub.restart();
                seqSub.play();
            }

            // Animate text in
            if ($text.length > 0) {
                isTransitionRunning = true;
                TweenLite.set($text, { x: '-3000px' });
                seqText.add(TweenLite.to($text, 0.72, { x: '25px', ease: new Ease(BezierEasing(0.215, 0.610, 0.355, 1.000)) }));
                seqText.add(TweenLite.to($text, 0.15, { x: '-10px', ease: new Ease(BezierEasing(0.215, 0.610, 0.355, 1.000)) }));
                seqText.add(TweenLite.to($text, 0.15, { x: '5px', ease: new Ease(BezierEasing(0.215, 0.610, 0.355, 1.000)) }));
                seqText.add(TweenLite.to($text, 0.12, { x: 0, ease: new Ease(BezierEasing(0.215, 0.610, 0.355, 1.000)), onComplete: finishHim }));
                seqText.restart();
                seqText.play();
            }

            // Animate non text elements in
            if ($otherElements.length > 0) {
                isTransitionRunning = true;
                TweenLite.to($otherElements, 0.6, {
                    scale: 1.05, onComplete: function () {
                        TweenLite.to($otherElements, 0.6, { scale: 1, onComplete: finishHim });
                    }
                });
            }

            // In case we have an empty slides with no elements, still shoot 
            // a transitionDone event so editor could hide scene slides
            setTimeout(function () {
                if (!isTransitionRunning) {
                    isTransitionRunning = true;
                    finishHim();
                }
            }, 1600);

            function finishHim() {
                if (isTransitionRunning) {
                    scene.setPreEnters();
                    $viewportDiv.trigger('transitionDone', [targetNum]);
                    isTransitionRunning = false;
                }
            }
        },
        /*Used in: Market Analysis*/
        backgroundAndContentScaleAndMoveOnXAxisForward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Prepare target/origin & Remove hiding class from it
            $target.removeClass('future');
            TweenLite.set($target, { x: '0%', scale: 0.8, alpha: 1, zIndex: -1 });
            TweenLite.set($origin, { zIndex: 2 });

            // Animate Out
            TweenLite.to($origin, 0.6, {
                x: '-120%', ease: Ease.easeIn, force3D: true, onComplete: function () {
                    TweenLite.set($origin, { alpha: 0 });
                }
            });
            // Animate in
            TweenLite.to($target, 0.7, {
                scale: 1, zIndex: 1, ease: Ease.easeOut, force3D: true, onComplete: function () {
                    scene.setPreEnters();
                    $viewportDiv.trigger('transitionDone', [targetNum]);
                }
            });
        },
        /*Used in: Market Analysis*/
        backgroundAndContentScaleAndMoveOnXAxisBackward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Prepare target/origin & Remove hiding class from it
            $target.removeClass('past');
            TweenLite.set($target, { x: '0%', scale: 0.8, alpha: 1, zIndex: -1 });
            TweenLite.set($origin, { zIndex: 2 });

            // Animate Out
            TweenLite.to($origin, 0.6, {
                x: '120%', ease: Ease.easeIn, force3D: true, onComplete: function () {
                    TweenLite.set($origin, { alpha: 0 });
                }
            });

            // Animate in
            TweenLite.to($target, 0.7, {
                scale: 1, zIndex: 1, ease: Ease.easeOut, force3D: true, onComplete: function () {
                    scene.setPreEnters();
                    $viewportDiv.trigger('transitionDone', [targetNum]);
                }
            });
        },
        /*Used in: Education Today*/
        backgroundAndContentScaleWithRadialBorder: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Prepare target
            $target.removeClass('past').removeClass('future');
            TweenLite.set($target, { scale: 0, borderRadius: '50%' });

            // Animate out
            TweenLite.to($origin, 0.5, {
                scale: 0, borderRadius: '50%', onComplete: function () {
                    // Animate in
                    TweenLite.to($target, 0.5, {
                        scale: 1, borderRadius: '0%', onComplete: function () {
                            scene.setPreEnters();
                            $viewportDiv.trigger('transitionDone', [targetNum]);
                        }
                    });
                }
            });

            // Set background color on world (round robin)
            var bgColorNum = (targetNum % 5) ? targetNum % 5 : 5;

            $origin.parents('#world')
            .removeClass()
            .addClass('sd_bg_color_' + bgColorNum);
        },
        /*Used in: Business Plan*/
        backgroundAndContentZoomOutWithYAxisTranslationForward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Prepare target
            $target.removeClass('future');
            TweenLite.set($target, { scale: 0.6, y: '200%' });

            // Animate out
            TweenLite.to($origin, 0.5, {
                scale: 0.6, ease: Ease.easeOut, onComplete: function () {
                    TweenLite.to($origin, 0.5, { y: '-200%', ease: Ease.easeInOut });
                }
            });

            TweenLite.to($target, 0.525, {
                y: '0%', delay: 0.5, ease: Ease.easeOut, onComplete: function () {
                    TweenLite.to($target, 0.2, {
                        scale: 1, ease: Ease.easeOut, force3D: true, onComplete: function () {
                            scene.setPreEnters();
                            $viewportDiv.trigger('transitionDone', [targetNum]);
                        }
                    });
                }
            });
        },
        /*Used in: Business Plan*/
        backgroundAndContentZoomOutWithYAxisTranslationBackward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Prepare target
            $target.removeClass('past');
            TweenLite.set($target, { scale: 0.6, y: '-200%' });

            // Animate out
            TweenLite.to($origin, 0.5, {
                scale: 0.6, ease: Ease.easeOut, onComplete: function () {
                    TweenLite.to($origin, 0.5, { y: '200%', ease: Ease.easeInOut });
                }
            });

            TweenLite.to($target, 0.525, {
                y: '0%', delay: 0.5, ease: Ease.easeOut, onComplete: function () {
                    TweenLite.to($target, 0.2, {
                        scale: 1, ease: Ease.easeOut, force3D: true, onComplete: function () {
                            scene.setPreEnters();
                            $viewportDiv.trigger('transitionDone', [targetNum]);
                        }
                    });
                }
            });
        },
        /*Used in: Marketing Strategy*/
        backgroundAndContentYAxisAndFadeForward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Prepare target
            $target.removeClass('future');
            TweenLite.set($target, { y: '100%', alpha: 0 });

            // Animate out
            TweenLite.to($origin, 0.65, { y: '-100%', alpha: 0, ease: Cubic.easeInOut });

            // Animate in
            TweenLite.to($target, 0.65, {
                y: '0%', alpha: 1, ease: Cubic.easeInOut, onComplete: function () {
                    scene.setPreEnters();
                    $viewportDiv.trigger('transitionDone', [targetNum]);
                }
            });
        },
        /*Used in: Marketing Strategy*/
        backgroundAndContentYAxisAndFadeBackward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Prepare target
            $target.removeClass('past');
            TweenLite.set($target, { y: '-100%', alpha: 0 });

            // Animate out
            TweenLite.to($origin, 0.65, { y: '100%', alpha: 0, ease: Cubic.easeInOut });

            // Animate in
            TweenLite.to($target, 0.65, {
                y: '0%', alpha: 1, ease: Cubic.easeInOut, onComplete: function () {
                    scene.setPreEnters();
                    $viewportDiv.trigger('transitionDone', [targetNum]);
                }
            });
        },
        /*Used in: Infographics*/
        backgroundAndContentYAxisForward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Prepare target
            $target.removeClass('future');
            TweenLite.set($target, { y: '100%' });

            // Animate out
            TweenLite.to($origin, 0.6, { y: '-100%', ease: Ease.easeInOut, force3D: true });

            // Animate in
            TweenLite.to($target, 0.6, {
                y: '0%', ease: Ease.easeInOut, force3D: true, onComplete: function () {
                    scene.setPreEnters();
                    $viewportDiv.trigger('transitionDone', [targetNum]);
                }
            });
        },
        /*Used in: Infographics*/
        backgroundAndContentYAxisBackward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Prepare target
            $target.removeClass('past');
            TweenLite.set($target, { y: '-100%' });

            // Animate out
            TweenLite.to($origin, 0.6, { y: '100%', ease: Ease.easeInOut, force3D: true });

            // Animate in
            TweenLite.to($target, 0.6, {
                y: '0%', ease: Ease.easeInOut, force3D: true, onComplete: function () {
                    scene.setPreEnters();
                    $viewportDiv.trigger('transitionDone', [targetNum]);
                }
            });
        },
        /*Used in: Simple Slides*/
        backgroundAndContentFade: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Prepare target
            TweenLite.set($target, { alpha: 0 });
            $target.removeClass('past').removeClass('future');

            var tl = new TimelineLite({
                onComplete: function () {
                    setTimeout(function () {
                        scene.setPreEnters();
                    }, 500);
                    $viewportDiv.trigger('transitionDone', [targetNum]);
                }
            });

            tl.add(TweenLite.to($origin, 0.45, { alpha: 0 }));
            tl.add(TweenLite.to($target, 0.45, { alpha: 1 }, '-=0.45'));
            // tl.restart();
            tl.play();
        },
        /*Used in: mobile app OLD*/
        //backgroundAndContentFadeSoft: function ($origin, $target, targetNum, $viewportDiv) {
        //    $viewportDiv.trigger('transitionStart', [targetNum]);

        //    // Prepare target
        //    TweenLite.set($target, { alpha: 0 });
        //    $target.removeClass('past').removeClass('future');

        //    var tl = new TimelineLite({
        //        onComplete: function () {
        //            setTimeout(function () {
        //                scene.setPreEnters();
        //            }, 900);
        //            $viewportDiv.trigger('transitionDone', [targetNum]);
        //        }
        //    });

        //    tl.add(TweenLite.to($origin, 0.45, { alpha: 0 }));
        //    tl.add(TweenLite.to($target, 0.45, { alpha: 1 }, '-=0.45'));
        //    // tl.restart();
        //    tl.play();
        //},
        /*Used in: Mobile app*/
        backgroundFadesContentInnerElementsMiscEffects: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            var $title, $subtitle, $text, $shapes, $videosAndImages, $otherElements;
            var seq = new TimelineLite({ onComplete: finishHim });
            var isTransitionRunning = false;
            var elementsIcareAbout = ['style-sd-text_1', 'style-sd-text_2', 'style-sd-text_3', 'sd-element-image', 'sd-element-video', 'sd-element-shape', 'sd-element-media'];
            var result = sortElementsGeneric($target, elementsIcareAbout);


            // In case we have an empty slides with no elements, still shoot
            // a transitionDone event so editor could hide scene slides
            setTimeout(function () {
                if (!isTransitionRunning) {
                    isTransitionRunning = true;
                    finishHim();
                }
            }, 1600);

            function finishHim() {
                if (isTransitionRunning) {
                    scene.setPreEnters();
                    seq.kill();
                    $viewportDiv.trigger('transitionDone', [targetNum]);
                    isTransitionRunning = false;
                }
            }

            function tweenSet($elements, animation) {
                if ($elements.length) {
                    TweenLite.set($elements, animation);
                }
            }

            function tweenTo($elements, duration, animation, seq, offset) {
                if ($elements.length) {
                    seq.add(new TweenLite.to($elements, duration, animation), offset);
                }
            }

            function f2s(f) {
                return (f * 1 / 30);
            }

            $title = result['style-sd-text_1'];
            $subtitle = result['style-sd-text_2'];
            $text = result['style-sd-text_3'];
            $shapes = result['sd-element-shape'].add(result['misc']);
            $videosAndImages = result['sd-element-media'].add(result['sd-element-video']).add(result['sd-element-image']);
            //$otherElements = result['misc'];


            // Prepare target & Remove hiding class from it
            $target.removeClass('past').removeClass('future');

            // put target infornt of origin
            TweenLite.set($target, { zIndex: 2 });
            TweenLite.set($origin, { zIndex: 1 });


            isTransitionRunning = true;
            tweenSet($target, { alpha: 0 });
            tweenSet($title, { y: '200px', opacity: 0 });
            tweenSet($subtitle, { y: '200px', opacity: 0 });
            tweenSet($text, { y: '200px', opacity: 0 });
            tweenSet($shapes, { opacity: 0 });
            tweenSet($videosAndImages, { opacity: 0 });


            // gradually remove origin
            tweenTo($origin, f2s(30), { opacity: 0, ease: Power2.easeOut }, seq);


            // gradually insert target and its elements
            tweenTo($target, f2s(10), { opacity: 1, ease: Ease.easeOut }, seq, 0);

            tweenTo($videosAndImages, f2s(22), { y: 0, opacity: 1, ease: Power2.easeOut }, seq, 0);

            tweenTo($shapes, f2s(19), { y: 0, ease: Power2.easeOut }, seq, f2s(8));
            tweenTo($shapes, f2s(19), { opacity: 1, ease: Power1.easeOut }, seq, f2s(8));

            tweenTo($title, f2s(35), { y: 0, ease: Power2.easeOut }, seq, f2s(19));
            tweenTo($title, f2s(25), { opacity: 1, ease: Power1.easeOut }, seq, f2s(19));

            tweenTo($subtitle, f2s(29), { y: 0, ease: Power2.easeOut }, seq, f2s(24));
            tweenTo($subtitle, f2s(19), { opacity: 1, ease: Power1.easeOut }, seq, f2s(24));

            tweenTo($text, f2s(29), { y: 0, ease: Power2.easeOut }, seq, f2s(29));
            tweenTo($text, f2s(19), { opacity: 1, color: "blue", ease: Power1.easeOut }, seq, f2s(29));

            seq.restart();
            seq.play();


        },
        /*Used in: CV*/
        backgroundAndContentCardShuffleForward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Prepare elements
            $target.removeClass('future');
            TweenLite.set($target, { zIndex: 0 });
            TweenLite.set($origin, { zIndex: 1 });

            // Animate
            TweenLite.to($origin, 0.6, {
                rotationZ: 5, x: 2000, ease: Ease.easeInOut, onComplete: function () {
                    TweenLite.set($origin, { zIndex: 0 });
                    TweenLite.set($target, { zIndex: 1 });
                    TweenLite.to($origin, 0.6, {
                        rotationZ: 0, x: 0, ease: Ease.easeInOut, onComplete: function () {
                            scene.setPreEnters();
                            $viewportDiv.trigger('transitionDone', [targetNum]);
                        }
                    });
                }
            });
        },
        /*Used in: CV*/
        backgroundAndContentCardShuffleBackward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Prepare elements
            $target.removeClass('past');
            TweenLite.set($target, { zIndex: 0 });
            TweenLite.set($origin, { zIndex: 1 });

            // Animate
            TweenLite.to($origin, 0.6, {
                rotationZ: -5, x: -2000, ease: Ease.easeInOut, onComplete: function () {
                    TweenLite.set($origin, { zIndex: 0 });
                    TweenLite.set($target, { zIndex: 1 });
                    TweenLite.to($origin, 0.6, {
                        rotationZ: 0, x: 0, ease: Ease.easeInOut, onComplete: function () {
                            scene.setPreEnters();
                            $viewportDiv.trigger('transitionDone', [targetNum]);
                        }
                    });
                }
            });
        },
        /*Used in: Educational*/
        foregroundParallelLayersContentClippedHorizontallyForward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            var $fgLayers = $('#fg-box').show().children();

            // Prepare elements
            TweenLite.set($fgLayers, { x: '-100%' });
            TweenLite.set($target, { width: '0%', zIndex: 2 });
            $target.removeClass('future');

            // Animate foreground layers
            TweenLite.to($fgLayers.eq(0), 2.2, {
                x: '100%', ease: Linear.easeNone, force3D: true, onComplete: function () {
                    $('#fg-box').hide();
                    scene.setPreEnters();
                    $viewportDiv.trigger('transitionDone', [targetNum]);
                }
            });
            TweenLite.to($fgLayers.eq(1), 1.5, { x: '100%', delay: 0.6, ease: Linear.easeNone, force3D: true });
            TweenLite.to($fgLayers.eq(2), 1.5, { x: '100%', ease: Linear.easeNone, force3D: true });

            // Animate in
            TweenLite.to($target, 1.1, { width: '100%', delay: 0.55 });
        },
        /*Used in: Educational*/
        foregroundParallelLayersContentClippedHorizontallyBackward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            var $fgLayers = $('#fg-box').show().children();

            // Prepare elements
            TweenLite.set($fgLayers, { x: '100%' });
            TweenLite.set($target, { width: '100%', zIndex: 1 });
            TweenLite.set($origin, { width: '100%', zIndex: 2 });
            $target.removeClass('past');

            // Animate foreground layers
            TweenLite.to($fgLayers.eq(0), 2.2, {
                x: '-100%', ease: Linear.easeNone, force3D: true, onComplete: function () {
                    $('#fg-box').hide();
                    scene.setPreEnters();
                    $viewportDiv.trigger('transitionDone', [targetNum]);
                }
            });
            TweenLite.to($fgLayers.eq(1), 1.5, { x: '-100%', delay: 0.6, ease: Linear.easeNone, force3D: true });
            TweenLite.to($fgLayers.eq(2), 1.5, { x: '-100%', ease: Linear.easeNone, force3D: true });

            // Animate in
            TweenLite.to($origin, 0.9, { width: '0%', delay: 0.93, ease: Ease.easeIn });
        },
        /*Used in: Portfolio (stripes)*/
        backgroundAndContentPortfolioSlidesForward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);
            var $slides = $('#slide-box').children('.slide');

            $target.removeClass('future');

            for (var i = scene.currentSlideNum() ; i < targetNum; i++) {
                TweenLite.to($slides.eq(i), 0.9, { x: 0, force3D: true, onCompleteParams: [i, targetNum, 'f', $viewportDiv], onComplete: finitoSenorPortfolio });
            };
        },
        /*Used in: Portfolio (stripes)*/
        backgroundAndContentPortfolioSlidesBackward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);
            var $slides = $('#slide-box').children('.slide');

            $target.removeClass('past');

            for (var i = scene.currentSlideNum() ; i >= targetNum; i--) {
                TweenLite.to($slides.eq(i), 0.9, { x: 1820, force3D: true, onCompleteParams: [i, targetNum, 'b', $viewportDiv], onComplete: finitoSenorPortfolio });
            };
        },
        /*Used in: Table (aka desktop)*/
        backgroundAndContentSlideOnXAxisForward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            var $bgLayer = $('#bg-box .bg-layer'),
                toMove = $origin.get(0).getBoundingClientRect().width * (targetNum - 1);

            $target.removeClass('future');
            TweenLite.set($target, { x: '100%' });

            TweenLite.to($bgLayer, 1.2, { backgroundPosition: '-' + toMove + 'px 0px', force3D: true });
            // Animate out
            TweenLite.to($origin, 1.2, { x: '-100%', force3D: true });

            // Animate in
            TweenLite.to($target, 1.2, {
                x: '0%', force3D: true, onComplete: function () {
                    scene.setPreEnters();
                    $viewportDiv.trigger('transitionDone', [targetNum]);
                }
            });
        },
        /*Used in: Table (aka desktop)*/
        backgroundAndContentSlideOnXAxisBackward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            var $bgLayer = $('#bg-box .bg-layer'),
                toMove = $origin.get(0).getBoundingClientRect().width * (targetNum - 1);

            $target.removeClass('past');
            TweenLite.set($target, { x: '-100%' });

            TweenLite.to($bgLayer, 1.2, { backgroundPosition: '-' + toMove + 'px 0px', force3D: true });
            // Animate out
            TweenLite.to($origin, 1.2, { x: '100%', force3D: true });

            // Animate in
            TweenLite.to($target, 1.2, {
                x: '0%', force3D: true, onComplete: function () {
                    scene.setPreEnters();
                    $viewportDiv.trigger('transitionDone', [targetNum]);
                }
            });

        },
        /*Used in: Finance HD*/
        backgroundAndContentCubeRotateForward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Prepare elements
            $target.removeClass('future');

            TweenLite.set($origin, { rotationX: 0, y: '0%', alpha: 1, transformOrigin: "center top" });
            TweenLite.set($target, { rotationX: -90, y: '78%', alpha: 0.3, transformOrigin: "center bottom" });

            TweenLite.to($origin, 0.8, { rotationX: 90, y: '0%', alpha: 0.3 });
            TweenLite.to($target, 0.8, {
                rotationX: 0, y: '0%', alpha: 1, onComplete: function () {
                    scene.setPreEnters();
                    $viewportDiv.trigger('transitionDone', [targetNum]);
                }
            });
        },
        /*Used in: Finance HD*/
        backgroundAndContentCubeRotateBackward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Prepare elements
            $target.removeClass('past');

            TweenLite.set($origin, { rotationX: 0, y: '0%', alpha: 1, transformOrigin: "center bottom" });
            TweenLite.set($target, { rotationX: 90, y: '-78%', alpha: 0.3, transformOrigin: "center top" });

            TweenLite.to($origin, 0.8, { rotationX: -90, y: '0%', alpha: 0.3 });
            TweenLite.to($target, 0.8, {
                rotationX: 0, y: '0%', alpha: 1, onComplete: function () {
                    scene.setPreEnters();
                    $viewportDiv.trigger('transitionDone', [targetNum]);
                }
            });
        },
        /*Used in: Photography*/
        SlideOnXAxisWithFadeForward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Prepare elements
            TweenLite.set($target, { x: '100%', alpha: 1 });
            $target.removeClass('future');

            TweenLite.to($origin, 0.2, { x: '-10%', alpha: 0, ease: Ease.easeInOut });
            TweenLite.to($target, 0.3, {
                x: '0%', delay: 0.1, ease: Ease.easeInOut, onComplete: function () {
                    scene.setPreEnters();
                    $viewportDiv.trigger('transitionDone', [targetNum]);
                }
            });
        },
        /*Used in: Photography*/
        SlideOnXAxisWithFadeBackward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Prepare elements
            TweenLite.set($target, { x: '-100%', alpha: 1 });
            $target.removeClass('past');

            TweenLite.to($origin, 0.2, { x: '10%', alpha: 0, ease: Ease.easeInOut });
            TweenLite.to($target, 0.3, {
                x: '0%', delay: 0.1, ease: Ease.easeInOut, onComplete: function () {
                    scene.setPreEnters();
                    $viewportDiv.trigger('transitionDone', [targetNum]);
                }
            });
        },
        /*Used in: quiz*/
        backgroundAndContentXAxisForward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Prepare target
            $target.removeClass('future');
            TweenLite.set($target, { x: '100%' });

            // Animate out
            TweenLite.to($origin, 0.6, { x: '-100%', ease: Ease.easeInOut, force3D: true });

            // Animate in
            TweenLite.to($target, 0.6, {
                x: '0%', ease: Ease.easeInOut, force3D: true, onComplete: function () {
                    scene.setPreEnters();
                    $viewportDiv.trigger('transitionDone', [targetNum]);
                }
            });
        },
        /*Used in: quiz*/
        backgroundAndContentXAxisBackward: function ($origin, $target, targetNum, $viewportDiv) {
            $viewportDiv.trigger('transitionStart', [targetNum]);

            // Prepare target
            TweenLite.set($target, { x: '-100%' });
            $target.removeClass('past');

            // Animate out
            TweenLite.to($origin, 0.6, { x: '100%', ease: Ease.easeInOut, force3D: true });

            // Animate in
            TweenLite.to($target, 0.6, {
                x: '0%', ease: Ease.easeInOut, force3D: true, onComplete: function () {
                    scene.setPreEnters();
                    $viewportDiv.trigger('transitionDone', [targetNum]);
                }
            });
        },
        smoothMyScroll: smoothMyScroll
    }

    // Portfolio single transitionDone report (since we animate multiple slides)
    function finitoSenorPortfolio(ind, tar, dir, $viewportDiv) {
        if (dir === 'f') {
            if (ind === tar - 1) {
                scene.setPreEnters();
                $viewportDiv.trigger('transitionDone', [tar]);
            }
        }

        if (dir === 'b') {
            if (ind === tar) {
                scene.setPreEnters();
                $viewportDiv.trigger('transitionDone', [tar]);
            }
        }
    }

    // Smoothy smooth scroll
    function smoothMyScroll(smoothMe) {
        var $window = $(window);
        var scrollTime = 1.2;
        var scrollDistance = 170;

        $window.on("mousewheel DOMMouseScroll", function (event) {

            event.preventDefault();

            var delta = event.originalEvent.wheelDelta / 120 || -event.originalEvent.detail / 3;
            var scrollTop = $window.scrollTop();
            var finalScroll = scrollTop - parseInt(delta * scrollDistance);

            TweenLite.to($window, scrollTime, {
                scrollTo: { y: finalScroll, autoKill: true },
                ease: Power2.easeOut,
                overwrite: 5
            });

        });
    }

})();
