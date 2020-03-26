export class UserManagerMock {
    settings;

    constructor(settings) {
        this.settings = settings;
    }

    getUser() {
        return Promise.resolve(JSON.parse(sessionStorage.getItem("user")));
    }

    signinRedirect() {
        window.location = "/sign-in-callback";
        return Promise.resolve(null);
    }

    signinSilent() {
        return Promise.resolve(null);
    }

    signoutRedirect() {
        sessionStorage.setItem("user", null);
        window.location = "/";
        return Promise.resolve(null);
    }
    signinRedirectCallback() {
        sessionStorage.setItem("user",  JSON.stringify({profile:{name:"John Doe"}}));
        return Promise.resolve("");
    }
}
