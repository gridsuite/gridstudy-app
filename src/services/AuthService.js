import { Log, UserManager } from 'oidc-client';

export class AuthService {
  userManager;

  constructor() {
    const settings = {
      authority: process.env.REACT_APP_STS_AUTHORITY,
      client_id: process.env.REACT_APP_CLIENT_ID,
      redirect_uri: `${process.env.REACT_APP_CLIENT_ROOT}signin-callback.html`,
      silent_redirect_uri: `${process.env.REACT_APP_CLIENT_ROOT}silent-renew.html`,
      // tslint:disable-next-line:object-literal-sort-keys
      post_logout_redirect_uri: `${process.env.REACT_APP_CLIENT_ROOT}`,
      response_mode : 'fragment',
      response_type: 'id_token token',
      scope: process.env.REACT_APP_SCOPE,
    };
    this.userManager = new UserManager(settings);
    Log.logger = console;
    Log.level = Log.INFO;
  }

  getUser() {
    return this.userManager.getUser();
  }

  login() {
    return this.userManager.signinRedirect();
  }

  renewToken() {
    return this.userManager.signinSilent();
  }

  logout() {
    return this.userManager.signoutRedirect();
  }
}
