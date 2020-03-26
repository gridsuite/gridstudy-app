import { Log, UserManager } from 'oidc-client';
import {UserManagerMock} from "./UserManagerMock";

export class UserManagerHelper {
  userManager;

  getUserManagerInstance() {
    return this.userManager;
  }

  constructor() {
    const settings = {
      authority: process.env.REACT_APP_STS_AUTHORITY,
      client_id: process.env.REACT_APP_CLIENT_ID,
      redirect_uri: `${process.env.REACT_APP_CLIENT_ROOT}sign-in-callback`,
      silent_redirect_uri: `${process.env.REACT_APP_CLIENT_ROOT}silent-renew`,
      // tslint:disable-next-line:object-literal-sort-keys
      post_logout_redirect_uri: `${process.env.REACT_APP_CLIENT_ROOT}`,
      response_mode : 'fragment',
      response_type: 'id_token token',
      scope: process.env.REACT_APP_SCOPE,
    };
    if (process.env.REACT_APP_USE_AUTHENTICATION === "true") {
      this.userManager = new UserManager(settings);
    } else {
      this.userManager = new UserManagerMock(settings);
    }
    Log.logger = console;
    Log.level = Log.INFO;
  }
}
