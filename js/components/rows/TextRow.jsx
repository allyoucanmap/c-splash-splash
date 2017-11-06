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

class TextRow extends React.Component {

    static propTypes = {
        group: PropTypes.string,
        id: PropTypes.string,
        param: PropTypes.object,
        onChange: PropTypes.func
    };

    static defaultProps = {
        group: '',
        id: '',
        param: {},
        onChange: () => {}
    };

    render() {
        return !isArray(this.props.param.value) ? (
            <div className="a-component">
                <div className="a-field a-param">{this.props.param.key}</div>
                <div className="a-field a-text">
                    <input value={this.props.param.value} onChange={(e) => { this.props.onChange('text', this.props.group, this.props.id, { key: this.props.param.key, value: e.target.value}); }}/>
                </div>
            </div>
        ) : (<span>
            {this.props.param.value.map((v, i) => {
                return (
                    <div key={i} className="a-component">
                        <div className="a-field a-param">{i === 0 && this.props.param.key}</div>
                        <div className="a-field a-text">
                            <input value={v} onChange={(e) => { this.props.onChange('text', this.props.group, this.props.id, { key: this.props.param.key, value: e.target.value}, i); }}/>
                        </div>
                    </div>
                );
            })}
        </span>);
    }
}

module.exports = TextRow;
