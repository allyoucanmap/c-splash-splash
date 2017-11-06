/*
 * Copyright 2017, Stefano Bovio @allyoucanmap.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');
const StyleUtils = require('../utils/StyleUtils');
const {UPDATE_CODE, ACTIVATE_CODE} = require('../actions/code');

function editor(state = {enabled: {css: true, json: false, sld: false}}, action) {
    switch (action.type) {
        case UPDATE_CODE:
            if (action.language === 'css') {
                const json = StyleUtils.toJSON(action.code);
                const sld = StyleUtils.toSLD(json);
                return assign({}, state, {[action.url + ':' + action.layer]: {json, sld, css: action.code}});
            }
            if (action.language === 'sld') {
                const css = StyleUtils.toCSS(action.code);
                const json = StyleUtils.toJSON(css);
                return assign({}, state, {[action.url + ':' + action.layer]: {json, sld: action.code, css}});
            }
            if (action.language === 'json') {
                const sld = StyleUtils.toSLD(action.code);
                const css = StyleUtils.toCSS(sld);
                return assign({}, state, {[action.url + ':' + action.layer]: {json: action.code, sld, css}});
            }
            return assign({}, state);
        case ACTIVATE_CODE:
            const enabled = action.code ? {[action.code]: true } : {};
            return assign({}, state, {enabled: assign({}, { css: false, json: false, sld: false }, enabled) });
        default:
            return state;
    }
}

module.exports = editor;
