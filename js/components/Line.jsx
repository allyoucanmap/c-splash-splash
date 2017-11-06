/*
 * Copyright 2017, Stefano Bovio @allyoucanmap.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');

const dragSource = require('react-dnd').DragSource;
const dropTarget = require('react-dnd').DropTarget;

const lineSource = {
    beginDrag: function(props) {
        return {
            line: props.line
        };
    }
};

const lineTarget = {
    drop: function(props, monitor) {
        const line = monitor.getItem().line;
        if (line.id !== props.line.id) {
            props.onSort(props.line.id, line);
        }
    }
};

const sourceCollect = function(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
};

const targetCollect = function(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    };
};

class Component extends React.Component {
    static propTypes = {
        line: PropTypes.object,
        selected: PropTypes.bool,
        isDraggable: PropTypes.bool,
        isOver: PropTypes.bool,
        isDragging: PropTypes.bool,
        onSort: PropTypes.func,
        onClick: PropTypes.func,
        onSelect: PropTypes.func,
        connectDragSource: PropTypes.func,
        connectDropTarget: PropTypes.func
    };

    static defaultProps = {
        line: {},
        selected: false,
        isDraggable: true,
        onSort: () => {},
        onClick: () => {},
        onSelect: () => {}
    };

    render() {
        const connectDragSource = this.props.connectDragSource;
        const connectDropTarget = this.props.connectDropTarget;

        const dragging = this.props.isDragging ? ' dragging' : '';
        const over = this.props.isOver ? ' over' : '';
        const selected = this.props.line.selected ? ' selected' : '';
        const toggled = this.props.line.toggled ? ' toggled' : '';
        return this.props.isDraggable ? connectDragSource(connectDropTarget(
            <div className={"a-item" + dragging + over + selected + toggled}>
                {!selected && <div className="a-btn a-sm" onClick={() => { this.props.onClick(this.props.line); }}><span>{toggled ? 'X' : ''}</span></div>}
                <div className="a-line-text" onClick={() => { this.props.onSelect(this.props.line); }}>{this.props.line.name}</div>
            </div>
        )) : (
            <div className={"a-item" + dragging + over + selected + toggled}>
                {!selected && <div className="a-btn a-sm" onClick={() => { this.props.onClick(this.props.line); }}><span>{toggled ? 'X' : ''}</span></div>}
                <div className="a-line-text" onClick={() => { this.props.onSelect(this.props.line); }}>{this.props.line.name}</div>
            </div>
        );
    }
}

const LineTarget = dropTarget('row', lineTarget, targetCollect)(Component);
const Line = dragSource('row', lineSource, sourceCollect)(LineTarget);

module.exports = Line;
