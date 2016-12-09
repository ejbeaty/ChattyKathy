
var playlist = [];
(function () {
    var kathy = ChattyKathy("", "", "us-west-2");

   
    kathy.Speak("1")
    kathy.Speak("2")
    kathy.Speak("3")
    kathy.Speak("4")
    kathy.Speak("5")
    setTimeout(function () {
        kathy.ShutUp();
        kathy.SpeakWithPromise("4").then(function () { console.log("done") })
    },2000)
    
    

})();

