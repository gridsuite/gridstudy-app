/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {UserManager} from 'oidc-client';
import {UserManagerMock} from "./UserManagerMock";
import {setLoggedUser} from "../../redux/actions";
let userManagerPromise;
if (process.env.REACT_APP_USE_AUTHENTICATION === "true") {
    userManagerPromise = fetch('idpSettings.json')
        .then(r => r.json())
        .then(idpSettings => {
            let settings = {
                authority: idpSettings.authority,
                client_id: idpSettings.client_id,
                redirect_uri: idpSettings.redirect_uri,
                post_logout_redirect_uri: idpSettings.post_logout_redirect_uri,
                response_mode: 'fragment',
                response_type: 'id_token token',
                scope: idpSettings.scope,
            };
            return new UserManager(settings);
        });
} else {
    userManagerPromise = Promise.resolve( new UserManagerMock({}));
}

const pathKey = "powsybl-study-app-current-path";

function login(location, userManagerInstance) {
    sessionStorage.setItem(pathKey,  location.pathname + location.search);
    return userManagerInstance.signinRedirect().then(() => console.debug("login"));
}

function logout(dispatch, userManagerInstance) {
    dispatch(setLoggedUser(null));
    return userManagerInstance.signoutRedirect().then(
        () => console.debug("logged out"));
}

function dispatchUser(dispatch, userManagerInstance) {
    return userManagerInstance.getUser().then(user => {
        if (user) {
            console.debug('User has been successfully loaded from store.');
            return dispatch(setLoggedUser(user));
        } else {
            console.debug('You are not logged in.');
        }
    });
}

function handleSigninCallback(dispatch, history, userManagerInstance) {
    userManagerInstance.signinRedirectCallback().then(function () {
        dispatchUser(dispatch, userManagerInstance);
        const previousPath = sessionStorage.getItem(pathKey);
        history.push(previousPath);
    }).catch(function (e) {
        console.error(e);
    });
}

export {userManagerPromise, login, logout, handleSigninCallback}
