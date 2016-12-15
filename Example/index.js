
(function () {
    
    var awsCredentials = new AWS.Credentials("yourAccessKey", "yourSecretAccessKey");
    var settings = {
        awsCredentials: awsCredentials,
        awsRegion: "us-west-2",
        pollyVoiceId: "Justin",
        cacheSpeech: true
    }
    var kathy = ChattyKathy(settings);
    
    kathy.Speak("Hello world, my name is Kathy!");
    kathy.Speak("I can be used for an amazing user experience!");

    if (kathy.IsSpeaking()) {
        kathy.ShutUp(); 
    }

    kathy.ForgetCachedSpeech();
})();

