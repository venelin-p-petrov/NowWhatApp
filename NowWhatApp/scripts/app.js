var app = app || {};
var localFileSystem = localFileSystem || {};
var appPictureDirectory = appPictureDirectory || {};
var kendoApp = kendoApp || {};

(function() {
    document.addEventListener("deviceready", function() {
        kendoApp = new kendo.mobile.Application(document.body, {initial: "#home-view"});
        
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
            localFileSystem = fileSystem;
        }, fileSystemFail);
        
        localFileSystem.root.getDirectory("Now What Images", {create: true, exclusive: false}, function(directory) {
            appPictureDirectory = directory;
        }, fileSystemFail);
        
        var captureBtn = $("#capture-btn");
        //var shareBtn = $("#share-btn");
        
        //shareBtn.click(sharePost);
        
        jso_registerRedirectHandler(function(url) {
            inAppBrowserRef = window.open(url, "_blank");
            inAppBrowserRef.addEventListener('loadstop', function(e) {
                LocationChange(e.url)
            }, false);
        });
        
        captureBtn.click(function() {
            navigator.camera.getPicture(cameraSuccess, cameraError, {
                quality : 100, 
                destinationType : Camera.DestinationType.FILE_URI, 
                sourceType : Camera.PictureSourceType.CAMERA,
                encodingType: Camera.EncodingType.JPEG,
                correctOrientation: true,
                saveToPhotoAlbum: false
            });
        });
    });
    
    function LocationChange(url) {
        console.log("in location change");
        url = decodeURIComponent(url);
        console.log("Checking location: " + url);

        jso_checkfortoken('facebook', url, function() {
            console.log("Closing InAppBrowser, because a valid response was detected.");
            inAppBrowserRef.close();
        });
    };
    
    jso_configure({
        "facebook": {
            client_id: "1453471471545081",
            redirect_uri: "http://www.facebook.com/connect/login_success.html",
            authorization: "https://www.facebook.com/dialog/oauth",
            presenttoken: "qs"
        }
    }, {
        "debug": false
    });
    
    function fileSystemFail(e){
        navigator.notification.alert("Something went wrong. Please restart the app.", null, 'Sorry!');
    }
    
    //function sharePost() {
    //    var message = "Test message";
    //    var picture = "../styles/cool_003.jpg";
        
    //    //FB.ui({
    //    //    method: 'feed',
    //    //    name: 'Facebook Dialogs',
    //    //    picture: picture,
    //    //    description: message
    //    //}, function(response) {
    //    //    if (response && response.post_id) {
    //    //        navigator.notification.alert("Post published.", null, 'OK!');
    //    //    }
    //    //    else {
    //    //        navigator.notification.alert("Post not published", null, 'Damn!');
    //    //    }
    //    //});
        
    //    $.oajax({
    //        type: "POST",
    //        url: "https://graph.facebook.com/me/photos",
    //        jso_provider: "facebook",
    //        jso_scopes: ["read_stream", "publish_stream"],
    //        jso_allowia: true,
    //        dataType: 'json',
    //        data: {
    //            name: message,
    //            url: picture
    //        },
    //        success: function(data) {
    //            navigator.notification.alert(data, null, 'OK!');
    //        },
    //        error: function(error) {
    //            navigator.notification.alert(error, null, 'Damn!');
    //        }
    //    });
    //}
    
    // Called when capture operation is finished
    //
    function cameraSuccess(imageUri) {
        window.resolveLocalFileSystemURI(imageUri, function(picture) {
            picture.moveTo(appPictureDirectory, picture.name, function(pic) {
                var url = "views/post-view.html#post-view?picname=" + pic.name;
                kendoApp.navigate(url);
            }, fail);
        }, fail);
    }
        
    // Called if something bad happens.
    //
    function cameraError(error) {
        var msg = 'An error occurred during capture.';
        navigator.notification.alert(msg, null, 'Sorry!');
    }

    function fail(error) {
        navigator.notification.alert("An error ocurred while saving the picture.", null, 'Sorry!');
    }
}());