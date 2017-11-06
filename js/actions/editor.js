/*
 * Copyright 2017, Stefano Bovio @allyoucanmap.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const OPEN_EDITOR = 'EDITOR:OPEN_EDITOR';
const LOADING = 'EDITOR:LOADING';
const TOGGLE = 'EDITOR:TOGGLE';
const ERROR = 'EDITOR:ERROR';

function openEditor(open) {
    return {
        type: OPEN_EDITOR,
        open
    };
}

function toggleEditor(name, enabled) {
    return {
        type: TOGGLE,
        name,
        enabled
    };
}

function loading(name, enabled) {
    return {
        type: LOADING,
        name,
        enabled
    };
}

function error(name, enabled) {
    return {
        type: ERROR,
        name,
        enabled
    };
}

module.exports = {
    OPEN_EDITOR,
    LOADING,
    ERROR,
    TOGGLE,
    openEditor,
    loading,
    error,
    toggleEditor
};
