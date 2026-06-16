/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useEffect, useState } from 'react';
import type { UserManager } from 'oidc-client-ts';
import {
    handleSilentRenewCallback,
    initializeAuthenticationProd,
    SilentRenewCallbackHandler,
} from '@gridsuite/commons-ui';
import { getCachedIdpSettings } from 'services/utils';

export default function SilentRenewApp() {
    const [userManager, setUserManager] = useState<UserManager | null>(null);

    useEffect(() => {
        initializeAuthenticationProd(
            () => undefined /* dispatch: unused when isSilentRenew=true */,
            true /* isSilentRenew */,
            getCachedIdpSettings /* reads the cache instead of fetching idpSettings.json */,
            false /* isSigningCallback */
        )
            .then(setUserManager)
            .catch((e) => console.error('Silent renew init failed:', e));
    }, []);

    const handleSilentRenewCallbackClosure = useCallback(() => {
        if (userManager) {
            handleSilentRenewCallback(userManager);
        }
    }, [userManager]);

    return (
        <SilentRenewCallbackHandler
            userManager={userManager}
            handleSilentRenewCallback={handleSilentRenewCallbackClosure}
        />
    );
}
