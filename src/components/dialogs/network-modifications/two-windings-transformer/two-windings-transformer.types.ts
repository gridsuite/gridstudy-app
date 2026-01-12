/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Identifiable } from '@gridsuite/commons-ui';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import {
    ENABLED,
    HIGH_TAP_POSITION,
    LOW_TAP_POSITION,
    REGULATING,
    REGULATING_TERMINAL_CONNECTABLE_ID,
    REGULATING_TERMINAL_CONNECTABLE_TYPE,
    REGULATING_TERMINAL_VOLTAGE_LEVEL_ID,
    REGULATION_MODE,
    REGULATION_VALUE,
    SELECTED,
    STEPS,
    STEPS_ALPHA,
    STEPS_CONDUCTANCE,
    STEPS_RATIO,
    STEPS_REACTANCE,
    STEPS_RESISTANCE,
    STEPS_SUSCEPTANCE,
    STEPS_TAP,
    TAP_POSITION,
    TARGET_DEADBAND,
} from 'components/utils/field-constants';
import { UUID } from 'node:crypto';

export const PHASE_TAP = 'dephasing';
export const RATIO_TAP = 'ratio';

export type RuleType = typeof PHASE_TAP | typeof RATIO_TAP;

export interface TapChangerStep {
    [STEPS_RESISTANCE]: number;
    [STEPS_REACTANCE]: number;
    [STEPS_CONDUCTANCE]: number;
    [STEPS_SUSCEPTANCE]: number;
    [STEPS_RATIO]: number;
    [STEPS_ALPHA]?: number;
    [STEPS_TAP]?: number;
    [SELECTED]?: boolean;
}

export interface TapChangerData {
    [ENABLED]?: boolean;
    [HIGH_TAP_POSITION]?: number;
    [REGULATING]?: boolean;
    [LOW_TAP_POSITION]?: number;
    [REGULATING_TERMINAL_CONNECTABLE_ID]?: string;
    [REGULATING_TERMINAL_CONNECTABLE_TYPE]?: string;
    [REGULATING_TERMINAL_VOLTAGE_LEVEL_ID]?: string;
    [STEPS]?: TapChangerStep[];
    [TAP_POSITION]?: number;
    [TARGET_DEADBAND]?: number;
}

export interface RatioTapChangerData extends TapChangerData {
    hasLoadTapChangingCapabilities?: boolean;
    loadTapChangingCapabilities?: boolean;
    targetV?: number | null;
}

export interface PhaseTapChangerData extends TapChangerData {
    [REGULATION_MODE]?: string;
    [REGULATION_VALUE]?: number;
}

export interface TapChangerPaneProps {
    id?: string;
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    voltageLevelOptions?: Identifiable[];
    previousValues?: TwoWindingsTransformerData;
    editData?: Record<string, unknown>;
    isModification?: boolean;
}

export type PhaseTapChangerPaneProps = TapChangerPaneProps;
export type RatioTapChangerPaneProps = TapChangerPaneProps;

export interface TwoWindingsTransformerData {
    id?: string;
    name?: string;
    voltageLevelId1?: string;
    voltageLevelId2?: string;
    ratioTapChanger?: RatioTapChangerData;
    phaseTapChanger?: PhaseTapChangerData;
    [key: string]: unknown;
}
