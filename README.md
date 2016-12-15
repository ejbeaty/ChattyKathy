# ChattyKathy
ChattyKathy is a wrapper for  Amazon's Aws.Polly library. You pass ChattyKathy an AWS Credentials object and she'll handle the calls to AWS Polly for you, turn the response into audio, and then play the audio.

## Dependencies
- [AWS Javascript SDK](https://aws.amazon.com/sdk-for-browser/) version 2.7.13 or higher

## Getting Started
### Basic Usage
```javascript
	var settings = {
        awsCredentials: awsCredentials,
        awsRegion: "us-west-2",
        pollyVoiceId: "Justin",
        cacheSpeech: true
    }

    var kathy = ChattyKathy(settings);
    
    kathy.Speak("Hello world, my name is Kathy!");
    kathy.Speak("I can be used for an amazing user experience!");
```
ChattyKathy will chain your commands together and not speak the next sentenece until the prior has been spoken.

### AWS Credentials
First you need to configure your AWS Credentials. The quick and dirty way to do this is to pass your AWS AccessKeyId and SecretAccessKey directly to the AWS.Credentials object in the [AWS Javascript SDK](https://aws.amazon.com/sdk-for-browser/).
```javascript
var awsCredentials = new AWS.Credentials("myAccessKeyId", "mySecretAccessKey");
var settings = {
        awsCredentials: awsCredentials,
        ...
    }
```
Hardcoding your credentials client-side is obviously **extremely unsecure** and should never be done in a production environment.
The proper way to approach this is with [Amazon Cognito](http://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html), which is the approach recommended by Amazon.

 Once your IdentityPool and logins are setup, securly retrieve a token with your server-side code, pass it to the client, and configure an AWS.CognitoIdentityCredentials object:
```javascript
    var awsCredentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-west-2:some-guid-for-identity-pool-id',
        IdentityId: 'us-west-2:some-guid-for-identity-id',
        Logins: {
            'cognito-identity.amazonaws.com': tokenReturnedFromServer
        }
    });
```

## Usage
### ChattyKathy(settings);
##### Settings { JSON Object  }
Property | Type | Default | Example | Details  
:------ | :------ | :------ | :-----| :------
**awsCredentials** | Object | null |  | Any credentials object from the AWS Javascript SDK that satisfies the [Polly API's](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Polly.html) constructor
**awsRegion** | string | null |```'us-west-2'```| The AWS Region you want to use
**pollyVoiceId** _(optional)_| string | ```'Amy'``` || Any valid VoiceId supported by [Polly.synthesizeSpeech](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Polly.html#synthesizeSpeech-property)
**cacheSpeech** _(optional)_| bool | true |  | When true, ChattyKathy will cache speech to the browser's localStorage after making a request to AWS and check there before each call to the API.

##### Methods 
Name | Returns | Details  
:------ | :------ | :------
**Speak(```string```)** | void |ChattyKathy will request audio for the desired msg from AWS Polly and play it back in the browser
**SpeakWithPromise(```string```)** | Promise | ChattyKathy will Speak() then return a promise so functions can be called once she has spoken.
**IsSpeaking()**| bool | returns ```true``` if ChattyKathy is currently speaking
**ShutUp()** | void | Makes ChattyKathy quit speaking
**ForgetCachedSpeech()** | void | Clears the localStorage of any cached speech

#### Examples
 ChattyKathy can return a Javascript Promise so that you can do something else once she's done speaking.
```javascript
    kathy.SpeakWithPromise("I'm going to run a function!")
        .then(doSomeFunction);
    
    function doSomeFunction() {
        kathy.Speak("I did a function");
    }
```

If ChattyKathy is getting too chatty, you can tell her to shut up:
```javascript
    if (kathy.IsSpeaking()) {
        kathy.ShutUp(); 
    }
```
