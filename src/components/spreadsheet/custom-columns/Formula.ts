/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface Formula /*<TData>*/ {
    destroy(): void;

    //calc(formula: string, scope: TData): unknown;
    calcColumnValue(
        formula: string,
        lineData: Record<string, unknown>,
        currentNode: unknown,
        colGetter: (field: string) => unknown
    ): unknown;

    formulaToString(x: unknown): string;
    formulaSerialize(x: unknown): string;
    formulaDeserialize(json: string): unknown;
}
