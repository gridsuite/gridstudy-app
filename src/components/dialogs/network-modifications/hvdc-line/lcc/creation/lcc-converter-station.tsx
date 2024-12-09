/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FloatInput, MODIFICATION_TYPES, TextInput } from '@gridsuite/commons-ui';
import {
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    CONVERTER_STATION_ID,
    CONVERTER_STATION_NAME,
    FILTERS_SHUNT_COMPENSATOR_TABLE,
    ID,
    LOSS_FACTOR,
    MAX_Q_AT_NOMINAL_V,
    POWER_FACTOR,
    SHUNT_COMPENSATOR_ID,
    SHUNT_COMPENSATOR_NAME,
    SHUNT_COMPENSATOR_SELECTED,
    VOLTAGE_LEVEL,
} from '../../../../../utils/field-constants';
import { percentageTextField, sanitizeString } from '../../../../dialog-utils';
import { CurrentTreeNode } from '../../../../../../redux/reducer';
import { UUID } from 'crypto';
import { ConnectivityForm } from '../../../../connectivity/connectivity-form';
import { Grid } from '@mui/material';
import useVoltageLevelsListInfos from '../../../../../../hooks/use-voltage-levels-list-infos';
import GridSection from '../../../../commons/grid-section';
import GridItem from '../../../../commons/grid-item';
import yup from '../../../../../utils/yup-config';
import {
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionSchema,
} from '../../../../connectivity/connectivity-form-utils';
import FiltersShuntCompensatorTable from './filters-shunt-compensator-table';
import {
    LccConverterStationCreationInfos,
    LccConverterStationFormInfos,
    ShuntCompensatorFormSchema,
    ShuntCompensatorInfos,
} from './lcc-creation.type';
import { UNDEFINED_CONNECTION_DIRECTION } from '../../../../../network/constants';
import { Connectivity } from '../../../../connectivity/connectivity.type';

export const getLccConverterStationSchema = () =>
    yup.object().shape({
        [CONVERTER_STATION_ID]: yup.string().nullable().required(),
        [CONVERTER_STATION_NAME]: yup.string().nullable(),
        [LOSS_FACTOR]: yup.number().nullable().required(),
        [POWER_FACTOR]: yup.number().nullable().max(1, 'powerFactorNormalizedPercentage').required(),
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

export const getEmptyShuntCompensatorOnSideFormData = () => ({
    [SHUNT_COMPENSATOR_ID]: null,
    [SHUNT_COMPENSATOR_NAME]: '',
    [MAX_Q_AT_NOMINAL_V]: null,
    [SHUNT_COMPENSATOR_SELECTED]: false,
});

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

const getShuntCompensatorOnSideFormData = (
    shuntCompensatorInfos?: ShuntCompensatorInfos[]
): ShuntCompensatorFormSchema[] => {
    return (
        shuntCompensatorInfos?.map((shuntCp) => ({
            [SHUNT_COMPENSATOR_ID]: shuntCp.id ?? null,
            [SHUNT_COMPENSATOR_NAME]: shuntCp.name ?? '',
            [MAX_Q_AT_NOMINAL_V]: shuntCp.maxQAtNominalV ?? null,
            [SHUNT_COMPENSATOR_SELECTED]: shuntCp.connectedToHvdc ?? false,
        })) ?? []
    );
};

const getShuntCompensatorOnSideCreateData = (
    shuntCompensatorInfos?: ShuntCompensatorFormSchema[]
): ShuntCompensatorInfos[] => {
    return (
        shuntCompensatorInfos?.map((shuntCp) => ({
            id: shuntCp[SHUNT_COMPENSATOR_ID],
            name: shuntCp[SHUNT_COMPENSATOR_NAME],
            maxQAtNominalV: shuntCp[MAX_Q_AT_NOMINAL_V],
            connectedToHvdc: shuntCp[SHUNT_COMPENSATOR_SELECTED],
        })) ?? []
    );
};

export const getShuntCompensatorOnSideFromSearchCopy = (shuntCompensatorInfos?: ShuntCompensatorInfos[]) => {
    return (
        shuntCompensatorInfos?.map((shuntCp) => ({
            [SHUNT_COMPENSATOR_ID]: shuntCp.id + '(1)',
            [SHUNT_COMPENSATOR_NAME]: shuntCp?.name ?? '',
            [MAX_Q_AT_NOMINAL_V]: shuntCp.maxQAtNominalV ?? null,
            [SHUNT_COMPENSATOR_SELECTED]: shuntCp.connectedToHvdc ?? false,
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
            busbarSectionName: undefined,
        }),
    };
}

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
            busbarSectionName: undefined,
        }),
    };
}

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

interface LccConverterStationProps {
    id: string;
    stationLabel: string;
    currentNode: CurrentTreeNode;
    studyUuid: UUID;
}

export default function LccConverterStation({
    id,
    stationLabel,
    currentNode,
    studyUuid,
}: Readonly<LccConverterStationProps>) {
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id);

    const stationIdField = <TextInput name={`${id}.${CONVERTER_STATION_ID}`} label={'converterStationId'} />;

    const stationNameField = <TextInput name={`${id}.${CONVERTER_STATION_NAME}`} label={'converterStationName'} />;

    const connectivityForm = (
        <ConnectivityForm
            id={`${id}.${CONNECTIVITY}`}
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
            studyUuid={studyUuid}
            currentNode={currentNode}
            previousValues={undefined}
        />
    );

    const lossFactorField = (
        <FloatInput name={`${id}.${LOSS_FACTOR}`} label={'lossFactorLabel'} adornment={percentageTextField} />
    );

    const powerFactorField = (
        <FloatInput name={`${id}.${POWER_FACTOR}`} label={'powerFactorLabel'} adornment={percentageTextField} />
    );

    return (
        <Grid container spacing={2}>
            <GridSection title={stationLabel} />
            <Grid container spacing={2}>
                <GridItem size={4}>{stationIdField}</GridItem>
                <GridItem size={4}>{stationNameField}</GridItem>
            </Grid>

            <GridSection title={'Connectivity'} />
            <Grid container spacing={2}>
                <GridItem size={12}>{connectivityForm}</GridItem>
            </Grid>

            <GridSection title="Characteristics" />
            <Grid container spacing={2}>
                <GridItem size={4}>{lossFactorField}</GridItem>
                <GridItem size={4}>{powerFactorField}</GridItem>
            </Grid>

            <GridSection title={'Filters'} />
            <FiltersShuntCompensatorTable id={`${id}`} />
        </Grid>
    );
}
