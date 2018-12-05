var recorder;
var callbackManager;
var audioContext;


// Callback once the user authorizes access to the microphone:
function startUserMedia(stream) {
    var input = audioContext.createMediaStreamSource(stream);

    var err_callback = function(err) { console.log(err); }
    var config = {
        'errorCallback': err_callback,
        'inputBufferLength': 4096,
        'outputBufferLength': 4000,
        'outputSampleRate': 16000,
        'worker': 'js/audioRecorderWorker.js'
    }

    recorder = new AudioRecorder(input, config);
};

window.onload = function() {
    callbackManager = new CallbackManager();

    // Instantiating AudioContext
    try {
        // Deal with prefixed APIs
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        audioContext = new AudioContext();
    } catch (e) {
        console.log("Error initializing Web Audio");
    }

    // Actually call getUserMedia
    if (navigator.getUserMedia)
        navigator.getUserMedia({ audio: true },
            startUserMedia,
            function(e) { console.log("No live audio input in this browser"); }
        );
    else console.log("No web audio support in this browser");
}

// Handle keyboard inputs
var firstPress = {};
window.addEventListener('keypress', function(e) {
    if (firstPress[e.keyCode] === undefined) {
        if (e.keyCode == 32) { //Spacebar
            audioContext.resume();
            console.log('key down');
            recorder.start(0);
        }
    }

    firstPress[e.keyCode] = true;
})

window.addEventListener('keyup', function(e) {
    if (e.keyCode == 32) { //Spacebar
        console.log('key up');
        recorder.stop();
    }

    delete firstPress[e.keyCode];
})