/*
 * Copyright 2017, Stefano Bovio @allyoucanmap.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const UPDATE_CODE = 'CODE:UPDATE_CODE';
const ACTIVATE_CODE = 'CODE:ACTIVATE_CODE';

function updateCode(language, code, layer, url) {
    return {
        type: UPDATE_CODE,
        language,
        code,
        layer,
        url
    };
}

function activateCode(code) {
    return {
        type: ACTIVATE_CODE,
        code
    };
}

module.exports = {
    UPDATE_CODE,
    ACTIVATE_CODE,
    updateCode,
    activateCode
};
