var FaceViewModel = function (face, parent) {
    var self = this;
    self.parent = parent;
    self.entityType = 'face';
    self.originalEntity = face;
    self.isInitialized = false;

    //
    // Observables.
    //
    self.id = ko.observable();
    self.lat = ko.observable();
    self.lng = ko.observable();
    self.name = ko.observable();
    self.desc = ko.observable();
    self.primaryArtery = ko.observable();
    self.crossArtery = ko.observable();
    self.streetSide = ko.observable();
    self.illuminationHours = ko.observable();
    self.directionFacing = ko.observable();
    self.size = ko.observable();
    self.distanceDir = ko.observable();
    self.plantName = ko.observable();
    self.marker = ko.observable();
    self.mediaType = ko.observable();
    self.isSelected = ko.observable(false);
    self.company = ko.observable();
    
    //
    // Computed.
    //
    self.latLng = ko.computed(function () {
        return new google.maps.LatLng(self.lat(), self.lng());
    });

    self.description = ko.computed(function () {
        if (self.crossArtery() != null)
            return self.primaryArtery() + ' @ ' + self.crossArtery();
        return self.primaryArtery();
    });

    self.isIlluminated = ko.computed(function () {
        return self.illuminationHours() != null && self.illuminationHours() > 0;
    });

    self.illuminationDescription = ko.computed(function () {
        return self.illuminationHours() + 'h';
    });

    self.directionFacingDescription = ko.computed(function () {
        return self.directionFacing() == 'n'
            ? 'North'
            : self.directionFacing() == 's'
                ? 'South'
                : self.directionFacing() == 'e'
                    ? 'East'
                    : self.directionFacing() == 'w'
                        ? 'West'
                        : self.directionFacing() == 'nw'
                            ? 'North west'
                            : self.directionFacing() == 'ne'
                                ? 'North east'
                                : self.directionFacing() == 'sw'
                                    ? 'South west'
                                    : self.directionFacing() == 'se'
                                        ? 'South east'
                                        : self.directionFacing();
    });

    self.directionFacingAngle = ko.computed(function () {
        return self.directionFacing() == 'n'
            ? 0
            : self.directionFacing() == 's'
                ? 180
                : self.directionFacing() == 'e'
                    ? 90
                    : self.directionFacing() == 'w'
                        ? -90
                        : self.directionFacing() == 'nw'
                            ? 315
                            : self.directionFacing() == 'ne'
                                ? 45
                                : self.directionFacing() == 'sw'
                                    ? 225
                                    : self.directionFacing() == 'se'
                                        ? 135
                                        : 0;
    });

    self.additionalDetails = ko.computed(function () {
        var details = '';

        if (self.isIlluminated) {
            if (details != '')
                details += ', ';
            details += 'Illuminated for ' + self.illuminationDescription();
        }
        if (self.directionFacing() != null) {
            if (details != '')
                details += ', ';
            details += 'Facing ' + self.directionFacingDescription();
        }
        return details;
    });

    self.streetViewThumbnailUrl = ko.computed(function () {
        return _rootUrl + 'StreetViewThumbnailHandler.ashx?lat=' + self.lat() + '&lng=' + self.lng() + '&w=312&h=100';
    });

    //
    // Methods
    //
    self.markAsActive = function () {
        self.parent.setActiveEntity(self);
    };

    self.toggleSelection = function () {
        self.isSelected(!self.isSelected());
    };


    //
    // Initialization.
    //
    self.init = function () {
        if (self.originalEntity != null) {
            self.id(self.originalEntity.id);
            self.lat(self.originalEntity.lat);
            self.lng(self.originalEntity.lng);
            self.mediaType(_.find(self.parent.mediaTypes(), function (x) { return x.id() == self.originalEntity.mt; }));
            self.directionFacing(self.originalEntity.df);
            self.company(_.find(self.parent.companies(), function(x){ return x.id() == self.originalEntity.cp; }));
        }
        self.isInitialized = true;
    };

    self.init();
};