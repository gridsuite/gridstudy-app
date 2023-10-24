/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export enum BranchSide {
    ONE = 'ONE',
    TWO = 'TWO',
}

export const PREDEFINED_PARAMETERS = [
    //todo : traduction?
    { id: 'NOMINAL', label: 'ICC max avec plan de tension normalisé' },
    { id: 'CONFIGURED', label: 'ICC max avec norme CEI 909' },
];

export const INITIAL_VOLTAGE_PROFILE_MODE = {
    NOMINAL: { id: 'NOMINAL', label: 'Normalisé' },
    CONFIGURED: { id: 'CONFIGURED', label: 'CEI 909' },
};
