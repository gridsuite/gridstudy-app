/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export class RemoteRessourceHandler {
    fetcher = undefined;
    errorHandler = undefined;
    postUpdate = undefined;
    cbUpdateDone = new Set();

    constructor(fetcher, setter, errorHandler, postUpdate) {
        this.fetcher = fetcher;
        this.setter = setter;
        this.errorHandler = errorHandler;
        this.postUpdate = postUpdate;
    }

    fetched = undefined;

    fetch(cbUpdateDone, forceUpdate) {
        if (this.fetched === undefined || forceUpdate) {
            this.fetched = false;
            if (cbUpdateDone) this.cbUpdateDone.add(cbUpdateDone);
            Promise.all([this.fetcher()])
                .then((val) => {
                    this.setter(val[0]);
                    if (this.postUpdate) this.postUpdate(val[0]);
                    this.fetched = true;
                    this.cbUpdateDone.forEach((cb) => cb());
                    this.cbUpdateDone.clear();
                })
                .catch((error) => {
                    if (this.errorHandler) this.errorHandler(error);
                });
        } else if (this.fetched && cbUpdateDone) cbUpdateDone();
    }
}
