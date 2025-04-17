/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface PhaseTapChangerStepData {
    index: number;
    rho: number;
    r: number;
    x: number;
    g: number;
    b: number;
    alpha: number;
}

export interface PhaseTapChangerFormInfos {
    lowTapPosition: number;
    tapPosition: number;
    highTapPosition: number;
    isRegulating: boolean;
    regulationMode: string;
    regulatingTerminalConnectableId: string;
    regulatingTerminalConnectableType: string;
    regulatingTerminalVlId: string;
    targetDeadband: number | null;
    regulationValue: number | null;
    steps: PhaseTapChangerStepData[];
}
