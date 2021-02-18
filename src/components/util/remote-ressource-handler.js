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

    constructor(fetcher, errorHandler, postUpdate) {
        this.fetcher = fetcher;
        this.errorHandler = errorHandler;
        this.postUpdate = postUpdate;
    }

    values = undefined;
    updating = undefined;

    cbUpdateDone = new Set();

    getOrFetch(cbUpdateDone) {
        if (this.values === undefined) {
            if (cbUpdateDone) this.cbUpdateDone.add(cbUpdateDone);
            if (!this.updating) {
                this.updating = true;
                this.fetcher()
                    .then((val) => {
                        this.values = val;
                        if (this.postUpdate) this.postUpdate(this.values);
                        this.updating = false;
                        this.cbUpdateDone.forEach((cb) => cb());
                        this.cbUpdateDone.clear();
                    })
                    .catch((error) => {
                        if (this.errorHandler) this.errorHandler(error);
                        this.values = {};
                    });
            }
            return undefined;
        }
        if (cbUpdateDone) cbUpdateDone();
        return this.values;
    }

    lengthOrFetch(cbUpdateDone) {
        return (
            (this.values !== undefined && this.values.length) ||
            this.getOrFetch(cbUpdateDone)
        );
    }
}
