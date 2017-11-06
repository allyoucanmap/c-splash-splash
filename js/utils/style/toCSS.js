/*
 * Copyright 2017, Stefano Bovio @allyoucanmap.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');
const {head, isArray} = require('lodash');
const {xmlToJson, parseXML} = require('../Utils');

const writeLine = (key, value, tab) => {
    if (isArray(value)) {
        const v = value.reduce((a, b, i) => i === value.length - 1 && a + b || a + b + '\n\t' + tab + '| ', '');
        return tab + key + ': ' + v + ';\n';
    }
    return tab + key + ': ' + value + ';\n';
};

const ogcFilter = (filter) => {
    if (filter) {
        if (filter['ogc:PropertyIsLessThan']) {
            return '[less(' + filter['ogc:PropertyIsLessThan']['ogc:PropertyName'] + ', ' + filter['ogc:PropertyIsLessThan']['ogc:Literal'] + ')]';
        }
        if (filter['ogc:PropertyIsBetween']) {
            return '[between(' + filter['ogc:PropertyIsBetween']['ogc:PropertyName'] + ', ' + filter['ogc:PropertyIsBetween']['ogc:LowerBoundary']['ogc:Literal'] + ', ' + filter['ogc:PropertyIsBetween']['ogc:UpperBoundary']['ogc:Literal'] + ')]';
        }
        if (filter['ogc:PropertyIsGreaterThan']) {
            return '[greater(' + filter['ogc:PropertyIsGreaterThan']['ogc:PropertyName'] + ', ' + filter['ogc:PropertyIsGreaterThan']['ogc:Literal'] + ')]';
        }
        if (filter['ogc:PropertyIsEqualTo']) {
            return '[equal(' + filter['ogc:PropertyIsEqualTo']['ogc:PropertyName'] + ', ' + filter['ogc:PropertyIsEqualTo']['ogc:Literal'] + ')]';
        }
    }
    return '';
};

const cssParameters = (params, tab, prefix = '') => {
    if (params['@attributes']) {
        return params['@attributes'] && params['@attributes'].name && tab + prefix + params['@attributes'].name + ': ' + params['#text'] + ';\n' || '';
    }
    return params.reduce((a, param) => {
        return param['@attributes'] && param['@attributes'].name && a + tab + prefix + param['@attributes'].name + ': ' + param['#text'] + ';\n' || '';
    }, '');
};

const wellKnownNameCheck = (wkn, tab) => {
    if (wkn && wkn.match(/wkt:\/\//)) {
        const wkt = wkn.replace(/wkt:\/\//, '');
        return writeLine('mark', 'wkt[' + wkt + ']', tab);
    }
    if (wkn && wkn.match(/shape:\/\//)) {
        const shape = wkn.replace(/shape:\/\//, '');
        return writeLine('mark', shape, tab);
    }

    if (wkn && wkn.match(/extshape:\/\//)) {
        const extshape = wkn.replace(/extshape:\/\//, '');
        return writeLine('mark', extshape, tab);
    }
    return writeLine('mark', wkn, tab);
};

const polygon = (PolygonSymbolizer, filter, title, text, t) => {

    const tab = t ? ['\t', '\t\t'] : ['', '\t'];
    const polygonTitle = title && tab[1] + 'title: ' + title + ';\n' || '';
    const fill = PolygonSymbolizer.Fill && PolygonSymbolizer.Fill.CssParameter && cssParameters(PolygonSymbolizer.Fill.CssParameter, tab[1]) || '';
    const stroke = PolygonSymbolizer.Stroke && PolygonSymbolizer.Stroke.CssParameter && cssParameters(PolygonSymbolizer.Stroke.CssParameter, tab[1]) || '';

    const graphic = PolygonSymbolizer.Fill && PolygonSymbolizer.Fill.GraphicFill && PolygonSymbolizer.Fill.GraphicFill.Graphic || '';

    const mark = graphic && graphic.Mark || '';
    const rotation = graphic && graphic.Rotation && writeLine('mark-rotation', graphic.Rotation, tab[1]) || '';
    const size = graphic && graphic.Size && writeLine('mark-size', graphic.Size, tab[1]) || '';
    const opacity = graphic && graphic.Opacity && writeLine('mark-opacity', graphic.Opacity, tab[1]) || '';
    const wellKnownName = mark && mark.WellKnownName && wellKnownNameCheck(mark.WellKnownName, tab[1]) || '';
    const markFill = mark && mark.Fill && mark.Fill.CssParameter && cssParameters(mark.Fill.CssParameter, tab[1], 'mark-') || '';
    const markStroke = mark && mark.Stroke && mark.Stroke.CssParameter && cssParameters(mark.Stroke.CssParameter, tab[1], 'mark-') || '';

    const graphicFill = wellKnownName + markFill + markStroke + opacity + size + rotation;

    return tab[0] + '#polygon' + ogcFilter(filter) + ' {\n' + polygonTitle + fill + stroke + graphicFill + tab[0] + '}\n\n';
};

const writeObject = (key, value) => {
    return {[key]: value};
};

const cssObject = (cssParameter, prefix = '') => {
    if (cssParameter['@attributes']) {
        return {[prefix + cssParameter['@attributes'].name]: cssParameter['#text']};
    }
    return cssParameter.reduce((a, b) => assign({}, a, {[prefix + b['@attributes'].name]: b['#text']}), {});
};

const wellKnownNameObject = wkn => {
    if (wkn && wkn.match(/wkt:\/\//)) {
        const wkt = wkn.replace(/wkt:\/\//, '');
        return writeObject('mark', 'wkt[' + wkt + ']');
    }

    if (wkn && wkn.match(/shape:\/\//)) {
        const shape = wkn.replace(/shape:\/\//, '');
        return writeObject('mark', shape);
    }

    if (wkn && wkn.match(/extshape:\/\//)) {
        const extshape = wkn.replace(/extshape:\/\//, '');
        return writeObject('mark', extshape);
    }
    return writeObject('mark', wkn);
};

const mergeSymbolizers = (symbololizers, data = {}) => {
    return symbololizers.map(LineSymbololizer => {
        return assign({}, data(LineSymbololizer));
    }).reduce((a, b) => {
        const params = Object.keys(b).reduce((p, k) => {
            if (a[k] && isArray(a[k])) {
                return assign({}, p, {[k]: [...a[k], b[k]]});
            }
            if (a[k]) {
                return assign({}, p, {[k]: a[k] === b[k] ? b[k] : [a[k], b[k]]});
            }
            return assign({}, p, {[k]: b[k]});
        }, {});
        return assign({}, a, params);
    }, {});
};

const line = (LS, filter, title, text, t) => {
    const lineSymbololizers = isArray(LS) ? LS : [LS];
    const tab = t ? ['\t', '\t\t'] : ['', '\t'];
    const mergedSymbolizer = mergeSymbolizers(lineSymbololizers, symbololizer => {
        const strokeCss = symbololizer.Stroke && symbololizer.Stroke.CssParameter && cssObject(symbololizer.Stroke.CssParameter) || {};
        const offset = symbololizer.PerpendicularOffset && {offset: symbololizer.PerpendicularOffset} || {};
        const graphic = symbololizer.Stroke && symbololizer.Stroke.GraphicStroke && symbololizer.Stroke.GraphicStroke.Graphic || {};
        const mark = graphic && graphic.Mark || null;
        const rotation = graphic && graphic.Rotation && writeObject('mark-rotation', graphic.Rotation) || {};
        const size = graphic && graphic.Size && writeObject('mark-size', graphic.Size) || {};
        const opacity = graphic && graphic.Opacity && writeObject('mark-opacity', graphic.Opacity) || {};
        const wellKnownName = mark && mark.WellKnownName && wellKnownNameObject(mark.WellKnownName) || {};
        const markFill = mark && mark.Fill && mark.Fill.CssParameter && cssObject(mark.Fill.CssParameter, 'mark-') || {};
        const markStroke = mark && mark.Stroke && mark.Stroke.CssParameter && cssObject(mark.Stroke.CssParameter, 'mark-') || {};
        return assign({}, strokeCss, offset, wellKnownName, markFill, markStroke, opacity, size, rotation);
    });
    const css = Object.keys(mergedSymbolizer).reduce((a, param) => {
        return a + writeLine(param, mergedSymbolizer[param], tab[1]);
    }, '');
    return '#line {\n' + css + '}\n';
};

const point = (PointSymbolizer, filter, title, text, t) => {
    const tab = t ? ['\t', '\t\t'] : ['', '\t'];
    const pointTitle = title && '\ttitle: ' + title + ';\n' || '';
    const graphic = PointSymbolizer.Graphic || '';
    const mark = graphic.Mark || '';
    const rotation = graphic.Rotation && writeLine('rotation', graphic.Rotation, tab[1]) || '';
    const size = graphic.Size && writeLine('size', graphic.Size, tab[1]) || '';
    const opacity = graphic.Opacity && writeLine('opacity', graphic.Opacity, tab[1]) || '';
    const wellKnownName = mark.WellKnownName && wellKnownNameCheck(mark.WellKnownName, tab[1]) || '';
    const fill = mark.Fill && mark.Fill.CssParameter && cssParameters(mark.Fill.CssParameter, tab[1]) || '';
    const stroke = mark.Stroke && mark.Stroke.CssParameter && cssParameters(mark.Stroke.CssParameter, tab[1]) || '';

    return tab[0] + '#point' + ogcFilter(filter) + ' {\n' + pointTitle + wellKnownName + fill + stroke + rotation + size + opacity + tab[0] + '}\n\n';
};

const getRule = (rule, tab) => {
    const PointSymbolizer = rule.PointSymbolizer;
    const LineSymbolizer = rule.LineSymbolizer;
    const PolygonSymbolizer = rule.PolygonSymbolizer;
    const TextSymbolizer = rule.TextSymbolizer;
    const filter = rule['ogc:Filter'];
    const title = rule.Title;

    if (PointSymbolizer) {
        return point(PointSymbolizer, filter, title, TextSymbolizer, tab);
    } else if (LineSymbolizer) {
        return line(LineSymbolizer, filter, title, TextSymbolizer, tab);
    } else if (PolygonSymbolizer) {
        return polygon(PolygonSymbolizer, filter, title, TextSymbolizer, tab);
    } else if (TextSymbolizer) {
        /* toLabel */
        return '';
    }
    return '';
};

const sortRules = (rule) => {
    return Object.keys(rule).reduce((a, i) => {
        const maxScaleDenominator = rule[i].MaxScaleDenominator;
        const minScaleDenominator = rule[i].MinScaleDenominator;
        if (maxScaleDenominator && !minScaleDenominator) {
            if (a['max:' + maxScaleDenominator]) {
                const newDenominator = [...a['max:' + maxScaleDenominator], rule[i]];
                return assign({}, a, {['max:' + maxScaleDenominator]: newDenominator});
            }
            return assign({}, a, {['max:' + maxScaleDenominator]: [rule[i]]});
        }
        if (!maxScaleDenominator && minScaleDenominator) {
            if (a['min:' + minScaleDenominator]) {
                const newDenominator = [...a['min:' + minScaleDenominator], rule[i]];
                return assign({}, a, {['min:' + minScaleDenominator]: newDenominator});
            }
            return assign({}, a, {['min:' + minScaleDenominator]: [rule[i]]});
        }
        if (maxScaleDenominator && minScaleDenominator) {
            if (a[maxScaleDenominator + ':' + minScaleDenominator]) {
                const newDenominator = [...a[maxScaleDenominator + ':' + minScaleDenominator], rule[i]];
                return assign({}, a, {[maxScaleDenominator + ':' + minScaleDenominator]: newDenominator});
            }
            return assign({}, a, {[maxScaleDenominator + ':' + minScaleDenominator]: [rule[i]]});
        }
        if (a['@style']) {
            const newDenominator = [...a['@style'], rule[i]];
            return assign({}, a, {['@style']: newDenominator});
        }
        return assign({}, a, {['@style']: [rule[i]]});
    }, {});
};

const toCSS = (sld) => {
    const str = sld.replace(/<\?([^\?]+)\?>/g, '');
    const json = xmlToJson(parseXML(str));
    const StyledLayerDescriptor = json && assign({}, json.StyledLayerDescriptor) || '';
    const NamedLayer = StyledLayerDescriptor && assign({}, StyledLayerDescriptor.NamedLayer) || '';
    const LayerName = NamedLayer && NamedLayer.Name && '@layer: ' + NamedLayer.Name + ';\n' || '';
    const UserStyle = NamedLayer && assign({}, NamedLayer.UserStyle) || '';
    const StyleTitle = UserStyle && UserStyle.Title && '@title: ' + UserStyle.Title + ';\n' || '';
    const StyleName = UserStyle && UserStyle.Name && '@name: ' + UserStyle.Name + ';\n' || '';
    const StyleAbstract = UserStyle && UserStyle.Abstract && '@abstract: ' + UserStyle.Name + ';\n' || '';
    const FeatureTypeStyle = UserStyle && assign({}, UserStyle.FeatureTypeStyle) || null;
    const Rule = FeatureTypeStyle && assign({}, FeatureTypeStyle.Rule) || null;

    const ruleKeys = Rule && Object.keys(Rule) || null;
    const styleHead = LayerName + StyleTitle + StyleName + StyleAbstract + '\n';
    if (ruleKeys) {

        const isObject = head(ruleKeys.filter(k => isNaN(parseFloat(k))));
        const sortedRules = isObject ? sortRules({'0': Rule}) : sortRules(Rule);

        const scales = Object.keys(sortedRules).reduce((r, c) => {
            if (c !== '@style') {
                const scale = c.split(':');
                const rules = sortedRules[c] && Object.keys(sortedRules[c]).reduce((a, i) => {
                    return a + getRule(sortedRules[c][i], true);
                }, '');
                if (scale[0] === 'max') {
                    return r + '@map (max-scale: ' + scale[1] + ') {\n\n' + rules + '}\n\n';
                }
                if (scale[0] === 'min') {
                    return r + '@map (min-scale: ' + scale[1] + ') {\n\n' + rules + '}\n\n';
                }
                return r + '@map (max-scale: ' + scale[0] + ') (min-scale: ' + scale[1] + ') {\n\n' + rules + '}\n\n';
            }
            return r + '';
        }, '');

        const rules = sortedRules['@style'] && Object.keys(sortedRules['@style']).reduce((a, i) => {
            return a + getRule(sortedRules['@style'][i]);
        }, '') || '';

        return styleHead + rules + scales;
    }

    return styleHead;
};

module.exports = toCSS;
