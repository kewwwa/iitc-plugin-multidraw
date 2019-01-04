// ==UserScript==
// @id             iitc-plugin-multidraw@kewwwa
// @name           IITC plugin: Multi draw
// @description    Draw multiple links
// @category       Layer
// @version        0.1.2
// @namespace      https://github.com/kewwwa/iitc-plugin-multidraw
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
    //PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
    //(leaving them in place might break the 'About IITC' page or break update checks)
    //plugin_info.buildName = 'iitc';
    //plugin_info.dateTimeVersion = '20170108.21732';
    //plugin_info.pluginId = 'multidraw';
    //END PLUGIN AUTHORS NOTE

    // PLUGIN START ////////////////////////////////////////////////////////
    var firstPortalLink, secondPortalLink;

    var setup = (function (window, undefined) {
        'use strict';

        var plugin, actions,
            firstPortal, secondPortal;

        if (typeof window.plugin !== 'function') window.plugin = function () { };
        window.plugin.multidraw = function () { };
        plugin = window.plugin.multidraw;
        plugin.setup = setup;

        return plugin.setup;

        function toggleMenu() {
            if (actions.classList.contains("active"))
                actions.classList.remove("active");
            else
                actions.classList.add("active");
        }

        function clear() {
            firstPortal = false;
            secondPortal = false;
            if (firstPortalLink.classList.contains('highlighted')) firstPortalLink.classList.remove('highlighted');
            if (secondPortalLink.classList.contains('highlighted')) secondPortalLink.classList.remove('highlighted');
        }
        function selectFirstPortal() {
            log('First portal selected');

            firstPortal = getPortalSelected();
            if (!firstPortal) return;
            if (!firstPortalLink.classList.contains('highlighted')) firstPortalLink.classList.add('highlighted');

            draw();
        }

        function selectSecondPortal() {
            var latlngs;
            log('Second portal selected');

            secondPortal = getPortalSelected();
            if (!secondPortal) return;
            if (!secondPortalLink.classList.contains('highlighted')) secondPortalLink.classList.add('highlighted');

            draw();
        }

        function selectOtherPortal() {
            var portal;
            log('Other portal selected');

            portal = getPortalSelected();
            if (!portal) return;

            draw(portal);
        }

        function draw(portal) {
            var latlngs;

            if (!(firstPortal && secondPortal)) return;

            latlngs = [];
            latlngs.push(firstPortal.ll);
            if (portal) latlngs.push(portal.ll);
            latlngs.push(secondPortal.ll);

            window.map.fire('draw:created', {
                layer: L.geodesicPolyline(latlngs, window.plugin.drawTools.lineOptions),
                layerType: 'polyline'
            });

            if (!window.map.hasLayer(window.plugin.drawTools.drawnItems)) {
                window.map.addLayer(window.plugin.drawTools.drawnItems);
            }
        }

        function getPortalSelected(data) {
            if (!(selectedPortal && portals[selectedPortal])) return;

            return {
                guid: selectedPortal,
                ll: portals[selectedPortal].getLatLng()
            };
        }

        function log(message) {
            console.log('Multi draw: ' + message);
        }

        function setup() {
            var parent, control, section, toolbar,
                button,
                clearLi, firstPortalLi, secondPortalLi, otherPortalLi,
                clearLink, /*firstPortalLink, secondPortalLink are visible globally*/ otherPortalLink;

            $('<style>').prop('type', 'text/css')
                .html('.leaflet-draw-actions.active{display: block;}.leaflet-control-multidraw a.leaflet-multidraw-edit-edit {background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCI+Cgk8ZyBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eTowLjQ7c3Ryb2tlOm5vbmUiPgoJCTxwYXRoIGQ9Ik0gNiwyNCAyNCwyNCAxNSw2IHoiLz4KCQk8cGF0aCBkPSJNIDYsMjQgMjQsMjQgMTUsMTIgeiIvPgoJCTxwYXRoIGQ9Ik0gNiwyNCAyNCwyNCAxNSwxOCB6Ii8+Cgk8L2c+Cjwvc3ZnPgo=");}')
                .appendTo('head');
            $('<style>').prop('type', 'text/css')
                .html('.multidraw.highlighted{background-color:#008902}')
                .appendTo('head');

            button = document.createElement("a");
            button.className = "leaflet-multidraw-edit-edit";
            button.addEventListener("click", toggleMenu, false);
            button.title = 'Draw multi links';

            toolbar = document.createElement("div");
            toolbar.className = "leaflet-draw-toolbar leaflet-bar";
            toolbar.appendChild(button);

            clearLink = document.createElement("a");
            clearLink.innerText = "X";
            clearLink.title = 'Clear selected portals';
            clearLink.addEventListener("click", clear, false);
            clearLi = document.createElement("li");
            clearLi.appendChild(clearLink);

            firstPortalLink = document.createElement("a");
            firstPortalLink.className = "multidraw";
            firstPortalLink.innerText = "1";
            firstPortalLink.title = 'Select first portal';
            firstPortalLink.addEventListener("click", selectFirstPortal, false);
            firstPortalLi = document.createElement("li");
            firstPortalLi.appendChild(firstPortalLink);

            secondPortalLink = document.createElement("a");
            secondPortalLink.className = "multidraw";
            secondPortalLink.innerText = "2";
            secondPortalLink.title = 'Select second portal';
            secondPortalLink.addEventListener("click", selectSecondPortal, false);
            secondPortalLi = document.createElement("li");
            secondPortalLi.appendChild(secondPortalLink);

            otherPortalLink = document.createElement("a");
            otherPortalLink.innerText = "N";
            otherPortalLink.title = 'Select other portal';
            otherPortalLink.addEventListener("click", selectOtherPortal, false);
            otherPortalLi = document.createElement("li");
            otherPortalLi.appendChild(otherPortalLink);

            actions = document.createElement("ul");
            actions.className = "leaflet-draw-actions leaflet-draw-actions-top";
            actions.appendChild(clearLi);
            actions.appendChild(firstPortalLi);
            actions.appendChild(secondPortalLi);
            actions.appendChild(otherPortalLi);

            section = document.createElement("div");
            section.className = "leaflet-draw-section";
            section.appendChild(toolbar);
            section.appendChild(actions);

            control = document.createElement("div");
            control.className = "leaflet-control-multidraw leaflet-draw leaflet-control";
            control.appendChild(section);

            parent = $(".leaflet-top.leaflet-left", window.map.getContainer());
            parent.append(control);
        }
    })(window);
    // PLUGIN END //////////////////////////////////////////////////////////

    setup.info = plugin_info; //add the script info data to the function as a property
    if (!window.bootPlugins) window.bootPlugins = [];
    window.bootPlugins.push(setup);
    // if IITC has already booted, immediately run the 'setup' function
    if (window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end

// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('(' + wrapper + ')(' + JSON.stringify(info) + ');'));
(document.body || document.head || document.documentElement).appendChild(script);
