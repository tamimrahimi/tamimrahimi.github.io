var FaceDetailsViewModel = function (faceDetails, parent) {
    var self = this;
    self.parent = parent;
    self.entityType = 'face_details';
    self.originalEntity = faceDetails;
    self.isInitialized = false;
    self.hasBeenGeocoded = false;
    self.arePhotosLoaded = false;

    //
    // Observables.
    //
    self.id = ko.observable();
    self.lat = ko.observable();
    self.lng = ko.observable();
    self.number = ko.observable();
    self.description = ko.observable();
    self.directionFacing = ko.observable();
    self.illumination = ko.observable();
    self.audience = ko.observable();
    self.media = ko.observable();
    self.area = ko.observable();
    self.size = ko.observable();
    self.market = ko.observable();
    self.rate = ko.observable();
    self.address = ko.observable();
    self.locality = ko.observable();
    self.county = ko.observable();
    self.state = ko.observable();
    self.postalCode = ko.observable();
    self.hasPhoto = ko.observable();
    self.photos = ko.observableArray();
    self.activePhoto = ko.observable();
    self.isSelected = ko.observable(false);
    self.isActiveFaceForComparison = ko.observable(false);
    self.company = ko.observable();

    //
    // Computed.
    //
    self.numberAndDescription = ko.computed(function () {
        return self.number() + ' - ' + self.description();
    });

    self.latLng = ko.computed(function () {
        return new google.maps.LatLng(self.lat(), self.lng());
    });

    self.staticMapUrl = ko.computed(function () {
        var scale = window.devicePixelRatio > 1 ? 2 : 1;
        return 'https://maps.googleapis.com/maps/api/staticmap?size=262x262&scale=' + scale + '&zoom=15&center=' + self.lat() + ',' + self.lng() + '&key=' + _googleStaticMaps_APIKey;
    });

    self.streetViewThumbnailUrl = ko.computed(function () {
        return _rootUrl + 'StreetViewThumbnailHandler.ashx?lat=' + self.lat() + '&lng=' + self.lng() + '&w=312&h=100';
    })

    self.facePhotoUrl = ko.computed(function () {
        return _rootUrl + 'FacePhotoHandler.ashx?id=' + self.id();
    })

    self.audienceFormatted = ko.computed(function () {
        return self.audience() == 0 || self.audience() == null
            ? 'N/A'
            : $.format(self.audience() * 1000, 'n0');
    });

    self.rateFormatted = ko.computed(function () {
        return self.rate() == 0 || self.rate() == null
            ? 'N/A'
            : $.format(self.rate(), 'c0');
    });

    self.isInCart = ko.computed(function () {
        return _.find(self.parent.cart(), function (x) { return x.id() == self.id(); }) != null;
    });

    self.stateAndPostalCode = ko.computed(function () {
        if (self.postalCode() == null && self.state() == null)
            return;

        if (self.postalCode() != null)
            return self.state() + ' ' + self.postalCode();
        else
            return self.state();
    });

    self.countyStateAndPostalCode = ko.computed(function () {
        var components = [];

        if (self.county() != null)
            components.push(self.county());
        if (self.stateAndPostalCode() != null)
            components.push(self.stateAndPostalCode());

        return components.join(', ');
    });

    self.getFacePhotoUrl = function (w, h, c) {
        var url = self.facePhotoUrl() + '&w=' + w + '&h=' + h + '&c=' + c;
        return url;
    };

    self.activePhotoUrl = ko.computed(function () {
        var urlSuffix = '';
        if (self.parent.activeCreative() != null)
            urlSuffix = '&cr=Creatives/' + self.parent.activeCreative();

        if (self.activePhoto() == null)
            return self.getFacePhotoUrl(1600, 1600, false) + urlSuffix;
        return self.activePhoto().isPhotosheetPhoto()
            ? self.activePhoto().url() + urlSuffix
            : self.activePhoto().url();
    });

    self.iconHtml = ko.computed(function () {
        if (self.media() == null)
            return null;
        return _.find(self.parent.mediaTypes(), function (x) { return x.name() == self.media(); }).iconHtml();
    });


    self.areaAndMarket = ko.computed(function () {
        if(self.market() != self.area() && self.market() != null)
            return self.market() + ', ' + self.area();
        return self.area();
    });

    self.comparisonAudienceDifference = ko.computed(function () {
        var activeFaceForComparison = _.find(parent.selectedCartFaces(), function(x){ return x.isActiveFaceForComparison(); });
        if(activeFaceForComparison != null && activeFaceForComparison != self)
            return self.audience() * 1000 - activeFaceForComparison.audience() * 1000;
        else
            return 0;
    });

    self.comparisonAudienceDifferenceFormatted = ko.computed(function () {
        return $.format(self.comparisonAudienceDifference(), 'n0');
    });


    self.comparisonRateDifference = ko.computed(function () {
        var activeFaceForComparison = _.find(parent.selectedCartFaces(), function(x){ return x.isActiveFaceForComparison(); });
        if(activeFaceForComparison != null && activeFaceForComparison != self)
            return self.rate() - activeFaceForComparison.rate();
        else
            return 0;
    });

    self.comparisonRateDifferenceFormatted = ko.computed(function () {
        return $.format(self.comparisonRateDifference(), 'c0');
    });

    self.isActive = ko.computed(function () {
        return self.parent.activeFaceDetails() != null && self.parent.activeFaceDetails().id() == self.id();
    });


    //
    // Methods
    //
    self.markAsActiveFaceForComparison = function () {
        self.isActiveFaceForComparison(true);
    };

    self.clearAsActiveFaceForComparison = function () {
        $.each(parent.selectedCartFaces(), function(i, x){ x.isActiveFaceForComparison(false); });
    };


    self.showStreetView = function () {
        self.parent.showStreetView(self.latLng());
    };

    self.zoomIn = function () {
        self.parent.map().panTo(self.latLng());
        self.parent.map().setZoom(20);
        self.parent.showActiveMarkerForFace(self.id());
    };

    self.addToCart = function () {
        self.parent.addToCart(self);
        _viewModel.triggerLoadFacesInViewport();
    };

    self.removeFromCart = function () {
        self.parent.removeFromCart(self);
        _viewModel.triggerLoadFacesInViewport();
    };

    self.markAsActive = function () {
        self.parent.showFaceDetailsInfoboxAfterFaceLoad(true);
        self.parent.activeFaceDetails(self);
    };

    self.markAsActiveAndZoom = function () {
        self.markAsActive();
        if(_viewModel.map().getZoom() < 16)
            self.zoomIn();
        else
            self.parent.map().panTo(self.latLng());

    };

    self.toggleSelection = function (model, e) {
        self.isSelected(!self.isSelected());
    };

    self.showFullScreenFaceDetails = function () {
        self.parent.showFullScreenFaceDetails();
    };

    self.cornerPinActivePhoto = function () {
        self.parent.cornerPinningPhoto(self.activePhoto());
        self.parent.startCornerPinning();
    };

    self.performGeocoding = function(){

        if(self.hasBeenGeocoded == true)
            return;

        var ms = self.parent.getGeocoderWaitTimeInMilliseconds(self.id());
        console.log(ms + 'ms');
        setTimeout(function(){
            console.log('geocoding ' + self.latLng().lat() + ', ' + self.latLng().lng());
            self.parent.geocoder().geocode({ 'latLng': self.latLng() }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    self.hasBeenGeocoded = true;

                    var location = results[1];
                    if (location) {
                        self.address(location.formatted_address);
                        var locality = _.find(location.address_components, function (x) { return _.find(x.types, function (y) { return y == 'locality'; }) });
                        if (locality != null)
                            self.locality(locality.short_name);
                        var county = _.find(location.address_components, function (x) { return _.find(x.types, function (y) { return y == 'administrative_area_level_2'; }) });
                        if (county != null)
                            self.county(county.short_name);
                        var state = _.find(location.address_components, function (x) { return _.find(x.types, function (y) { return y == 'administrative_area_level_1'; }) });
                        if (state != null)
                            self.state(state.short_name);
                        var postalCode = _.find(location.address_components, function (x) { return _.find(x.types, function (y) { return y == 'postal_code'; }) });
                        if (postalCode != null)
                            self.postalCode(postalCode.short_name);

                    } else {
                        //alert('No results found');
                    }
                } else {
                    console.log('Geocoder failed due to: ' + status);
                }
            });
        }, ms);

    };

    //
    // Initialization.
    //
    self.init = function () {
        if (self.originalEntity != null) {
            self.id(self.originalEntity.id);
            self.lat(self.originalEntity.lat);
            self.lng(self.originalEntity.lng);
            self.number(self.originalEntity.number);
            self.description(self.originalEntity.description);
            self.directionFacing(self.originalEntity.directionFacing);
            self.illumination(self.originalEntity.illumination);
            self.audience(self.originalEntity.audience);
            self.media(self.originalEntity.media);
            self.area(self.originalEntity.area);
            self.size(self.originalEntity.size);
            self.market(self.originalEntity.market);
            self.rate(self.originalEntity.rate);
            self.hasPhoto(self.originalEntity.hasPhoto);
            self.company(_.find(self.parent.companies(), function(x){ return x.id() == self.originalEntity.companyID; }));

            if(self.originalEntity.photos != null) {
                $.each(self.originalEntity.photos, function (i, x) {
                    var newPhoto = new FacePhotoViewModel(x, self);
                    if (self.activePhoto() == null)
                        self.activePhoto(newPhoto);
                    self.photos.push(newPhoto);
                });
                self.arePhotosLoaded = true;
            }

            //self.performGeocoding();

        }
        self.isInitialized = true;
    };

    self.init();
};