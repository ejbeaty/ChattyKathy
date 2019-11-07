/*! ChattyKathy 1.0.1
 * ©2016 Elliott Beaty
 */

/**
 * @summary     ChattyKathy
 * @description Wrapper for Amazon's AWS Polly Javascript SDK
 * @version     1.0.1
 * @file        ChattyKathy.js
 * @author      Elliott Beaty
 * @contact     elliott@elliottbeaty.com
 * @copyright   Copyright 2016 Elliott Beaty
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license/mit
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 */

function ChattyKathy(settings) {

    settings = getValidatedSettings(settings);

    // Add audio node to html
    var elementId = "audioElement" + new Date().valueOf().toString();
    var audioElement = document.createElement('audio');
    audioElement.setAttribute("id", elementId);
    document.body.appendChild(audioElement);

    var isSpeaking = false;

    AWS.config.credentials = settings.awsCredentials;
    AWS.config.region = settings.awsRegion;

    var kathy = {
        self: this,
        playlist:[],
        // Speak
        Speak: function (msg) {
            if (isSpeaking) {
                this.playlist.push(msg);
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
        },

        ForgetCachedSpeech: function () {
            localStorage.removeItem("chattyKathyDictionary");
        }

    }

    // Quit talking
    function shutUp() {
        isSpeaking = false;
        audioElement.pause();
        playlist = [];
    }

    // Speak the message
    function say(message) {
        return new Promise(function (successCallback, errorCallback) {
            isSpeaking = true;
            getAudio(message)
                .then(playAudio)
                .then(successCallback);
        });
    }

    // Say next
    function sayNext() {
        var list = kathy.playlist;
        if (list.length > 0) {
            var msg = list[0];
            list.splice(0, 1);
            say(msg).then(sayNext);
        }
    }

    // Get Audio
    function getAudio(message) {
        if (settings.cacheSpeech === false || requestSpeechFromLocalCache(message) === null) {
            return requestSpeechFromAWS(message);
        } else {
            return requestSpeechFromLocalCache(message);
        }
    }

    // Make request to Amazon polly
    function requestSpeechFromAWS(message) {
        return new Promise(function (successCallback, errorCallback) {
            var polly = new AWS.Polly();
            var params = {
                OutputFormat: 'mp3',
                Text: `<speak>${message}</speak>`,
                VoiceId: settings.pollyVoiceId,
                TextType: 'ssml'
            }
            polly.synthesizeSpeech(params, function (error, data) {
                if (error) {
                    errorCallback(error)
                } else {
                    saveSpeechToLocalCache(message, data.AudioStream);
                    successCallback(data.AudioStream);
                }
            });
        });
    }

    // Save to local cache
    function saveSpeechToLocalCache(message, audioStream) {
        var record = {
            Message: message,
            AudioStream: JSON.stringify(audioStream)
        };
        var localPlaylist = JSON.parse(localStorage.getItem("chattyKathyDictionary"));

        if (localPlaylist === null) {
            localPlaylist = [];
            localPlaylist.push(record);
        }else{
            localPlaylist.push(record);

        }
        localStorage.setItem("chattyKathyDictionary", JSON.stringify(localPlaylist));
    }

    // Check local cache for audio clip
    function requestSpeechFromLocalCache(message) {
        
        var audioDictionary = localStorage.getItem("chattyKathyDictionary");
        if (audioDictionary === null) {
            return null;
        }
        var audioStreamArray = JSON.parse(audioDictionary);
        var audioStream = audioStreamArray.filter(function (record) {
            
            return record.Message === message;
        })[0];
       
        if (audioStream === null || typeof audioStream === 'undefined') {
            return null;
        } else {
            return new Promise(function (successCallback, errorCallback) {
                successCallback(JSON.parse(audioStream.AudioStream).data);
            });
        }
    }

    // Play audio
    function playAudio(audioStream) {
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

    // Validate settings
    function getValidatedSettings(settings) {
        if (typeof settings === 'undefined') {
            throw "Settings must be provided to ChattyKathy's constructor";
        }
        if (typeof settings.awsCredentials === 'undefined') {
            throw "A valid AWS Credentials object must be provided";
        }
        if (typeof settings.awsRegion === 'undefined' || settings.awsRegion.length < 1) {
            throw "A valid AWS Region must be provided";
        }
        if (typeof settings.pollyVoiceId === 'undefined') {
            settings.pollyVoiceId = "Amy";
        }
        if (typeof settings.cacheSpeech === 'undefined') {
            settings.cacheSpeech === true;
        }
        return settings;
    }

    return kathy;
}






