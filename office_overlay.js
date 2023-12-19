
OfficeOverlay.prototype = new google.maps.OverlayView();


/** @constructor */
function OfficeOverlay(map, office) {
    var self = this;

    // Initialize all properties.
    self.latLng = new google.maps.LatLng(office.lat(), office.lng());
    self.map = map;
    self.size = 21;
    self.office = office;

    self.div_ = null;

    // Explicitly call setMap on this overlay.
    self.setMap(map);
}

/**
 * onAdd is called when the map's panes are ready and the overlay has been
 * added to the map.
 */
OfficeOverlay.prototype.onAdd = function () {
    var self = this;

    self.div_ = OfficeOverlay.prototype.getVisual(self.map, self.office, self.size);

    // Add the element to the "overlayLayer" pane.
    var panes = self.getPanes();
    panes.floatPane.appendChild(self.div_);
};

OfficeOverlay.prototype.draw = function () {

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
OfficeOverlay.prototype.onRemove = function () {
    var self = this;

    self.div_.parentNode.removeChild(self.div_);
    self.div_ = null;
};

OfficeOverlay.prototype.getVisual = function (map, office, size) {
    var self = this;

    var div = document.createElement('div');
    div.style.borderStyle = 'none';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';
    div.style.width = size + 'px';
    div.style.height = size + 'px';
    div.style.cursor = 'pointer';

    //
    // Circle
    //
    var circle = document.createElement('div');
    circle.style.position = 'absolute';
    circle.style.borderRadius = size / 2 + 'px';
    circle.style.border = '2px solid #fff';
    circle.style.backgroundColor = '#c0392b';
    circle.style.width = size + 'px';
    circle.style.height = size + 'px';
    circle.style.cursor = 'pointer';
    circle.style.boxShadow = '0 0 4px rgba(0,0,0,.5)';
    div.appendChild(circle);

    //
    // Star
    //
    var star = document.createElement('div');
    star.className = 'glyphicon glyphicon-home';
    star.style.color = '#fff';
    star.style.fontSize = (size / 2) + 'px';
    star.style.lineHeight = size + 'px';
    star.style.position = 'absolute';
    star.style.top = '50%';
    star.style.left = '50%';
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.marginLeft = (-size / 2 ) + 'px';
    star.style.marginTop = (-size / 2) + 'px';
    star.style.textAlign = 'center';

    circle.appendChild(star);

    var showTooltip = function(){
        var content = '<b>' + office.name() + ' office</b>';

        _viewModel.showInfoWindow(office.latLng(), content, new google.maps.Size(0, -12));
    };

    if(Modernizr.touch) {
        google.maps.event.addDomListener(div, 'touchend', function (e) {

            office.zoomToBounds();
            self.activateOffice(e, office);

//            if ($(circle).hasClass('hover')) {
//                if (_viewModel.getInfoWindow() != null)
//                    _viewModel.getInfoWindow().close();
//                $('.hover').removeClass('hover');
//
//                self.activateOffice(e, office);
//                office.zoomToBounds();
//            }
//            else {
//                $(circle).addClass('hover');
//                self.activateOffice(e, office);
//                showTooltip();
//            }
        });
    }
    else {
        google.maps.event.addDomListener(div, 'mouseenter', function (e) {
            showTooltip();
        });
        google.maps.event.addDomListener(div, 'click', function (e) {
            office.zoomToBounds();
            self.activateOffice(e, office);
        });

    }

    return div;
};

OfficeOverlay.prototype.activateOffice = function(e, office){
    if (e.stopPropagation != null)
        e.stopPropagation();
    if (e.preventDefault != null)
        e.preventDefault();
    e.cancelBubble = true;
    var office = _.find(_viewModel.offices(), function (x) { return x.id() == office.id(); });
    if(_viewModel.activeEntity() != office)
        _viewModel.setActiveEntity(office);
};
