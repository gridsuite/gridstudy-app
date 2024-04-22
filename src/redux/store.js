/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { legacy_createStore as createStore } from 'redux';
import { reducer } from './reducer';

export const store = createStore(reducer);

// to avoid to reset the state with HMR
if (import.meta.env.DEV && import.meta.hot) {
    import.meta.hot.accept('./reducer', () => store.replaceReducer(reducer))
}