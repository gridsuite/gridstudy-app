/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * This file is only to break the cyclic dependency in reducer.test + reducers + store
 * TODO: remove when upgrading to next commons-ui version
 */
/*
    at src/redux/store.ts:12:33
    at src/services/utils.ts:7:1
    at src/services/study/index.ts:8:1
    at src/components/utils/inputs/input-hooks.jsx:41:1
    at src/components/dialogs/commons/modification-dialog-content.jsx:19:1
    at src/components/dialogs/commons/modificationDialog.jsx:12:1
    at src/components/dialogs/network-modifications/generator/modification/regulating-terminal-modification-dialog.jsx:23:1
    at src/components/spreadsheet/utils/equipment-table-editors.jsx:25:1
    at src/components/spreadsheet/utils/config-tables.js:11:1
    at src/redux/reducer.ts:192:1
    at src/redux/reducer.test.ts:10:1
 */

import { User } from 'oidc-client';

type UserStoreState = {
    user: User | null;
};

interface UserStore {
    getState(): UserStoreState;
}

let userStore: UserStore | undefined;

export function setUserStore(store: UserStore): void {
    userStore = store;
}

//TODO use the one from commons-ui instead when exported in next version
export function getUserToken() {
    return userStore?.getState().user?.id_token ?? undefined;
}
