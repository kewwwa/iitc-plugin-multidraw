// ==UserScript==
// @id             iitc-plugin-multidraw@kewwwa
// @name           IITC plugin: Multi draw
// @description    Draw multiple links
// @category       Layer
// @version        0.1
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
    var setup = (function (window, undefined) {
        'use strict';

        var firstPortal, secondPortal, currentPortal = null;

        if (typeof window.plugin !== 'function') window.plugin = function () { };
        window.plugin.multidraw = function () { };
        window.plugin.multidraw.setup = setup;

        return setup;

        function setup() {
            addHook('portalDetailsUpdated', portalSelected);
        }

        function portalSelected(data) {
            var latlngs;

            currentPortal = null;

            if (!(data && data.portal)) return;

            currentPortal = {
                guid: data.guid,
                ll: data.portal.getLatLng()
            };

            if (typeof firstPortal === typeof undefined) {
                log('First portal selected');
                firstPortal = currentPortal;
            }
            else {
                latlngs = [];
                latlngs.push(firstPortal.ll);

                if (typeof secondPortal === typeof undefined) {
                    log('Second portal selected');
                    secondPortal = currentPortal;
                }
                else {
                    log('New portal selected');
                    latlngs.push(currentPortal.ll);
                }

                latlngs.push(secondPortal.ll);

                window.map.fire('draw:created', {
                    layer: L.geodesicPolyline(latlngs, window.plugin.drawTools.lineOptions),
                    layerType: 'polyline'
                });

                if (!window.map.hasLayer(window.plugin.drawTools.drawnItems)) {
                    window.map.addLayer(window.plugin.drawTools.drawnItems);
                }
            }
        }

        function log(message) {
            console.log('Multi draw: ' + message);
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

