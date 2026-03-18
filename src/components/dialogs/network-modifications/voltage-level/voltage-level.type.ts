/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SwitchKind } from '@gridsuite/commons-ui';

export interface VoltageLevelFormInfos {
    equipmentId: string;
    equipmentName?: string | null;
    substationId?: string | null;
    topologyKind?: string | null;
}

export interface IdentifiableShortCircuitDto {
    ipMin: number | null;
    ipMax: number | null;
}

export interface VoltageLevelDto {
    id: string;
    name: string | null;
    topologyKind: string | null;
    substationId: string | null;
    nominalV: number;
    lowVoltageLimit: number | null;
    highVoltageLimit: number | null;
    busbarCount: number | null;
    sectionCount: number | null;
    switchKinds: SwitchKind[] | null;
    isSymmetrical: boolean | null;
    identifiableShortCircuit: IdentifiableShortCircuitDto | null;
    properties: Record<string, string> | null;
}
