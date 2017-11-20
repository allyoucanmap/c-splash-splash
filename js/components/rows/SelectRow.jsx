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
const SelectOptions = require('../SelectOptions');

class SelectRow extends React.Component {

    static propTypes = {
        group: PropTypes.string,
        id: PropTypes.string,
        param: PropTypes.object,
        options: PropTypes.array,
        onChange: PropTypes.func
    };

    static defaultProps = {
        group: '',
        id: '',
        param: {},
        options: [],
        onChange: () => {}
    };

    state = {};

    render() {
        return !isArray(this.props.param.value) ? (
            <div className="a-component">
                <div className="a-field a-param">{this.props.param.key}</div>
                <SelectOptions
                    selected={this.props.param.value}
                    options={this.props.options}
                    onChange={value => {
                        this.props.onChange('text', this.props.group, this.props.id, { key: this.props.param.key, value});
                    }}/>

            </div>
        ) : (<span>
            {this.props.param.value.map((v, i) => {
                return (
                    <div key={i} className="a-component">
                        <div className="a-field a-param">{i === 0 && this.props.param.key}</div>
                        <SelectOptions
                            selected={v}
                            options={this.props.options}
                            onChange={value => {
                                this.props.onChange('text', this.props.group, this.props.id, { key: this.props.param.key, value});
                            }}/>
                    </div>
                );
            })}
        </span>);
    }
}

module.exports = SelectRow;
