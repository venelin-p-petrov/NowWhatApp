var app = app || {};
var appPictureDirectory = appPictureDirectory || {};

(function(a){
    
    var imgTemplate = kendo.template('<img src="#: fullPath #" class="picture" />');
    
    function loadPicture() {
        var directoryReader = appPictureDirectory.createReader();
        directoryReader.readEntries(function(entries) {
            var i;
            for (i=0; i < entries.length; i++) {
                if (entries[i].isFile && entries[i].name == viewModel.pictureName) {
                    viewModel.picture = imgTemplate(entries[i]);
                    break;
                }
            }
        }, fail);
    }
    
    var viewModel = kendo.observable({
        pictureName: "",
        picture: ""
    });
    
    function init(e){
        viewModel.pictureName = e.view.params.picname;
        loadPicture();
        kendo.bind(e.view.element, viewModel);
        
        
    }
    
    function fail(error) {
        navigator.notification.alert(error.code, null, 'Damn!');
    }
    
    a.post = {
        init: init
    }
}(app));