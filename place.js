var PlaceViewModel = function (place, marker, parent) {
    var self = this;
    self.parent = parent;
    self.entityType = 'place';
    self.originalEntity = place;
    self.isInitialized = false;

    //
    // Observables.
    //
    self.address = ko.observable();
    self.icon = ko.observable();
    self.id = ko.observable();
    self.name = ko.observable();
    self.photos = ko.observableArray();
    self.placeId = ko.observable();
    self.latLng = ko.observable();
    self.types = ko.observableArray();
    self.marker = ko.observable(marker);
    self.iconHtml = ko.observable();
    self.radius = ko.observable();

    //
    // Computed.
    //
    self.streetViewThumbnailUrl = ko.computed(function () {
        if (self.latLng() == null)
            return null;

        return _rootUrl + 'StreetViewThumbnailHandler.ashx?lat=' + self.latLng().lat() + '&lng=' + self.latLng().lng();
    });

    self.typesFormatted = ko.computed(function () {
        if (self.types() == null || self.types().length == 0)
            return null;

        var formatted = '';
        $.each(self.types(), function (i, x) {
            if (formatted != '')
                formatted += ', ';
            var s = x.replace(/_/g, ' ');
            s = s.replace(/(\w)(\w*)/g, function (g0, g1, g2) { return g1.toUpperCase() + g2.toLowerCase(); });
            formatted += s;
        });
        return formatted;
    });

    self.isInMyPlaces = ko.computed(function () {
        return _.find(self.parent.myPlaces(), function (x) { return x.id() == self.id(); }) != null;
    });

    self.isRadiusEnabled = ko.computed(function () {
        if (self.radius() == null)
            return false;
        return self.radius().isEnabled();
    });

    self.isActive = ko.computed(function () {
        return self.parent.activeEntity() != null && self.parent.activeEntity().id() == self.id();
    });

    //
    // Methods
    //
    self.showStreetView = function () {
        self.parent.showStreetView(self.latLng());
    };

    self.getStreetViewThumbnailUrl = function (w, h, c) {
        return self.streetViewThumbnailUrl() + '&w=' + w + '&h=' + h + '&c=' + c;
    };

    self.markAsActive = function () {
        self.parent.setActiveEntity(self);
        self.parent.map().panTo(self.latLng());
        self.marker().showActiveMarker();
    };

    self.zoomIn = function () {
        self.parent.setMapCenter(self.latLng());
        self.parent.map().setZoom(15);
    };

    self.addToMyPlaces = function () {
        self.parent.addToMyPlaces(self);
    };

    self.removeFromMyPlaces = function () {
        self.parent.removeFromMyPlaces(self);
    };

    self.enableRadius = function () {
        self.radius().isEnabled(true);

        self.radius().slider = $(".specific_place_radius_slider").bootstrapSlider({ tooltip: 'hide' });
        self.radius().slider.on('slide', function (ev) {
            var newRadius = parseFloat(self.radius().slider.bootstrapSlider('getValue'));
            if (self.radius().radius() != newRadius)
                self.radius().radius(newRadius);
        });
        self.radius().slider.on('slideStop', function (ev) {
            var newRadius = parseFloat(self.radius().slider.bootstrapSlider('getValue'));
            if (self.radius().radius() != newRadius)
                self.radius().radius(newRadius);
        });

        self.parent.updateMainBoxTopMargin();
    };

    self.disableRadius = function () {
        self.radius().isEnabled(false);
        self.parent.updateMainBoxTopMargin();
    };

    //
    // Subscriptions
    //
    self.isInMyPlaces.subscribe(function(newValue){
        if(self.iconHtml() == null)
            return;
        var elm = $(self.iconHtml());
        if(newValue)
            elm.addClass('selected');
        else
            elm.removeClass('selected');
        self.iconHtml(elm[0].outerHTML);

        self.marker().selected = newValue;
        self.marker().setMap(null);
        self.marker().setMap(self.parent.map());
    });

    //
    // Initialization
    //
    self.init = function () {
        if (self.originalEntity != null) {
            self.address(self.originalEntity.formatted_address);
            self.icon(self.originalEntity.icon);
            self.id(self.originalEntity.id);
            self.name(self.originalEntity.name);
            self.iconHtml(self.originalEntity.iconHtml);
            self.placeId(self.originalEntity.place_id);
            self.latLng(new google.maps.LatLng( self.originalEntity.lat, self.originalEntity.lng));

            if (self.originalEntity.types != null){
                $.each(self.originalEntity.types, function (i, t) {
                    self.types.push(t);
                });
            }

            self.radius(new RadiusViewModel({ radius: 1, unit: 'mi', isEnabled: false }, self));
            self.parent.radiuses.push(self.radius());
        }
        self.isInitialized = true;
    };

    self.init();
};

//var PlacePhotoViewModel = function (photo, parent) {
//    var self = this;
//    self.parent = parent;
//    self.originalEntity = photo;
//    self.isInitialized = false;

//    //
//    // Observables.
//    //
//    self.url = ko.observable();
//    self.height = ko.observable();
//    self.width = ko.observable();

//    //
//    // Initialization.
//    //
//    self.init = function () {
//        if (self.originalEntity != null) {
//            self.url(self.originalEntity.getUrl());
//            self.width(self.originalEntity.width);
//            self.height(self.originalEntity.height);
//        }
//        self.isInitialized = true;
//    };

//    self.init();

//};
