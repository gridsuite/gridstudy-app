/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export type Nullable<T> = { [K in keyof T]: T[K] | null };
export type DeepNullable<T> = {
    [K in keyof T]: DeepNullable<T[K]> | null;
};
