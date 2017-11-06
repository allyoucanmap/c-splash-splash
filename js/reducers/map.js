/*
 * Copyright 2017, Stefano Bovio @allyoucanmap.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');
const {head} = require('lodash');
const {ADD_LAYERS, SELECT_LAYER, TOGGLE, SORT_LAYERS, FILTER_LAYERS, UPDATE_MAP, LOAD_MAP} = require('../actions/map');

const defaultLayer = {
    name: '',
    url: '',
    bbox: {minx: -180, miny: -90, maxx: 180, maxy: 90}
};

function map(state = {startEnabled: true, layers: [], layer: {name: '', url: ''}, selected: []}, action) {
    switch (action.type) {
        case ADD_LAYERS:
            return assign({}, state, {layers: [...state.layers, ...action.layers]});
        case SELECT_LAYER:
            const isSelected = head(state.selected.filter(s => s.name === action.layer.name && s.url === action.layer.url));
            const selected = isSelected ? state.selected.filter(s => !(s.name === action.layer.name && s.url === action.layer.url)) : [...state.selected, action.layer];
            return action.current ? assign({}, state, {layer: isSelected ? defaultLayer : action.layer, selected}) : assign({}, state, {selected});
        case TOGGLE:
            return assign({}, state, {[action.name]: action.enabled});
        case SORT_LAYERS:
            let bottom = [...state.layers];
            let top = bottom.splice(0, action.target);
            const t = top.filter(l => !(action.current.layer.name === l.name && action.current.layer.url === l.url));
            const b = bottom.filter(l => !(action.current.layer.name === l.name && action.current.layer.url === l.url));
            return assign({}, state, {layers: [...t, assign({}, action.current.layer), ...b]});
        case FILTER_LAYERS:
            return assign({}, state, {filterText: action.text});
        case UPDATE_MAP:
            return assign({}, state, {[action.key]: action.value});
        case LOAD_MAP:
            const newSelected = state.selected.map(l => l.url + ':' + l.name === action.value ?
                assign({}, l, {loading: action.key === 'start'}) :
                assign({}, l)
            );
            const isLoading = head(newSelected.filter(l => l.loading));
            return assign({}, state, {selected: newSelected, loading: !!isLoading});
        default:
            return state;
    }
}

module.exports = map;
