/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TextDecoder, TextEncoder } from 'util';

jest.mock('uuid', () => ({
    v1: () => 'xxx-xxx-xxx-xxx-xxx',
}));

console.info = jest.fn();
console.debug = jest.fn();

Object.assign(global, { TextDecoder, TextEncoder });

//FIXME workaround svg.panzoom.js import crash even though it's not used
global.SVG = () => {};
global.SVG.extend = () => {};
