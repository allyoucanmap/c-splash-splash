/*
 * Copyright 2017, Stefano Bovio @allyoucanmap.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {isArray} = require('lodash');

class ColorRow extends React.Component {

    static propTypes = {
        group: PropTypes.string,
        id: PropTypes.string,
        param: PropTypes.object,
        onClick: PropTypes.func
    };

    static defaultProps = {
        group: '',
        id: '',
        param: {},
        onClick: () => {}
    };

    render() {
        return !isArray(this.props.param.value) ? (
            <div className="a-component">
                <div className="a-field a-param">{this.props.param.key}</div>
                <div className="a-field a-color"
                    style={{backgroundColor: this.props.param.value}}
                    onClick={() => { this.props.onClick('color', this.props.group, this.props.id, this.props.param); }}></div>
            </div>
        ) : (<span>
            {this.props.param.value.map((v, i) => {
                return (
                    <div key={i} className="a-component">
                        <div className="a-field a-param">{i === 0 && this.props.param.key}</div>
                        <div className="a-field a-color"
                            style={{backgroundColor: v}}
                            onClick={() => { this.props.onClick('color', this.props.group, this.props.id, {key: this.props.param.key, value: v}, i); }}></div>
                    </div>
                );
            })}
        </span>);
    }
}

module.exports = ColorRow;
