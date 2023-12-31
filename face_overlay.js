﻿
FaceOverlay.prototype = new google.maps.OverlayView();


/** @constructor */
function FaceOverlay(map, options) {
    var self = this;

    // Initialize all properties.
    self.latLng = options.latLng;
    self.latLngBounds = options.latLngBounds;
    self.count = options.count;
    self.map = map;
    self.data = options.data;
    self.label = self.count > 1 ? self.count : '';
    self.backgroundColor = self.count > 1 ? '#f00' : '#bac7c4';
    self.showBorder = true;
    self.shadowOpacity = self.count > 1 ? .5 : 1;
    self.isExpanded = map.getZoom() >= 15;
    self.wasManuallyExpanded = false;
    self.isExpandable = Object.prototype.toString.call(self.data) === '[object Array]';
    var size = ((self.count + '').length - 1) * 4 + 40;

    self.width = size;
    self.height = size;
    self.anchor = null;
    self.mediaTypes = options.mediaTypes;
    self.mediaTypeCounts = options.mediaTypeCounts;
    self.subCircles = {};
    self.subCirclesCount = 0;

    // Define a property to hold the image's div. We'll
    // actually create this div upon receipt of the onAdd()
    // method so we'll leave it null for now.
    self.div_ = null;

    // Explicitly call setMap on this overlay.
    self.setMap(map);
}

FaceOverlay.prototype.getLocationElement = function (
    size,
    backgroundColor,
    foregroundColor,
    label,
    showBorder,
    shadowOpacity,
    mediaType,
    isExpandedItem,
    isInCart,
    directionFacingAngle) {
    var self = this;

    //
    // Circle
    //
    var div = document.createElement('div');
    div.className = 'fm'; // face marker
    div.style.borderRadius = size / 2 + 'px';
    div.style.width = size + 'px';
    div.style.height = size + 'px';

    if (self.count == 1 || isExpandedItem) {
        size -= 10;
        if(isInCart) {
            var sizeRatio = 1.25;
            var selectedCircle = document.createElement('div');
            selectedCircle.style.position = 'absolute';
            selectedCircle.style.borderRadius = size * sizeRatio / 2 + 'px';
            selectedCircle.style.width = size * sizeRatio + 'px';
            selectedCircle.style.height = size * sizeRatio + 'px';
            selectedCircle.style.cursor = 'pointer';
            selectedCircle.style.backgroundColor = tinycolor('#2ecc71').toString();
            selectedCircle.style.boxShadow = '0 0 4px rgba(0,0,0,' + shadowOpacity + ')';
            selectedCircle.style.left = '50%';
            selectedCircle.style.top = '50%';
            selectedCircle.style.marginLeft = -size * sizeRatio / 2 + 'px';
            selectedCircle.style.marginTop = -size * sizeRatio / 2 + 'px';
            div.appendChild(selectedCircle);
        }

        var circle = document.createElement('div');
        circle.style.position = 'absolute';
        circle.style.borderRadius = size / 2 + 'px';
        circle.style.width = size / 1 + 'px';
        circle.style.height = size / 1 + 'px';
        circle.style.cursor = 'pointer';
        circle.style.backgroundColor = 'rgba(255,255,255,1)';
        circle.style.boxShadow = '0 0 4px rgba(0,0,0,' + shadowOpacity + ')';
        if (showBorder)
            circle.style.border = '1px solid #fff';
        circle.style.left = '50%';
        circle.style.top = '50%';
        circle.style.marginLeft = -size / 2 + 'px';
        circle.style.marginTop = -size / 2 + 'px';

        var icon = $('<div><div class="pin-icon pin-iconcircle mt" style="color: rgb(255, 0, 0);"></div></div>');
        var pinIcon = icon.find('.pin-icon')[0];
        var shapeIndex = 1;

        div.appendChild(circle);
        if (mediaType == null || !mediaType.hasOwnProperty("iconHtml")) {
        }
        else {
            icon = $(mediaType.iconHtml());
            pinIcon = icon.find('.pin-icon')[0];
            shapeIndex = mediaType.shapeIndex();
        }

        //
        // Rotate the marker if we need to respect the direction facing.
        //
        if (shapeIndex == 6) { // Directional half circle
            var transform = 'rotate(' + directionFacingAngle + 'deg)';
            pinIcon.style.transform = transform;
            pinIcon.style.msTransform = transform;
            $(pinIcon).css('-webkit-transform', transform);
        }

        div.appendChild(pinIcon);
    }
    else{
        var angleShift = 2 * Math.PI / self.mediaTypes.length;
        var startAngle = 0;
        var angle = startAngle;
        var radius = Math.round(size / 3);
        var circleSize = Math.round(size / 1.5);

        var circle = document.createElement('div');
        circle.style.position = 'absolute';
        circle.style.borderRadius = size / 3 + 'px';
        circle.style.width = size / 1.5 + 'px';
        circle.style.height = size / 1.5 + 'px';
        circle.style.cursor = 'pointer';
        circle.style.backgroundColor = 'rgba(0,0,0,.5)';
        //circle.style.boxShadow = '0 0 4px rgba(0,0,0,' + shadowOpacity + ')';
        if (showBorder)
            circle.style.border = '2px solid #fff';

        circle.style.left = '50%';
        circle.style.top = '50%';
        circle.style.marginLeft = -size / 3 + 'px';
        circle.style.marginTop = -size / 3 + 'px';

        div.appendChild(circle);
    }

    //
    // Face count label.
    //
    var countSpan = document.createElement('span');
    countSpan.className = 'fc'; // face count
    if(label != null && label != '')
    {
        countSpan.innerText = label;
        countSpan.style.color = self.count == 1 || isExpandedItem == true ? foregroundColor : '#fff';
    }
    div.appendChild(countSpan);

    return div;
}

/**
 * onAdd is called when the map's panes are ready and the overlay has been
 * added to the map.
 */
FaceOverlay.prototype.onAdd = function () {
    var self = this;

    var div = document.createElement('div');
    if (self.isExpandable && self.isExpanded && self.map.getZoom() >= 15)
        div.className = 'mk isxpd';
    else
        div.className = 'mk';

    div.style.borderStyle = 'none';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';
    div.style.width = self.width + 'px';
    div.style.height = self.height + 'px';

    var isInCart = false;

    if (!(self.data == null || !self.data.hasOwnProperty("id"))) {
        isInCart = self.data
            ? _.find(_viewModel.cart(), function (x) { return self.data.id() == x.id(); }) != null
            : false;
    }

    var circle = self.getLocationElement(
        self.width,
        self.isExpanded && self.isExpandable ? '#fff' : self.backgroundColor,
        self.isExpanded && self.isExpandable ? '#999' : '#fff',
        self.label,
        self.showBorder,
        self.shadowOpacity,
        self.data != null && self.data.mediaType != null ? self.data.mediaType() : null,
        self.isExpanded,
        isInCart,
        self.data != null && self.data.directionFacingAngle != null ? self.data.directionFacingAngle() : null);
    circle.className = 'mc'; // main circle
    div.appendChild(circle);

    //
    // Expanded only visible elements.
    //
    if (self.isExpandable) {

        var largeCircle = document.createElement('div');
        largeCircle.className = 'xp lc';
        largeCircle.style.display = self.isExpanded ? '' : 'none';
        largeCircle.style.width = 3 * self.width + 'px';
        largeCircle.style.height = 3 * self.width + 'px';
        largeCircle.style.borderRadius = 1.5 * self.width + 'px';
        largeCircle.style.left = -self.width + 'px';
        largeCircle.style.top = -self.width + 'px';
        div.insertBefore(largeCircle, circle);

        var angleShift = 2 * Math.PI / self.data.length;
        var startAngle = 0;
        var angle = startAngle;
        var locationMarkerWidth = self.width;
        var radius = 36;

        $.each(self.data, function (i, l) {
            var isInCart = _.find(_viewModel.cart(), function(x){ return l.id() == x.id(); }) != null;

            var location = self.getLocationElement(
                self.width,
                '#bac7c4',
                '#fff',
                '',
                true,
                .5,
                l.mediaType(),
                true,
                isInCart,
                l.directionFacingAngle());

            ////
            //// Rotate the marker if we need to respect the direction facing.
            ////
            //if (l.mediaType().shapeIndex() == 6) { // Directional half circle
            //    var transform = 'rotate(' + l.directionFacingAngle() + 'deg)';
            //    location.style.transform = transform;
            //    location.style.msTransform = transform;
            //    $(location).css('-webkit-transform', transform);
            //}

            location.className = 'xp';
            location.style.display = self.isExpanded ? '' : 'none';
            location.style.position = 'absolute';
            location.style.left = self.width / 2 + (radius * Math.cos(angle) - locationMarkerWidth / 2) + 'px';
            location.style.top = self.width / 2 + (radius * Math.sin(angle) - locationMarkerWidth / 2) + 'px';
            location.style.cursor = 'pointer';
            div.appendChild(location);

            self.subCircles[l.id()] = location;
            self.subCirclesCount++;


            var showTooltip = function(){
                _viewModel.faceDetailsInfobox.setPosition(self.latLng);
                _viewModel.showFaceDetailsInfoBox();
                _viewModel.faceDetailsInfobox.setOptions({
                    pixelOffset: new google.maps.Size(-172 + parseInt(location.style.left), parseInt(location.style.top) - 40)
                });
            };

            var activateLocation = function(e){
                if (e.stopPropagation != null)
                    e.stopPropagation();
                if (e.preventDefault != null)
                    e.preventDefault();
                e.cancelBubble = true;

                showTooltip();
                if(_viewModel.activeEntity() != l) {
                    _viewModel.faceDetailsLoadedCallbacks.push(showTooltip);
                    _viewModel.setActiveEntity(l);
                }
                self.lastActiveEntity = _viewModel.activeEntity();
            };

            if(Modernizr.touch){
                google.maps.event.addDomListener(location, 'touchend', function (e) {
                    activateLocation(e);
                });
            }
            else{
                google.maps.event.addDomListener(location, 'mouseenter', function (e) {
                    activateLocation(e);
                });

                google.maps.event.addDomListener(location, 'click', function (e) {
                    activateLocation(e);
                });

                google.maps.event.addDomListener(location, 'mouseleave', function (e) {
                    if(self.xhrFaceDetails != null)
                        self.xhrFaceDetails.abort();
                    if(_viewModel.getInfoWindow() != null)
                        _viewModel.getInfoWindow().close();
                });
            }

            angle += angleShift;
        });

    }

    var circleShowTooltip = function () {
        var content = '';
        if(self.data != null && Object.prototype.toString.call(self.data) != '[object Array]')
        {
            _viewModel.setActiveEntity(self.data);
            self.showActiveMarker();
            return;
        }
        else if(self.mediaTypes != null){
            var content = '';

            var data = [];
            $.each(self.mediaTypes, function(i,x){
                var count = _.find(self.mediaTypeCounts, function(y){ return y.id == x.id(); }).c;

                data.push({
                    id: x.id(),
                    name: x.name(),
                    iconHtml: x.iconHtml(),
                    latLngBounds: self.latLngBounds,
                    count: count
                });
            });


            var target = $('<div>')[0];

            ko.renderTemplate(
                'clusterdetails_infobox_template',
                { mediaTypeCounts: data },
                null,
                target,
                'replaceChildren'
            );


            _viewModel.clusterDetailsInfobox.setPosition(self.latLng);
            _viewModel.clusterDetailsInfobox.setOptions({
                pixelOffset: new google.maps.Size(-125, -32),
                content: $(target).html()
            });

            _viewModel.showClusterDetailsInfoBox();

        }
    };


    //
    // Event handlers.
    //
    var activateLocation =  function(e){
        if (e.stopPropagation != null)
            e.stopPropagation();
        if (e.preventDefault != null)
            e.preventDefault();

        e.cancelBubble = true;

        _viewModel.getInfoWindow().close();
        $('.hover').removeClass('hover');

        if (self.count == 1) {
            _viewModel.setActiveEntity(self.data);
            self.showActiveMarker();
        }
        else if (self.isExpandable) {
            if (self.isExpanded) {
                self.wasManuallyExpanded = false;
                self.contract();
            }
            else {
                self.wasManuallyExpanded = true;
                self.expand();
            }
        }
        else {
            if(self.map != null) {
                var zoom = self.map.getZoom();
                self.map.fitBounds(self.latLngBounds);
            }
        }
    };

    //
    // Event handlers
    //
    if(Modernizr.touch) {
        google.maps.event.addDomListener(circle, 'touchend', function (e) {
            activateLocation(e);
        });
    }
    else {
        google.maps.event.addDomListener(circle, 'click', function (e) {
            activateLocation(e);
        });
        google.maps.event.addDomListener(circle, 'mouseenter', function (e) {
            if(circleShowTooltip != null)
                circleShowTooltip();
        });
    }


    self.div_ = div;

    // Add the element to the "overlayLayer" pane.
    var panes = self.getPanes();
    panes.overlayMouseTarget.appendChild(div);

    return false;
};

FaceOverlay.prototype.showActiveMarkerForId = function (id) {
    var self = this;
    if (self.subCirclesCount == 0)
        self.showActiveMarker();
    else {
        self.showActiveMarker(self.subCircles[id]);
    }
};

FaceOverlay.prototype.showActiveMarker = function (elm) {
    var self = this;

    _viewModel.faceDetailsInfobox.setPosition(self.latLng);
    _viewModel.showFaceDetailsInfoBox();
    var xOffset = 0,
        yOffset = 0;

    if(elm != null) {
        xOffset = parseInt($(elm).css('left'));
        yOffset = parseInt($(elm).css('top'));
    }

    _viewModel.faceDetailsInfobox.setOptions({
        pixelOffset: new google.maps.Size(-172 + xOffset, yOffset - 40)
    });
};


FaceOverlay.prototype.contract = function () {
    var self = this;
    self.isExpanded = false;
    $(self.div_).find('.xp').hide();
    $(self.div_).removeClass('isxpd');
};

FaceOverlay.prototype.expand = function () {
    var self = this;
    self.isExpanded = true;
    $(self.div_).find('.xp').show();
    $(self.div_).addClass('isxpd');
};

FaceOverlay.prototype.draw = function () {

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

    if (self.isExpandable) {
        if (self.map.getZoom() >= 15) {
            if (!self.isExpanded)
                self.expand();
        }
        else {
            if (self.isExpanded && !self.wasManuallyExpanded)
                self.contract();
            else if (!self.isExpanded && self.wasManuallyExpanded)
                self.expand();
        }
    }

    $(self.div_).fadeIn(500, 'easeOutQuart');

};

// The onRemove() method will be called automatically from the API if
// we ever set the overlay's map property to 'null'.
FaceOverlay.prototype.onRemove = function () {
    var self = this;

    $(self.div_).fadeOut(500, 'easeOutQuart', function () {
        self.div_.parentNode.removeChild(self.div_);
        self.div_ = null;
    });
};

