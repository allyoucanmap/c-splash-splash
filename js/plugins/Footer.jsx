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

class Footer extends React.Component {

    static propTypes = {
        zoom: PropTypes.number,
        scales: PropTypes.array,
        loading: PropTypes.bool
    };

    static defaultProps = {
        zoom: 0,
        scales: [],
        loading: false
    };

    render() {
        // const loading = this.props.loading ? ' loading' : '';
        return (
            <div className="a-bottom-bar">
                {/*<div className={'a-h-title' + loading}>C<span>~</span><span>~</span></div>*/}
                <div className="a-scale">
                    <div className="a-text">scale</div>
                    <input disabled value={this.props.scales[this.props.zoom] && '1 : ' + Math.round(this.props.scales[this.props.zoom]) || ''} placeholder="no scale"/>
                </div>
            </div>
        );
    }
}

const footerSelector = createSelector([
        state => state.map && state.map.zoom || 0,
        state => state.map && state.map.scales || [],
        state => state.map && state.map.loading
    ], (zoom, scales, loading) => ({
        zoom,
        scales,
        loading
    })
);

const FooterPlugin = connect(footerSelector)(Footer);

module.exports = {
    FooterPlugin,
    reducers: {}
};
