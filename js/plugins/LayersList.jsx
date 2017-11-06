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
const {createSelector} = require('reselect');
const {head} = require('lodash');
const {selectLayer, toggle, sortLayers, filterLayers} = require('../actions/map');
const List = require('../components/List');

class LayersList extends React.Component {

    static propTypes = {
        enabled: PropTypes.bool,
        layers: PropTypes.array,
        selected: PropTypes.string,
        bgLayers: PropTypes.array,
        onSelect: PropTypes.func,
        onClose: PropTypes.func,
        onSort: PropTypes.func,
        onFilter: PropTypes.func,
        filterText: PropTypes.string,
        url: PropTypes.string
    };

    static defaultProps = {
        enabled: false,
        layers: [],
        selected: '',
        bgLayers: [],
        onSelect: () => {},
        onClose: () => {},
        onSort: () => {},
        onFilter: () => {},
        filterText: '',
        url: ''
    };

    getHiglightedName = name => {
        if (!this.props.filterText) {
            return name.toLowerCase();
        }
        const splitName = name.toLowerCase().split(this.props.filterText);
        return splitName.reduce((a, b, i) => i < splitName.length - 1 ? [...a, <span key={i}>{b}</span>, <strong key={i + '_s'} >{this.props.filterText}</strong>] : [...a, <span key={i}>{b}</span>], []);
    }

    render() {
        const lines = this.props.layers.map((l, id) => {
            const selected = l.name === this.props.selected && l.url === this.props.url;
            const toggled = !selected && head(this.props.bgLayers.filter(b => b.name === l.name && b.url === l.url));
            return {id, name: this.getHiglightedName(l.name), selected, toggled, layer: l };
        });
        return this.props.enabled && (
            <div className="a-layer-list" onClick={e => {
                if (e.target.getAttribute('class') === 'a-layer-list') {
                    this.props.onClose();
                }
            }}>
                <div className="a-conatiner">
                    <div className="a-head">
                        <div className="a-title">
                            select layers
                        </div>
                        <input value={this.props.filterText || ''} placeholder="filter..." onChange={e => {
                            this.props.onFilter(e.target.value);
                        }}/>
                    </div>
                    <div className="a-body-scroll">
                        <List
                            isDraggable={!this.props.filterText}
                            lines={lines}
                            onSort={(target, current) => {
                                this.props.onSort(target, current);
                            }}
                            onSelect={l => {
                                this.props.onSelect(l.layer, true);
                            }}
                            onClick={l => {
                                this.props.onSelect(l.layer);
                            }}/>
                    </div>
                </div>
            </div>
        );
    }
}
const layersListSelector = createSelector([
        state => state.map && state.map.listEnabled,
        state => state.map && state.map.layers || [],
        state => state.map && state.map.layer && state.map.layer.name || '',
        state => state.map && state.map.selected || [],
        state => state.map && state.map.filterText || '',
        state => state.map && state.map.layer && state.map.layer.url || ''
    ], (enabled, layers, selected, bgLayers, filterText, url) => ({
        enabled,
        layers: layers.filter(l => l.name.match(filterText)),
        selected,
        bgLayers,
        filterText,
        url
    })
);

const LayersListPlugin = connect(layersListSelector, {
    onSelect: selectLayer,
    onClose: toggle.bind(null, 'listEnabled', false),
    onSort: sortLayers,
    onFilter: filterLayers
})(LayersList);

module.exports = {
    LayersListPlugin
};
