/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect} from "react";
import {Redirect, Route, Switch} from "react-router-dom";
import SignInCallback from "./signin-callback";
import {handleSigninCallback, handleSilentRenewCallback, login} from "../../utils/authentication/AuthService";
import SilentRenewCallback from "./silent-renew-callback";
import Authentication from "./authentication";

const AuthenticationRouter = ({userManager, signInCallbackError, dispatch, history, location}) => {
    return (
        <React.Fragment>
            {userManager.error !== null && (<h1>Error : Getting userManager; {userManager.error}</h1>)}
            {signInCallbackError !== null && (<h1>Error : SignIn Callback Error; {signInCallbackError.message}</h1>)}
            <Switch>
                <Route exact path="/sign-in-callback">
                    <SignInCallback userManager={userManager} handleSigninCallback={() => handleSigninCallback(dispatch, history, userManager.instance)}/>
                </Route>
                <Route exact path="/silent-renew-callback">
                    <SilentRenewCallback userManager={userManager} handleSilentRenewCallback={() => handleSilentRenewCallback(userManager.instance)}/>
                </Route>
                <Route exact path="/logout-callback">
                    <Redirect to="/" />
                </Route>
                <Route>
                    {userManager.error === null && (<Authentication disabled={userManager.instance === null} onLoginClick={() => login(location, userManager.instance)}/>)}
                </Route>
            </Switch>
        </React.Fragment>
    )
};
export default AuthenticationRouter;
