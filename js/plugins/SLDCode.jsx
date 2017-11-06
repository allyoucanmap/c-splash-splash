/*
 * Copyright 2017, Stefano Bovio @allyoucanmap.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {createSelector} = require('reselect');
const {connect} = require('react-redux');
const Codemirror = require('react-codemirror');
const {activateCode, updateCode} = require('../actions/code');

require('codemirror/mode/xml/xml');

let update = 0;

class SLDCode extends React.Component {

    static propTypes = {
        enabled: PropTypes.bool,
        sld: PropTypes.string,
        onFocus: PropTypes.func,
        onChange: PropTypes.func,
        layerName: PropTypes.string,
        url: PropTypes.string
    };

    static defaultProps = {
        enabled: true,
        sld: '',
        onFocus: () => {},
        onChange: () => {},
        layerName: '',
        url: ''
    };

    render() {
        if (!this.props.enabled) {
            update++;
        }
        return (
            <div className={"a-sld-code a-code" + (this.props.enabled ? ' enabled' : '')}>
                <Codemirror
                    key={'sld-' + update}
                    value={this.props.sld || ''}
                    onFocusChange={enabled => {
                        if (enabled) {
                            this.props.onFocus('sld');
                        }
                    }}
                    onChange={(sld) => {
                        this.props.onChange('sld', sld, this.props.layerName, this.props.url);
                    }}
                    options={{
                        mode: {name: "xml"},
                        lineNumbers: true,
                        lineWrapping: true,
                        readOnly: !this.props.enabled
                    }}/>
            </div>
        );
    }
}

const sldCodeSelector = createSelector([
        state => state.code,
        state => state.code && state.code.enabled && state.code.enabled.sld,
        state => state.map && state.map.layer && state.map.layer.name || '',
        state => state.map && state.map.layer && state.map.layer.url || ''
    ], (code, enabled, layerName, url) => ({
        sld: code[url + ':' + layerName] && code[url + ':' + layerName].sld || '',
        enabled,
        layerName,
        url
    })
);

const SLDCodePlugin = connect(sldCodeSelector, {
    onChange: updateCode,
    onFocus: activateCode
})(SLDCode);

module.exports = {
    SLDCodePlugin,
    reducers: {}
};
