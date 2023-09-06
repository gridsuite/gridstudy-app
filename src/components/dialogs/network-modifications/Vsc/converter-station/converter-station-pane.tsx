import { FunctionComponent } from 'react';
import { string } from 'yup';
import { FloatInput, SwitchInput, TextInput } from '@gridsuite/commons-ui';
import {
    CONNECTIVITY,
    CONVERTER_STATION_ID,
    CONVERTER_STATION_NAME,
    DC_RESISTANCE,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    LOSS_FACTOR,
    REACTIVE_LIMITS,
    REACTIVE_POWER,
    VOLTAGE,
    VOLTAGE_REGULATION,
} from '../../../../utils/field-constants';
import {
    filledTextField,
    gridItem,
    GridSection,
    percentageTextField,
    ReactivePowerAdornment,
    VoltageAdornment,
} from '../../../dialogUtils';
import React, { useEffect, useState } from 'react';
import { fetchVoltageLevelsListInfos } from '../../../../../services/study/network';
import { CurrentTreeNode } from '../../../../../redux/reducer.type';
import { UUID } from 'crypto';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';
import Grid from '@mui/material/Grid';
import yup from 'components/utils/yup-config';
import {
    getConnectivityPropertiesEmptyFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionValidationSchema,
} from '../../../connectivity/connectivity-form-utils';
import ReactiveLimitsForm from '../../../reactive-limits/reactive-limits-form';
import {
    getReactiveLimitsEmptyFormData,
    getReactiveLimitsSchema,
} from '../../../reactive-limits/reactive-limits-utils';

interface VscConverterStationPaneProps {
    id: string;
    stationLabel: string;
    currentNode: CurrentTreeNode;
    studyUuid: UUID;
}

export function getVscConverterStationSchema(id: string) {
    return {
        [id]: yup.object().shape({
            [CONVERTER_STATION_ID]: yup.string().nullable().required(),
            [CONVERTER_STATION_NAME]: yup.string().nullable(),
            [LOSS_FACTOR]: yup.number().nullable(),
            [REACTIVE_POWER]: yup.number().nullable(),
            [VOLTAGE_REGULATION]: yup.boolean(),
            [VOLTAGE]: yup.number().nullable(),
            ...getConnectivityWithPositionValidationSchema(),
            ...getReactiveLimitsSchema({}),
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
            [VOLTAGE_REGULATION]: null,
            [VOLTAGE]: null,
            ...getConnectivityWithPositionEmptyFormData(),
            ...getReactiveLimitsEmptyFormData(),
        },
    };
}
const ConverterStationPane: FunctionComponent<VscConverterStationPaneProps> = ({
    id,
    stationLabel,
    currentNode,
    studyUuid,
}) => {
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);
    const currentNodeUuid = currentNode?.id;

    useEffect(() => {
        if (studyUuid && currentNodeUuid) {
            fetchVoltageLevelsListInfos(studyUuid, currentNodeUuid).then(
                (values) => {
                    setVoltageLevelOptions(
                        values.sort((a: { id: string }, b: { id: string }) =>
                            a.id.localeCompare(b.id)
                        )
                    );
                }
            );
        }
    }, [studyUuid, currentNodeUuid]);

    const generatorIdField = (
        <TextInput
            name={`${id}.${CONVERTER_STATION_ID}`}
            label={'converterStationId'}
        />
    );

    const generatorNameField = (
        <TextInput
            name={`${id}.${CONVERTER_STATION_NAME}`}
            label={'converterStationName'}
        />
    );

    const connectivityForm = (
        <ConnectivityForm
            id={`${id}.${CONNECTIVITY}`}
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
            studyUuid={studyUuid}
            currentNode={currentNode}
        />
    );

    const lossFactorField = (
        <FloatInput
            name={`${id}.${LOSS_FACTOR}`}
            adornment={percentageTextField}
        />
    );

    const reactivePowerField = (
        <FloatInput
            name={`${id}.${REACTIVE_POWER}`}
            adornment={ReactivePowerAdornment}
            label={'ReactivePowerText'}
        />
    );

    const voltageRegulation = (
        <SwitchInput
            name={`${id}.${VOLTAGE_REGULATION}`}
            label={'VoltageRegulationText'}
        />
    );

    const voltageField = (
        <FloatInput name={`${id}.${VOLTAGE}`} adornment={VoltageAdornment} label={"VoltageText"}/>
    );

    return (
        <Grid container spacing={2}>
            <GridSection title={stationLabel} />
            <Grid container item spacing={2}>
                {gridItem(generatorIdField, 4)}
                {gridItem(generatorNameField, 4)}
            </Grid>

            <GridSection title={'Connectivity'} />
            <Grid container item>
                {gridItem(connectivityForm, 12)}
            </Grid>

            <GridSection title="Characteristics" />
            <Grid container item>
                {gridItem(lossFactorField, 4)}
            </Grid>

            <GridSection title="ReactiveLimits" />
            <ReactiveLimitsForm id={`${id}.${REACTIVE_LIMITS}`} />

            <GridSection title={'Setpoints'} />
            <Grid container item spacing={2}>
                {gridItem(reactivePowerField, 4)}
            </Grid>
            <Grid container item spacing={2}>
                {gridItem(voltageRegulation, 4)}
                {gridItem(voltageField, 4)}
            </Grid>
        </Grid>
    );
};

export default ConverterStationPane;
