/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { CommonBranchEquipmentInfos } from 'components/tooltips/equipment-popover-type';
import { Identifiable } from '@gridsuite/commons-ui';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import {
    CURRENT_LIMITER_REGULATING_VALUE,
    ENABLED,
    EQUIPMENT,
    FLOW_SET_POINT_REGULATING_VALUE,
    HIGH_TAP_POSITION,
    LOAD_TAP_CHANGING_CAPABILITIES,
    LOW_TAP_POSITION,
    PHASE_TAP_CHANGER,
    RATIO_TAP_CHANGER,
    REGULATING,
    REGULATING_TERMINAL_CONNECTABLE_ID,
    REGULATING_TERMINAL_CONNECTABLE_TYPE,
    REGULATING_TERMINAL_VOLTAGE_LEVEL_ID,
    REGULATION_MODE,
    REGULATION_SIDE,
    REGULATION_TYPE,
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
    TARGET_V,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import { UUID } from 'node:crypto';
import { ConnectablePositionFormInfos } from 'components/dialogs/connectivity/connectivity.type';
import { CurrentLimitsData } from 'services/study/network-map.type';
import { OperationalLimitsGroupFormSchema } from 'components/dialogs/limits/operational-limits-groups-types';
import { Property } from '../common/properties/property-utils';

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
    terminalRefConnectableId?: string;
    terminalRefConnectableVlId?: string;
    terminalRefConnectableType?: string;
    [REGULATION_MODE]?: string;
    [REGULATION_VALUE]?: number;
    [REGULATION_TYPE]?: string;
    [REGULATION_SIDE]?: string;
    [LOAD_TAP_CHANGING_CAPABILITIES]?: boolean;
    loadTapChangingCapabilities?: boolean;
    [TARGET_V]?: number | null;
    [EQUIPMENT]?: Record<string, unknown>;
    [VOLTAGE_LEVEL]?: Identifiable | null;
}

export interface RatioTapChangerData extends TapChangerData {}

export interface PhaseTapChangerData extends TapChangerData {
    [FLOW_SET_POINT_REGULATING_VALUE]?: number;
    [CURRENT_LIMITER_REGULATING_VALUE]?: number;
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

export interface TwoWindingsTransformerData extends CommonBranchEquipmentInfos {
    uuid?: UUID;
    equipmentId?: string;
    equipmentName?: string;
    g?: number;
    b?: number;
    ratedU1?: number;
    ratedU2?: number;
    ratedS?: number;
    busOrBusbarSectionId1?: string;
    busOrBusbarSectionId2?: string;
    connectionDirection1?: string;
    connectionDirection2?: string;
    connectablePosition1?: ConnectablePositionFormInfos;
    connectablePosition2?: ConnectablePositionFormInfos;
    connectionName1?: string;
    connectionName2?: string;
    connectionPosition1?: number;
    connectionPosition2?: number;
    currentLimits?: CurrentLimitsData[] | null;
    voltageLevelId1?: string;
    voltageLevelId2?: string;
    connected1?: boolean;
    connected2?: boolean;
    operationalLimitsGroups?: OperationalLimitsGroupFormSchema[];
    selectedOperationalLimitsGroupId1?: string;
    selectedOperationalLimitsGroupId2?: string;
    [RATIO_TAP_CHANGER]?: RatioTapChangerData;
    [PHASE_TAP_CHANGER]?: PhaseTapChangerData;
    properties?: Property[] | null;
    [key: string]: unknown;
}
