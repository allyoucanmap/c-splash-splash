/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
    plugins: {
        HeaderPlugin: require('./plugins/Header'),
        MapPlugin: require('./plugins/Map'),
        CSSCodePlugin: require('./plugins/CSSCode'),
        JSONCodePlugin: require('./plugins/JSONCode'),
        SLDCodePlugin: require('./plugins/SLDCode'),
        EditorPlugin: require('./plugins/Editor'),
        LayersListPlugin: require('./plugins/LayersList'),
        StartPlugin: require('./plugins/Start'),
        GUIStylePlugin: require('./plugins/GUIStyle'),
        FooterPlugin: require('./plugins/Footer')
    },
    requires: {}
};
