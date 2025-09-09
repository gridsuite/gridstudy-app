/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Omits the 'ref' attribute from the given props object.
 * @template P The props object type.
 *
 * @import {PropsWithoutRef} from "react"
 * @see inspired from {@link PropsWithoutRef}
 */
export type PropsWithoutChildren<P> =
    /* Omit would not be enough for this. We'd like to avoid unnecessary mapping and need a distributive conditional to support unions.
     * see: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
     * https://github.com/Microsoft/TypeScript/issues/28339 */
    P extends any ? ('children' extends keyof P ? Omit<P, 'children'> : P) : P;
