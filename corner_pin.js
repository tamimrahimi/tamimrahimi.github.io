var CornerPinViewModel = function (data) {
    var self = this;
    self.id = ko.observable(data.id);
    self.x = ko.observable(data.x);
    self.y = ko.observable(data.y);
};