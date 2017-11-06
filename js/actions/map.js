/*
 * Copyright 2017, Stefano Bovio @allyoucanmap.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const ADD_LAYERS = 'MAP:ADD_BG_LAYERS';
const SELECT_LAYER = 'MAP:SELECT_LAYER';
const TOGGLE = 'MAP:TOGGLE';
const SET_URL = 'MAP:SET_URL';
const SORT_LAYERS = 'MAP:SORT_LAYERS';
const FILTER_LAYERS = 'MAP:FILTER_LAYERS';
const REQUEST_INFO = 'MAP:REQUEST_INFO';
const UPDATE_MAP = 'MAP:UPDATE';
const LOAD_MAP = 'MAP:LOAD';

function addLayers(layers) {
    return {
        type: ADD_LAYERS,
        layers
    };
}

function selectLayer(layer, current) {
    return {
        type: SELECT_LAYER,
        layer,
        current
    };
}

function toggle(name, enabled) {
    return {
        type: TOGGLE,
        enabled,
        name
    };
}

function setUrl(url) {
    return {
        type: SET_URL,
        url
    };
}

function sortLayers(target, current) {
    return {
        type: SORT_LAYERS,
        target,
        current
    };
}

function filterLayers(text) {
    return {
        type: FILTER_LAYERS,
        text
    };
}

function requestInfo(url, params) {
    return {
        type: REQUEST_INFO,
        url,
        params
    };
}

function updateMap(key, value) {
    return {
        type: UPDATE_MAP,
        key,
        value
    };
}

function loadMap(key, value) {
    return {
        type: LOAD_MAP,
        key,
        value
    };
}

module.exports = {
    ADD_LAYERS,
    SELECT_LAYER,
    TOGGLE,
    SET_URL,
    SORT_LAYERS,
    FILTER_LAYERS,
    REQUEST_INFO,
    UPDATE_MAP,
    LOAD_MAP,
    addLayers,
    selectLayer,
    toggle,
    setUrl,
    sortLayers,
    filterLayers,
    requestInfo,
    updateMap,
    loadMap
};
