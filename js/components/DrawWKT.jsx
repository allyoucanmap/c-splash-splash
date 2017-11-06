/*
 * Copyright 2017, Stefano Bovio @allyoucanmap.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const PropTypes = require('prop-types');

const map = (val, v1, v2, v3, v4) => {
    return v3 + (v4 - v3) * ((val - v1) / (v2 - v1));
};

const inside = (p, a) => {
    let ins = false;
    for (let i = 0, j = a.length - 1; i < a.length; j = i++) {
        if (a[i][1] > p[1] !== a[j][1] > p[1] && p[0] < (a[j][0] - a[i][0]) * (p[1] - a[i][1]) / (a[j][1] - a[i][1]) + a[i][0]) {
            ins = !ins;
        }
    }
    return ins;
};

class DrawWKT extends React.Component {

    static propTypes = {
        side: PropTypes.number,
        type: PropTypes.string,
        wkt: PropTypes.string,
        readOnly: PropTypes.bool,
        onUpdate: PropTypes.func
    };

    static defaultProps = {
        side: 256,
        type: '',
        wkt: '',
        readOnly: false,
        onUpdate: () => {}
    };

    state = {
        a: [],
        b: [],
        multi: [],
        geometry: [],
        hover: -1
    };

    componentWillMount() {
        this.setState({
            geometry: this.getWKT(this.props.wkt, this.props.side)
        });
    }

    componentDidMount() {
        const domNode = ReactDOM.findDOMNode(this);
        this.setState({
            bBoxDOM: domNode && domNode.getBoundingClientRect ? domNode.getBoundingClientRect()
            : {bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0}
        });
    }

    componentWillUpdate(newProps) {
        if (newProps.wkt !== this.props.wkt) {
            this.setState({
                geometry: this.getWKT(newProps.wkt, newProps.side)
            });
        }
    }

    getWKT = (wkt, side) => {
        const isValid = wkt && wkt.match(/MULTIPOLYGON/) || null;
        if (isValid) {
            const geometryString = wkt
                .replace(/MULTIPOLYGON|wkt|\[|\]/g, '')
                .replace(/\(/g, '[')
                .replace(/\)/g, ']')
                .replace(/(-\d+\.?\d*|\d+\.?\d*) (-\d+\.?\d*|\d+\.?\d*)/g, '[$1, $2]');
            try {
                return JSON.parse(geometryString).map(g => {
                    return g.length && g.length > 0 && g[0].map(c => [map(c[0], -1, 1, 0, side), map(c[1], 1, -1, 0, side)] ) || null;
                }).filter(v => v);
            } catch (e) {
                return [];
            }
        }
        return [];
    }

    getData = (g) => {
        return g.reduce((a, b, i) => {
            if (i === 0) {
                return a + 'M' + b[0] + ' ' + b[1] + ' ';
            }
            if (i === g.length - 1) {
                return a + 'L' + b[0] + ' ' + b[1] + ' Z';
            }
            return a + 'L' + b[0] + ' ' + b[1] + ' ';
        }, '');
    }

    renderReadOnly = (edit) => {
        return (
            <svg>
                <rect width={this.props.side} height={this.props.side} style={{fill: '#333333'}}/>
                {this.state.geometry.length > 0 && this.state.geometry.map((g, i) =>
                    <path key={i} d={this.getData(g)} stroke="transparent" strokeDasharray={i === this.state.hover && !edit ? 5 : 0} strokeWidth="0" fill="#f2f2f2" fillOpacity="1"/>
                )}
            </svg>);
    }

    renderEditor = (edit, grid) => {
        return (<svg><rect width={this.props.side} height={this.props.side} style={{fill: '#333333'}}/>
        {grid.map((g, i) => <line key={i} x1={0} y1={this.props.side / 10 * g} x2={this.props.side} y2={this.props.side / 10 * g} style={{stroke: "#f2f2f2", strokeWidth: 0.1}}/>)}
        {grid.map((g, i) => <line key={i} x1={this.props.side / 10 * g} y1={0} x2={this.props.side / 10 * g} y2={this.props.side} style={{stroke: "#f2f2f2", strokeWidth: 0.1}}/>)}
        {this.state.a.length === 2 && <line x1={this.state.a[0]} y1={this.state.a[1]} x2={this.state.b[0]} y2={this.state.b[1]} style={{stroke: "#f2f2f2", strokeWidth: 2}}/>}
        {this.state.multi.length > 0 && <path d={this.getData([...this.state.multi, this.state.b])} stroke="#f2f2f2" strokeWidth="2" fill="#f2f2f2" fillOpacity="0.5"/>}
        {this.state.multi.length > 0 && this.state.multi.map((m, i) => (<rect key={i} x={m[0] - 4} y={m[1] - 4} width="8" height="8" style={{fill: 'rgba(255,255,255,0.1)', stroke: "#00ffff", strokeWidth: 1}} />))}
        {this.state.close && <rect x={this.state.b[0] - 8} y={this.state.b[1] - 8} width="16" height="16" style={{fill: 'rgba(255,255,255,0.1)', stroke: "#00ff00", strokeWidth: 1}} />}
        {this.state.geometry.length > 0 && this.state.geometry.map((g, i) => <path key={i} d={this.getData(g)} stroke={i === this.state.hover && !edit ? "#ff00ff" : "#f2f2f2"} strokeDasharray={i === this.state.hover && !edit ? 5 : 0} strokeWidth="2" fill={i === this.state.hover && !edit ? "transparent" : "rgba(255,255,255,0.1)"} fillOpacity="0.5"/>)}
        {!edit && this.state.hover !== -1 && this.state.geometry.filter((g, i) => i === this.state.hover).map(g =>
            g.map((m, i) => <rect key={i} x={m[0] - 4} y={m[1] - 4} width="8" height="8" style={{fill: 'rgba(255,255,255,0.1)', stroke: "#ff00ff", strokeWidth: 1}} />))
        })}
        {edit && <rect x={edit[0] - 8} y={edit[1] - 8} width="16" height="16" style={{fill: 'rgba(255,255,255,0.1)', stroke: "#00ffff", strokeWidth: 1}} />}</svg>);
    }

    render() {
        const grid = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const edit = this.state.near && this.state.geometry[this.state.near.j][this.state.near.i] || null;
        return (
            <svg className="draw-wkt" width={this.props.side} height={this.props.side}
                onClick={this.props.readOnly ? () => {} : (e) => {
                    if (this.state.near) {
                        if (!this.state.edit) {
                            this.setState({
                                edit: true
                            });
                        } else {
                            const WKT = this.state.geometry.reduce((w, g, i) => {
                                const end = i === this.state.geometry.length - 1 ? ')' : ', ';
                                return w + g.reduce((a, b, j) => {
                                    const gEnd = j === g.length - 1 ? '))' : ', ';
                                    return a + map(b[0], 0, this.props.side, -1, 1) + ' ' + map(b[1], 0, this.props.side, 1, -1) + gEnd;
                                }, '((') + end;
                            }, 'MULTIPOLYGON(');
                            this.setState({
                                edit: false,
                                near: null
                            });
                            this.props.onUpdate(this.state.geometry, WKT);
                        }
                    } else if (this.state.hover !== -1) {
                        const geometry = this.state.geometry.filter((g, i) => i !== this.state.hover);
                        const WKT = geometry.reduce((w, g, i) => {
                            const end = i === geometry.length - 1 ? ')' : ', ';
                            return w + g.reduce((a, b, j) => {
                                const gEnd = j === g.length - 1 ? '))' : ', ';
                                return a + map(b[0], 0, this.props.side, -1, 1) + ' ' + map(b[1], 0, this.props.side, 1, -1) + gEnd;
                            }, '((') + end;
                        }, 'MULTIPOLYGON(');
                        this.setState({
                            geometry,
                            hover: -1,
                            near: null
                        });
                        this.props.onUpdate(geometry, WKT);
                    } else if (this.state.close) {
                        const geometry = [...this.state.geometry, [...this.state.multi, this.state.multi[0]]];
                        const WKT = geometry.reduce((w, g, i) => {
                            const end = i === geometry.length - 1 ? ')' : ', ';
                            return w + g.reduce((a, b, j) => {
                                const gEnd = j === g.length - 1 ? '))' : ', ';
                                return a + map(b[0], 0, this.props.side, -1, 1) + ' ' + map(b[1], 0, this.props.side, 1, -1) + gEnd;
                            }, '((') + end;
                        }, 'MULTIPOLYGON(');
                        this.setState({
                            a: [],
                            multi: [],
                            geometry,
                            close: false
                        });
                        this.props.onUpdate(geometry, WKT);
                    } else {
                        let a = [e.clientX - this.state.bBoxDOM.left, e.clientY - this.state.bBoxDOM.top];
                        if (e.ctrlKey) {
                            const frag = this.props.side / 10;
                            a = [Math.round(a[0] / frag) * frag, Math.round(a[1] / frag) * frag];

                        }
                        this.setState({
                            a,
                            multi: [...this.state.multi, a]
                        });
                    }
                }}
                onMouseMove={this.props.readOnly ? () => {} : (e) => {
                    let b = [e.clientX - this.state.bBoxDOM.left, e.clientY - this.state.bBoxDOM.top];
                    if (e.ctrlKey) {
                        const frag = this.props.side / 10;
                        b = [Math.round(b[0] / frag) * frag, Math.round(b[1] / frag) * frag];

                    }
                    if (this.state.edit) {
                        let geometry = [...this.state.geometry];
                        geometry[this.state.near.j] = geometry[this.state.near.j].map((c, i) => i === this.state.near.i ? b : c);
                        this.setState({
                            geometry
                        });
                    } else {

                        const hover = this.state.geometry.length > 0 && this.state.geometry.reduce((a, g, i) => {
                            if (!a) {
                                return inside(b, g) ? {id: i} : null;
                            }
                            return a;
                        }, null);

                        const near = this.state.geometry.length > 0 && this.state.geometry.map((g) => {
                            return g.map(c => {
                                return Math.sqrt(Math.pow(Math.abs(c[0] - b[0]), 2) + Math.pow(Math.abs(c[1] - b[1]), 2));
                            }).reduce((a, v, i) => {
                                return a.v > v ? {i, v} : a;
                            }, {i: -1, v: Infinity});
                        }).reduce((a, v, j) => {
                            return a.v > v.v ? {j, i: v.i, v: v.v} : a;
                        }, {i: -1, v: Infinity, j: -1});

                        if (near && near.v < 10) {
                            this.setState({
                                near
                            });
                        } else {
                            this.setState({
                                near: null
                            });
                        }

                        if (this.state.multi.length > 0) {
                            const last = [...this.state.multi[0]];
                            const dist = Math.sqrt(Math.pow(Math.abs(last[0] - b[0]), 2) + Math.pow(Math.abs(last[1] - b[1]), 2));
                            if (dist < 10) {
                                this.setState({
                                    b: [...last],
                                    close: true,
                                    hover: hover ? hover.id : -1
                                });
                            } else {
                                this.setState({
                                    b,
                                    close: false,
                                    hover: hover ? hover.id : -1
                                });
                            }
                        } else {
                            this.setState({
                                b,
                                hover: hover ? hover.id : -1
                            });
                        }
                    }

                }}>
                {this.props.readOnly ? this.renderReadOnly(edit, grid) : this.renderEditor(edit, grid)}
            </svg>
        );
    }
}

module.exports = DrawWKT;
