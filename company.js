var CompanyViewModel = function (global, company) {
    var self = this;
    self.entityType = 'company';
    self.originalEntity = company;
    self.isInitialized = false;
    self.global = global;

    //
    // Observables.
    //
    self.id = ko.observable();
    self.name = ko.observable();
    self.logoFileID = ko.observable();
    self.isChecked = ko.observable(true);
    self.count = ko.observable();
    self.areActionsEnabled = ko.observable(false);
    self.isAvailableInCurrentViewport = ko.observable(true);

    //
    // Computed
    //
    self.countFormatted = ko.computed(function () {
        if (self.count() == null || self.count() == 0)
            return '';
        return '(' + $.format(self.count(), 'n0') + ')';
    });

    //
    // Methods
    //
    self.checkThisOnly = function () {
        $.each(self.global.companies(), function (i, x) {
            if (x == self)
                x.isChecked(true);
            else
                x.isChecked(false);
        });
    };

    self.enableActions = function () {
        self.areActionsEnabled(true);
    };

    self.disableActions = function () {
        self.areActionsEnabled(false);
    };

    //
    // Subscriptions
    //
    self.isChecked.subscribe(function (newValue) {
        self.global.triggerLoadFacesInViewport();
    });

    //
    // Initialization.
    //
    self.init = function () {
        if (self.originalEntity != null) {
            self.id(self.originalEntity.id);
            self.name(self.originalEntity.name);
            self.logoFileID(self.originalEntity.logoFileID);
        }
        self.isInitialized = true;
    };

    self.init();
};


