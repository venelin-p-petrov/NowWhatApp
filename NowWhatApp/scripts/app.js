var app = app || {};
var localFileSystem = localFileSystem || {};
var appPictureDirectory = appPictureDirectory || {};
var pictures = pictures || {};
var test = new kendo.data.DataSource({
    data: [{name:"asdasdasd"}, {name:"124141341234"}]
});

(function() {
    document.addEventListener("deviceready", function() {
        var kendoApp = new kendo.mobile.Application(document.body);
        
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
            localFileSystem = fileSystem;
        }, fail);
        
        localFileSystem.root.getDirectory("Now What Images", {create: true, exclusive: false}, function(directory) {
            appPictureDirectory = directory;
        }, fail);
        
        var captureBtn = $("#capture-btn");
        
        captureBtn.click(function() {
            navigator.device.capture.captureImage(captureSuccess, captureError);
        });
        
        loadPictures();
    });
    
    // Called when capture operation is finished
    //
    function captureSuccess(mediaFiles) {
        window.resolveLocalFileSystemURI(mediaFiles[0].fullPath, function(picture) {
            picture.copyTo(appPictureDirectory, picture.name, null, fail);
        }, fail);
    }
        
    // Called if something bad happens.
    //
    function captureError(error) {
        var msg = 'An error occurred during capture: ' + error.code;
        navigator.notification.alert(msg, null, 'Uh oh!');
    }

    function fail(error) {
        navigator.notification.alert(error.code, null, 'Damn!');
    }
    
    function loadPictures() {
        var directoryReader = appPictureDirectory.createReader();
        directoryReader.readEntries(function(entries) {
            var pictureArr = new Array();
            
            var i;
            for (i=0; i < entries.length; i++) {
                if (entries[i].isFile) {
                    pictureArr.push(entries[i]);
                }
            }
            
            pictures = new kendo.data.DataSource({
                data: pictureArr
            });
        }, fail);
    }
}());