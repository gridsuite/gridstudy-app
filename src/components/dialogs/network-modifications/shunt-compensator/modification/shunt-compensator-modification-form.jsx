/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import { TextInput } from '@gridsuite/commons-ui';
import { EQUIPMENT_NAME } from '../../../../utils/field-constants';
import { filledTextField, gridItem, GridSection } from '../../../dialogUtils';
import Grid from '@mui/material/Grid';
import { TextField } from '@mui/material';
import { CharacteristicsForm } from '../characteristics-pane/characteristics-form';
import PropertiesForm from '../../common/properties/properties-form';
import { ConnectivityForm } from '../../../connectivity/connectivity-form.jsx';
import { fetchVoltageLevelsListInfos } from '../../../../../services/study/network.js';

const ShuntCompensatorModificationForm = ({
    studyUuid,
    currentNode,
    shuntCompensatorInfos,
    equipmentId,
}) => {
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);
    const currentNodeUuid = currentNode?.id;

    useEffect(() => {
        if (studyUuid && currentNodeUuid) {
            fetchVoltageLevelsListInfos(studyUuid, currentNodeUuid).then(
                (values) => {
                    setVoltageLevelOptions(
                        values.sort((a, b) => a.id.localeCompare(b.id))
                    );
                }
            );
        }
    }, [studyUuid, currentNodeUuid]);
    const shuntCompensatorIdField = (
        <TextField
            size="small"
            fullWidth
            label={'ID'}
            value={equipmentId}
            InputProps={{
                readOnly: true,
            }}
            disabled
            {...filledTextField}
        />
    );
    const shuntCompensatorNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
            previousValue={shuntCompensatorInfos?.name}
            clearable
        />
    );

    const characteristicsForm = (
        <CharacteristicsForm
            previousValues={shuntCompensatorInfos}
            isModification={true}
        />
    );

    const connectivityForm = (
        <ConnectivityForm
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
            studyUuid={studyUuid}
            currentNode={currentNode}
            isEquipmentModification={true}
            previousValues={shuntCompensatorInfos}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(shuntCompensatorIdField, 4)}
                {gridItem(shuntCompensatorNameField, 4)}
            </Grid>
            {/* Connectivity part */}
            <GridSection title="Connectivity" />
            <Grid container spacing={2}>
                {gridItem(connectivityForm, 12)}
            </Grid>
            <GridSection title="Characteristics" />
            <Grid container spacing={2}>
                {gridItem(characteristicsForm, 12)}
            </Grid>
            <PropertiesForm
                networkElementType={'shuntCompensator'}
                isModification={true}
            />
        </>
    );
};

export default ShuntCompensatorModificationForm;
