import {UserManager} from 'oidc-client';
import {UserManagerMock} from "./UserManagerMock";

const userManagerPromise = fetch('idpSettings.json')
    .then(r => r.json())
    .then(idpSettings => {
        let settings = {
            authority: idpSettings.authority,
            client_id: idpSettings.client_id,
            redirect_uri: idpSettings.redirect_uri,
            post_logout_redirect_uri: idpSettings.post_logout_redirect_uri,
            response_mode : 'fragment',
            response_type: 'id_token token',
            scope: process.env.REACT_APP_SCOPE,
        };
        return process.env.REACT_APP_USE_AUTHENTICATION === "true" ? new UserManager(settings) : new UserManagerMock(settings);
    });
export {userManagerPromise}
