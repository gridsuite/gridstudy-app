/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

//FIXME workaround svg.panzoom.js import crash even though it's not used
global.SVG = () => {};
global.SVG.extend = () => {};

// Cheap simple system to suppress messages, we should add things here when we need them
const nativeConsoleError = global.console.error;
const nativeConsoleWarn = global.console.warn;
const allSuppressed = {errors: [], warns: []};
const makeSuppresser = (nativeLog, type) => (...args) => {
  if (allSuppressed[type].some( suppressed => args.join('').includes(suppressed))) {
    return
  }
  return nativeLog(...args)
}
global.console.error = makeSuppresser(nativeConsoleError, "errors");
global.console.warn = makeSuppresser(nativeConsoleWarn, "warns");
// Simple console suppress configuration API, can be extended later if we need it..
global.WithSuppressedConsole = (suppressed, test) => {
    const oldSuppressed = {...allSuppressed};
    Object.assign(allSuppressed, suppressed({
        errors: [...allSuppressed.errors],
        warns: [...allSuppressed.warns],
    }));
    try {
        test();
    } finally {
        Object.assign(allSuppressed, oldSuppressed);
    }
}
