// when testing on localhost, you cannot load the file directly. You
// must serve it from a browser. You need an SSL certificate to load
// the audio recorder.

var gumStream; //stream from getUserMedia() 
var recorder; //WebAudioRecorder object 
var input; //MediaStreamAudioSourceNode we'll be recording var encodingType; 

var audioContext = null;

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var statusLabel = document.getElementById("recordstatus");

recordButton.addEventListener("click", startRecording); 
stopButton.addEventListener("click", stopRecording);

function updateStatus(s) {
    statusLabel.innerHTML = s;
}

function startRecording() { 

    var constraints = {
        audio: true,
        video: false
    }

    audioContext = new AudioContext(); //new audio context to help us record 

    navigator.mediaDevices.getUserMedia(constraints).then( function(stream) {

        //assign to gumStream for later use 
        gumStream = stream;
        
        /* use the stream */
        input = audioContext.createMediaStreamSource(stream);

        //stop the input from playing back through the speakers 
        // does the opposite of the comment above
        // input.connect(audioContext.destination)

        //get the encoding 
        encodingType = "mp3";
        
        recorder = new WebAudioRecorder(input, {
            workerDir: "js/",
            encoding: encodingType,
            onEncoderLoading: function(recorder, encoding) {
                updateStatus("Loading Encoder...");
            },
            onEncoderLoaded: function(recorder, encoding) {
                updateStatus("Encoder Loaded.");
            }
        });
        recorder.onComplete = function(recorder, blob) {
            updateStatus("Encoding complete");
            createDownloadLink(blob, recorder.encoding);
        }
        recorder.setOptions({
            timeLimit: 120,
            encodeAfterRecord: true,
            ogg: {
                quality: 0.5
            },
            mp3: {
                bitRate: 160
            }
        });
        
        recordButton.disabled = true;
        stopButton.disabled = false;
        updateStatus("Recording");

        //start the recording process 
        recorder.startRecording();


    })

};


function stopRecording() {
    updateStatus("stopRecording() called");
    //stop microphone access 
    gumStream.getAudioTracks()[0].stop();
    //disable the stop button 
    stopButton.disabled = true;
    recordButton.disabled = false;
    //tell the recorder to finish the recording (stop recording + encode the recorded audio) 
    recorder.finishRecording();
    updateStatus('Recording stopped');
}

function createDownloadLink(blob, encoding) {
    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');
    var li = document.createElement('li');
    var link = document.createElement('a');
    //add controls to the "audio" element 
    au.controls = true;
    au.src = url; //link the a element to the blob 
    link.href = url;
    link.download = new Date().toISOString() + '.' + encoding;
    link.innerHTML = link.download;
    //add the new audio and a elements to the li element 
    li.appendChild(au);
    li.appendChild(link); //add the li element to the ordered list 

    recordingsList.appendChild(li);
}