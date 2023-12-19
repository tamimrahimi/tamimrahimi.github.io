var CartPageViewModel = function (entity, parent) {
    var self = this;
    self.parent = parent;
    self.isInitialized = false;
    self.originalEntity = entity;

    //
    // Observables
    //
    self.index = ko.observable();

    //
    // Computed
    //
    self.markAsActive = function () {
        self.parent.activeCartPage(self);
    };

    //
    // Methods
    //

    //
    // Subscriptions
    //

    //
    // Initialization
    //
    self.init = function () {
        if (!self.isInitialized) {
            if (self.originalEntity != null) {
                self.index(entity.index);
            }
            self.isInitialized = true;
        }
    };

    self.init();
};