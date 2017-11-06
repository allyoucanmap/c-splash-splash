/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const assign = require('object-assign');

const DebugUtils = require('../../MapStore2/web/client/utils/DebugUtils');
const {combineReducers, combineEpics} = require('../../MapStore2/web/client/utils/PluginsUtils');

const {createEpicMiddleware} = require('redux-observable');

const SecurityUtils = require('../../MapStore2/web/client/utils/SecurityUtils');
const ListenerEnhancer = require('@carnesen/redux-add-action-listener-enhancer').default;

const {routerReducer, routerMiddleware} = require('react-router-redux');
const routerCreateHistory = require('history/createHashHistory').default;
const history = routerCreateHistory();

// Build the middleware for intercepting and dispatching navigation actions
const reduxRouterMiddleware = routerMiddleware(history);

module.exports = (initialState = {defaultState: {}, mobile: {}}, appReducers = {}, appEpics = {}, plugins, storeOpts = {}) => {
    const allReducers = combineReducers(plugins, {
        ...appReducers,
        localConfig: require('../../MapStore2/web/client/reducers/localConfig'),
        locale: require('../../MapStore2/web/client/reducers/locale'),
        browser: require('../../MapStore2/web/client/reducers/browser'),
        routing: routerReducer
    });
    const rootEpic = combineEpics(plugins, {...appEpics});
    const optsState = storeOpts.initialState || {defaultState: {}, mobile: {}};
    const defaultState = assign({}, initialState.defaultState, optsState.defaultState);
    const epicMiddleware = createEpicMiddleware(rootEpic);
    const rootReducer = (state, action) => {
        let newState = {
            ...allReducers(state, action)
        };

        return newState;
    };
    let store;
    let enhancer;
    if (storeOpts && storeOpts.notify) {
        enhancer = ListenerEnhancer;
    }
    /*if (storeOpts && storeOpts.persist) {
        storeOpts.persist.whitelist.forEach((fragment) => {
            const fragmentState = localStorage.getItem('mapstore2.persist.' + fragment);
            if (fragmentState) {
                defaultState[fragment] = JSON.parse(fragmentState);
            }
        });
        if (storeOpts.onPersist) {
            setTimeout(() => {storeOpts.onPersist(); }, 0);
        }
    }*/
    store = DebugUtils.createDebugStore(rootReducer, defaultState, [epicMiddleware, reduxRouterMiddleware], enhancer);
    /*if (storeOpts && storeOpts.persist) {
        const persisted = {};
        store.subscribe(() => {
            storeOpts.persist.whitelist.forEach((fragment) => {
                const fragmentState = store.getState()[fragment];
                if (fragmentState && persisted[fragment] !== fragmentState) {
                    persisted[fragment] = fragmentState;
                    localStorage.setItem('mapstore2.persist.' + fragment, JSON.stringify(fragmentState));
                }
            });
        });
    }*/
    SecurityUtils.setStore(store);
    return store;
};
