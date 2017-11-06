/*
 * Copyright 2017, Stefano Bovio @allyoucanmap.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const Slider = require('react-nouislider');
const {isArray} = require('lodash');

class SliderRow extends React.Component {

    static propTypes = {
        group: PropTypes.string,
        id: PropTypes.string,
        param: PropTypes.object,
        min: PropTypes.number,
        max: PropTypes.number,
        onChange: PropTypes.func
    };

    static defaultProps = {
        group: '',
        id: '',
        param: {},
        min: 0,
        max: 1,
        onChange: () => {}
    };

    render() {
        return !isArray(this.props.param.value) ? (
            <div className="a-component">
                <div className="a-field a-param">{this.props.param.key}</div>
                <div className="a-field a-slider">
                    <Slider start={[parseFloat(this.props.param.value)]} range={{min: this.props.min, max: this.props.max}} onChange={(value) => {
                        this.props.onChange('text', this.props.group, this.props.id, { key: this.props.param.key, value: value[0]});
                    }}/>
                </div>
            </div>
        ) : (<span>
            {this.props.param.value.map((v, i) => {
                return (
                    <div key={i} className="a-component">
                        <div className="a-field a-param">{i === 0 && this.props.param.key}</div>
                        <div className="a-field a-slider">
                            <Slider start={[parseFloat(v)]} range={{min: this.props.min, max: this.props.max}} onChange={(value) => {
                                this.props.onChange('text', this.props.group, this.props.id, { key: this.props.param.key, value: value[0]}, i);
                            }}/>
                        </div>
                    </div>
                );
            })}
        </span>);
    }
}

module.exports = SliderRow;
