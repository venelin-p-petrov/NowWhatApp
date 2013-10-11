var app = app || {};
var localFileSystem = localFileSystem || {};
var appPictureDirectory = appPictureDirectory || {};
var places = [];
var kendoApp = kendoApp || {};

(function() {
    document.addEventListener("deviceready", function() {
        kendoApp = new kendo.mobile.Application(document.body, {initial: "#home-view"});
        
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
            localFileSystem = fileSystem;
        }, fail);
        
        localFileSystem.root.getDirectory("Now What Images", {create: true, exclusive: false}, function(directory) {
            appPictureDirectory = directory;
        }, fail);
        
        var captureBtn = $("#capture-btn");
        //var locateBtn = $("#location-btn");
        //var shareBtn = $("#share-btn");
        
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
        
        //locateBtn.click(getPlaces);
        //shareBtn.click(function() {
        //    $.oajax({
        //        type: "POST",
        //        url: "https://graph.facebook.com/me/feed",
        //        jso_provider: "facebook",
        //        jso_scopes: ["read_stream", "publish_stream"],
        //        jso_allowia: true,
        //        dataType: 'json',
        //        data: {
        //            message: "WOW with my Icenium mobile application I can post to my Facebook wall!",
        //            link: "http://icenium.com/?utm_source=facebook&utm_medium=post&utm_campaign=sampleapp",
        //            picture: "http://www.icenium.com/iceniumImages/features-main-images/how-it-works.png"
        //        },
        //        success: function(data) {
        //            console.log("Post response (facebook):");
        //            console.log(data);
        //        },
        //        error: function(e) {
        //            console.log(e);
        //        }
        //    });
        //});
        //getPlaces();
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
    }, {"debug": false});
    
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
        var msg = 'An error occurred during capture: ' + error.message;
        navigator.notification.alert(msg, null, 'Uh oh!');
    }
    
    function getPlaces() {
        navigator.geolocation.getCurrentPosition(geolocationSuccess, fail);
    }
    
    function geolocationSuccess(position) {
        //var msg = 'Latitude: ' + position.coords.latitude + '\n' +
        //          'Longitude: ' + position.coords.longitude + '\n' +
        //          'Accuracy: ' + position.coords.accuracy + '\n';
        //navigator.notification.alert(msg, null, 'Coords');
        var baseUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
        
        var locationParam = "location=" + position.coords.latitude + "," + position.coords.longitude;
        var typesParam = "types=accounting|airport|amusement_park|aquarium|art_gallery|bakery|bank|bar|beauty_salon|bicycle_store|book_store|bowling_alley|bus_station|cafe|campground|car_dealer|car_rental|car_repair|car_wash|casino|cemetery|church|city_hall|clothing_store|convenience_store|courthouse|dentist|department_store|doctor|electrician|electronics_store|embassy|establishment|finance|fire_station|florist|food|funeral_home|furniture_store|gas_station|general_contractor|grocery_or_supermarket|gym|hair_care|hardware_store|health|hindu_temple|home_goods_store|hospital|insurance_agency|jewelry_store|laundry|lawyer|library|liquor_store|local_government_office|locksmith|lodging|meal_delivery|meal_takeaway|mosque|movie_rental|movie_theater|moving_company|museum|night_club|painter|park|parking|pet_store|pharmacy|physiotherapist|place_of_worship|plumber|police|post_office|real_estate_agency|restaurant|roofing_contractor|rv_park|school|shoe_store|shopping_mall|spa|stadium|storage|store|subway_station|synagogue|taxi_stand|train_station|travel_agency|university|veterinary_care|zoo";
        var sensorParam = "sensor=false";
        var rankByParam = "rankby=distance";
        var apiKeyParam = "key=AIzaSyCD0kWajaBZ6kyOaDxb14Gn4lFAstK85Yo";
        
        var url = baseUrl + locationParam + "&" + typesParam + "&" + sensorParam + "&" + rankByParam + "&" + apiKeyParam;
        
        httpRequest.getJSON(url)
        .then(function (placesJson) {
            places = placesJson.results;
            $("#places-list").data("kendoDropDownList").setDataSource(places);
        });
    }

    function fail(error) {
        navigator.notification.alert(error.message, null, 'Damn!');
    }
}());