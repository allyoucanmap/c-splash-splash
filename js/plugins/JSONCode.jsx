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

require('codemirror/mode/javascript/javascript');

let update = 0;

class JSONCode extends React.Component {

    static propTypes = {
        enabled: PropTypes.bool,
        json: PropTypes.object,
        onFocus: PropTypes.func,
        onChange: PropTypes.func,
        layerName: PropTypes.string,
        url: PropTypes.string
    };

    static defaultProps = {
        enabled: true,
        json: {},
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
            <div className={"a-json-code a-code" + (this.props.enabled ? ' enabled' : '')}>
                <Codemirror
                    key={'json-' + update}
                    value={this.props.json && JSON.stringify(this.props.json, null, '\t') || ''}
                    onFocusChange={enabled => {
                        if (enabled) {
                            this.props.onFocus('json');
                        }
                    }}
                    onChange={(json) => {
                        try {
                            this.props.onChange('json', JSON.parse(json), this.props.layerName, this.props.url);
                        } catch(e) {
                            /* */
                        }
                    }}
                    options={{
                        mode: {name: "javascript"},
                        lineNumbers: true,
                        lineWrapping: true,
                        readOnly: !this.props.enabled
                    }}/>
            </div>
        );
    }
}

const jsonCodeSelector = createSelector([
        state => state.code,
        state => state.code && state.code.enabled && state.code.enabled.json,
        state => state.map && state.map.layer && state.map.layer.name || '',
        state => state.map && state.map.layer && state.map.layer.url || ''
    ], (code, enabled, layerName, url) => ({
        json: code[url + ':' + layerName] && code[url + ':' + layerName].json || {},
        enabled,
        layerName,
        url
    })
);

const JSONCodePlugin = connect(jsonCodeSelector, {
    onChange: updateCode,
    onFocus: activateCode
})(JSONCode);

module.exports = {
    JSONCodePlugin,
    reducers: {}
};
