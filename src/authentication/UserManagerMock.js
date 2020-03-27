export class UserManagerMock {
    settings;

    constructor(settings) {
        this.settings = settings;
    }

    getUser() {
        return Promise.resolve(JSON.parse(sessionStorage.getItem("powsybl-study-app-mock-user")));
    }

    signinRedirect() {
        window.location = "/sign-in-callback";
        return Promise.resolve(null);
    }

    signinSilent() {
        return Promise.resolve(null);
    }

    signoutRedirect() {
        sessionStorage.setItem("powsybl-study-app-mock-user", null);
        window.location = "/";
        return Promise.resolve(null);
    }
    signinRedirectCallback() {
        sessionStorage.setItem("powsybl-study-app-mock-user",  JSON.stringify({profile:{name:"John Doe"}}));
        return Promise.resolve("");
    }
}
