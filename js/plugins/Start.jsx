/*
 * Copyright 2017, Stefano Bovio @allyoucanmap.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {connect} = require('react-redux');
const {setUrl} = require('../actions/map');
const {toggleEditor} = require('../actions/editor');

class Start extends React.Component {

    static propTypes = {
        url: PropTypes.string,
        loading: PropTypes.bool,
        enabled: PropTypes.bool,
        onStart: PropTypes.func,
        onToggle: PropTypes.func,
        error: PropTypes.string
    };

    static defaultProps = {
        url: '',
        loading: false,
        enabled: true,
        onStart: () => {},
        onToggle: () => {},
        error: ''
    };

    state = {
        url: ''
    }

    componentWillMount() {
        this.setState({
            url: this.props.url || 'http://localhost:8080/geoserver/ows'
        });
    }

    render() {
        const loading = this.props.loading && ' loading' || '';
        return this.props.enabled && (
            <div className="a-start">
                <div className={'a-start-form' + loading}>
                    {!this.props.error && <div className={'a-h-title' + loading} onClick={() => {
                        this.props.onToggle();
                    }}>C<span>~</span><span>~</span></div>}
                    {!this.props.error && <div className="a-desc">c splash splash | {loading ? 'loading...' : 'map style editor'}</div>}
                    {this.props.error && <div className="a-h-title error">C<span>!</span><span>!</span></div>}
                    {this.props.error && <div className="a-desc">c splash splash | <span className="error">{this.props.error}</span></div>}
                    <input
                        type="text"
                        value={this.state.url || ''}
                        placeholder="insert geoserver url..."
                        onChange={e => {
                            this.setState({
                                url: e.target.value
                            });
                        }}/>
                    <div className="a-btn" onClick={() => { this.props.onStart(this.state.url); }}><span>-></span></div>
                    <div className="a-desc"><a href="http://twitter.com/allyoucanmap">@allyoucanmap</a></div>
                </div>
            </div>
        );
    }
}

const StartPlugin = connect(state => {
    return {
        enabled: state.map && state.map.startEnabled,
        url: state.map && state.map.layer && state.map.layer.url || '',
        loading: state.editor && state.editor.loadingStart,
        error: state.editor && state.editor.errorStart
    };
}, {
    onStart: setUrl,
    onToggle: toggleEditor.bind(null, 'gui', true)
})(Start);

module.exports = {
    StartPlugin
};
