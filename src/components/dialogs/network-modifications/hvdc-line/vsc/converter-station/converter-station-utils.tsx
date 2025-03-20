/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MODIFICATION_TYPES } from '@gridsuite/commons-ui';
import yup from '../../../../../utils/yup-config';
import {
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    CONVERTER_STATION_ID,
    CONVERTER_STATION_NAME,
    ID,
    LOSS_FACTOR,
    MAXIMUM_REACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_LIMITS,
    REACTIVE_POWER,
    VOLTAGE,
    VOLTAGE_LEVEL,
    VOLTAGE_REGULATION_ON,
} from '../../../../../utils/field-constants';
import {
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionValidationSchema,
} from '../../../../connectivity/connectivity-form-utils';
import {
    getReactiveLimitsEmptyFormData,
    getReactiveLimitsFormData,
    getReactiveLimitsSchema,
} from '../../../../reactive-limits/reactive-limits-utils';
import { UNDEFINED_CONNECTION_DIRECTION } from '../../../../../network/constants';
import { sanitizeString } from '../../../../dialog-utils';
import { toModificationOperation } from '../../../../../utils/utils';
import {
    AttributeModification,
    ConverterStationElementInfos,
    ConverterStationElementModificationInfos,
} from './converter-station-type';
import { ReactiveCapabilityCurvePoints } from '../../../../reactive-limits/reactive-limits.type';

export type UpdateReactiveCapabilityCurveTable = (action: string, index: number) => void;

export type UpdateReactiveCapabilityCurveTableConverterStation = (
    action: string,
    index: number,
    converterStationName: 'converterStation1' | 'converterStation2'
) => void;

export interface ConverterStationInterfaceEditData {
    equipmentId: string;
    equipmentName: string | null;
    lossFactor: number;
    reactivePowerSetpoint?: number;
    voltageRegulationOn: boolean;
    voltageSetpoint?: number | null;
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    busbarSectionName?: string;
    connectionDirection: string | null;
    connectionName?: string | null;
    connectionPosition?: number | null;
    terminalConnected?: boolean | null;
    reactiveCapabilityCurvePoints: ReactiveCapabilityCurvePoints[];
    reactiveCapabilityCurve: boolean;
    minQ: number | null;
    maxQ: number | null;
}

export interface ConverterStationModificationInterfaceEditData {
    equipmentId: string;
    equipmentName: AttributeModification<string> | null;
    lossFactor: AttributeModification<number> | null;
    reactivePowerSetpoint?: AttributeModification<number>;
    voltageRegulationOn: AttributeModification<boolean>;
    voltageSetpoint?: AttributeModification<number> | null;
    voltageLevelId: AttributeModification<string> | null;
    busOrBusbarSectionId: AttributeModification<string> | null;
    busbarSectionName?: AttributeModification<string> | null;
    connectionDirection: AttributeModification<string> | null;
    connectionName?: AttributeModification<string> | null;
    connectionPosition?: AttributeModification<number> | null;
    terminalConnected?: AttributeModification<boolean> | null;
    reactiveCapabilityCurvePoints: ReactiveCapabilityCurvePoints[];
    reactiveCapabilityCurve: AttributeModification<boolean> | null;
    minQ: AttributeModification<number> | null;
    maxQ: AttributeModification<number> | null;
}

export function getVscConverterStationSchema(id: string) {
    return {
        [id]: yup.object().shape({
            [CONVERTER_STATION_ID]: yup.string().nullable().required(),
            [CONVERTER_STATION_NAME]: yup.string().nullable(),
            [LOSS_FACTOR]: yup.number().nullable().required(),
            [VOLTAGE_REGULATION_ON]: yup.boolean(),
            [REACTIVE_POWER]: yup
                .number()
                .nullable()
                .when([VOLTAGE_REGULATION_ON], {
                    is: false,
                    then: (schema) => schema.required(),
                }),
            [VOLTAGE]: yup
                .number()
                .nullable()
                .when([VOLTAGE_REGULATION_ON], {
                    is: true,
                    then: (schema) => schema.required(),
                }),
            ...getConnectivityWithPositionValidationSchema(),
            ...getReactiveLimitsSchema(false, true),
        }),
    };
}

export function getVscConverterStationModificationSchema(id: string) {
    return {
        [id]: yup.object().shape({
            [CONVERTER_STATION_ID]: yup.string(),
            [CONVERTER_STATION_NAME]: yup.string().nullable(),
            [LOSS_FACTOR]: yup.number().nullable(),
            [VOLTAGE_REGULATION_ON]: yup.boolean().nullable(),
            [REACTIVE_POWER]: yup.number().nullable(),
            [VOLTAGE]: yup.number().nullable(),
            ...getReactiveLimitsSchema(true),
        }),
    };
}

export function getVscConverterStationEmptyFormData(id: string, isModification = false) {
    return {
        [id]: {
            [CONVERTER_STATION_ID]: isModification ? '' : null,
            [CONVERTER_STATION_NAME]: isModification ? '' : null,
            [LOSS_FACTOR]: null,
            [REACTIVE_POWER]: null,
            [VOLTAGE_REGULATION_ON]: isModification ? null : false,
            [VOLTAGE]: null,
            ...getConnectivityWithPositionEmptyFormData(),
            ...getReactiveLimitsEmptyFormData(),
        },
    };
}

export function getConverterStationCreationData(converterStation: any) {
    const reactiveLimits = converterStation[REACTIVE_LIMITS];
    const isReactiveCapabilityCurveOn = reactiveLimits[REACTIVE_CAPABILITY_CURVE_CHOICE] === 'CURVE';
    return {
        type: MODIFICATION_TYPES.CONVERTER_STATION_CREATION.type,
        equipmentId: converterStation[CONVERTER_STATION_ID],
        equipmentName: converterStation[CONVERTER_STATION_NAME],
        lossFactor: converterStation[LOSS_FACTOR],
        reactivePowerSetpoint: converterStation[REACTIVE_POWER],
        voltageRegulationOn: converterStation[VOLTAGE_REGULATION_ON],
        voltageSetpoint: converterStation[VOLTAGE],
        voltageLevelId: converterStation[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
        busOrBusbarSectionId: converterStation[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
        connectionName: sanitizeString(converterStation[CONNECTIVITY]?.[CONNECTION_NAME]),
        connectionDirection: converterStation[CONNECTIVITY]?.[CONNECTION_DIRECTION] ?? UNDEFINED_CONNECTION_DIRECTION,
        connectionPosition: converterStation[CONNECTIVITY]?.[CONNECTION_POSITION],
        terminalConnected: converterStation[CONNECTIVITY]?.[CONNECTED],
        reactiveCapabilityCurve: isReactiveCapabilityCurveOn,
        minQ: isReactiveCapabilityCurveOn ? null : reactiveLimits[MINIMUM_REACTIVE_POWER],
        maxQ: isReactiveCapabilityCurveOn ? null : reactiveLimits[MAXIMUM_REACTIVE_POWER],
        reactiveCapabilityCurvePoints: isReactiveCapabilityCurveOn
            ? reactiveLimits[REACTIVE_CAPABILITY_CURVE_TABLE]
            : null,
    };
}

export function getConverterStationModificationData(
    converterStation: any,
    converterStationToModify: ConverterStationElementModificationInfos | undefined
) {
    const reactiveLimits = converterStation[REACTIVE_LIMITS];
    const isReactiveCapabilityCurveOn = reactiveLimits[REACTIVE_CAPABILITY_CURVE_CHOICE] === 'CURVE';

    return {
        type: MODIFICATION_TYPES.CONVERTER_STATION_MODIFICATION.type,
        equipmentId: converterStationToModify?.id ?? converterStation[CONVERTER_STATION_ID],
        equipmentName: toModificationOperation(converterStation[CONVERTER_STATION_NAME]),
        lossFactor: toModificationOperation(converterStation[LOSS_FACTOR]),
        reactivePowerSetpoint: toModificationOperation(converterStation[REACTIVE_POWER]),
        voltageRegulationOn: toModificationOperation(converterStation[VOLTAGE_REGULATION_ON]),
        voltageSetpoint: toModificationOperation(converterStation[VOLTAGE]),
        voltageLevelId: toModificationOperation(converterStation[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID]),
        busOrBusbarSectionId: toModificationOperation(converterStation[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID]),
        reactiveCapabilityCurve: toModificationOperation(isReactiveCapabilityCurveOn),
        minQ: toModificationOperation(isReactiveCapabilityCurveOn ? null : reactiveLimits[MINIMUM_REACTIVE_POWER]),
        maxQ: toModificationOperation(isReactiveCapabilityCurveOn ? null : reactiveLimits[MAXIMUM_REACTIVE_POWER]),
        reactiveCapabilityCurvePoints: isReactiveCapabilityCurveOn
            ? reactiveLimits[REACTIVE_CAPABILITY_CURVE_TABLE]
            : null,
    };
}

export function getConverterStationFormEditData(id: string, converterStation: ConverterStationInterfaceEditData) {
    return {
        [id]: {
            [CONVERTER_STATION_ID]: converterStation?.equipmentId,
            [CONVERTER_STATION_NAME]: converterStation?.equipmentName ?? '',
            [LOSS_FACTOR]: converterStation?.lossFactor,
            [REACTIVE_POWER]: converterStation?.reactivePowerSetpoint,
            [VOLTAGE_REGULATION_ON]: converterStation?.voltageRegulationOn,
            [VOLTAGE]: converterStation?.voltageSetpoint,
            ...getConnectivityFormData({
                voltageLevelId: converterStation?.voltageLevelId,
                busbarSectionId: converterStation?.busOrBusbarSectionId,
                connectionDirection: converterStation?.connectionDirection,
                connectionName: converterStation?.connectionName,
                connectionPosition: converterStation?.connectionPosition,
                busbarSectionName: converterStation?.busbarSectionName,
                terminalConnected: converterStation?.terminalConnected,
            }),
            ...getConverterStationReactiveLimits(converterStation),
        },
    };
}

export function getConverterStationModificationFormEditData(
    id: string,
    converterStation: ConverterStationModificationInterfaceEditData
) {
    return {
        [id]: {
            [CONVERTER_STATION_ID]: converterStation?.equipmentId,
            [CONVERTER_STATION_NAME]: converterStation?.equipmentName?.value ?? '',
            [LOSS_FACTOR]: converterStation?.lossFactor?.value ?? null,
            [REACTIVE_POWER]: converterStation?.reactivePowerSetpoint?.value ?? null,
            [VOLTAGE_REGULATION_ON]: converterStation?.voltageRegulationOn?.value ?? null,
            [VOLTAGE]: converterStation?.voltageSetpoint?.value ?? null,
            ...getConnectivityFormData({
                voltageLevelId: converterStation?.voltageLevelId?.value ?? null,
                busbarSectionId: converterStation?.busOrBusbarSectionId?.value ?? null,
                connectionDirection: converterStation?.connectionDirection?.value ?? null,
                connectionName: converterStation?.connectionName?.value ?? null,
                connectionPosition: converterStation?.connectionPosition?.value ?? null,
                busbarSectionName: converterStation?.busbarSectionName?.value ?? null,
                terminalConnected: converterStation?.terminalConnected?.value ?? null,
            }),
            ...getConverterStationModificationReactiveLimits(converterStation),
        },
    };
}
function getConverterStationReactiveLimits(converterStation: ConverterStationInterfaceEditData) {
    return converterStation.reactiveCapabilityCurve
        ? getReactiveLimitsFormData({
              reactiveCapabilityCurveChoice: 'CURVE',
              minimumReactivePower: null,
              maximumReactivePower: null,
              reactiveCapabilityCurveTable: converterStation.reactiveCapabilityCurvePoints,
          })
        : getReactiveLimitsFormData({
              reactiveCapabilityCurveChoice: 'MINMAX',
              minimumReactivePower: converterStation.minQ,
              maximumReactivePower: converterStation.maxQ,
              reactiveCapabilityCurveTable: converterStation?.reactiveCapabilityCurvePoints ?? null,
          });
}

function getConverterStationModificationReactiveLimits(
    converterStationEditData: ConverterStationModificationInterfaceEditData
) {
    return {
        ...getReactiveLimitsFormData({
            reactiveCapabilityCurveChoice: converterStationEditData?.reactiveCapabilityCurve?.value
                ? 'CURVE'
                : 'MINMAX',
            maximumReactivePower: converterStationEditData?.maxQ?.value ?? null,
            minimumReactivePower: converterStationEditData?.minQ?.value ?? null,
            reactiveCapabilityCurveTable: converterStationEditData?.reactiveCapabilityCurvePoints ?? null,
        }),
    };
}
export function getConverterStationFromSearchCopy(id: string, converterStation: ConverterStationElementInfos) {
    return {
        [id]: {
            [CONVERTER_STATION_ID]: converterStation.id + '(1)',
            [CONVERTER_STATION_NAME]: converterStation?.name ?? '',
            [LOSS_FACTOR]: converterStation.lossFactor,
            [REACTIVE_POWER]: converterStation?.reactivePowerSetpoint,
            [VOLTAGE_REGULATION_ON]: converterStation.voltageRegulatorOn,
            [VOLTAGE]: converterStation?.voltageSetpoint,
            ...getConnectivityFormData({
                voltageLevelId: converterStation?.voltageLevelId,
                busbarSectionId: converterStation?.busOrBusbarSectionId,
                connectionDirection: converterStation?.connectablePosition?.connectionDirection,
                connectionName: converterStation?.connectablePosition?.connectionName,
                connectionPosition: null,
                busbarSectionName: null,
                terminalConnected: true,
            }),
            ...getReactiveLimitsFormData({
                reactiveCapabilityCurveChoice: converterStation?.minMaxReactiveLimits ? 'MINMAX' : 'CURVE',
                minimumReactivePower: converterStation?.minMaxReactiveLimits?.minQ,
                maximumReactivePower: converterStation?.minMaxReactiveLimits?.maxQ,
                reactiveCapabilityCurveTable: converterStation.reactiveCapabilityCurvePoints ?? null,
            }),
        },
    };
}
