/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export function getNominalVoltageColor(nominalV) {
    if (nominalV >= 300) {
        return [255, 0, 0];
    } else if (nominalV >= 170 && nominalV < 300) {
        return [34, 139, 34];
    } else if (nominalV >= 120 && nominalV < 170) {
        return [1, 175, 175];
    } else if (nominalV >= 70 && nominalV < 120) {
        return [204, 85, 0];
    } else if (nominalV >= 50 && nominalV < 70) {
        return [160, 32, 240];
    } else if (nominalV >= 30 && nominalV < 50) {
        return [255, 130, 144];
    } else {
        return [171, 175, 40];
    }
}

export const INVALID_LOADFLOW_OPACITY = 0.2;
export const NAD_INVALID_LOADFLOW_OPACITY = 0.4;
