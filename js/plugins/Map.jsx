/*
 * Copyright 2017, Stefano Bovio @allyoucanmap.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const L = require('leaflet');

const React = require('react');
const PropTypes = require('prop-types');
const {createSelector} = require('reselect');
const assign = require('object-assign');
const {connect} = require('react-redux');
const {head, isEqual, isEmpty} = require('lodash');
const {requestInfo, updateMap, loadMap} = require('../actions/map');
const ContainerDimensions = require('react-container-dimensions').default;

const EARTH_RADIUS = 6378137.0;
const EARTH_CIRCUMFERENCE = 2 * Math.PI * EARTH_RADIUS;

const resolution = (lat, z) => {
    return EARTH_CIRCUMFERENCE * Math.cos(lat * Math.PI / 180) / Math.pow(2, z + 8);
};

const getScale = (lat, z, ppi) => {
    return ppi * 39.37 * resolution(lat, z);
};

const getPPI = () => {
    const div = document.createElement('div');
    div.style.width = '1in';
    div.style.height = '1in';
    div.style.position = 'absolute';
    div.style.zIndex = -99999;
    document.body.appendChild(div);
    const ppi = div.clientWidth;
    document.body.removeChild(div);
    return ppi;
};

const getScales = () => {
    const ppi = getPPI();
    let cnt = 0;
    let scales = [];
    while (cnt <= 21) {
        scales.push(getScale(0, cnt, ppi));
        cnt++;
    }
    return [...scales];
};

class Map extends React.Component {

    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
        code: PropTypes.object,
        sld: PropTypes.string,
        center: PropTypes.object,
        zoom: PropTypes.number,
        layers: PropTypes.array,
        layerName: PropTypes.string,
        format: PropTypes.string,
        url: PropTypes.string,
        allLayers: PropTypes.array,
        onRequestInfo: PropTypes.func,
        feature: PropTypes.object,
        onUpdate: PropTypes.func,
        onLoad: PropTypes.func
    };

    static defaultProps = {
        width: 0,
        height: 0,
        code: {},
        sld: '',
        center: {x: 11.2558136, y: 43.7695604},
        zoom: 14,
        url: 'http://localhost:8080/geoserver/wms?',
        format: 'image/png',
        layerName: 'osm:buildings',
        layers: [],
        allLayers: [],
        onRequestInfo: () => {},
        feature: {},
        onUpdate: () => {},
        onLoad: () => {}
    };

    state = {
        layers: {}
    };

    componentDidMount() {
        this.addMap();
    }

    componentWillUpdate(newProps, newState) {
        if (this.props.layerName !== newProps.layerName) {
            this.clearLayers();
            const layers = [...newProps.allLayers].reverse();
            layers.forEach(l => {
                if (head(newProps.layers.filter(s => s.name === l.name && s.url === l.url))) {
                    if (l.name === newProps.layerName) {
                        this.layer = this.addLayer(l.url, l.name, newProps.format, newProps.code[l.url + ':' + l.name], l.bbox);
                    } else {
                        this.addLayer(l.url, l.name, newProps.format, newProps.code[l.url + ':' + l.name]);
                    }
                }
            });
        }

        if (!isEqual(newProps.allLayers, this.props.allLayers) || this.props.layers.length !== newProps.layers.length) {
            this.clearLayers();
            const layers = [...newProps.allLayers].reverse();
            layers.forEach(l => {
                if (head(newProps.layers.filter(s => s.name === l.name && s.url === l.url))) {
                    if (l.name === newProps.layerName) {
                        this.layer = this.addLayer(l.url, l.name, newProps.format, newProps.code[l.url + ':' + l.name]);
                    } else {
                        this.addLayer(l.url, l.name, newProps.format, newProps.code[l.url + ':' + l.name]);
                    }
                }
            });
        }

        if (!isEqual(this.props.feature, newProps.feature) && !isEmpty(newProps.feature) && this.state.popup) {
            newState.popup
                .setLatLng(newState.infoLatLng)
                .setContent('<div class="a-popup-body">' + this.htmlString(newProps.feature) + '</div>')
                .addTo(this.state.map);
        }

        if (!isEqual(newState.infoLatLng, this.state.infoLatLng)) {
            newState.popup
                .setLatLng(newState.infoLatLng);
        }

        if (this.layer && this.props.sld !== newProps.sld && newProps.sld !== '') {
            this.layer.setParams({
                sld_body: newProps.sld.replace(/\n/g, '')
            }, false);
        }

        if (this.props.width !== newProps.width || this.props.height !== newProps.height) {
            newState.map.invalidateSize();
        }
    }

    componentWillUnmount() {
        this.removeMap();
    }

    render() {
        return (<div id="map-container" className="a-map-conatiner"/>);
    }

    htmlString = results => {
        return results && results.features && results.features[0] && results.features[0].properties && !isEmpty(results.features[0].properties) && Object.keys(results.features[0].properties).reduce((a, key) => {
            return a + '<div class="a-line"><span>' + key + '</span><span>' + results.features[0].properties[key] + '</span></div>';
        }, '') || '<div class="a-line"><span class="a-text">no feature selected</span></div>';
    }

    addMap = () => {
        if (!this.state.map) {
            const map = L.map('map-container', { zoomControl: false, attributionControl: false})
                .setView([this.props.center.y, this.props.center.x], Math.round(this.props.zoom));
            // const scaleControl = L.control.scale({ position: 'bottomright', imperial: false});
            // const zoomControl = L.control.zoom({ position: 'bottomright'});
            const popup = L.popup({
                closeOnClick: false,
                className: 'a-popup'
            });
            // map.addControl(scaleControl);
            // map.addControl(zoomControl);

            map.on('layeradd', e => {
                if (e && e.layer && e.layer.on && e.layer && e.layer.wmsParams && e.layer.wmsParams.layers) {
                    e.layer.on('loading', l => {
                        this.props.onLoad('start', l.target._url + ':' + l.target.wmsParams.layers);
                    });
                    e.layer.on('load', l => {
                        this.props.onLoad('end', l.target._url + ':' + l.target.wmsParams.layers);
                    });
                }
            });

            map.on('moveend', () => {
                this.props.onUpdate('zoom', map.getZoom());
            });

            map.on('popupclose', () => {
                this.props.onRequestInfo('');
            });

            const delta = 0.00001;
            map.on('click', (e) => {
                this.props.onRequestInfo(
                    this.props.url,
                    e.latlng && {
                        bbox: (e.latlng.lng - delta) + ',' + (e.latlng.lat - delta) + ',' + (e.latlng.lng + delta) + ',' + (e.latlng.lat + delta),
                        fotmat: 'jpeg',
                        request: 'GetFeatureInfo',
                        query_layers: this.props.layerName,
                        layers: this.props.layerName,
                        width: 2,
                        height: 2,
                        crs: 'EPSG:4326',
                        x: 1,
                        y: 1,
                        info_format: 'application/json'
                    } || null);

                this.setState({
                    infoLatLng: assign({}, e.latlng)
                });
            });

            this.props.onUpdate('scales', getScales());
            this.props.onUpdate('zoom', map.getZoom());

            this.setState({
                // scaleControl,
                // zoomControl,
                popup,
                map
            });
        }
    }

    removeMap = () => {
        this.clearLayers();
        this.state.map.remove();
        this.setState({
            map: null,
            scaleControl: null,
            zoomControl: null
        });
    }

    addLayer = (url, name, format, code, bbox) => {
        if (url && name && format) {
            const params = code && code.sld ? {
                layers: name,
                format,
                transparent: true,
                sld_body: code.sld.replace(/\n/g, '')
            } : {
                layers: name,
                format,
                transparent: true
            };

            const layer = L.tileLayer.wms(url, params).addTo(this.state.map);

            if (bbox) {
                this.state.map.fitBounds([
                    [bbox.miny, bbox.minx],
                    [bbox.maxy, bbox.maxx]
                ]);
            }

            return layer;
        }
    }

    clearLayers = () => {
        this.state.map.eachLayer(l => {
            this.state.map.removeLayer(l);
        });
        this.setState({
            layers: {}
        });
    }
}

class MapContainer extends React.Component {
    render() {
        return (
            <ContainerDimensions>
                { ({ width, height }) =>
                    <Map width={width} height={height} {...this.props}/>
                }
            </ContainerDimensions>
        );
    }
}

const mapSelector = createSelector([
        state => state.code && state.code,
        state => state.map && state.map.layer && state.map.layer.name,
        state => state.map && state.map.selected || [],
        state => state.map && state.map.layer && state.map.layer.url,
        state => state.map && state.map.layers || [],
        state => state.map && state.map.infoResults && state.map.infoResults || {}
    ], (code, layerName, layers, url, allLayers, feature) => ({
        sld: code[url + ':' + layerName] && code[url + ':' + layerName].sld || '',
        layerName,
        layers,
        url,
        code,
        allLayers,
        feature
    })
);

const MapPlugin = connect(
    mapSelector, {
        onRequestInfo: requestInfo,
        onUpdate: updateMap,
        onLoad: loadMap
    }
)(MapContainer);

module.exports = {
    MapPlugin,
    reducers: {
        map: require('../reducers/map')
    },
    epics: require('../epics/map')
};
