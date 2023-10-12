/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export enum NMK_TYPE {
    CONSTRAINTS_FROM_CONTINGENCIES = 'constraints-from-contingencies',
    CONTINGENCIES_FROM_CONSTRAINTS = 'contingencies-from-constraints',
}

export enum RESULT_TYPE {
    N = 'N',
    NMK_CONSTRAINTS = 'NMK_CONSTRAINTS',
    NMK_CONTINGENCIES = 'NMK_CONTINGENCIES',
}
