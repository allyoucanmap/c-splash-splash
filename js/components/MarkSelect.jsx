/*
 * Copyright 2017, Stefano Bovio @allyoucanmap.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');

class MarkSelect extends React.Component {

    static propTypes = {
        marks: PropTypes.array,
        mark: PropTypes.string,
        onUpdate: PropTypes.func
    };

    static defaultProps = {
        marks: [
            {mark: 'square', code: 'Q'},
            {mark: 'circle', code: 'C'},
            {mark: 'triangle', code: 'T'},
            {mark: 'star', code: 'S'},
            {mark: 'cross', code: 'P'},
            {mark: 'x', code: 'X'},

            {mark: 'vertline', code: 'L'},
            {mark: 'horline', code: 'H'},
            {mark: 'slash', code: 'A'},
            {mark: 'backslash', code: 'B'},
            {mark: 'dot', code: 'O'},
            {mark: 'plus', code: 'G'},
            {mark: 'times', code: 'F'},
            {mark: 'oarrow', code: 'R'},
            {mark: 'carrow', code: 'Y'},

            {mark: 'triangle-ext', code: 'W'},
            {mark: 'emicircle', code: 'E'},
            {mark: 'triangleemicircle', code: 'K'}
        ],
        mark: '',
        onUpdate: () => {}
    };

    componentWillMount() {
        this.setState({
            selected: this.props.mark
        });
    }

    render() {
        return (<div className="a-mark-select">
            {this.props.marks.map((m, i) => {
                const selected = m.mark === this.state.selected && ' selected' || '';
                return (<div key={i} title={m.mark} className={'a-btn' + selected} onClick={() => {
                    this.props.onUpdate(m.mark);
                    this.setState({
                        selected: m.mark
                    });
                }}><span>{m.code}</span></div>);
            })}
        </div>);
    }
}

module.exports = MarkSelect;
