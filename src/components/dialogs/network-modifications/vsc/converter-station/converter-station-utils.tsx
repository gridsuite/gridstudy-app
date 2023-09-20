/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../../utils/yup-config';
import {
    BUS_OR_BUSBAR_SECTION,
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
} from '../../../../utils/field-constants';
import {
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionValidationSchema,
} from '../../../connectivity/connectivity-form-utils';
import {
    getReactiveLimitsEmptyFormData,
    getReactiveLimitsFormData,
    getReactiveLimitsSchema,
} from '../../../reactive-limits/reactive-limits-utils';
import { UNDEFINED_CONNECTION_DIRECTION } from '../../../../network/constants';
import { sanitizeString } from '../../../dialogUtils';
import { getRowEmptyFormData } from '../../../reactive-limits/reactive-capability-curve/reactive-capability-utils';
import { MODIFICATION_TYPES } from '../../../../utils/modification-type';

interface ReactiveCapabilityCurvePointsData {
    p?: number | null;
    qmaxP?: number | null;
    qminP?: number | null;
}

interface MinMaxReactiveLimitsData {
    minMaxReactiveLimits: number | null;
    maximumReactivePower: number | null;
}

interface ConnectablePositionInfos {
    connectionName: string | null;
    connectionDirection: string | null;
    connectionPosition: number | null;
}

interface ConverterStationInterfaceEditData {
    equipmentId: string;
    equipmentName: string | null;
    lossFactor: number;
    reactivePower?: number;
    voltageRegulationOn: boolean;
    voltage?: number | null;
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    busbarSectionName?: string;
    connectionDirection: string | null;
    connectionName?: string | null;
    connectionPosition?: string | null;
    reactiveCapabilityCurvePoints: ReactiveCapabilityCurvePointsData[];
    reactiveCapabilityCurve: boolean;
    minimumReactivePower: number | null;
    maximumReactivePower: number | null;
}

export interface ConverterStationElementInfos {
    id: string;
    name: string | null;
    lossFactor: number;
    voltageSetpoint: number | null;
    reactivePowerSetpoint: number | null;
    voltageRegulatorOn: boolean;
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    nominalVoltage: number;
    terminalConnected: boolean;
    p: number | null;
    q: number | null;
    reactiveCapabilityCurvePoints: ReactiveCapabilityCurvePointsData[];
    minMaxReactiveLimits: MinMaxReactiveLimitsData | null;
    connectablePositionInfos: ConnectablePositionInfos;
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

export function getVscConverterStationEmptyFormData(id: string) {
    return {
        [id]: {
            [CONVERTER_STATION_ID]: null,
            [CONVERTER_STATION_NAME]: null,
            [LOSS_FACTOR]: null,
            [REACTIVE_POWER]: null,
            [VOLTAGE_REGULATION_ON]: false,
            [VOLTAGE]: null,
            ...getConnectivityWithPositionEmptyFormData(),
            ...getReactiveLimitsEmptyFormData(),
        },
    };
}

export function getConverterStationCreationData(converterStation: any) {
    const reactiveLimits = converterStation[REACTIVE_LIMITS];
    const isReactiveCapabilityCurveOn =
        reactiveLimits[REACTIVE_CAPABILITY_CURVE_CHOICE] === 'CURVE';
    return {
        type: MODIFICATION_TYPES.CONVERTER_STATION_CREATION.type,
        equipmentId: converterStation[CONVERTER_STATION_ID],
        equipmentName: converterStation[CONVERTER_STATION_NAME],
        lossFactor: converterStation[LOSS_FACTOR],
        reactivePower: converterStation[REACTIVE_POWER],
        voltageRegulationOn: converterStation[VOLTAGE_REGULATION_ON],
        voltage: converterStation[VOLTAGE],
        voltageLevelId: converterStation[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
        busOrBusbarSectionId:
            converterStation[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
        connectionName: sanitizeString(
            converterStation[CONNECTIVITY]?.[CONNECTION_NAME]
        ),
        connectionDirection:
            converterStation[CONNECTIVITY]?.[CONNECTION_DIRECTION] ??
            UNDEFINED_CONNECTION_DIRECTION,
        connectionPosition:
            converterStation[CONNECTIVITY]?.[CONNECTION_POSITION],
        reactiveCapabilityCurve: isReactiveCapabilityCurveOn,
        minimumReactivePower: isReactiveCapabilityCurveOn
            ? null
            : reactiveLimits[MINIMUM_REACTIVE_POWER],
        maximumReactivePower: isReactiveCapabilityCurveOn
            ? null
            : reactiveLimits[MAXIMUM_REACTIVE_POWER],
        reactiveCapabilityCurvePoints: isReactiveCapabilityCurveOn
            ? reactiveLimits[REACTIVE_CAPABILITY_CURVE_TABLE]
            : null,
    };
}

export function getConverterStationFormEditData(
    id: string,
    converterStation: ConverterStationInterfaceEditData
) {
    return {
        [id]: {
            [CONVERTER_STATION_ID]: converterStation.equipmentId,
            [CONVERTER_STATION_NAME]: converterStation?.equipmentName ?? '',
            [LOSS_FACTOR]: converterStation.lossFactor,
            [REACTIVE_POWER]: converterStation?.reactivePower,
            [VOLTAGE_REGULATION_ON]: converterStation.voltageRegulationOn,
            [VOLTAGE]: converterStation?.voltage,
            ...getConnectivityFormData({
                voltageLevelId: converterStation.voltageLevelId,
                busbarSectionId: converterStation.busOrBusbarSectionId,
                connectionDirection: converterStation?.connectionDirection,
                connectionName: converterStation?.connectionName,
                connectionPosition: converterStation?.connectionPosition,
                busbarSectionName: converterStation?.busbarSectionName,
            }),
            ...getConverterStationReactiveLimits(converterStation),
        },
    };
}

function getConverterStationReactiveLimits(
    converterStation: ConverterStationInterfaceEditData
) {
    return converterStation.reactiveCapabilityCurve
        ? getReactiveLimitsFormData({
              reactiveCapabilityCurveChoice: 'CURVE',
              minimumReactivePower: null,
              maximumReactivePower: null,
              reactiveCapabilityCurveTable:
                  converterStation.reactiveCapabilityCurvePoints,
          })
        : getReactiveLimitsFormData({
              reactiveCapabilityCurveChoice: 'MINMAX',
              minimumReactivePower: converterStation.minimumReactivePower,
              maximumReactivePower: converterStation.maximumReactivePower,
              reactiveCapabilityCurveTable: [
                  getRowEmptyFormData(),
                  getRowEmptyFormData(),
              ],
          });
}

export function getConverterStationFromSearchCopy(
    id: string,
    converterStation: ConverterStationElementInfos
) {
    return {
        [id]: {
            [CONVERTER_STATION_ID]: converterStation.id + '(1)',
            [CONVERTER_STATION_NAME]: converterStation?.name ?? '',
            [LOSS_FACTOR]: converterStation.lossFactor,
            [REACTIVE_POWER]: converterStation?.reactivePowerSetpoint,
            [VOLTAGE_REGULATION_ON]: converterStation.voltageRegulatorOn,
            [VOLTAGE]: converterStation?.voltageSetpoint,
            ...getConnectivityFormData({
                voltageLevelId: converterStation.voltageLevelId,
                busbarSectionId: converterStation.busOrBusbarSectionId,
                connectionDirection:
                    converterStation?.connectablePositionInfos
                        ?.connectionDirection,
                connectionName:
                    converterStation?.connectablePositionInfos?.connectionName,
                connectionPosition: null,
                busbarSectionName: null,
            }),
            ...getReactiveLimitsFormData({
                reactiveCapabilityCurveChoice:
                    converterStation?.minMaxReactiveLimits ? 'MINMAX' : 'CURVE',
                minimumReactivePower:
                    converterStation?.minMaxReactiveLimits
                        ?.minMaxReactiveLimits,
                maximumReactivePower:
                    converterStation?.minMaxReactiveLimits
                        ?.maximumReactivePower,
                reactiveCapabilityCurveTable:
                    converterStation.reactiveCapabilityCurvePoints ?? null,
            }),
        },
    };
}
