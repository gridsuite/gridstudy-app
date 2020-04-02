/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {UserManager} from 'oidc-client';
import {UserManagerMock} from "./UserManagerMock";

const userManagerPromise = fetch('idpSettings.json')
    .then(r => r.json())
    .then(idpSettings => {
        let settings = {
            authority: idpSettings.authority,
            client_id: idpSettings.client_id,
            client_secret: idpSettings.client_secret,
            redirect_uri: idpSettings.redirect_uri,
            post_logout_redirect_uri: idpSettings.post_logout_redirect_uri,
            response_mode : 'fragment',
            response_type: 'id_token token',
            scope: idpSettings.scope,
        };
        return process.env.REACT_APP_USE_AUTHENTICATION === "true" ? new UserManager(settings) : new UserManagerMock(settings);
    });
export {userManagerPromise}
