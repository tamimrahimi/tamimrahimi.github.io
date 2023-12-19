var MediaTypeModel = function (global, entity) {
    var self = this;
    self.originalEntity = entity;
    self.global = global;

    //
    // Observables.
    //
    self.id = ko.observable();
    self.name = ko.observable();
    self.shapeIndex = ko.observable();
    self.foreColor = ko.observable();
    self.backColor = ko.observable();
    self.isChecked = ko.observable(true);
    self.count = ko.observable();
    self.areActionsEnabled = ko.observable(false);
    self.isAvailableInCurrentViewport = ko.observable(true);

    //
    // Computed
    //
    self.description = ko.computed(function () {
        if(self.count() == null || self.count() == 0)
            return self.name();
        return self.name() + ' ' + self.countFormatted();
    });

    self.countFormatted = ko.computed(function () {
        if (self.count() == null || self.count() == 0)
            return '';
        return '(' + $.format(self.count(), 'n0') + ')';
    });

    self.iconHtml = ko.computed(function(){
        var div = document.createElement('div');
        //div.className = '';

        var pinClass = 'iconcircle';

        if (self.shapeIndex() == 1) // Circle 
            pinClass = 'iconcircle';
        else if (self.shapeIndex() == 2) // Square 
            pinClass = 'iconsquare';
        else if (self.shapeIndex() == 3) // Diamond 
            pinClass = 'icondiamond';
        else if (self.shapeIndex() == 4) // Star 
            pinClass = 'iconstar';
        else if (self.shapeIndex() == 5) // HalfCircle 
            pinClass = 'iconhalf_circle';
        else if (self.shapeIndex() == 6) // DirectionalHalfCircle 
            pinClass = 'iconhalf_circle';


        var pin = document.createElement('div');
        pin.className = 'pin-icon pin-' + pinClass + ' mt';
        pin.style.color = self.backColor();
        div.appendChild(pin);

        return div.outerHTML;
    });

    //
    // Methods
    //
    self.checkThisOnly = function () {
        $.each(self.global.mediaTypes(), function (i, x) {
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
    // SUbscriptions
    //
    self.isChecked.subscribe(function (newValue) {
        self.global.triggerLoadFacesInViewport();
    });

    self.init = function (){
        if (self.originalEntity != null) {
            self.id(self.originalEntity.id);
            self.name(self.originalEntity.name);
            self.shapeIndex(self.originalEntity.shape);
            self.foreColor(self.originalEntity.foreColor);
            self.backColor(self.originalEntity.backColor);
        }
    };

    self.init();
}