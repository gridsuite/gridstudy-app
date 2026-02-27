/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    ACTIVE_POWER_SETPOINT,
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    CONVERTER_STATION_ID,
    CONVERTER_STATION_NAME,
    CONVERTERS_MODE,
    FILTERS_SHUNT_COMPENSATOR_TABLE,
    ID,
    LOSS_FACTOR,
    MAX_P,
    MAX_Q_AT_NOMINAL_V,
    NOMINAL_V,
    POWER_FACTOR,
    R,
    SHUNT_COMPENSATOR_ID,
    SHUNT_COMPENSATOR_NAME,
    SHUNT_COMPENSATOR_SELECTED,
    VOLTAGE_LEVEL,
} from '../../../../../utils/field-constants';
import {
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
} from '../../../../connectivity/connectivity-form-utils';
import yup from '../../../../../utils/yup-config';
import {
    LccConverterStationCreationInfos,
    LccConverterStationFormInfos,
    LccCreationInfos,
    LccFormInfos,
    ShuntCompensatorFormSchema,
    ShuntCompensatorModificationFormSchema,
} from './lcc-type';
import {
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    emptyProperties,
    FieldConstants,
    getPropertiesFromModification,
    MODIFICATION_TYPES,
    modificationPropertiesSchema,
    sanitizeString,
    toModificationOperation,
} from '@gridsuite/commons-ui';
import { UNDEFINED_CONNECTION_DIRECTION } from '../../../../../network/constants';
import { getConnectivityWithPositionSchema } from 'components/dialogs/connectivity/connectivity-form-utils';
import { Connectivity } from 'components/dialogs/connectivity/connectivity.type';
import {
    LccConverterStationModificationInfos,
    LccModificationInfos,
    LccShuntCompensatorInfos,
    LccShuntCompensatorModificationInfos,
} from '../../../../../../services/network-modification-types';

export const getLccConverterStationSchema = () =>
    yup.object().shape({
        [CONVERTER_STATION_ID]: yup.string().nullable().required(),
        [CONVERTER_STATION_NAME]: yup.string().nullable(),
        [LOSS_FACTOR]: yup
            .number()
            .nullable()
            .min(0, 'NormalizedPercentage')
            .max(100, 'NormalizedPercentage')
            .required(),
        [POWER_FACTOR]: yup
            .number()
            .nullable()
            .min(-1, 'powerFactorMinValueError')
            .max(1, 'powerFactorMaxValueError')
            .required(),
        [FILTERS_SHUNT_COMPENSATOR_TABLE]: yup
            .array()
            .of(
                yup.object().shape({
                    [SHUNT_COMPENSATOR_ID]: yup.string().nullable().required(),
                    [SHUNT_COMPENSATOR_NAME]: yup.string().nullable(),
                    [MAX_Q_AT_NOMINAL_V]: yup
                        .number()
                        .nullable()
                        .min(0, 'qMaxAtNominalVMustBeGreaterThanZero')
                        .required(),
                    [SHUNT_COMPENSATOR_SELECTED]: yup.boolean().nullable(),
                })
            )
            .nullable(),
        [CONNECTIVITY]: getConnectivityWithPositionSchema(false),
    });

export const getLccConverterStationModificationSchema = () =>
    yup.object().shape({
        [CONVERTER_STATION_ID]: yup.string().nullable(),
        [CONVERTER_STATION_NAME]: yup.string().nullable(),
        [LOSS_FACTOR]: yup.number().nullable().min(0, 'NormalizedPercentage').max(100, 'NormalizedPercentage'),
        [POWER_FACTOR]: yup
            .number()
            .nullable()
            .min(0, 'powerFactorIntervalValueError')
            .max(1, 'powerFactorIntervalValueError'),
        [FILTERS_SHUNT_COMPENSATOR_TABLE]: yup
            .array()
            .of(
                yup.object().shape({
                    [SHUNT_COMPENSATOR_ID]: yup.string().required(),
                    [SHUNT_COMPENSATOR_NAME]: yup.string().nullable(),
                    [MAX_Q_AT_NOMINAL_V]: yup
                        .number()
                        .nullable()
                        .min(0, 'qMaxAtNominalVMustBeGreaterThanZero')
                        .required(),
                    [SHUNT_COMPENSATOR_SELECTED]: yup.boolean().nullable(),
                })
            )
            .nullable(),
    });

export const getEmptyShuntCompensatorOnSideFormData = () => ({
    [SHUNT_COMPENSATOR_ID]: null,
    [SHUNT_COMPENSATOR_NAME]: '',
    [MAX_Q_AT_NOMINAL_V]: null,
    [SHUNT_COMPENSATOR_SELECTED]: true,
});

export const getEmptyShuntCompensatorOnSideModificationFormData = () => ({
    ...getEmptyShuntCompensatorOnSideFormData(),
    [FieldConstants.DELETION_MARK]: false,
});

export const getEmptyFiltersShuntCompensatorModificationTableFormData = (count = 0) =>
    Array.from({ length: count }, () => getEmptyShuntCompensatorOnSideModificationFormData());

export const getEmptyFiltersShuntCompensatorTableFormData = (count = 0) =>
    Array.from({ length: count }, () => getEmptyShuntCompensatorOnSideFormData());

export function getLccConverterStationEmptyFormData() {
    return {
        [CONVERTER_STATION_ID]: null,
        [CONVERTER_STATION_NAME]: null,
        [LOSS_FACTOR]: null,
        [POWER_FACTOR]: null,
        [FILTERS_SHUNT_COMPENSATOR_TABLE]: getEmptyFiltersShuntCompensatorTableFormData(),
        ...getConnectivityWithPositionEmptyFormData(),
    };
}

export function getLccConverterStationModificationEmptyFormData() {
    return {
        [CONVERTER_STATION_ID]: null,
        [CONVERTER_STATION_NAME]: null,
        [LOSS_FACTOR]: null,
        [POWER_FACTOR]: null,
        [FILTERS_SHUNT_COMPENSATOR_TABLE]: getEmptyFiltersShuntCompensatorModificationTableFormData(),
    };
}

export const getShuntCompensatorOnSideFromSearchCopy = (shuntCompensatorInfos?: LccShuntCompensatorInfos[]) => {
    return (
        shuntCompensatorInfos?.map((shuntCp) => ({
            [SHUNT_COMPENSATOR_ID]: shuntCp.id + '(1)',
            [SHUNT_COMPENSATOR_NAME]: shuntCp?.name ?? '',
            [MAX_Q_AT_NOMINAL_V]: shuntCp.maxQAtNominalV ?? null,
            [SHUNT_COMPENSATOR_SELECTED]: shuntCp.terminalConnected ?? true, //TODO : rename field to terminalConnected
        })) ?? []
    );
};

export function getLccConverterStationFromSearchCopy(lccConverterStationFormInfos: LccConverterStationFormInfos) {
    return {
        [CONVERTER_STATION_ID]: lccConverterStationFormInfos.id + '(1)',
        [CONVERTER_STATION_NAME]: lccConverterStationFormInfos?.name ?? '',
        [LOSS_FACTOR]: lccConverterStationFormInfos.lossFactor,
        [POWER_FACTOR]: lccConverterStationFormInfos.powerFactor,
        [FILTERS_SHUNT_COMPENSATOR_TABLE]: getShuntCompensatorOnSideFromSearchCopy(
            lccConverterStationFormInfos?.shuntCompensatorsOnSide
        ),
        ...getConnectivityFormData({
            voltageLevelId: lccConverterStationFormInfos?.voltageLevelId,
            busbarSectionId: lccConverterStationFormInfos?.busOrBusbarSectionId,
            connectionDirection: lccConverterStationFormInfos.connectablePosition?.connectionDirection,
            connectionName: lccConverterStationFormInfos.connectablePosition?.connectionName,
            terminalConnected: lccConverterStationFormInfos?.terminalConnected,
            connectionPosition: undefined,
        }),
    };
}

export const getShuntCompensatorOnSideFormData = (
    shuntCompensatorInfos?: LccShuntCompensatorInfos[]
): ShuntCompensatorFormSchema[] => {
    return (
        shuntCompensatorInfos?.map((shuntCp) => ({
            [SHUNT_COMPENSATOR_ID]: shuntCp.id ?? null,
            [SHUNT_COMPENSATOR_NAME]: shuntCp.name ?? '',
            [MAX_Q_AT_NOMINAL_V]: shuntCp.maxQAtNominalV ?? null,
            [SHUNT_COMPENSATOR_SELECTED]: shuntCp.connectedToHvdc ?? true,
        })) ?? []
    );
};

export const getShuntCompensatorOnSideFormModificationData = (
    infos?: LccShuntCompensatorModificationInfos[]
): ShuntCompensatorFormSchema[] => {
    return (
        infos?.map((shuntCp) => ({
            [SHUNT_COMPENSATOR_ID]: shuntCp.id ?? null,
            [SHUNT_COMPENSATOR_NAME]: shuntCp.name ?? '',
            [MAX_Q_AT_NOMINAL_V]: shuntCp.maxQAtNominalV ?? null,
            [SHUNT_COMPENSATOR_SELECTED]: shuntCp.connectedToHvdc === undefined ? null : shuntCp.connectedToHvdc,
            [FieldConstants.DELETION_MARK]: shuntCp.deletionMark ?? false,
        })) ?? []
    );
};

export const getConcatenatedShuntCompensatorOnSideInfos = (
    infosModification?: LccShuntCompensatorModificationInfos[],
    infosMap?: LccShuntCompensatorInfos[]
) => {
    const mergeResult: LccShuntCompensatorModificationInfos[] | null =
        mergeModificationAndEquipmentShuntCompensatorInfos(infosModification, infosMap);
    return (
        mergeResult?.map((shuntCp) => ({
            [SHUNT_COMPENSATOR_ID]: shuntCp.id ?? null,
            [SHUNT_COMPENSATOR_NAME]: shuntCp.name ?? '',
            [MAX_Q_AT_NOMINAL_V]: shuntCp.maxQAtNominalV ?? null,
            [SHUNT_COMPENSATOR_SELECTED]: shuntCp.connectedToHvdc === undefined ? null : shuntCp.connectedToHvdc,
            [FieldConstants.DELETION_MARK]: shuntCp?.deletionMark ?? false,
        })) ?? []
    );
};

export const mergeModificationAndEquipmentShuntCompensatorInfos = (
    infosModification?: LccShuntCompensatorModificationInfos[],
    infosMap?: LccShuntCompensatorInfos[]
): LccShuntCompensatorModificationInfos[] => {
    let result = new Map<string, LccShuntCompensatorModificationInfos>();

    if (!infosModification) {
        if (infosMap) {
            //we only consider infosMap
            for (const info of infosMap) {
                result.set(info.id, {
                    ...info,
                    connectedToHvdc: null,
                    deletionMark: false,
                    type: 'LCC_SHUNT_MODIFICATION',
                });
            }
            return Array.from(result.values());
        }
        // nothing to be merged
        return [];
    }

    //initialize with network modification infos
    for (const info of infosModification) {
        if (info.id) {
            result.set(info.id, info);
        }
    }

    // Add map server infos
    if (infosMap) {
        infosMap.forEach((value: LccShuntCompensatorInfos) => {
            if (value.id !== null) {
                // If the property is present in the modification and in the equipment
                if (!result.has(value.id)) {
                    result.set(value.id, { ...value, connectedToHvdc: null, deletionMark: false });
                }
            }
        });
    }
    return Array.from(result.values());
};

export function getLccConverterStationFromEditData(lccConverterStationCreationInfos: LccConverterStationCreationInfos) {
    return {
        [CONVERTER_STATION_ID]: lccConverterStationCreationInfos.equipmentId,
        [CONVERTER_STATION_NAME]: lccConverterStationCreationInfos?.equipmentName ?? '',
        [LOSS_FACTOR]: lccConverterStationCreationInfos.lossFactor,
        [POWER_FACTOR]: lccConverterStationCreationInfos.powerFactor,
        [FILTERS_SHUNT_COMPENSATOR_TABLE]: getShuntCompensatorOnSideFormData(
            lccConverterStationCreationInfos?.shuntCompensatorsOnSide
        ),
        ...getConnectivityFormData({
            voltageLevelId: lccConverterStationCreationInfos?.voltageLevelId,
            busbarSectionId: lccConverterStationCreationInfos?.busOrBusbarSectionId,
            connectionDirection: lccConverterStationCreationInfos?.connectionDirection,
            connectionName: lccConverterStationCreationInfos?.connectionName,
            terminalConnected: lccConverterStationCreationInfos?.terminalConnected,
            connectionPosition: lccConverterStationCreationInfos?.connectionPosition,
        }),
    };
}

export function getLccConverterStationModificationFromEditData(
    lccConverterStationInfos: LccConverterStationModificationInfos
) {
    return {
        [CONVERTER_STATION_ID]: lccConverterStationInfos.equipmentId,
        [CONVERTER_STATION_NAME]: lccConverterStationInfos?.equipmentName?.value ?? '',
        [LOSS_FACTOR]: lccConverterStationInfos.lossFactor?.value ?? undefined,
        [POWER_FACTOR]: lccConverterStationInfos.powerFactor?.value ?? undefined,
        [FILTERS_SHUNT_COMPENSATOR_TABLE]: getShuntCompensatorOnSideFormModificationData(
            lccConverterStationInfos?.shuntCompensatorsOnSide
        ),
    };
}

export const getShuntCompensatorOnSideCreateData = (
    shuntCompensatorInfos?: ShuntCompensatorFormSchema[]
): LccShuntCompensatorInfos[] => {
    return (
        shuntCompensatorInfos?.map((shuntCp) => ({
            id: shuntCp[SHUNT_COMPENSATOR_ID],
            name: shuntCp[SHUNT_COMPENSATOR_NAME],
            maxQAtNominalV: shuntCp[MAX_Q_AT_NOMINAL_V],
            connectedToHvdc: shuntCp[SHUNT_COMPENSATOR_SELECTED],
            type: 'LCC_SHUNT_CREATION',
        })) ?? []
    );
};

export const getShuntCompensatorOnSideModificationData = (
    shuntCompensatorInfos?: ShuntCompensatorModificationFormSchema[]
): LccShuntCompensatorModificationInfos[] => {
    return (
        shuntCompensatorInfos?.map((shuntCp) => ({
            id: shuntCp[SHUNT_COMPENSATOR_ID],
            name: shuntCp[SHUNT_COMPENSATOR_NAME],
            maxQAtNominalV: shuntCp[MAX_Q_AT_NOMINAL_V],
            connectedToHvdc: shuntCp[SHUNT_COMPENSATOR_SELECTED],
            deletionMark: shuntCp[FieldConstants.DELETION_MARK],
            type: 'LCC_SHUNT_MODIFICATION',
        })) ?? []
    );
};

export function getLccConverterStationCreationData(converterStation: {
    converterStationId: string;
    converterStationName?: string;
    lossFactor: number;
    powerFactor: number;
    connectivity: Connectivity;
    shuntCompensatorInfos?: ShuntCompensatorFormSchema[];
}) {
    return {
        type: MODIFICATION_TYPES.LCC_CONVERTER_STATION_CREATION.type,
        equipmentId: converterStation[CONVERTER_STATION_ID],
        equipmentName: converterStation[CONVERTER_STATION_NAME],
        lossFactor: converterStation[LOSS_FACTOR],
        powerFactor: converterStation[POWER_FACTOR],
        voltageLevelId: converterStation[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
        busOrBusbarSectionId: converterStation[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
        connectionName: sanitizeString(converterStation[CONNECTIVITY]?.[CONNECTION_NAME]),
        connectionDirection: converterStation[CONNECTIVITY]?.[CONNECTION_DIRECTION] ?? UNDEFINED_CONNECTION_DIRECTION,
        connectionPosition: converterStation[CONNECTIVITY]?.[CONNECTION_POSITION],
        terminalConnected: converterStation[CONNECTIVITY]?.[CONNECTED],
        shuntCompensatorsOnSide: getShuntCompensatorOnSideCreateData(converterStation[FILTERS_SHUNT_COMPENSATOR_TABLE]),
    };
}

export function getLccConverterStationModificationData(
    converterStation: any,
    converterStationToModify: LccConverterStationFormInfos
): LccConverterStationModificationInfos {
    return {
        type: MODIFICATION_TYPES.LCC_CONVERTER_STATION_MODIFICATION.type,
        equipmentId: converterStationToModify.id,
        equipmentName: toModificationOperation(converterStation[CONVERTER_STATION_NAME]),
        lossFactor: toModificationOperation(converterStation[LOSS_FACTOR]),
        powerFactor: toModificationOperation(converterStation[POWER_FACTOR]),
        shuntCompensatorsOnSide: getShuntCompensatorOnSideModificationData(
            converterStation[FILTERS_SHUNT_COMPENSATOR_TABLE]
        ),
    };
}

export const getLccHvdcLineSchema = () =>
    yup
        .object()
        .shape({
            [NOMINAL_V]: yup.number().nullable().min(0, 'nominalVMustBeGreaterOrEqualToZero').required(),
            [R]: yup.number().nullable().min(0, 'dcResistanceMustBeGreaterOrEqualToZero').required(),
            [MAX_P]: yup.number().nullable().min(0, 'maxPMustBeGreaterOrEqualToZero').required(),
            [ACTIVE_POWER_SETPOINT]: yup
                .number()
                .nullable()
                .min(0, 'activePowerSetpointMinValueError')
                .max(yup.ref(MAX_P), 'activePowerSetpointMaxValueError')
                .required(),
            [CONVERTERS_MODE]: yup.string().required(),
        })
        .concat(creationPropertiesSchema);

export const getLccHvdcLineModificationSchema = () =>
    yup
        .object()
        .shape({
            [NOMINAL_V]: yup.number().nullable().min(0, 'nominalVMustBeGreaterOrEqualToZero'),
            [R]: yup.number().nullable().min(0, 'dcResistanceMustBeGreaterOrEqualToZero'),
            [MAX_P]: yup.number().nullable().min(0, 'maxPMustBeGreaterOrEqualToZero'),
            [ACTIVE_POWER_SETPOINT]: yup
                .number()
                .nullable()
                .min(0, 'activePowerSetpointMinValueError')
                .max(yup.ref(MAX_P), 'activePowerSetpointMaxValueError'),
            [CONVERTERS_MODE]: yup.string().nullable(),
        })
        .concat(modificationPropertiesSchema);

export function getLccHvdcLineEmptyFormData() {
    return {
        [NOMINAL_V]: null,
        [R]: null,
        [MAX_P]: null,
        [CONVERTERS_MODE]: null,
        [ACTIVE_POWER_SETPOINT]: null,
        ...emptyProperties,
    };
}

export function getLccHvdcLineFromSearchCopy(hvdcLine: LccFormInfos) {
    return {
        [NOMINAL_V]: hvdcLine.nominalV,
        [R]: hvdcLine.r,
        [MAX_P]: hvdcLine.maxP,
        [CONVERTERS_MODE]: hvdcLine.convertersMode,
        [ACTIVE_POWER_SETPOINT]: hvdcLine.activePowerSetpoint,
        ...copyEquipmentPropertiesForCreation(hvdcLine),
    };
}

export function getLccHvdcLineFromEditData(hvdcLine: LccCreationInfos) {
    return {
        [NOMINAL_V]: hvdcLine.nominalV,
        [R]: hvdcLine.r,
        [MAX_P]: hvdcLine.maxP,
        [CONVERTERS_MODE]: hvdcLine.convertersMode,
        [ACTIVE_POWER_SETPOINT]: hvdcLine.activePowerSetpoint,
        ...getPropertiesFromModification(hvdcLine.properties),
    };
}

export function getLccHvdcLineFromModificationEditData(hvdcLine: LccModificationInfos) {
    return {
        [NOMINAL_V]: hvdcLine.nominalV?.value ?? null,
        [R]: hvdcLine.r?.value ?? null,
        [MAX_P]: hvdcLine.maxP?.value ?? null,
        [CONVERTERS_MODE]: hvdcLine.convertersMode?.value ?? null,
        [ACTIVE_POWER_SETPOINT]: hvdcLine.activePowerSetpoint?.value ?? null,
        ...getPropertiesFromModification(hvdcLine.properties),
    };
}
