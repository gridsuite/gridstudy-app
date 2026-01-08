/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PHASE_TAP, RATIO_TAP } from './creation/two-windings-transformer-creation-dialog';
import { PhaseTapChangerData, RatioTapChangerData } from './tap-changer-pane/tap-changer-pane.types';

export type RuleType = typeof PHASE_TAP | typeof RATIO_TAP;

export interface TwoWindingsTransformerData {
    id?: string;
    name?: string;
    voltageLevelId1?: string;
    voltageLevelId2?: string;
    ratioTapChanger?: RatioTapChangerData | null;
    phaseTapChanger?: PhaseTapChangerData | null;
    [key: string]: unknown;
}
