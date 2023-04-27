/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// TODO to be replaced with a custom hook
export class RemoteResourceHandler {
    fetcher = undefined;
    errorHandler = undefined;
    postUpdate = undefined;

    constructor(fetcher, setter, errorHandler) {
        this.fetcher = fetcher;
        this.setter = setter;
        this.errorHandler = errorHandler;
    }

    fetched = undefined;

    fetch() {
        if (this.fetched === undefined) {
            this.fetched = false;
            this.fetcher()
                .then((val) => {
                    this.fetched = true;
                    this.setter(val);
                })
                .catch((error) => {
                    if (this.errorHandler) {
                        this.errorHandler(error);
                    }
                });
        }
        return this.fetched;
    }

    isFetched() {
        return this.fetched === true;
    }
}
