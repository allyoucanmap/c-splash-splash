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
const {updateCode, activateCode} = require('../actions/code');
const Codemirror = require('react-codemirror');

require('../lib/css');

let update = 0;

class CSSCode extends React.Component {

    static propTypes = {
        enabled: PropTypes.bool,
        onChange: PropTypes.func,
        onFocus: PropTypes.func,
        css: PropTypes.string,
        layerName: PropTypes.string,
        url: PropTypes.string
    };

    static defaultProps = {
        enabled: true,
        onChange: () => {},
        onFocus: () => {},
        css: '',
        layerName: '',
        url: ''
    };

    state = {}

    componentWillUpdate(newProps) {
        if (this.props.layerName === '' && newProps.layerName !== '') {
            update++;
        }
    }

    render() {
        if (!this.props.enabled) {
            update++;
        }
        return (
            <div className={"a-css-code a-code" + (this.props.enabled ? ' enabled' : '')}>
                <Codemirror
                    key={'css-' + update}
                    value={this.props.css || this.props.layerName && '@layer: ' + this.props.layerName + ';' || ''}
                    onChange={(css) => {
                        this.props.onChange('css', css, this.props.layerName, this.props.url);
                    }}
                    onFocusChange={enabled => {
                        if (enabled) {
                            this.props.onFocus('css');
                        }
                    }}
                    options={{
                        mode: {name: "css"},
                        lineNumbers: true,
                        // lineWrapping: true,
                        readOnly: !this.props.enabled
                    }}/>
            </div>
        );
    }
}

const cssCodeSelector = createSelector([
        state => state.code,
        state => state.code && state.code.enabled && state.code.enabled.css,
        state => state.map && state.map.layer && state.map.layer.name || '',
        state => state.map && state.map.layer && state.map.layer.url || ''
    ], (code, enabled, layerName, url) => ({
        css: code[url + ':' + layerName] && code[url + ':' + layerName].css || '',
        enabled,
        layerName,
        url
    })
);

const CSSCodePlugin = connect(cssCodeSelector, {
    onChange: updateCode,
    onFocus: activateCode
})(CSSCode);

module.exports = {
    CSSCodePlugin,
    reducers: {
        code: require('../reducers/code')
    }
};
