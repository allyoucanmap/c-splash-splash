/*
 * Copyright 2017, Stefano Bovio @allyoucanmap.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const axios = require('axios');
const {xmlToJson, parseXML} = require('../utils/Utils');
const {REQUEST_INFO, SET_URL, addLayers, toggle, updateMap} = require('../actions/map');
const {loading, error} = require('../actions/editor');
const url = require('url');

const getBbox = l => {
    const bbox = l.LatLonBoundingBox && l.LatLonBoundingBox['@attributes'];
    return bbox ? {minx: parseFloat(bbox.minx), miny: parseFloat(bbox.miny), maxx: parseFloat(bbox.maxx), maxy: parseFloat(bbox.maxy)} : {minx: -180, miny: -90, maxx: 180, maxy: 90};
};

let cache = {};

module.exports = {
    getCapabilities: action$ =>
        action$.ofType(SET_URL)
            .filter(a => a.url)
            .switchMap(a => {
                const parsedUrl = url.parse(a.url, true);
                const query = url.format({
                    protocol: parsedUrl.protocol,
                    host: parsedUrl.host,
                    pathname: parsedUrl.pathname
                });
                return cache[query] ? Rx.Observable.of(error('errorStart', ''), toggle('startEnabled', false), toggle('listEnabled', true)) : Rx.Observable.fromPromise(
                    axios.get(query, {
                        params: {
                            SERVICE: 'WMS',
                            version: '1.1.1',
                            REQUEST: 'GetCapabilities'
                        }
                    }).then(response => response.data)
                )
                .delay(1000)
                .switchMap(data => {
                    const json = xmlToJson(parseXML(data));
                    const layers = json && json.WMT_MS_Capabilities && json.WMT_MS_Capabilities[1] && json.WMT_MS_Capabilities[1].Capability && json.WMT_MS_Capabilities[1].Capability.Layer && json.WMT_MS_Capabilities[1].Capability.Layer.Layer.map(l => ({name: l.Name, url: query + '?', bbox: getBbox(l)})) || null;
                    cache[query] = !!layers;
                    return layers ? Rx.Observable.of(addLayers(layers), toggle('startEnabled', false), toggle('listEnabled', true), loading('loadingStart', false)) : Rx.Observable.empty();
                })
                .startWith(loading('loadingStart', true), error('errorStart', ''))
                .catch(e => {
                    const message = e.message && e.message.toLowerCase() || 'not found';
                    return Rx.Observable.of(error('errorStart', message), loading('loadingStart', false));
                });
            }),
    getFeatureInfo: action$ =>
        action$.ofType(REQUEST_INFO)
            .switchMap(a => {
                const parsedUrl = url.parse(a.url, true);
                const query = url.format({
                    protocol: parsedUrl.protocol,
                    host: parsedUrl.host,
                    pathname: parsedUrl.pathname && parsedUrl.pathname.replace('/ows', '/wms') || ''
                });
                return !a.params || !a.url ?
                    Rx.Observable.of(updateMap('infoResults', {})) :
                    Rx.Observable.fromPromise(axios.get(query, {params: a.params}).then(response => response.data))
                        .switchMap(data => {
                            return Rx.Observable.of(updateMap('infoResults', data));
                        });

            })

};
