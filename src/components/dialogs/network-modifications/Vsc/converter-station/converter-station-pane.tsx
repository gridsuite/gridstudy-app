import { FunctionComponent } from 'react';
import { string } from 'yup';
import { FloatInput, TextInput } from "@gridsuite/commons-ui";
import {
    CONNECTIVITY,
    CONVERTER_STATION_ID,
    CONVERTER_STATION_NAME, DC_RESISTANCE,
    EQUIPMENT_ID,
    EQUIPMENT_NAME, LOSS_FACTOR
} from "../../../../utils/field-constants";
import { filledTextField, gridItem, GridSection, percentageTextField } from "../../../dialogUtils";
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
            ...getConnectivityWithPositionValidationSchema(),
        }),
    };
}

export function getVscConverterStationEmptyFormData(id: string) {
    return {
        [id]: {
            [CONVERTER_STATION_ID]: null,
            [CONVERTER_STATION_NAME]: null,
            ...getConnectivityWithPositionEmptyFormData(),
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
                        values.sort((a: {id: string}, b: {id: string}) =>
                            a.id.localeCompare(b.id)
                        )
                    );
                }
            );
        }
    }, [studyUuid, currentNodeUuid]);

    const generatorIdField = (
        <TextInput name={`${id}.${CONVERTER_STATION_ID}`} label={'converterStationId'} />
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
      <FloatInput name={`${id}.${LOSS_FACTOR}`} adornment={percentageTextField}/>
    )

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
        </Grid>
    );
};

export default ConverterStationPane;
