/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');

const ConfigUtils = require('../../MapStore2/web/client/utils/ConfigUtils');
const Page = require('../../MapStore2/web/client/containers/Page');

class Index extends React.Component {
    static propTypes = {
        name: PropTypes.string,
        mode: PropTypes.string,
        match: PropTypes.object,
        plugins: PropTypes.object
    };

    static defaultProps = {
        name: 'index',
        mode: 'desktop'
    };

    render() {
        const plugins = ConfigUtils.getConfigProp('plugins') || {};
        const pagePlugins = {
            desktop: plugins.common || [],
            mobile: plugins.common || []
        };
        const pluginsConfig = {
            desktop: plugins[this.props.name] || [],
            mobile: plugins[this.props.name] || []
        };

        return (
            <Page
                id="index"
                pagePluginsConfig={pagePlugins}
                pluginsConfig={pluginsConfig}
                plugins={this.props.plugins}
                params={this.props.match.params}/>);
    }
}

module.exports = Index;
