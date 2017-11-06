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
const {openEditor} = require('../actions/editor');
const {toggle} = require('../actions/map');
const {activateCode} = require('../actions/code');
const SwitchButton = require('../components/SwitchButton');
const FileSaver = require('file-saver');

const types = [
    {ext: 'sld', type: 'application/xml'},
    {ext: 'json', type: 'application/json'},
    {ext: 'css', type: 'text/plain;charset=utf-8'}
];

class Header extends React.Component {

    static propTypes = {
        layerName: PropTypes.string,
        onSwitch: PropTypes.func,
        onToggle: PropTypes.func,
        onToggleBackgrounds: PropTypes.func,
        onToggleStart: PropTypes.func,
        onClear: PropTypes.func,
        loading: PropTypes.bool,
        sld: PropTypes.string,
        json: PropTypes.string,
        css: PropTypes.string
    };

    static defaultProps = {
        onSwitch: () => {},
        onToggle: () => {},
        onToggleBackgrounds: () => {},
        onToggleStart: () => {},
        onClear: () => {},
        loading: false,
        sld: '',
        json: '',
        css: ''
    };

    state = {
        type: 0
    }

    render() {
        const loading = this.props.loading ? ' loading' : '';
        return (
            <span>
                {this.props.sld && this.state.save && <div className="a-save" onClick={e => {
                    if (e.target && e.target.getAttribute('class') === 'a-save') {
                        this.setState({ save: false });
                    }
                }}>
                    <div className="a-save-container">
                        <div className="a-title">download <strong>{this.props.layerName}<span className="a-ext" onClick={() => {
                            this.setState({ type: this.state.type === 2 ? 0 : this.state.type + 1 });
                        }}>{'.' + types[this.state.type].ext}</span></strong> style</div>
                        <div className="a-group">
                            <div className="a-btn a-sm" onClick={() => {
                                const sld = new Blob([this.props[types[this.state.type].ext]], {type: types[this.state.type].type});
                                FileSaver.saveAs(sld, this.props.layerName + '.' + types[this.state.type].ext);
                                this.setState({ save: false });
                            }}><span>Y</span></div>
                            <div className="a-btn a-sm" onClick={() => {
                                this.setState({ save: false });
                            }}><span>N</span></div>
                        </div>
                    </div>
                </div>}
                <div className="a-top-bar" >
                    <SwitchButton onSwitch={enabled => { this.props.onSwitch(enabled); }}/>
                    <div className={'a-h-title' + loading} onClick={() => {
                        this.props.onToggle('startEnabled', true);
                        this.props.onClear();
                    }}>C<span>~</span><span>~</span></div>
                    {/*<div className="a-btn a-sm" onClick={() => {}} ><span>{'!'}</span></div>*/}
                    {this.props.sld && <div className="a-btn a-sm" onClick={() => { this.setState({ save: true }); }} ><span>{'$'}</span></div>}
                    <div className="a-btn a-sm" onClick={() => {
                        this.props.onToggle('listEnabled', true);
                        this.props.onClear();
                    }} ><span>{'#'}</span></div>
                    <input disabled value={this.props.layerName} placeholder="layer"/>
                </div>
            </span>
        );
    }
}

const headerSelector = createSelector([

        state => state.map && state.map.layer && state.map.layer.name || '',
        state => state.map && state.map.loading,
        state => state.code,
        state => state.map && state.map.layer && state.map.layer.url || ''
    ], (layerName, loading, code, url) => ({
        layerName,
        loading,
        sld: code[url + ':' + layerName] && code[url + ':' + layerName].sld || '',
        json: code[url + ':' + layerName] && code[url + ':' + layerName].json && JSON.stringify(code[url + ':' + layerName].json, null, '\t') || '',
        css: code[url + ':' + layerName] && code[url + ':' + layerName].css || ''
    })
);

const HeaderPlugin = connect(headerSelector, {
    onSwitch: openEditor,
    onToggle: toggle,
    onClear: activateCode
})(Header);

module.exports = {
    HeaderPlugin
};
