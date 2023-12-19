
PlaceOverlay.prototype = new google.maps.OverlayView();


/** @constructor */
function PlaceOverlay(map, place, selected) {
    var self = this;

    // Initialize all properties.
    self.latLng = new google.maps.LatLng(place.lat, place.lng);
    self.map = map;
    self.width = 24;
    self.height = 30;
    self.place = place;
    self.selected = selected;

    var icon = place.icon.split('/');
    icon = icon[icon.length - 1];
    self.icon = icon;

    self.div_ = null;

    // Explicitly call setMap on this overlay.
    self.setMap(map);
}

/**
 * onAdd is called when the map's panes are ready and the overlay has been
 * added to the map.
 */
PlaceOverlay.prototype.onAdd = function () {
    var self = this;

    self.div_ = PlaceOverlay.prototype.getVisual(self.width, self.height, self.icon, self.selected);

    google.maps.event.addDomListener(self.div_, 'click', function (e) {
        if (e.stopPropagation != null)
            e.stopPropagation();
        if (e.preventDefault != null)
            e.preventDefault();
        e.cancelBubble = true;

        _viewModel.setActiveEntity(_.find(_viewModel.placeSearchResults(), function (x) { return x.id() == self.place.id; }));
        self.showActiveMarker();
    });

    // Add the element to the "overlayLayer" pane.
    var panes = self.getPanes();
    panes.overlayMouseTarget.appendChild(self.div_);

    google.maps.event.addDomListener(self.div_, 'mouseenter', function (e) {
        _viewModel.setActiveEntity(_.find(_viewModel.placeSearchResults(), function (x) { return x.id() == self.place.id; }));
        self.showActiveMarker();
    });
};

PlaceOverlay.prototype.showActiveMarker = function () {
    var self = this;
    //$('.active_entity_marker').remove();
    //var marker = $(_viewModel.getActiveMarkerHtml());
    //self.div_.appendChild(marker[0]);

    _viewModel.placeDetailsInfobox.setPosition(self.latLng);
    _viewModel.showPlaceDetailsInfoBox();
    _viewModel.placeDetailsInfobox.setOptions({
        pixelOffset: new google.maps.Size(-172, -40)
    });

};

PlaceOverlay.prototype.draw = function () {

    var self = this;

    // We use the south-west and north-east
    // coordinates of the overlay to peg it to the correct position and size.
    // To do this, we need to retrieve the projection from the overlay.
    var overlayProjection = this.getProjection();

    var pos = this.getProjection().fromLatLngToDivPixel(this.latLng);
    var x = 0;
    var y = 0;

    if (!this.anchor) {
        this.anchor = {
            x: this.div_.clientWidth / 2,
            y: this.div_.clientHeight / 2
        };
    }
    x = this.anchor.x;
    y = this.anchor.y;

    pos.x -= x;
    pos.y -= y;

    this.div_.style.top = pos.y + "px";
    this.div_.style.left = pos.x + "px";
};

// The onRemove() method will be called automatically from the API if
// we ever set the overlay's map property to 'null'.
PlaceOverlay.prototype.onRemove = function () {
    var self = this;

    self.div_.parentNode.removeChild(self.div_);
    self.div_ = null;
};

PlaceOverlay.prototype.getVisual = function (width, height, icon, selected) {

    var div = document.createElement('div');
    if(selected)
        div.className = 'pm selected';
    else
        div.className = 'pm';
    div.style.width = width + 'px';
    div.style.height = height + 'px';

    var square = document.createElement('div');
    square.className = 'square';
    square.style.width = width + 'px';
    square.style.height = width + 'px';
    div.appendChild(square);

    var triangleSize = width / 3;
    var triangle = document.createElement('div');
    triangle.className = 'place_triangle';
    triangle.style.width = triangleSize + 'px';
    triangle.style.height = triangleSize + 'px';
    triangle.style.top = (width - triangleSize / 2) + 'px';
    triangle.style.left = (width - triangleSize) / 2 + 'px';
    div.appendChild(triangle);

    var iconMargins = 14;
    var iconWidth = width - iconMargins;
    var iconImg = document.createElement('img');
    iconImg.src = _rootUrl + 'images/places/' + icon;
    iconImg.style.width = iconWidth + 'px';
    iconImg.style.position = 'absolute';
    iconImg.style.left = (width - iconWidth) / 2 + 'px';
    iconImg.style.top = iconMargins / 2 + 'px';
    div.appendChild(iconImg);

    return div;
};