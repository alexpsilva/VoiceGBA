var recorder;
var recognizer;
var callbackManager;
var audioContext;
    

function postRecognizerJob(message, callback){
	console.log('postRecognizerJob: ', message);
	var msg = message || {};

	if(recognizer){
		recognizer.postMessage(msg);
	}
}

// Callback once the user authorizes access to the microphone:
function startUserMedia(stream) {
    var input = audioContext.createMediaStreamSource(stream);

    var err_callback = function(err){ console.log(err); }
    var config = {
    	'errorCallback': err_callback,
    	'inputBufferLength': 4096,
    	'outputBufferLength': 4000,
    	'outputSampleRate': 16000,
    	'worker': 'webapp/js/audioRecorderWorker.js'
    }

    recorder = new AudioRecorder(input, config);

    if(recognizer){
    	recorder.consumers = [recognizer];
    }
};
    
window.onload = function(){
	recognizer = new Worker('webapp/js/recognizer.js');
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
	    navigator.getUserMedia({audio: true},
	                           startUserMedia,
	                           function(e) {console.log("No live audio input in this browser");}
	                          );
	else console.log("No web audio support in this browser");

	recognizer.onmessage = function() {
		recognizer.onmessage = function(e) {
			// if an id to be used with the callback manager
			// this is needed to start the listening
			if (e.data.hasOwnProperty('id')) {
				var data = {};
				if (e.data.hasOwnProperty('data')) {
					data = e.data.data;
				}

				var callback = callbackManager.get(e.data['id']);
				if (callback) {
					callback(data);
				}
			}

			// if a new hypothesis has been created
			if (e.data.hasOwnProperty('hyp')) {
				var hypothesis = e.data.hyp;

				if (outputContainer) {
					outputContainer.innerHTML = hypothesis;
				}
			}

			// if an error occured
			if (e.data.hasOwnProperty('status') && (e.data.status == "error")) {}
		}
		postRecognizerJob(
			{command: 'initialize'},
			function() {
				if (recorder) {
					recorder.consumers = [recognizer];
				}
			})
	}
}

// Handle keyboard inputs
var firstPress = {};
window.addEventListener('keypress', function(e){
	if(firstPress[e.keyCode] === undefined){
		if(e.keyCode == 32){ //Spacebar
			console.log('key down');
			recorder.start(0);
		}
	}
	
	firstPress[e.keyCode] = true;
})

window.addEventListener('keyup', function(e){
	if(e.keyCode == 32){ //Spacebar
		console.log('key up');
		recorder.stop();
	}

	delete firstPress[e.keyCode];
})