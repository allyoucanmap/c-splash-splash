/*
 * Copyright 2017, Stefano Bovio @allyoucanmap.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const Line = require('./Line');

const dragDropContext = require('react-dnd').DragDropContext;
const html5Backend = require('react-dnd-html5-backend');

class List extends React.Component {
    static propTypes = {
        lines: PropTypes.array,
        onSort: PropTypes.func,
        onClick: PropTypes.func,
        onSelect: PropTypes.func,
        isDraggable: PropTypes.bool
    };

    static defaultProps = {
        lines: [],
        onSort: () => {},
        onClick: () => {},
        onSelect: () => {},
        isDraggable: true
    };

    render() {
        return (
            <span>
                {this.props.lines.map((line, i) => {
                    return (
                        <Line
                            onSort={this.props.onSort}
                            line={line}
                            key={i}
                            sortData={i}
                            isDraggable={this.props.isDraggable}
                            onClick={this.props.onClick}
                            onSelect={this.props.onSelect}/>
                    );
                })}
            </span>
        );
    }
}

module.exports = dragDropContext(html5Backend)(List);
