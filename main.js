var _viewModel = null;

function pageInit(viewModelPara) {

    var _map = null;
    var _overlay = null;
    var _geocoder = null;
    
    var _googleStaticMaps_APIKey = null;

    _viewModel = viewModelPara;

    ko.applyBindings(_viewModel);

    function initialize() {
        console.log('initialize()');

        //
        // Initialize the map.
        //
        var mapOptions = {
            center: new google.maps.LatLng(39.8282, -88.5795),
            zoom: 6,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_LEFT
            }
        };
        _map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
        _geocoder = new google.maps.Geocoder();
        var country = _viewModel.companyCountry();

        _geocoder.geocode({ 'address': country }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                _map.setCenter(results[0].geometry.location);
            }
        });
        _viewModel.map(_map);
        _viewModel.geocoder(_geocoder);



        initializeSearchPlaces();

        //
        // Clear all active entities when the map is clicked.
        //
        google.maps.event.addListener(_map, 'mousedown', function () {
            _viewModel.activeFace(null);
            _viewModel.activeFaceDetails(null);
            _viewModel.activePlace(null);
            _viewModel.activeOffice(null);
        });

        //
        // Clear all active entities when the map is clicked.
        //
        google.maps.event.addListener(_map, 'zoom_changed', function () {
            console.log('zoom_changed');
            if(_viewModel.faceDetailsInfobox.getVisible())
                _viewModel.faceDetailsInfobox.close();
        });

        //
        // Trigger the initial load of faces when the map is idle.
        //
        google.maps.event.addListenerOnce(_map, 'idle', function () {
            if (!_viewModel.isMapLoaded()) {
                _viewModel.isMapLoaded(true);
                _viewModel.triggerLoadFacesInViewport();
            }
        });

        //
        // Restore my places.
        //
        _viewModel.restoreMyPlaces();

        //
        // Init Stripe if necessary.
        //
        if(ShowBillingFields)
            Stripe.setPublishableKey(StripePublishableKey);

        //
        // Init RFP dialog datepickers.
        //
        $('#rfp_start_date').datepicker({});
        $('#rfp_end_date').datepicker({});

        //
        // Init search radius sliders.
        //
        _viewModel.overallRadius().slider = $(".radius_slider").bootstrapSlider({tooltip: 'hide'});
        _viewModel.overallRadius().slider.on('slide', function (ev) {
            var newRadius = parseFloat(_viewModel.overallRadius().slider.bootstrapSlider('getValue'));
            if (_viewModel.overallRadius().radius() != newRadius)
                _viewModel.overallRadius().radius(newRadius);
        });
        _viewModel.overallRadius().slider.on('slideStop', function (ev) {
            var newRadius = parseFloat(_viewModel.overallRadius().slider.bootstrapSlider('getValue'));
            if (_viewModel.overallRadius().radius() != newRadius)
                _viewModel.overallRadius().radius(newRadius);
        });

        //
        // Init face details map info box.
        //
        _viewModel.faceDetailsInfobox = new InfoBox({
            content: document.getElementById("infobox_facedetails"),
            disableAutoPan: false,
            maxWidth: 340,
            pixelOffset: new google.maps.Size(-170, 0),
            zIndex: null,
            boxStyle: {
                width: "340px"
            },
            closeBoxMargin: "12px 4px 2px 2px",
            closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif",
            infoBoxClearance: new google.maps.Size(1, 1),
            alignBottom: true
        });

        //
        // Init place details map info box.
        //
        _viewModel.placeDetailsInfobox = new InfoBox({
            content: document.getElementById("infobox_placedetails"),
            disableAutoPan: false,
            maxWidth: 340,
            pixelOffset: new google.maps.Size(-170, 0),
            zIndex: null,
            boxStyle: {
                width: "340px"
            },
            closeBoxMargin: "12px 4px 2px 2px",
            closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif",
            infoBoxClearance: new google.maps.Size(1, 1),
            alignBottom: true
        });

        //
        // Init cluster details map info box.
        //
        _viewModel.clusterDetailsInfobox = new InfoBox({
            content: document.getElementById("infobox_clusterdetails"),
            disableAutoPan: false,
            maxWidth: 250,
            pixelOffset: new google.maps.Size(-125, 0),
            zIndex: null,
            boxStyle: {
                width: "250px"
            },
            closeBoxMargin: "12px 4px 2px 2px",
            closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif",
            infoBoxClearance: new google.maps.Size(1, 1),
            alignBottom: true
        });
    }

    function initializeSearchPlaces() {

        // Create the search box and link it to the UI element.
        var input = /** @type {HTMLInputElement} */(
            document.getElementById('pac-input'));
        //_map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        var searchBox = new google.maps.places.SearchBox(
            /** @type {HTMLInputElement} */(input));

        // Listen for the event fired when the user selects an item from the
        // pick list. Retrieve the matching places for that item.
        google.maps.event.addListener(searchBox, 'places_changed', function () {

            console.log('places_changed');

            var places = searchBox.getPlaces();

            $.each(_viewModel.placeSearchResults(), function (i, p) {
                p.marker().setMap(null);
            });

            _viewModel.placeSearchResults.removeAll();

            if (places.length > 0 || _viewModel.searchTermResults().length > 0) {

                var bounds = new google.maps.LatLngBounds();
                for (var i = 0, place; place = places[i]; i++) {

                    place.lat = place.geometry.location.lat();
                    place.lng = place.geometry.location.lng();
                    _viewModel.addPlace(place);
                    
                    bounds.extend(place.geometry.location);
                }

                $.each(_viewModel.searchTermResults(), function(i,x){
                    bounds.extend(x.latLng());
                });

                _map.fitBounds(bounds);
            }
            _viewModel.activeTab('search');
        });

        // Bias the SearchBox results towards places that are within the bounds of the
        // current map's viewport.
        google.maps.event.addListener(_map, 'bounds_changed', function () {
            var bounds = _map.getBounds();
            searchBox.setBounds(bounds);

            _viewModel.triggerLoadFacesInViewport();
            _viewModel.clusterDetailsInfobox.close();
            $('.hover').removeClass('hover');
        });
    }

    google.maps.event.addDomListener(window, 'load', initialize);

    $(document).on('mousedown', '.pac-item-face', function () {

        var faceId = $(this).data('faceid');


        _viewModel.afterLoadCallbacks.push(function () {
            _viewModel.getFaceDetails(faceId, function(data){
                _viewModel.activeFaceDetails(data);
                _viewModel.showFaceDetailsInfoBox();
            });
        });

        _map.panTo(new google.maps.LatLng($(this).data('lat'), $(this).data('lng')));
        _map.setZoom(20);
        //_viewModel.getFaceDetails(faceId, function(){_viewModel.showActiveMarkerForFace(faceId);});

    });


    $(document).on('click', '.office_media', function(){
        _viewModel.filterAndZoomByOfficeAnMedia($(this).data('officeid'), $(this).data('mediatypeid'));
    });
}

function refReplacer() {
    let m = new Map(), v= new Map(), init = null;
    return function(field, value) {
        let p= m.get(this) + (Array.isArray(this) ? `[${field}]` : '.' + field);
        let isComplex= value===Object(value)
        if (isComplex) m.set(value, p);
        let pp = v.get(value)||'';
        let path = p.replace(/undefined\.\.?/,'');
        let val = pp ? `#REF:${pp[0]=='[' ? '$':'$.'}${pp}` : value;
        !init ? (init=value) : (val===init ? val="#REF:$" : 0);
        if(!pp && isComplex) v.set(value, path);
        return val;
    }
}
function removeClosestListItem(elm) {
    $(elm).closest('li').remove();
}