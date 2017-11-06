/*
 * Copyright 2017, Stefano Bovio @allyoucanmap.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const DrawWKT = require('../DrawWKT');
const {isArray} = require('lodash');

class MarkRow extends React.Component {

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

    getWKT = (value) => {
        return value.match(/wkt\[([^\]]+)\]/);
    }

    render() {
        return !isArray(this.props.param.value) ? (
            <div className="a-component">
                <div className="a-field a-param">{this.props.param.key}</div>
                {this.getWKT(this.props.param.value) ? <div className="a-field a-mark" onClick={() => { this.props.onClick('wkt', this.props.group, this.props.id, this.props.param); }}>
                     <DrawWKT readOnly side={15} wkt={this.getWKT(this.props.param.value)[1]}/> <span>wkt</span>
                </div> : <div className="a-field a-mark" onClick={() => { this.props.onClick('mark', this.props.group, this.props.id, this.props.param); }}>
                    {this.props.param.value}
                </div>}
            </div>
        ) : (<span>
            {this.props.param.value.map((v, i) => {
                const wkt = this.getWKT(v);
                return (
                    <div key={i} className="a-component">
                        <div className="a-field a-param">{i === 0 && this.props.param.key}</div>
                        {wkt ? <div className="a-field a-mark" onClick={() => { this.props.onClick('wkt', this.props.group, this.props.id, {key: this.props.param.key, value: v}, i); }}>
                                <DrawWKT readOnly side={15} wkt={wkt[1]}/> <span>wkt</span>
                        </div> : <div className="a-field a-mark" onClick={() => {
                            this.props.onClick('mark', this.props.group, this.props.id, {key: this.props.param.key, value: v}, i);
                        }}>
                            {v}
                        </div>}
                    </div>
                );
            })}
        </span>);
    }
}

module.exports = MarkRow;
