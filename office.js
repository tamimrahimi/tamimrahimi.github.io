var OfficeFaceCountByMediaTypeViewModel = function (originalEntity, parent) {
    var self = this;
    self.parent = parent;
    self.isInitialized = false;
    self.originalEntity = originalEntity;

    self.mediaType = ko.observable();
    self.count = ko.observable();
    self.latLngBounds = ko.observable();

    self.countFormatted = ko.computed(function () {
        return $.format(self.count(), 'n0');
    });

    self.filterAndZoom = function () {
        _viewModel.map().fitBounds(self.latLngBounds());
        self.mediaType().checkThisOnly();
    };

    self.init = function () {
        if (self.originalEntity != null) {
            self.mediaType(_.find(_viewModel.mediaTypes(), function (x) { return x.id() == self.originalEntity.mt; }));
            self.count(self.originalEntity.count);
            self.latLngBounds(new google.maps.LatLngBounds(
                new google.maps.LatLng(self.originalEntity.swLat, self.originalEntity.swLng),
                new google.maps.LatLng(self.originalEntity.neLat, self.originalEntity.neLng)));
        }
        self.isInitialized = true;
    }

    self.init();
};



var OfficeViewModel = function (office, parent) {
    var self = this;
    self.parent = parent;
    self.entityType = 'office';
    self.originalEntity = office;
    self.isInitialized = false;

    //
    // Observables.
    //
    self.id = ko.observable();
    self.code = ko.observable();
    self.name = ko.observable();
    self.lat = ko.observable();
    self.lng = ko.observable();
    self.facesByMediaType = ko.observableArray();
    self.address = ko.observable();
    self.locality = ko.observable();
    self.county = ko.observable();
    self.state = ko.observable();
    self.postalCode = ko.observable();

    //
    // Computed.
    //
    self.streetViewThumbnailUrl = ko.computed(function () {
        if (self.lat() == null)
            return null;

        return _rootUrl + 'StreetViewThumbnailHandler.ashx?lat=' + self.lat() + '&lng=' + self.lng();
    });

    self.latLng = ko.computed(function () {
        return new google.maps.LatLng(self.lat(), self.lng());
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

    self.latLngBounds = ko.computed(function () {
        if(self.facesByMediaType().length == 0)
            return null;

        var swLat = _.min(self.facesByMediaType(), function(x){ return x.latLngBounds().getSouthWest().lat(); }).latLngBounds().getSouthWest().lat();
        var swLng = _.min(self.facesByMediaType(), function(x){ return x.latLngBounds().getSouthWest().lng(); }).latLngBounds().getSouthWest().lng();
        var neLat = _.max(self.facesByMediaType(), function(x){ return x.latLngBounds().getNorthEast().lat(); }).latLngBounds().getNorthEast().lat();
        var neLng = _.max(self.facesByMediaType(), function(x){ return x.latLngBounds().getNorthEast().lng(); }).latLngBounds().getNorthEast().lng();

        return new google.maps.LatLngBounds(
            new google.maps.LatLng(swLat, swLng),
            new google.maps.LatLng(neLat, neLng));
    });

    //
    // Methods
    //
    self.markAsActive = function () {
        self.parent.setActiveEntity(self);
    };

    self.showStreetView = function () {
        self.parent.showStreetView(self.latLng());
    };

    self.getStreetViewThumbnailUrl = function (w, h, c) {
        return self.streetViewThumbnailUrl() + '&w=' + w + '&h=' + h + '&c=' + c;
    };

    self.zoomIn = function () {
        self.parent.setMapCenter(self.latLng());
        self.parent.map().setZoom(15);
    };

    self.zoomToBounds = function(){
        _viewModel.map().fitBounds(self.latLngBounds());
    };

    //
    // Initialization.
    //
    self.init = function () {
        if (self.originalEntity != null) {
            self.id(self.originalEntity.id);
            self.code(self.originalEntity.code);
            self.name(self.originalEntity.name);
            self.lat(self.originalEntity.lat);
            self.lng(self.originalEntity.lng);
            $.each(self.originalEntity.facesByMediaType, function (i, x) {

                if (_.find(_viewModel.mediaTypes(), function (y) { return y.id() == x.mt; }) != null)
                    self.facesByMediaType.push(new OfficeFaceCountByMediaTypeViewModel(x, self));
            });

            self.facesByMediaType.sort(function (left, right) { return left.mediaType().name() == right.mediaType().name() ? 0 : (left.mediaType().name() < right.mediaType().name() ? -1 : 1) });

            if(self.parent.geocoder() != null) {
                self.parent.geocoder().geocode({ 'latLng': self.latLng() }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var location = results[1];
                        if (location) {
                            self.address(location.formatted_address);
                            var locality = _.find(location.address_components, function (x) {
                                return _.find(x.types, function (y) {
                                    return y == 'locality';
                                })
                            });
                            if (locality != null)
                                self.locality(locality.short_name);
                            var county = _.find(location.address_components, function (x) {
                                return _.find(x.types, function (y) {
                                    return y == 'administrative_area_level_2';
                                })
                            });
                            if (county != null)
                                self.county(county.short_name);
                            var state = _.find(location.address_components, function (x) {
                                return _.find(x.types, function (y) {
                                    return y == 'administrative_area_level_1';
                                })
                            });
                            if (state != null)
                                self.state(state.short_name);
                            var postalCode = _.find(location.address_components, function (x) {
                                return _.find(x.types, function (y) {
                                    return y == 'postal_code';
                                })
                            });
                            if (postalCode != null)
                                self.postalCode(postalCode.short_name);

                        } else {
                            // console.log('No results found');
                        }
                    } else {
                        //console.log('Geocoder failed due to: ' + status);
                    }

                });
            }
        }
        self.isInitialized = true;
    };

    self.init();
};


