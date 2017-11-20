/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');

class SwitchButton extends React.Component {

    static propTypes = {
        checked: PropTypes.bool,
        onSwitch: PropTypes.func,
        rotate: PropTypes.bool
    };

    static defaultProps = {
        checked: false,
        onSwitch: () => {},
        rotate: false
    };

    componentWillMount() {
        this.setState({
            checked: this.props.checked
        });
    }

    render() {
        const rotate = this.props.rotate && ' rotate' || '';
        return (<label className={"a-switch-btn" + rotate}>
            <input type="checkbox"
                onChange={() => {
                    this.props.onSwitch(!this.state.checked);
                    this.setState({
                        checked: !this.state.checked
                    });
                }}
                checked={this.state.checked}
                />
            <span className="a-slider"/>
        </label>);
    }
}

module.exports = SwitchButton;
