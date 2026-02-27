/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Identifiable, FieldConstants } from '@gridsuite/commons-ui';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import {
    B,
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    G,
    HIGH_TAP_POSITION,
    ID,
    LOAD_TAP_CHANGING_CAPABILITIES,
    LOW_TAP_POSITION,
    MEASUREMENT_P1,
    MEASUREMENT_P2,
    MEASUREMENT_Q1,
    MEASUREMENT_Q2,
    PHASE_TAP_CHANGER_STATUS,
    R,
    RATED_S,
    RATED_U1,
    RATED_U2,
    RATIO_TAP_CHANGER_STATUS,
    REGULATING,
    REGULATING_TERMINAL_CONNECTABLE_ID,
    REGULATING_TERMINAL_CONNECTABLE_TYPE,
    REGULATING_TERMINAL_VOLTAGE_LEVEL_ID,
    REGULATION_MODE,
    REGULATION_VALUE,
    SELECTED,
    STEPS,
    STEPS_ALPHA,
    STEPS_BY_TAP_POSITION,
    STEPS_CONDUCTANCE,
    STEPS_RATIO,
    STEPS_REACTANCE,
    STEPS_RESISTANCE,
    STEPS_SUSCEPTANCE,
    STEPS_TAP,
    TAP_POSITION,
    TARGET_DEADBAND,
    TARGET_V,
    TO_BE_ESTIMATED,
    VALIDITY,
    VOLTAGE_LEVEL,
    X,
} from 'components/utils/field-constants';
import { UUID } from 'node:crypto';
import { ConnectablePositionFormInfos } from 'components/dialogs/connectivity/connectivity.type';
import { LimitsProperty, TwoWindingsTransformerModificationInfo } from 'services/network-modification-types';

export const PHASE_TAP = 'dephasing';
export const RATIO_TAP = 'ratio';

export type RuleType = typeof PHASE_TAP | typeof RATIO_TAP;

export interface TapChangerStep extends TapChangerStepMapInfos {
    [SELECTED]?: boolean;
}

export interface TapChangerPaneProps {
    id?: string;
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    voltageLevelOptions?: Identifiable[];
    previousValues?: TwoWindingsTransformerMapInfos;
    editData?: TwoWindingsTransformerModificationInfo;
    isModification?: boolean;
}

// Creation/Modification form types
export interface EntityIdReference {
    [ID]: string;
}

export type ConnectivityFormSchema = {
    [VOLTAGE_LEVEL]: EntityIdReference | null;
    [BUS_OR_BUSBAR_SECTION]: EntityIdReference | null;
    [CONNECTION_DIRECTION]: string | null;
    [CONNECTION_NAME]: string;
    [CONNECTION_POSITION]: number | null;
    [CONNECTED]: boolean | null;
};

export type CharacteristicsFormSchema = {
    [R]: number | null;
    [X]: number | null;
    [G]: number | null;
    [B]: number | null;
    [RATED_S]: number | null;
    [RATED_U1]: number | null;
    [RATED_U2]: number | null;
};
export type CharacteristicsCreationFormSchema = CharacteristicsFormSchema & {
    [CONNECTIVITY_1]: ConnectivityFormSchema;
    [CONNECTIVITY_2]: ConnectivityFormSchema;
};

export interface MeasurementFormSchema {
    [FieldConstants.VALUE]: number | null;
    [VALIDITY]: boolean | null;
}

export interface ToBeEstimatedFormSchema {
    [RATIO_TAP_CHANGER_STATUS]: boolean | null;
    [PHASE_TAP_CHANGER_STATUS]: boolean | null;
}

export interface StateEstimationFormSchema {
    [MEASUREMENT_P1]: MeasurementFormSchema;
    [MEASUREMENT_Q1]: MeasurementFormSchema;
    [MEASUREMENT_P2]: MeasurementFormSchema;
    [MEASUREMENT_Q2]: MeasurementFormSchema;
    [TO_BE_ESTIMATED]: ToBeEstimatedFormSchema;
}

// Types from network map server response

interface TwoWindingsTransformerToBeEstimatedInfos {
    ratioTapChangerStatus?: boolean;
    phaseTapChangerStatus?: boolean;
}

interface MeasurementsInfos {
    value?: number;
    validity: boolean;
}

export interface TemporaryLimitMapInfos {
    name: string;
    value?: number;
    acceptableDuration?: number;
}

export interface CurrentLimitsMapInfos {
    id?: string;
    permanentLimit?: number;
    temporaryLimits?: TemporaryLimitMapInfos[];
    temporaryLimitsByName?: Record<string, TemporaryLimitMapInfos>;
    applicability: string;
    limitsProperties?: LimitsProperty[];
}

export interface TapChangerStepMapInfos {
    [STEPS_RESISTANCE]: number;
    [STEPS_REACTANCE]: number;
    [STEPS_CONDUCTANCE]: number;
    [STEPS_SUSCEPTANCE]: number;
    [STEPS_RATIO]: number;
    [STEPS_ALPHA]?: number;
    [STEPS_TAP]?: number;
}

export interface TapChangerMapInfos {
    [LOW_TAP_POSITION]: number;
    [TAP_POSITION]: number;
    [HIGH_TAP_POSITION]: number;
    [REGULATING]?: boolean;
    [LOAD_TAP_CHANGING_CAPABILITIES]?: boolean;
    [TARGET_V]?: number;
    [TARGET_DEADBAND]?: number;
    [REGULATION_MODE]?: string;
    [REGULATION_VALUE]?: number;
    [REGULATING_TERMINAL_CONNECTABLE_ID]?: string;
    [REGULATING_TERMINAL_CONNECTABLE_TYPE]?: string;
    [REGULATING_TERMINAL_VOLTAGE_LEVEL_ID]?: string;
    [STEPS]?: TapChangerStepMapInfos[];
    [STEPS_BY_TAP_POSITION]?: Record<number, TapChangerStepMapInfos>;
}

export interface TwoWindingsTransformerMapInfos extends Identifiable {
    properties?: Record<string, string>;
    voltageLevelId1: string;
    voltageLevelName1: string;
    voltageLevelId2: string;
    voltageLevelName2: string;
    terminal1Connected: boolean;
    terminal2Connected: boolean;
    p1?: number;
    q1?: number;
    p2?: number;
    q2?: number;
    i1?: number;
    i2?: number;
    currentLimits?: CurrentLimitsMapInfos[];
    selectedOperationalLimitsGroupId1?: string;
    selectedOperationalLimitsGroupId2?: string;
    phaseTapChanger?: TapChangerMapInfos;
    ratioTapChanger?: TapChangerMapInfos;
    g: number;
    b: number;
    r: number;
    x: number;
    ratedU1: number;
    ratedU2: number;
    ratedS?: number;
    connectablePosition1: ConnectablePositionFormInfos;
    connectablePosition2: ConnectablePositionFormInfos;
    busOrBusbarSectionId1?: string;
    busOrBusbarSectionId2?: string;
    operatingStatus?: string;
    measurementP1?: MeasurementsInfos;
    measurementQ1?: MeasurementsInfos;
    measurementP2?: MeasurementsInfos;
    measurementQ2?: MeasurementsInfos;
    toBeEstimated?: TwoWindingsTransformerToBeEstimatedInfos;
}
