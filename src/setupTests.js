/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

//FIXME workaround svg.panzoom.js import crash even though it's not used

// make crypto.randomUUID() available in tests
import crypto from 'crypto';

global.IS_REACT_ACT_ENVIRONMENT = true;

window.crypto = {
    randomUUID: function () {
        return crypto.randomUUID();
    },
};

global.SVG = () => {};
global.SVG.extend = () => {};
