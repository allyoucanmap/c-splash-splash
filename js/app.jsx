/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const {connect} = require('react-redux');
const LocaleUtils = require('../MapStore2/web/client/utils/LocaleUtils');

const startApp = () => {

    const StandardApp = require('./stores/StandardApp');

    const {pages, pluginsDef, initialState, storeOpts, appEpics = {}} = require('./appConfig');

    LocaleUtils.setSupportedLocales({
        en: {
            code: 'en-US',
            description: 'English'
        }
    });

    const StandardRouter = connect((state) => ({
        locale: state.locale || {},
        pages
    }))(require('../MapStore2/web/client/components/app/StandardRouter'));

    const appStore = require('./stores/store').bind(null, initialState, {}, appEpics);

    const initialActions = [];

    const appConfig = {
        storeOpts,
        appEpics,
        appStore,
        pluginsDef,
        initialActions,
        appComponent: StandardRouter
    };

    ReactDOM.render(
        <StandardApp {...appConfig}/>,
        document.getElementById('container')
    );
};

if (!global.Intl ) {
    // Ensure Intl is loaded, then call the given callback
    LocaleUtils.ensureIntl(startApp);
} else {
    startApp();
}
