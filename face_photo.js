var FacePhotoViewModel = function (photo, parent) {
    var self = this;
    self.parent = parent;
    self.entityType = 'face_photo';
    self.originalEntity = photo;
    self.isInitialized = false;

    //
    // Observables.
    //
    self.id = ko.observable();
    self.bottomLeftX = ko.observable();
    self.bottomLeftY = ko.observable();
    self.bottomRightX = ko.observable();
    self.bottomRightY = ko.observable();
    self.topLeftX = ko.observable();
    self.topLeftY = ko.observable();
    self.topRightX = ko.observable();
    self.topRightY = ko.observable();
    self.fileId = ko.observable();
    self.isPhotosheetPhoto = ko.observable();
    self.cornerPinsUpdatedOn = ko.observable();

    //
    // Computed.
    //
    self.storageUrl = ko.computed(function () {
        return storageUrl + '/' + self.fileId();
    });

    self.url = ko.computed(function () {
        var date = self.cornerPinsUpdatedOn(); // Only there to trigger change.

        if (self.isPhotosheetPhoto())
            return _rootUrl + 'FacePhotoHandler.ashx?w=1600&h=1600&facefileid=' + self.id() + '&ts=' + date;
        return self.storageUrl();
    });

    self.isCornerPinned = ko.computed(function () {
        return self.bottomRightX() != null && self.bottomRightX() != 0;
    });

    //
    // Methods
    //
    self.markAsActive = function () {
        self.parent.activePhoto(self);
    };

    //
    // Initialization.
    //
    self.init = function () {
        if (self.originalEntity != null) {
            self.id(self.originalEntity.id);
            self.bottomLeftX(self.originalEntity.bottomLeftX);
            self.bottomLeftY(self.originalEntity.bottomLeftY);
            self.bottomRightX(self.originalEntity.bottomRightX);
            self.bottomRightY(self.originalEntity.bottomRightY);
            self.topLeftX(self.originalEntity.topLeftX);
            self.topLeftY(self.originalEntity.topLeftY);
            self.topRightX(self.originalEntity.topRightX);
            self.topRightY(self.originalEntity.topRightY);
            self.fileId(self.originalEntity.fileId);
            self.isPhotosheetPhoto(self.originalEntity.isPhotosheetPhoto);

        }
        self.isInitialized = true;
    };

    self.init();
};