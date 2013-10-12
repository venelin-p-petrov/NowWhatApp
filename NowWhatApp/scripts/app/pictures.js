var app = app || {};
var appPictureDirectory = appPictureDirectory || {};

(function(a){
    function loadPictures() {
        var directoryReader = appPictureDirectory.createReader();
        directoryReader.readEntries(function(entries) {
            viewModel.pictures.splice(0, viewModel.pictures.length);
            var picCount = 10;
            var i;
            for (i=entries.length - 1; i >= entries.length - picCount && i >= 0; i--) {
                if (entries[i].isFile) {
                    viewModel.pictures.push(entries[i]);
                }
            }
        }, fail);
    }
    
    var viewModel = kendo.observable({
        pictures: [],
        loadPictures: loadPictures
    });
    
    function init(e){
        kendo.bind(e.view.element, viewModel);
        loadPictures();
    }
    
    function fail(error) {
        navigator.notification.alert(error.code, null, 'Damn!');
    }
    
    a.pictures = {
        init: init
    }
}(app));