/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useEffect, useState } from 'react';
import { FloatInput, SwitchInput, TextInput } from '@gridsuite/commons-ui';
import {
    CONNECTIVITY,
    CONVERTER_STATION_ID,
    CONVERTER_STATION_NAME,
    LOSS_FACTOR,
    REACTIVE_LIMITS,
    REACTIVE_POWER,
    VOLTAGE,
    VOLTAGE_REGULATION_ON,
} from '../../../../utils/field-constants';
import {
    gridItem,
    GridSection,
    percentageTextField,
    ReactivePowerAdornment,
    VoltageAdornment,
} from '../../../dialogUtils';
import { fetchVoltageLevelsListInfos } from '../../../../../services/study/network';
import { CurrentTreeNode } from '../../../../../redux/reducer.type';
import { UUID } from 'crypto';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';
import Grid from '@mui/material/Grid';
import ReactiveLimitsForm from '../../../reactive-limits/reactive-limits-form';
import { useFormContext, useWatch } from 'react-hook-form';
import { TextField } from '@mui/material';
import {
    ConverterStationElementModificationInfos,
    UpdateReactiveCapabilityCurveTable,
} from './converter-station-utils';
import CheckboxNullableInput from '../../../../utils/rhf-inputs/boolean-nullable-input';
import { useIntl } from 'react-intl';

interface VscConverterStationPaneProps {
    id: string;
    stationLabel: string;
    currentNode: CurrentTreeNode;
    studyUuid: UUID;
    isModification?: boolean;
    previousValues?: ConverterStationElementModificationInfos | null;
    updatePreviousReactiveCapabilityCurveTableConverterStation?: UpdateReactiveCapabilityCurveTable;
}

const ConverterStationPane: FunctionComponent<VscConverterStationPaneProps> = ({
    id,
    stationLabel,
    currentNode,
    studyUuid,
    isModification = false,
    previousValues,
    updatePreviousReactiveCapabilityCurveTableConverterStation,
}) => {
    const intl = useIntl();
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);
    const currentNodeUuid = currentNode?.id;

    const { trigger } = useFormContext();

    const voltageRegulationOnWatch = useWatch({
        name: `${id}.${VOLTAGE_REGULATION_ON}`,
    });

    useEffect(() => {
        if (!voltageRegulationOnWatch) {
            trigger(`${id}.${VOLTAGE_REGULATION_ON}`);
        }
    });

    useEffect(() => {
        if (studyUuid && currentNodeUuid) {
            fetchVoltageLevelsListInfos(studyUuid, currentNodeUuid).then((values) => {
                setVoltageLevelOptions(values.sort((a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id)));
            });
        }
    }, [studyUuid, currentNodeUuid]);

    const generatorIdField = isModification ? (
        <TextField
            size="small"
            fullWidth
            label={'ID'}
            value={previousValues?.id}
            InputProps={{
                readOnly: true,
            }}
            disabled
        />
    ) : (
        <TextInput name={`${id}.${CONVERTER_STATION_ID}`} label={'converterStationId'} />
    );

    const generatorNameField = (
        <TextInput
            name={`${id}.${CONVERTER_STATION_NAME}`}
            label={'converterStationName'}
            previousValue={previousValues?.name ?? ''}
        />
    );

    const connectivityForm = isModification ? null : (
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
            label={'lossFactorLabel'}
            adornment={percentageTextField}
            previousValue={previousValues?.lossFactor}
        />
    );

    const reactivePowerField = (
        <FloatInput
            name={`${id}.${REACTIVE_POWER}`}
            adornment={ReactivePowerAdornment}
            label={'ReactivePowerText'}
            previousValue={previousValues?.reactivePowerSetpoint ?? undefined}
        />
    );

    const previousVoltageRegulatorOn = () => {
        return intl.formatMessage({
            id: previousValues?.voltageRegulatorOn ? 'On' : 'Off',
        });
    };
    const voltageRegulation = isModification ? (
        <CheckboxNullableInput
            name={`${id}.${VOLTAGE_REGULATION_ON}`}
            label={'VoltageRegulationText'}
            previousValue={previousVoltageRegulatorOn()}
            id={undefined}
            formProps={undefined}
        />
    ) : (
        <SwitchInput name={`${id}.${VOLTAGE_REGULATION_ON}`} label={'VoltageRegulationText'} />
    );

    const voltageField = (
        <FloatInput
            name={`${id}.${VOLTAGE}`}
            adornment={VoltageAdornment}
            label={'VoltageText'}
            previousValue={previousValues?.voltageSetpoint || undefined}
        />
    );

    return (
        <Grid container spacing={2}>
            <GridSection title={stationLabel} />
            <Grid container spacing={2}>
                {gridItem(generatorIdField, 4)}
                {gridItem(generatorNameField, 4)}
            </Grid>

            {!isModification && (
                <>
                    <GridSection title={'Connectivity'} />
                    <Grid container spacing={2}>
                        {gridItem(connectivityForm, 12)}
                    </Grid>
                </>
            )}

            <GridSection title="Characteristics" />
            <Grid container spacing={2}>
                {gridItem(lossFactorField, 4)}
            </Grid>

            <GridSection title="ReactiveLimits" />
            <ReactiveLimitsForm
                id={`${id}.${REACTIVE_LIMITS}`}
                equipmentToModify={previousValues as any}
                updatePreviousReactiveCapabilityCurveTable={
                    updatePreviousReactiveCapabilityCurveTableConverterStation as any
                }
            />

            <GridSection title={'Setpoints'} />
            <Grid container spacing={2}>
                {gridItem(reactivePowerField, 4)}
            </Grid>
            <Grid container spacing={2} paddingTop={2}>
                {gridItem(voltageRegulation, 4)}
                {gridItem(voltageField, 4)}
            </Grid>
        </Grid>
    );
};

export default ConverterStationPane;
