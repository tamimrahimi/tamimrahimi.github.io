var FaceSearchResultModel = function (entity, parent) {
    var self = this;
    self.parent = parent;
    self.isInitialized = false;
    self.originalEntity = entity;

    //
    // Observables
    //
    self.number = ko.observable();
    self.description = ko.observable();
    self.latLng = ko.observable();
    self.lat = ko.observable();
    self.lng = ko.observable();
    self.id = ko.observable();


    //
    // Computed
    //

    //
    // Methods
    //
    self.zoom = function () {
        self.parent.map().panTo(self.latLng());
        self.parent.map().setZoom(16);
    };

    //
    // Subscriptions
    //

    //
    // Initialization
    //
    self.init = function () {
        if (!self.isInitialized) {
            if (self.originalEntity != null) {
                self.id(self.originalEntity.id);
                self.number(self.originalEntity.number);
                self.description(self.originalEntity.description);
                self.lat(self.originalEntity.lat);
                self.lng(self.originalEntity.lng);
                self.latLng(new google.maps.LatLng(self.originalEntity.lat, self.originalEntity.lng));
            }
            self.isInitialized = true;
        }
    };

    self.init();
};