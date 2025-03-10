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
export type OptionalNullableUndefined<T> = {
    [K in keyof T]?: T[K] extends (infer U)[] // If it's an array
        ? (OptionalNullableUndefined<U> | null | undefined)[] // Transform each element in the array
        : T[K] extends object // If it's an object
        ? OptionalNullableUndefined<T[K]> | null | undefined // Transform recursively
        : T[K] | null | undefined; // Primitive types
};
