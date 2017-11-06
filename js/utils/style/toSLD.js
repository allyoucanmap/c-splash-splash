/*
 * Copyright 2017, Stefano Bovio @allyoucanmap.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {head, isArray, range} = require('lodash');
const assign = require('object-assign');
const encoding = '<?xml version="1.0" encoding="ISO-8859-1"?>';

const Symbolizer = {
    '#polygon': 'PolygonSymbolizer',
    '#line': 'LineSymbolizer',
    '#point': 'PointSymbolizer',
    '#raster': 'RasterSymbolizer',
    '#text': 'TextSymbolizer'
};

const cssParameter = (param) => param && param.key && param.value ? '<CssParameter name="' + param.key + '">' + param.value + '</CssParameter>\n' : '';
const cssParameters = (params) => {
    return params.reduce((a, param) => a + cssParameter(param), '');
};

const addCssParameters = (key, params, fields) => {
    const css = cssParameters(params);
    const externalField = fields.reduce((a, b) => a + b, '');
    return css === '' ? '' : '<' + key + '>\n' + css + externalField + '</' + key + '>\n';
};

// const externalGraphic = (params) => params && params.url && params.format ? '<ExternalGraphic><OnlineResource xlink:type="simple" xlink:href="' + params.url + '" /><Format>' + params.format + '</Format></ExternalGraphic>' : '';

const wellKnownName = (mark) => {
    const names = [
        {mark: 'square', code: 'square'},
        {mark: 'circle', code: 'circle'},
        {mark: 'triangle', code: 'triangle'},
        {mark: 'star', code: 'star'},
        {mark: 'cross', code: 'cross'},
        {mark: 'x', code: 'x'},

        {mark: 'vertline', code: 'shape://vertline'},
        {mark: 'horline', code: 'shape://horline'},
        {mark: 'slash', code: 'shape://slash'},
        {mark: 'backslash', code: 'shape://backslash'},
        {mark: 'dot', code: 'shape://dot'},
        {mark: 'plus', code: 'shape://plus'},
        {mark: 'times', code: 'shape://times'},
        {mark: 'oarrow', code: 'shape://oarrow'},
        {mark: 'carrow', code: 'shape://carrow'},

        {mark: 'triangle-ext', code: 'extshape://triangle'},
        {mark: 'emicircle', code: 'extshape://emicircle'},
        {mark: 'triangleemicircle', code: 'extshape://triangleemicircle'}

        /* windbars */
        /* font */
    ];

    const name = head(names.filter(n => n.mark === mark.replace(/\s/g, '')));
    const wkt = mark.match(/wkt\[([^\]]+)\]/);
    if (wkt) {
        return '<WellKnownName>wkt://' + wkt[1] + '</WellKnownName>';
    }
    return name ? '<WellKnownName>' + name.code + '</WellKnownName>' : '';
};

const size = (value) => {
    return '<Size>' + value + '</Size>';
};

const opacity = (value) => {
    return '<Opacity>' + value + '</Opacity>';
};

const rotation = (value) => {
    return '<Rotation>' + value + '</Rotation>';
};

const mark = (params, css, outer = ['', ''], point) => {
    const name = params && params.mark && wellKnownName(params.mark) || '';
    const markSize = params && params[point ? 'size' : 'mark-size'] ? size(params[point ? 'size' : 'mark-size']) : '';
    const markOpacity = params && params[point ? 'opacity' : 'mark-opacity'] ? opacity(params[point ? 'opacity' : 'mark-opacity']) : '';
    const markRotation = params && params[point ? 'rotation' : 'mark-rotation'] ? rotation(params[point ? 'rotation' : 'mark-rotation']) : '';
    return name !== '' ? outer[0] + '<Mark>' + name + css + '</Mark>' + markSize + markOpacity + markRotation + outer[1] : '';
};
/*
const getParams = (style, attributes) => {
    return attributes.map(attribute => {
        const key = head(Object.keys(style).filter(k => k === attribute));
        return key && {key, value: style[key]} || null;
    }).filter(a => a);
};

const addParams = (key, style, attributes) => {
    const css = cssParameters(getParams(style, attributes));
    return css === '' ? '' : '<' + key + '>\n' + css + '</' + key + '>\n';
};*/

/*<GraphicFill>
                <Graphic>
                  <ExternalGraphic>
                    <OnlineResource xlink:type="simple" xlink:href="grass_fill.png" />
                    <Format>image/png</Format>
                  </ExternalGraphic>
                  <Opacity>
                    <ogc:Literal>1.0</ogc:Literal>
                  </Opacity>
                </Graphic>
              </GraphicFill>

              */

            /*  <GraphicFill>
                <Graphic>
                  <Mark>
                    <WellKnownName>shape://slash</WellKnownName>
                    <Stroke>
                      <CssParameter name="stroke">0xAAAAAA</CssParameter>
                    </Stroke>
                  </Mark>
                  <Size>16</Size>
                </Graphic>
              </GraphicFill>*/


              /*

              <Graphic>
                            <Mark>
                              <WellKnownName>circle</WellKnownName>
                              <Fill>
                                <CssParameter name="fill">
                                  <ogc:Literal>#FFFFFF</ogc:Literal>
                                </CssParameter>
                              </Fill>
                              <Stroke>
                                <CssParameter name="stroke">
                                  <ogc:Literal>#000000</ogc:Literal>
                                </CssParameter>
                                <CssParameter name="stroke-width">
                                  <ogc:Literal>2</ogc:Literal>
                                </CssParameter>
                              </Stroke>
                            </Mark>
                            <Opacity>
                              <ogc:Literal>1.0</ogc:Literal>
                            </Opacity>
                            <Size>
                              <ogc:Literal>6</ogc:Literal>
                            </Size>

                          </Graphic>

              */

const scaleDenominator = (params) => {
    const maxScaleDenominator = params['max-scale'] ? '<MaxScaleDenominator>' + params['max-scale'] + '</MaxScaleDenominator>\n' : '';
    const minScaleDenominator = params['min-scale'] ? '<MinScaleDenominator>' + params['min-scale'] + '</MinScaleDenominator>\n' : '';
    return maxScaleDenominator + minScaleDenominator;
};

const propertyIsEqualTo = (key, params) => {
    const keys = Object.keys(params);
    return key === 'equal' && keys && keys.length > 0 && params[keys[0]] && '<ogc:PropertyIsEqualTo><ogc:PropertyName>' + keys[0] + '</ogc:PropertyName><ogc:Literal>' + params[keys[0]] + '</ogc:Literal></ogc:PropertyIsEqualTo>' || '';
};

const filter = (params) => {
    const rules = params && params.filter && Object.keys(params.filter).reduce((a, key) => {
        return a + propertyIsEqualTo(key, params.filter[key]);
    }, '') || '';
    return rules !== '' && '<ogc:Filter>' + rules + '</ogc:Filter>' || '';
};

/*
<ogc:Filter>
  <ogc:PropertyIsGreaterThan>
   <ogc:PropertyName>PERSONS</ogc:PropertyName>
   <ogc:Literal>4000000</ogc:Literal>
  </ogc:PropertyIsGreaterThan>
</ogc:Filter>
*/

const getCssParameters = (constant, params, fields, prefix) => {
    const currentCssParams = Object.keys(params).map(key => {
        return head(constant.filter(p => p === key));
    }).filter(v => v);
    const groupByKey = currentCssParams.reduce((a, b) => {
        const keys = head(Object.keys(a).filter(k => b.match(k.toLowerCase())));
        return keys ? assign({}, a, {[keys]: [...a[keys], {key: prefix ? b.replace(prefix, '') : b, value: params[b]}] }) : assign({}, a);
    }, assign({}, fields));
    return Object.keys(groupByKey).reduce((a, key) => a + addCssParameters(key, groupByKey[key], fields[key]), '');
};

const polygon = (symbol, params) => {
    const graphicFill = mark(
        params,
        getCssParameters(['mark-fill', 'mark-fill-opacity', 'mark-stroke', 'mark-stroke-width'], params, {Fill: [], Stroke: []}, 'mark-'),
        ['<GraphicFill>\n<Graphic>\n', '</Graphic>\n</GraphicFill>\n']);

    const css = getCssParameters(['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linejoin', 'stroke-linecap', 'stroke-dasharray', 'stroke-dashoffset'], params, {Fill: [graphicFill], Stroke: []});

    const rules = css;

    return rules !== '' ? '<Rule>\n' + scaleDenominator(params) + filter(params) + '<' + Symbolizer[symbol] + '>\n' + rules + '</' + Symbolizer[symbol] + '>\n</Rule>\n' : '';
};

const point = (symbol, params) => {
    const markParams = mark(
        params,
        getCssParameters(['fill', 'fill-opacity', 'stroke', 'stroke-width'], params, {Fill: [], Stroke: []}, 'mark-'),
        ['<Graphic>\n', '</Graphic>\n'], true);
    const rules = markParams;
    return rules !== '' ? '<Rule>\n' + scaleDenominator(params) + filter(params) + '<' + Symbolizer[symbol] + '>\n' + rules + '</' + Symbolizer[symbol] + '>\n</Rule>\n' : '';
};

const line = (symbol, params) => {

    const valueArray = Object.keys(params).map(key => isArray(params[key]) && params[key].length || null).filter(v => v);
    const n = valueArray[0] && valueArray.reduce((a, b) => b > a ? a : b, valueArray[0]) || 1;
    const count = range(n);

    const newParams = count.map(i => {
        return Object.keys(params).reduce((a, b) => {
            return assign({}, a, isArray(params[b]) ? {[b]: params[b][i]} : {[b]: params[b]});
        }, {});
    });

    const rules = newParams.reduce((a, p) => {
        const graphicStroke = mark(
            p,
            getCssParameters(['mark-fill', 'mark-fill-opacity', 'mark-stroke', 'mark-stroke-width'], p, {Fill: [], Stroke: []}, 'mark-'),
            ['<GraphicStroke>\n<Graphic>\n', '</Graphic>\n</GraphicStroke>\n']);

        const css = getCssParameters(['stroke', 'stroke-width', 'stroke-opacity', 'stroke-linejoin', 'stroke-linecap', 'stroke-dasharray', 'stroke-dashoffset'], p, {Stroke: [graphicStroke]});

        const graphic = css === '' && graphicStroke !== '' && '<Stroke>' + graphicStroke + '</Stroke>' || '';

        const offset = p.offset && '<PerpendicularOffset>' + p.offset + '</PerpendicularOffset>' || '';
        return a + '<' + Symbolizer[symbol] + '>\n' + css + graphic + offset + '</' + Symbolizer[symbol] + '>\n';
    }, '');

    return rules !== '' ? '<Rule>\n' + scaleDenominator(params) + filter(params) + rules + '</Rule>\n' : '';
};

const text = (symbol, params) => {

    const label = params.label && '<Label>\n<ogc:PropertyName>\n' + params.label + '</ogc:PropertyName>\n</Label>\n' || '';
    const font = getCssParameters(['font-family', 'font-style', 'font-weight', 'font-size'], params, {Font: []});
    const fill = getCssParameters(['label-fill', 'label-fill-opacity'], params, {Fill: []}, 'label-');
    const haloFill = getCssParameters(['halo-fill', 'halo-fill-opacity'], params, {Fill: []}, 'halo-');
    const haloRadius = params['halo-radius'] && '<Radius>' + params['halo-radius'] + '</Radius>' || '';
    const halo = haloFill + haloRadius ? '<Halo>' + haloFill + haloRadius + '</Halo>' : '';

    const anchor = params['label-anchor'] && params['label-anchor'].match(/(-\d+\.?\d*|\d+\.?\d*) (-\d+\.?\d*|\d+\.?\d*)/) && '<AnchorPoint><AnchorPointX>' + params['label-anchor'].split(' ')[0] + '</AnchorPointX><AnchorPointY>' + params['label-anchor'].split(' ')[1] + '</AnchorPointY></AnchorPoint>' || '';
    const displacement = params['label-displacement'] && params['label-displacement'].match(/(-\d+\.?\d*|\d+\.?\d*) (-\d+\.?\d*|\d+\.?\d*)/) && '<Displacement><DisplacementX>' + params['label-displacement'].split(' ')[0] + '</DisplacementX><DisplacementY>' + params['label-displacement'].split(' ')[1] + '</DisplacementY></Displacement>' || '';
    const labelRotation = params['label-rotation'] && '<Rotation>' + params['label-rotation'] + '</Rotation>' || '';
    const pointPlacement = anchor + displacement + labelRotation ? '<PointPlacement>' + anchor + displacement + labelRotation + '</PointPlacement>' : '';

    const linePlacement = params['label-offset'] && '<LinePlacement><PerpendicularOffset>' + params['label-offset'] + '</PerpendicularOffset></LinePlacement>' || '';

    const labelPlacement = pointPlacement + linePlacement ? '<LabelPlacement>' + pointPlacement + linePlacement + '</LabelPlacement>' : '';
    const rules = label + font + halo + labelPlacement + fill;
    return rules !== '' ? '<Rule>\n' + scaleDenominator(params) + filter(params) + '<' + Symbolizer[symbol] + '>\n' + rules + '</' + Symbolizer[symbol] + '>\n</Rule>\n' : '';
};

const rule = (type, params) => { /* #polygon, { fill: #fff, stroke: 1px} */

    const symbol = head(Object.keys(Symbolizer).filter(key => type.match(key)));
    if (!symbol) { return ''; }

    switch (symbol) {
        case '#polygon':
            return polygon(symbol, params);
        case '#point':
            return point(symbol, params);
        case '#line':
            return line(symbol, params);
        case '#text':
            return text(symbol, params);
        default:
        return '';
    }

};

const featureTypeStyle = (json) => {
    const rules = Object.keys(json).reduce((string, section) => {
        return string + Object.keys(json[section]).reduce((a, key) => a + rule(key, json[section][key]), '');
    }, '');
    return rules !== '' ? '<FeatureTypeStyle>\n' + rules + '</FeatureTypeStyle>\n' : '';
};

const styledLayerDescriptor = (json, featureStyle) => {
    const name = json['@layer'] ? '<Name>' + json['@layer'] + '</Name>\n' : '';
    const styleName = json['@name'] ? '<Name>' + json['@name'] + '</Name>\n' : '';
    const title = json['@title'] ? '<Title>' + json['@title'] + '</Title>\n' : '';
    const abstract = json['@abstract'] ? '<Abstract>' + json['@abstract'] + '</Abstract>\n' : '';
    return encoding +
    '\n<StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml">\n' +
    '<NamedLayer>\n' +
        name +
        '<UserStyle>\n' +
            styleName +
            title +
            abstract +
            featureStyle +
        '</UserStyle>\n' +
    '</NamedLayer>\n' +
    '</StyledLayerDescriptor>';
};

const toSLD = (json) => {
    const style = featureTypeStyle(json);
    return style !== '' ? styledLayerDescriptor(json, style) : '';
};

module.exports = toSLD;
