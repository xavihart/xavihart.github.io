/**
 * Reusable frame-by-frame video controls.
 *
 * Usage (declarative):
 *   Add data-video-controls to any container that has <video> children.
 *   Optional attributes:
 *     data-fps="20"          — frame rate for stepping (default: 20)
 *     data-autoplay="false"   — whether videos auto-play on load (default: true)
 *
 * Usage (programmatic):
 *   createVideoControls(containerEl, { fps: 20, autoplay: true });
 */
var ICON_RESET    = '\u23EE\uFE0E'; // ⏮︎
var ICON_STEP_BACK = '\u23EA\uFE0E'; // ⏪︎
var ICON_PLAY      = '▶️'; // Use Emoji
var ICON_PAUSE     = '⏸️'; // Use Emoji
var ICON_STEP_FWD  = '\u23E9\uFE0E'; // ⏩︎

function createVideoControls(container, opts) {
    opts = opts || {};
    const FPS = opts.fps || 20;
    const FRAME_DUR = 1 / FPS;
    const shouldAutoplay = opts.autoplay !== false;

    const videos = Array.from(container.querySelectorAll('video'));
    if (videos.length === 0) return;

    const primary = videos[0];

    // --- Build control bar DOM ---
    const btnStyle = opts._isLightbox
        ? 'background:none;border:1px solid #555;border-radius:0.25em;padding:0.25em 0.5em;cursor:pointer;font-size:1em;line-height:1;color:#ccc;'
        : 'background:none;border:1px solid #ccc;border-radius:0.25em;padding:0.25em 0.5em;cursor:pointer;font-size:1em;line-height:1;color:#444;';
    const playBtnStyle = opts._isLightbox
        ? 'background:none;border:1px solid #555;border-radius:0.25em;padding:0.25em 0.5em;cursor:pointer;font-size:1.3em;line-height:1;color:#ccc;width:2.5em;text-align:center;'
        : 'background:none;border:1px solid #ccc;border-radius:0.25em;padding:0.25em 0.5em;cursor:pointer;font-size:1.3em;line-height:1;color:#444;width:2.5em;text-align:center;';

    const bar = document.createElement('div');
    bar.style.cssText = 'display:flex;align-items:center;gap:0.6em;margin-top:0.5em;padding:0.5em 0.75em;background:' + (opts._isLightbox ? '#2a2a2a' : '#f5f5f5') + ';border-radius:0.4em;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:0.9em;';

    const resetBtn = document.createElement('button');
    resetBtn.textContent = ICON_RESET; resetBtn.title = 'Reset to first frame'; resetBtn.style.cssText = btnStyle;

    const stepBackBtn = document.createElement('button');
    stepBackBtn.textContent = ICON_STEP_BACK; stepBackBtn.title = 'Step back one frame; hold to slow play'; stepBackBtn.style.cssText = btnStyle;

    const playPauseBtn = document.createElement('button');
    playPauseBtn.textContent = shouldAutoplay ? ICON_PAUSE : ICON_PLAY;
    playPauseBtn.title = shouldAutoplay ? 'Pause' : 'Play';
    playPauseBtn.style.cssText = playBtnStyle;

    const stepFwdBtn = document.createElement('button');
    stepFwdBtn.textContent = ICON_STEP_FWD; stepFwdBtn.title = 'Step forward one frame; hold to slow play'; stepFwdBtn.style.cssText = btnStyle;

    const scrubber = document.createElement('input');
    scrubber.type = 'range'; scrubber.min = '0'; scrubber.max = '1000'; scrubber.value = '0';
    scrubber.style.cssText = 'flex:1;min-width:0;cursor:pointer;accent-color:' + (opts._isLightbox ? '#aaa' : '#555') + ';';

    const timeDisplay = document.createElement('span');
    timeDisplay.style.cssText = 'flex-shrink:0;white-space:nowrap;text-align:right;color:' + (opts._isLightbox ? '#aaa' : '#666') + ';font-variant-numeric:tabular-nums;';
    timeDisplay.textContent = '0:00 / 0:00';

    bar.appendChild(resetBtn);
    bar.appendChild(stepBackBtn);
    bar.appendChild(playPauseBtn);
    bar.appendChild(stepFwdBtn);
    bar.appendChild(scrubber);
    bar.appendChild(timeDisplay);

    // Insert control bar right after the video container
    container.parentNode.insertBefore(bar, container.nextSibling);

    // --- State ---
    let isPlaying = shouldAutoplay;
    let isScrubbing = false;
    let duration = 0;

    function formatTime(t) {
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return m + ':' + String(s).padStart(2, '0');
    }

    function updateTimeDisplay() {
        const cur = primary.currentTime || 0;
        timeDisplay.textContent = formatTime(cur) + ' / ' + formatTime(duration);
    }

    function syncVideos(time) {
        videos.forEach(function(v) { v.currentTime = time; });
    }

    function safePlay(video) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function() {});
        }
    }

    function setPlayingState(playing) {
        playPauseBtn.textContent = playing ? ICON_PAUSE : ICON_PLAY;
        playPauseBtn.title = playing ? 'Pause' : 'Play';
        isPlaying = playing;
    }

    function pauseAll() {
        videos.forEach(function(v) { v.pause(); });
        setPlayingState(false);
    }

    function playAll() {
        videos.forEach(safePlay);
        setPlayingState(true);
    }

    function stepByFrame(direction) {
        var newTime = direction > 0
            ? Math.min(duration, primary.currentTime + FRAME_DUR)
            : Math.max(0, primary.currentTime - FRAME_DUR);
        syncVideos(newTime);
        updateTimeDisplay();
        return newTime;
    }

    // --- Events ---
    primary.addEventListener('loadedmetadata', function() {
        duration = primary.duration;
        updateTimeDisplay();
    });
    // In case metadata already loaded
    if (primary.readyState >= 1) {
        duration = primary.duration;
        updateTimeDisplay();
    }

    primary.addEventListener('timeupdate', function() {
        if (!isScrubbing && duration > 0) {
            scrubber.value = (primary.currentTime / duration) * 1000;
            updateTimeDisplay();
        }
    });

    playPauseBtn.addEventListener('click', function() {
        if (isPlaying) { pauseAll(); } else { playAll(); }
    });

    resetBtn.addEventListener('click', function() {
        pauseAll();
        syncVideos(0);
        scrubber.value = 0;
        updateTimeDisplay();
    });

    // --- Hold-to-slow-play for step buttons ---
    var HOLD_DELAY = 200;   // ms before slow play kicks in
    var SLOW_RATE = 0.25;

    function setupStepButton(btn, direction) {
        var holdTimer = null;
        var stepInterval = null;
        var didHold = false;
        var isPressed = false;

        function startSlowPlay() {
            didHold = true;
            var stepMs = FRAME_DUR / SLOW_RATE * 1000;
            stepInterval = setInterval(function() {
                var newTime = stepByFrame(direction);
                if (direction > 0 ? newTime >= duration : newTime <= 0) stopSlowPlay();
            }, stepMs);
        }

        function stopSlowPlay() {
            if (!isPressed) return;
            isPressed = false;
            if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
            if (stepInterval) { clearInterval(stepInterval); stepInterval = null; }
            pauseAll();
        }

        function onDown(e) {
            e.preventDefault();
            isPressed = true;
            didHold = false;
            pauseAll();
            // Immediate single step
            stepByFrame(direction);
            holdTimer = setTimeout(startSlowPlay, HOLD_DELAY);
        }

        function onUp() {
            stopSlowPlay();
        }

        btn.addEventListener('mousedown', onDown);
        btn.addEventListener('mouseup', onUp);
        btn.addEventListener('mouseleave', onUp);
        btn.addEventListener('touchstart', onDown, { passive: false });
        btn.addEventListener('touchend', onUp);
        btn.addEventListener('touchcancel', onUp);

        // Suppress click if it was a hold (prevents extra step on release)
        btn.addEventListener('click', function(e) {
            if (didHold) { e.preventDefault(); e.stopPropagation(); }
        });
    }

    setupStepButton(stepBackBtn, -1);
    setupStepButton(stepFwdBtn, 1);

    var resumeAfterScrub = false;
    scrubber.addEventListener('input', function() {
        if (!isScrubbing) {
            resumeAfterScrub = isPlaying;
            pauseAll();
            isScrubbing = true;
        }
        syncVideos((scrubber.value / 1000) * duration);
        updateTimeDisplay();
    });

    scrubber.addEventListener('change', function() {
        isScrubbing = false;
        if (resumeAfterScrub) playAll();
        resumeAfterScrub = false;
    });

    // Manual looping (remove loop attr so reset works cleanly)
    videos.forEach(function(v) { v.removeAttribute('loop'); });
    primary.addEventListener('ended', function() {
        syncVideos(0);
        playAll();
    });

    // --- Lightbox: click video to pop out ---
    if (!opts._isLightbox) {
        videos.forEach(function(v) {
            v.style.cursor = 'pointer';
            v.addEventListener('click', function() {
                var currentTime = primary.currentTime;

                // Pause all background videos
                pauseAll();

                // Overlay
                var overlay = document.createElement('div');
                overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);z-index:10000;display:flex;align-items:center;justify-content:center;';

                // Inner wrapper — holds both video and control bar at same width
                var wrapper = document.createElement('div');
                wrapper.className = 'video-lightbox-wrapper';
                wrapper.style.cssText = 'max-height:90vh;';

                // Video container (needed for createVideoControls)
                var videoContainer = document.createElement('div');
                videoContainer.style.cssText = 'width:100%;';

                // Clone the clicked video
                var popupVideo = document.createElement('video');
                popupVideo.muted = true;
                popupVideo.playsInline = true;
                popupVideo.style.cssText = 'width:100%;display:block;border-radius:0.4em;';
                // Copy all sources
                var sources = v.querySelectorAll('source');
                sources.forEach(function(src) {
                    var newSrc = document.createElement('source');
                    newSrc.src = src.src;
                    newSrc.type = src.type;
                    popupVideo.appendChild(newSrc);
                });
                // Fallback: use src directly
                if (sources.length === 0 && v.src) {
                    popupVideo.src = v.src;
                }

                videoContainer.appendChild(popupVideo);
                wrapper.appendChild(videoContainer);
                overlay.appendChild(wrapper);
                document.body.appendChild(overlay);

                // Once metadata is ready, seek and play
                function initPopup() {
                    popupVideo.currentTime = currentTime;
                    safePlay(popupVideo);
                    // Create controls — _isLightbox prevents nested lightbox handlers
                    createVideoControls(videoContainer, {
                        fps: FPS,
                        autoplay: true,
                        _isLightbox: true
                    });
                }
                if (popupVideo.readyState >= 1) {
                    initPopup();
                } else {
                    popupVideo.addEventListener('loadedmetadata', initPopup);
                }

                // Close on overlay click (not on video/controls)
                overlay.addEventListener('click', function(e) {
                    if (e.target === overlay) closeLightbox();
                });

                // Close on Escape
                function onKey(e) {
                    if (e.key === 'Escape') closeLightbox();
                }
                document.addEventListener('keydown', onKey);

                function closeLightbox() {
                    document.removeEventListener('keydown', onKey);
                    popupVideo.pause();
                    overlay.remove();
                }
            });
        });
    }

    return {
        container: container,
        bar: bar,
        videos: videos,
        playAll: playAll,
        pauseAll: pauseAll
    };
}

// Auto-initialize all containers with data-video-controls
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-video-controls]').forEach(function(el) {
        createVideoControls(el, {
            fps: parseFloat(el.getAttribute('data-fps')) || 20,
            autoplay: el.getAttribute('data-autoplay') !== 'false'
        });
    });
});
