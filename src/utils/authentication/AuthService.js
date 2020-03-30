import {UserManager} from 'oidc-client';
import {UserManagerMock} from "./UserManagerMock";

const settings = {
    authority: process.env.REACT_APP_STS_AUTHORITY,
    client_id: process.env.REACT_APP_CLIENT_ID,
    redirect_uri: `${process.env.REACT_APP_CLIENT_ROOT}sign-in-callback`,
    silent_redirect_uri: `${process.env.REACT_APP_CLIENT_ROOT}silent-renew`,
    post_logout_redirect_uri: `${process.env.REACT_APP_CLIENT_ROOT}`,
    response_mode : 'fragment',
    response_type: 'id_token token',
    scope: process.env.REACT_APP_SCOPE,
};

const userManager = process.env.REACT_APP_USE_AUTHENTICATION === "true" ? new UserManager(settings) : new UserManagerMock(settings);
export {userManager}
