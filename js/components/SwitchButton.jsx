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
        onSwitch: PropTypes.func
    };

    static defaultProps = {
        checked: false,
        onSwitch: () => {}
    };

    componentWillMount() {
        this.setState({
            checked: this.props.checked
        });
    }

    render() {
        return (<label className="a-switch-btn">
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
