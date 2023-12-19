var RadiusViewModel = function (entity, parent){
    var self = this;
    self.parent = parent;
    self.originalEntity = entity;
    self.initialized = false;
    self.radius = null;

    //
    // Observable.
    //
    self.radius = ko.observable(1);
    self.unit = ko.observable('mi');
    self.isEnabled = ko.observable(false);

    //
    // Computed
    //
    self.distanceInMeters = ko.computed(function () {
        return self.unit() == 'mi'
            ? self.radius() * 1609.34
            : self.unit() == 'yd'
                ? self.radius() * 0.9144
                : self.unit() == 'km'
                    ? self.radius() * 1000.0
                    : self.radius() * 1.0;

    });

    //
    // Subscriptions.
    //
    self.radius.subscribe(function (newValue) {
        if (self.parent.triggerUpdateRadiusCircles != null)
            self.parent.triggerUpdateRadiusCircles();
        else if (self.parent.parent != null)
            self.parent.parent.triggerUpdateRadiusCircles();

        if (self.slider != null) {
            $(".radius_slider").bootstrapSlider('setValue', parseFloat(newValue));
        }
    });

    self.unit.subscribe(function (newValue) {
        if (self.parent.triggerUpdateRadiusCircles != null)
            self.parent.triggerUpdateRadiusCircles();
        else if (self.parent.parent != null)
            self.parent.parent.triggerUpdateRadiusCircles();
    });

    self.isEnabled.subscribe(function (newValue) {
        if (self.parent.triggerUpdateRadiusCircles != null)
            self.parent.triggerUpdateRadiusCircles();
        else if (self.parent.parent != null)
            self.parent.parent.triggerUpdateRadiusCircles();
    });

    //
    // Initialization.
    //
    self.init = function () {
        if (self.originalEntity != null) {
            self.radius(self.originalEntity.radius);
            self.unit(self.originalEntity.unit);
            self.isEnabled(self.originalEntity.isEnabled);
        }
        self.isInitialized = true;
    };

    self.init();
}