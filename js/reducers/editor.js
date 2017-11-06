/*
 * Copyright 2017, Stefano Bovio @allyoucanmap.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');

const {OPEN_EDITOR, LOADING, TOGGLE, ERROR} = require('../actions/editor');

function editor(state = null, action) {
    switch (action.type) {
        case OPEN_EDITOR:
            return assign({}, state, {open: action.open});
        case LOADING:
            return assign({}, state, {[action.name]: action.enabled});
        case TOGGLE:
            return assign({}, state, {[action.name]: action.enabled});
        case ERROR:
            return assign({}, state, {[action.name]: action.enabled});
        default:
            return state;
    }
}

module.exports = editor;
