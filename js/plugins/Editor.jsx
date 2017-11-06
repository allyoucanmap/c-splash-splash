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
const {isString, isObject, isArray} = require('lodash');
const assign = require('object-assign');
const ReactCSSTransitionGroup = require('react-addons-css-transition-group');
const { SketchPicker } = require('react-color');
const {updateCode, activateCode} = require('../actions/code');
const Row = require('../components/rows');
const DrawWKT = require('../components/DrawWKT');
const MarkSelect = require('../components/MarkSelect');

const params = {
    'max-scale': {name: 'text'},
    'min-scale': {name: 'text'},

    'fill': {name: 'color'},
    'fill-opacity': {name: 'slider', props: {min: 0, max: 1}},
    'stroke': {name: 'color'},
    'stroke-width': {name: 'slider', props: {min: 0, max: 10}},

    'size': {name: 'slider', props: {min: 0, max: 50}},
    'opacity': {name: 'slider', props: {min: 0, max: 1}},
    'rotation': {name: 'slider', props: {min: 0, max: 360}},

    'mark': {name: 'mark'},
    'mark-fill': {name: 'color'},
    'mark-fill-opacity': {name: 'slider', props: {min: 0, max: 1}},
    'mark-stroke': {name: 'color'},
    'mark-stroke-width': {name: 'slider', props: {min: 0, max: 10}},
    'mark-size': {name: 'slider', props: {min: 0, max: 50}},
    'mark-opacity': {name: 'slider', props: {min: 0, max: 1}},
    'mark-rotation': {name: 'slider', props: {min: 0, max: 360}}
};

const replaceValue = (json, group, id, key, value, pos) => {
    return Object.keys(assign({}, json)).reduce((gg, g) => {
        if (group === g && isObject(json[g])) {
            return assign({}, gg, { [g]: Object.keys(json[g]).reduce((ii, i) => {
                if (id === i && isObject(json[g][i])) {
                    return assign({}, ii, {[i]: Object.keys(json[g][i]).reduce((a, k) => {
                        if (key === k) {
                            const v = isArray(json[g][i][k]) ? json[g][i][k].map((j, ps) => pos === ps ? value : j) : value;
                            return assign({}, a, {[k]: v});
                        }
                        return assign({}, a, {[k]: json[g][i][k]});
                    }, {})});
                }
                return assign({}, ii, {[i]: json[g][i]});
            }, {})});
        }
        return assign({}, gg, {[g]: json[g]});
    }, {});
};

class Editor extends React.Component {

    static propTypes = {
        enabled: PropTypes.bool,
        json: PropTypes.object,
        onChange: PropTypes.func,
        onFocus: PropTypes.func,
        layerName: PropTypes.string,
        url: PropTypes.string
    };

    static defaultProps = {
        enabled: false,
        json: {},
        onChange: () => {},
        onFocus: () => {},
        layerName: '',
        url: ''
    };

    state = {

    }

    onChange = (type, group, id, param, i) => {
        switch (type) {
            case 'text':
                this.props.onChange('json', replaceValue(this.props.json, group, id, param.key, param.value, i), this.props.layerName, this.props.url);
            break;
            default:
            break;
        }
    }

    onClick = (type, group, id, param, i) => {
        switch (type) {
            case 'color':
                this.setState({
                    group,
                    id,
                    key: param.key,
                    color: param.value,
                    colorPicker: true,
                    i
                });
            break;
            case 'wkt':
                this.setState({
                    group,
                    id,
                    key: param.key,
                    wkt: param.value,
                    drawWKT: true,
                    i
                });
            break;
            case 'mark':
                this.setState({
                    group,
                    id,
                    key: param.key,
                    mark: param.value,
                    selectMark: true,
                    i
            });
            break;
            default:
            break;
        }
    }

    renderColorPicker() {
        return this.state.colorPicker && (
            <div
                className="a-hover"
                onClick={(e) => {
                    if (e.target.getAttribute('class') === 'a-flex') {
                        this.props.onChange('json', replaceValue(this.props.json, this.state.group, this.state.id, this.state.key, this.state.color, this.state.i), this.props.layerName, this.props.url);
                        this.setState({
                            group: null,
                            id: null,
                            key: null,
                            color: null,
                            colorPicker: false,
                            i: null
                        });
                    }
                }}>
                <div className="a-flex">
                    <SketchPicker
                        color={this.state.color}
                        onChange={(color) => {
                            this.setState({
                                color: color.hex
                            });
                        }}/>
            </div>
        </div>);
    }

    renderWKT() {
        return this.state.drawWKT && (
            <div
                className="a-hover"
                onClick={(e) => {
                    if (e.target.getAttribute('class') === 'a-flex') {
                        this.props.onChange('json', replaceValue(this.props.json, this.state.group, this.state.id, this.state.key, this.state.wkt, this.state.i), this.props.layerName, this.props.url);
                        this.setState({
                            group: null,
                            id: null,
                            key: null,
                            wkt: null,
                            drawWKT: false,
                            i: null
                        });
                    }
                }}>
                <div className="a-flex">
                    <DrawWKT wkt={this.state.wkt} onUpdate={(g, wkt) => {
                        this.setState({
                            wkt: 'wkt[' + wkt + ']'
                        });
                    }}/>
            </div>
        </div>);
    }

    renderMark() {
        return this.state.selectMark && (
            <div
                className="a-hover"
                onClick={(e) => {
                    if (e.target.getAttribute('class') === 'a-flex') {
                        this.props.onChange('json', replaceValue(this.props.json, this.state.group, this.state.id, this.state.key, this.state.mark, this.state.i), this.props.layerName, this.props.url);
                        this.setState({
                            group: null,
                            id: null,
                            key: null,
                            mark: null,
                            selectMark: false,
                            i: null
                        });
                    }
                }}>
                <div className="a-flex">
                    <MarkSelect mark={this.state.mark} onUpdate={mark => {
                        this.setState({
                            mark
                        });
                    }}/>
            </div>
        </div>);
    }

    render() {
        const json = assign({}, this.props.json);
        return (
            <ReactCSSTransitionGroup
                transitionName="a-editor-transition"
                transitionEnterTimeout={300}
                transitionLeaveTimeout={300}>
                {this.props.enabled &&
                    <div
                        key="editor"
                        className="a-editor"
                        onClick={() => {
                            this.props.onFocus();
                        }}>
                        {Object.keys(json).map(group => {
                            return !isString(json[group]) && Object.keys(json[group]).map(id => {
                                return (<div className="a-container">
                                    <div className="a-component"><div className="a-title"><strong>{id}</strong></div></div>
                                    {Object.keys(json[group][id]).map((k, idx) => {
                                        const name = params[k] && params[k].name;
                                        const Field = name ? Row[params[k].name] : Row.text;
                                        const props = params[k] && params[k].props || {};
                                        return params[k] && params[k].name !== 'filter' && (<Field
                                            key={idx}
                                            group={group}
                                            id={id}
                                            param={{key: k, value: json[group][id][k]}}
                                            {...props}
                                            onChange={(_type, _group, _id, _param, _i) => {
                                                this.onChange(_type, _group, _id, _param, _i);
                                                this.props.onFocus();
                                            }}
                                            onClick={(_type, _group, _id, _param, _i) => {
                                                this.onClick(_type, _group, _id, _param, _i);
                                                this.props.onFocus();
                                            }}/>);
                                    })}
                                </div>);
                            });
                        })}
                        {this.renderColorPicker()}
                        {this.renderWKT()}
                        {this.renderMark()}
                    </div>
                }
            </ReactCSSTransitionGroup>
        );
    }
}

const editorSelector = createSelector([
        state => state.editor && state.editor.open,
        state => state.code,
        state => state.map && state.map.layer && state.map.layer.name || '',
        state => state.map && state.map.layer && state.map.layer.url || ''
    ], (enabled, code, layerName, url) => ({
        enabled,
        json: code[url + ':' + layerName] && code[url + ':' + layerName].json || {},
        layerName,
        url
    })
);

const EditorPlugin = connect(editorSelector, {
    onChange: updateCode,
    onFocus: activateCode
})(Editor);

module.exports = {
    EditorPlugin,
    reducers: {
        editor: require('../reducers/editor')
    }
};
