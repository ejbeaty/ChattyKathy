

function ChattyKathy(awsAccessKey,awsSecretKey,awsRegion) {

    // Add audio node to html
    var elementId = "audioElement" + new Date().valueOf().toString();
    document.body.innerHTML += '<audio id="'+elementId+'" />';
    var audioElement = document.getElementById(elementId);

    var isSpeaking = false;
    var playlist = [];

    // Credentials
    var awsCredentials = new AWS.Credentials({
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretKey
    });
    // Config
    AWS.config.update({
        credentials: awsCredentials,
        region: awsRegion
    });

    var polly = new AWS.Polly();

    var kathy = {
        self: this,
        // Speak
        Speak: function (msg) {
            if (isSpeaking) {
                playlist.push(msg);
            } else {
                say(msg).then(sayNext)
            }
        },

        // Quit speaking, clear playlist
        ShutUp: function(){
            shutUp();
        },
        // Speak & return promise
        SpeakWithPromise: function (msg) {
            return say(msg);
        },

        IsSpeaking: function () {
            return isSpeaking;
        }

    }
    // Quit talking
    function shutUp() {
        audioElement.pause();
        playlist = [];
    }

    // Speak the message
    function say(message) {
        return new Promise(function (successCallback, errorCallback) {
            isSpeaking = true;
            requestSpeechFromAWS(message)
                .then(playAudio)
                .then(successCallback);
        });
    }

    // Say next
    function sayNext() {
        if (playlist.length > 0) {
            var msg = playlist[0];
            playlist.splice(0, 1);
            say(msg).then(sayNext);
        }
    }

    // Make request to Amazon polly
    function requestSpeechFromAWS(message) {

        return new Promise(function (successCallback, errorCallback) {

            var params = {
                OutputFormat: 'mp3',
                Text: message,
                VoiceId: 'Amy'
            }
            polly.synthesizeSpeech(params, function (error, data) {
                if (error) {
                    console.log("ERROR!")
                    errorCallback(error)
                } else {
                    successCallback(data.AudioStream)
                }
            });
        });
    }

    // Play audio
    function playAudio(audioStream, callBack) {

        return new Promise(function (success, error) {
            var uInt8Array = new Uint8Array(audioStream);
            var arrayBuffer = uInt8Array.buffer;
            var blob = new Blob([arrayBuffer]);

            var url = URL.createObjectURL(blob);
            audioElement.src = url;
            audioElement.addEventListener("ended", function () {
                isSpeaking = false;
                success();
            });
            audioElement.play();
        });
    }

    return kathy;
}






