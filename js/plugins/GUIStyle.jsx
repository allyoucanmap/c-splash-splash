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
const assign = require('object-assign');
const less = require('less');
const {isEqual} = require('lodash');
const requireLess = require.context('raw-loader!../../assets/themes/txt/', true, /\.txt$/);
const { SketchPicker } = require('react-color');
const {toggleEditor} = require('../actions/editor');

const lessStyle = requireLess.keys().reduce((str, key) => {
    return str + requireLess(key);
}, '');

const Row = require('../components/rows');

const params = {
    '@a-bg-color': {name: 'color'},
    '@a-br-color': {name: 'color'},
    '@a-sm-size': {name: 'slider', props: {min: 20, max: 30}}
};

const bg = 'overflow: hidden;\n position: absolute;\n left: 0;\n top: 0;\n width: 100%;\n height: 100%;\n margin: 0;\n background-color: @a-bg-color;\n font-family: monospace;\n';

const defaulVariables = {
    '@a-bg-color': '#032f2b',
    '@a-tx-color': 'contrast(@a-bg-color)',
    '@a-br-color': '#098f83',
    '@a-bg-map-color': '#f2f2f2',
    '@a-sm-size': '20px',
    '@a-md-size': '@a-sm-size * 2',
    '@a-bg-size': '@a-sm-size * 3',
    '@a-side': '@a-md-size * 7'
};

class GUIStyle extends React.Component {

    static propTypes = {
        bodyClass: PropTypes.string,
        enabled: PropTypes.bool,
        onToggle: PropTypes.func
    };

    static defaultProps = {
        bodyClass: 'c-splash-splash',
        enabled: false,
        onToggle: () => {}
    };

    state = {
        variables: {}
    }

    componentWillMount() {
        if (!document.getElementById('_a-style')) {
            const style = document.createElement('style');
            style.setAttribute('id', '_a-style');
            document.head.appendChild(style);
            less.render(this.getLess(this.state.variables)).then(out => {
                style.innerHTML = out.css;
            });
        }

        this.setState({
            variables: assign({}, defaulVariables)
        });
    }

    componentWillUpdate(newProps, newState) {
        if (!isEqual(this.state.variables, newState.variables)) {
            const style = document.getElementById('_a-style');
            if (style) {
                less.render(this.getLess(newState.variables)).then(out => {
                    style.innerHTML = out.css;
                });
            }
        }
    }

    onClick = (type, group, id, param) => {
        switch (type) {
            case 'color':
                this.setState({
                    key: param.key,
                    color: param.value,
                    colorPicker: true
                });
            break;
            default:
            break;
        }
    }

    onChange = (type, group, id, param) => {
        switch (type) {
            case 'text':
            this.setState({
                variables: assign({}, this.state.variables, {[param.key]: Math.floor(param.value) + 'px' })
            });
            break;
            default:
            break;
        }
    }

    getLess = (v) => {
        return '.' + this.props.bodyClass + ' {\n' + bg + (this.getVariables(v)) + lessStyle + '\n}';
    }

    getVariables = (v) => {
        const variables = assign({}, defaulVariables, v);
        return Object.keys(variables).reduce((a, b) => {
            return a + b + ':' + variables[b] + ';\n';
        }, '');
    }

    renderColorPicker() {
        return this.state.colorPicker && (
            <div
                className="a-hover"
                onClick={(e) => {
                    if (e.target.getAttribute('class') === 'a-flex') {
                        this.setState({
                            variables: assign({}, this.state.variables, {[this.state.key]: this.state.color }),
                            key: null,
                            color: null,
                            colorPicker: false
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

    render() {
        return this.props.enabled && (
            <div className="a-gui" onClick={e => {
                if (e.target && e.target.getAttribute('class') === 'a-gui') {
                    this.props.onToggle();
                }
            }}>
            <div className="a-editor">
                <div className="a-container">
                {Object.keys(params).map((p, i)=> {
                    const Field = params[p] && params[p].name ? Row[params[p].name] : Row.text;
                    const props = params[p] && params[p].props || {};
                    return (<Field
                        key={i}
                        group={'gui-style'}
                        id={p}
                        param={{key: p, value: this.state.variables[p] || defaulVariables[p]}}
                        {...props}
                        onChange={this.onChange}
                        onClick={this.onClick}/>);
                })}
                </div>
                {this.renderColorPicker()}
            </div>
            </div>
        ) || null;
    }
}
const guiStyleSelector = createSelector([
        state => state.editor && state.editor.gui
    ], (enabled) => ({
        enabled
    })
);

const GUIStylePlugin = connect(guiStyleSelector, {
    onToggle: toggleEditor.bind(null, 'gui', false)
})(GUIStyle);

module.exports = {
    GUIStylePlugin
};
