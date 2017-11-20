const React = require('react');
const PropTypes = require('prop-types');

class SelectOptions extends React.Component {

    static propTypes = {
        selected: PropTypes.string,
        options: PropTypes.array,
        onChange: PropTypes.func
    };

    static defaultProps = {
        selected: '',
        options: [],
        onChange: () => {}
    };

    state = {};

    componentWillMount() {
        this.setState({ selected: this.props.selected});
    }

    componentWillUpdate(newProps) {
        if (this.props.selected !== newProps.selected) {
            this.setState({ selected: newProps.selected});
        }
    }

    getOptions = () => {
        return this.props.options.map((option, i) => {
            return (option !== this.state.selected && <li key={i} onClick={() => {
                this.setState({ selected: option, showOptions: false});
                this.props.onChange(option);
            }}>{option}</li>);
        });
    };

    render() {
        const open = this.state.showOptions && ' a-open' || '';
        return (
            <div className={"a-field a-select" + open}>
                <div onClick={() => { this.setState({ showOptions: !this.state.showOptions}); this.props.onChange(this.state.selected); }}>{this.state.selected}</div>
                {this.state.showOptions && <ul>{this.getOptions()}</ul>}
            </div>
        );
    }
}

module.exports = SelectOptions;
