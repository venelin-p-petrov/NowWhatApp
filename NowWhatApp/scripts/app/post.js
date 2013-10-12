var app = app || {};
var appPictureDirectory = appPictureDirectory || {};

(function(a) {
    var imgTemplate = kendo.template('<img src="#: fullPath #" class="picture-single" />');
    
    function loadPicture() {
        var directoryReader = appPictureDirectory.createReader();
        directoryReader.readEntries(function(entries) {
            var i;
            for (i=0; i < entries.length; i++) {
                if (entries[i].isFile && entries[i].name == viewModel.pictureName) {
                    viewModel.set("picture", imgTemplate(entries[i]));
                    //viewModel.set("pictureUrl", entries[i].fullPath);
                    //viewModel.set("pictureFile", entries[i]);
                    break;
                }
            }
        }, loadPictureFail);
    }
    
    function getPlaces(buttonPress) {
        if (buttonPress != 2) {
            navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationFail, {timeout: 30000});
        }
    }
    
    function changePlace(e) {
        var ind = viewModel.message.lastIndexOf(" at ");
        if (ind > 0) {
            viewModel.set("message", viewModel.message.substr(0, ind) + " at " + e.sender.text());
        }
        else {
            viewModel.set("message", viewModel.message + " at " + e.sender.text());
        }
    }
    
    //function createBlob(picUrl) {
    //    var xhr = new XMLHttpRequest();
    //    xhr.open('GET', 'blob:' + picUrl, true);
    //    xhr.responseType = 'blob';
    //    xhr.onload = function(e) {
    //        if (this.status == 200) {
    //            var myBlob = this.response;
    //            navigator.notification.alert(myBlob, null, 'OK!');
    //            return myBlob;
    //        }
    //        else{
    //            navigator.notification.alert("Failed!", null, 'Damn!');
    //            return null;
    //        }
    //    };
    //    navigator.notification.alert(xhr, null, 'OK!');
    //    xhr.send();
    //}
    
    //function uploadImage() {
    //    //var imageBlob = createBlob(viewModel.pictureUrl);
    //    var imageBlob = viewModel.pictureFile;
    //    var formData = new FormData();
    //    formData.append("file",imageBlob);

    //    $.ajax({
    //        url: 'http://newssystem.apphb.com/api/images/upload',
    //        type: 'POST',
    //        // Form data
    //        data: formData,
    //        //Options to tell JQuery not to process data or worry about content-type
    //        cache: false,
    //        contentType: false,
    //        processData: false,
    //        success: function (data) {
    //            navigator.notification.alert(data, null, 'OK!');
    //        },
    //        error: function(error){
    //            navigator.notification.alert(error, null, 'Damn!');
    //        }
    //    });
    //}
    
    function hasConnection() {
        return navigator.connection.type != Connection.NONE;
    }
    
    function sharePost(buttonPress) {
        if (buttonPress != 2) {
            if (!hasConnection()) {
                navigator.notification.confirm("You need to be connected to the Internet.", sharePost, "Info", ['Try again','Cancel']);
            }
            else {
                var message = viewModel.message;
                //var picture = viewModel.pictureUrl;
        
                //$.oajax({
                //    type: "POST",
                //    url: "https://graph.facebook.com/me/photos",
                //    jso_provider: "facebook",
                //    jso_scopes: ["read_stream", "publish_stream"],
                //    jso_allowia: true,
                //    dataType: 'json',
                //    data: {
                //        name: message,
                //        url: picture
                //    },
                //    success: function(data) {
                //        navigator.notification.alert(data, null, 'OK!');
                //    },
                //    error: function(error) {
                //        navigator.notification.alert(error, null, 'Damn!');
                //    }
                //});
        
                $.oajax({
                    type: "POST",
                    url: "https://graph.facebook.com/me/feed",
                    //url: "https://graph.facebook.com/me/photos",
                    jso_provider: "facebook",
                    jso_scopes: ["read_stream", "publish_stream"],
                    jso_allowia: true,
                    dataType: 'json',
                    data: {
                        message: message,
                        //name: message,
                        //url: picture
                    },
                    success: function(data) {
                        navigator.notification.vibrate(500);
                    },
                    error: function(e) {
                        navigator.notification.alert("Failed to post to Facebook. Please try again.", null, 'Sorry!');
                    }
                });
            }
        }
    }
    
    function onResume(){
        navigator.notification.confirm("Do you want to get nearby places", getPlaces, "Info", ['Yes','No']);
    }
    
    var viewModel = kendo.observable({
        pictureName: "",
        picture: {},
        //pictureUrl: "",
        //pictureFile: {},
        places: [],
        getPlaces: getPlaces,
        message: "Now What?!?",
        changePlace: changePlace,
        sharePost: sharePost
    });
    
    function init(e) {
        viewModel.set("pictureName", e.view.params.picname);
        loadPicture();
        getPlaces();
        document.addEventListener("resume", onResume, false);
        kendo.bind(e.view.element, viewModel);
    }
    
    function geolocationSuccess(position) {
        var baseUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
        
        var locationParam = "location=" + position.coords.latitude + "," + position.coords.longitude;
        var typesParam = "types=accounting|airport|amusement_park|aquarium|art_gallery|bakery|bank|bar|beauty_salon|bicycle_store|book_store|bowling_alley|bus_station|cafe|campground|car_dealer|car_rental|car_repair|car_wash|casino|cemetery|church|city_hall|clothing_store|convenience_store|courthouse|dentist|department_store|doctor|electrician|electronics_store|embassy|establishment|finance|fire_station|florist|food|funeral_home|furniture_store|gas_station|general_contractor|grocery_or_supermarket|gym|hair_care|hardware_store|health|hindu_temple|home_goods_store|hospital|insurance_agency|jewelry_store|laundry|lawyer|library|liquor_store|local_government_office|locksmith|lodging|meal_delivery|meal_takeaway|mosque|movie_rental|movie_theater|moving_company|museum|night_club|painter|park|parking|pet_store|pharmacy|physiotherapist|place_of_worship|plumber|police|post_office|real_estate_agency|restaurant|roofing_contractor|rv_park|school|shoe_store|shopping_mall|spa|stadium|storage|store|subway_station|synagogue|taxi_stand|train_station|travel_agency|university|veterinary_care|zoo";
        var sensorParam = "sensor=false";
        var rankByParam = "rankby=distance";
        var apiKeyParam = "key=AIzaSyCD0kWajaBZ6kyOaDxb14Gn4lFAstK85Yo";
        
        var url = baseUrl + locationParam + "&" + typesParam + "&" + sensorParam + "&" + rankByParam + "&" + apiKeyParam;
        
        if (!hasConnection()) {
            navigator.notification.confirm("You need to be connected to the Internet.", sharePost, "Info", ['Try again','Cancel']);
        }
        else {
            httpRequest.getJSON(url)
            .then(function (placesJson) {
                viewModel.set("places", placesJson.results);
            }, locationFail);
        }
    }
    
    function locationFail() {
        navigator.notification.alert("Failed to get nearby places", null, 'Sorry!');
    }
    
    function geolocationFail(e) {
        if (e.code == PositionError.POSITION_UNAVAILABLE) {
            navigator.notification.confirm("You need to enable GPS and/or Networking", getPlaces, "Info", ['Try again','Cancel']);
        }
        else {
            navigator.notification.alert("An error occured while getting your location.", null, 'Sorry!');
        }
    }
    
    function loadPictureFail() {
        navigator.notification.alert("An error occured while loading the pictures.", null, 'Sorry!');
    }
    
    a.post = {
        init: init
    }
}(app));