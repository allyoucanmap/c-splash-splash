/*
 * Copyright 2017, Stefano Bovio @allyoucanmap.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');
const {head} = require('lodash');

const variables = [
    'title',
    'layer',
    'name',
    'abstract'
];

const filter = (string) => {
    let jsonString = string[1]
        .replace(/(equal|between|greater|less|and|or)(\()/g, '$1:$2')
        .replace(/\(/g, '{')
        .replace(/\)/g, '}')
        .replace(/\b(\w+)\b,\s|,\b(\w+)\b/g, '$1:')
        .replace(/\b(\w+)\b/g, '"$1"');
    jsonString = '{ "filter": {' + jsonString + '} }';
    try {
        return JSON.parse(jsonString);
    } catch(e) {
        return {};
    }
};

const checkValueArray = value => {
    const values = value.split('|') || [];
    return values[0] !== '' && values.length > 1 && values || value;
};

const rules = (css, attr = {}) => {
    return css
        .map(c => c.replace(/\t|\n|\}/g, '')
            .split(/\{/)
        ).reduce((a, b) => {
            const filterString = b[0].match(/\[([^\]]+)\]/);
            return assign({}, a, {[b[0]]: b[1].split(/;/).filter(v => v)
                .reduce((c, d) => {
                    const v = d.split(/:/);
                    const value = v[1] ? v[1] : '';
                    return assign({}, c, {[v[0].replace(/\s|\}/g, '')]: value[0] === ' ' ? checkValueArray(value.substring(1, value.length)) : checkValueArray(value)});
                }, assign({}, attr, filterString && filter(filterString) || {}))
            });
        }, {});
};

const toJSON = (css) => {

    const paramsString = css.match(/@([^;]+);/g);
    const params = paramsString && paramsString.map(p => {
        const param = p.split(/:(.+)/);
        const key = param[0] && param[0].replace(/\s/, '');
        const value = param[1] && param[1].replace(';', '');
        return key && value && {[key]: value[0] === ' ' ? value.substring(1, value.length) : value };
    })
    .filter(p => p && head(variables.filter(v => '@' + v === Object.keys(p)[0])))
    .reduce((a, b) => {
        return assign({}, a, b);
    }, {}) || {};

    const rulesMatch = css.replace(/\/\*([^\*\/]+)\*\/|@map([^@]+)\{([^@]+)\}([\s]+)\}|@map([^@]+)\{([^@]+)\}\}|@([^;]+)\;/g, '').match(/([^}]+)\{([^}]+)\}/g);
    const styleRules = rulesMatch ? rules(rulesMatch) : {};

    const mapRulesMatch = css.replace(/\/\*([^\*\/]+)\*\//g, '').match(/@map([^@]+)\{([^@]+)\}([\s]+)\}|@map([^@]+)\{([^@]+)\}\}/g);
    const mapRules = mapRulesMatch ? mapRulesMatch.reduce((a, c) => {
        const key = c.split(/\{/)[0];
        const scales = key.replace(/and|@map|\s/g, '').match(/\((max-scale[^)]+)\)|\((min-scale[^)]+)\)/g);

        const attr = scales ? scales.reduce((ac, s) => {
            let att = s.replace(/\(|\)/g, '').split(/:/);
            return assign({}, ac, {[att[0]]: att[1]});
        }, {}) : null;

        const body = c.replace(key, '');
        const match = body.substring(1, body.length - 1).replace(/\/\*([^\*\/]+)\*\/|@map([^}]+)\{([^@]+)\}([\s|\t|\n]+)\}|@map([^}]+)\{([^@]+)\}\}/g, '').match(/([^}]+)\{([^}]+)\}/g);
        return assign({}, a, {[key.replace(/\s/g, '')]: match && attr ? rules(match, attr) : {}});
    }, {}) : null;

    return assign({}, params, {['@style']: styleRules}, mapRules);

};

module.exports = toJSON;
