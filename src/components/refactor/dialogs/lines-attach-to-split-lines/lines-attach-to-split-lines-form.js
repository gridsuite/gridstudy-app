/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import { Box } from '@mui/system';
import AutocompleteInput from 'components/refactor/rhf-inputs/autocomplete-input';
import {
    ACTIVE_POWER,
    BUS_BAR_SECTION_ID,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    LINE_TO_ATTACH_TO_ID_1,
    LINE_TO_ATTACH_TO_ID_2,
    LOAD_TYPE,
    REACTIVE_POWER,
    REMPLACING_LINE_ID_1,
    REMPLACING_LINE_ID_2,
    REMPLACING_LINE_NAME_1,
    REMPLACING_LINE_NAME_2,
    VOLTAGE_LEVEL_ID,
} from 'components/refactor/utils/field-constants';
import React, { useEffect, useState } from 'react';
import { fetchVoltageLevelsIdAndTopology } from 'utils/rest-api';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    GridSection,
    ReactivePowerAdornment,
} from '../../../dialogs/dialogUtils';
import { LOAD_TYPES } from '../../../network/constants';
import FloatInput from '../../rhf-inputs/float-input';
import SelectInput from '../../rhf-inputs/select-input';
import TextInput from '../../rhf-inputs/text-input';
import { ConnectivityForm } from '../connectivity/connectivity-form';

const LinesAttachToSplitLinesForm = ({ currentNode, studyUuid }) => {
    const currentNodeUuid = currentNode?.id;
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);

    useEffect(() => {
        if (studyUuid && currentNodeUuid)
            fetchVoltageLevelsIdAndTopology(studyUuid, currentNodeUuid).then(
                (values) => {
                    setVoltageLevelOptions(
                        values.sort((a, b) => a.id.localeCompare(b.id))
                    );
                }
            );
    }, [studyUuid, currentNodeUuid]);

    const lineToAttachTo1Field = (
        <AutocompleteInput
            //isOptionEqualToValue={areIdsEqual}
            /* outputTransform={(value) =>
                typeof value === 'string'
                    ? getConnectivityVoltageLevelData({ voltageLevelId: value })
                    : value
            } */
            //onChangeCallback={resetBusBarSection}
            allowNewValue
            forcePopupIcon
            name={LINE_TO_ATTACH_TO_ID_1}
            label="VoltageLevel"
            options={voltageLevelOptions}
            //getOptionLabel={getObjectId}
            size={'small'}
        />
    );

    const lineToAttachTo2Field = (
        <AutocompleteInput
            //isOptionEqualToValue={areIdsEqual}
            /* outputTransform={(value) =>
                typeof value === 'string'
                    ? getConnectivityVoltageLevelData({ voltageLevelId: value })
                    : value
            } */
            //onChangeCallback={resetBusBarSection}
            allowNewValue
            forcePopupIcon
            name={LINE_TO_ATTACH_TO_ID_2}
            label="VoltageLevel"
            options={voltageLevelOptions}
            //getOptionLabel={getObjectId}
            size={'small'}
        />
    );

    const attachedLineField = (
        <AutocompleteInput
            //isOptionEqualToValue={areIdsEqual}
            /* outputTransform={(value) =>
                typeof value === 'string'
                    ? getConnectivityVoltageLevelData({ voltageLevelId: value })
                    : value
            } */
            //onChangeCallback={resetBusBarSection}
            allowNewValue
            forcePopupIcon
            name={LINE_TO_ATTACH_TO_ID_2}
            label="VoltageLevel"
            options={voltageLevelOptions}
            //getOptionLabel={getObjectId}
            size={'small'}
        />
    );

    const voltageLevelIdField = (
        <AutocompleteInput
            //isOptionEqualToValue={areIdsEqual}
            outputTransform={
                (value) => value
                /*  typeof value === 'string'
                    ? getConnectivityVoltageLevelData({ voltageLevelId: value })
                    : value */
            }
            // onChangeCallback={resetBusBarSection}
            allowNewValue
            forcePopupIcon
            name={VOLTAGE_LEVEL_ID}
            label="VoltageLevel"
            options={voltageLevelOptions}
            //getOptionLabel={getObjectId}
            size={'small'}
        />
    );

    const bbsOrNodeIdField = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            //hack to work with freesolo autocomplete
            //setting null programatically when freesolo is enable wont empty the field
            name={BUS_BAR_SECTION_ID}
            label="BusBarBus"
            //options={busOrBusbarSectionOptions}
            //getOptionLabel={getObjectId}
            //isOptionEqualToValue={areIdsEqual}
            inputTransform={(value) => (value === null ? '' : value)}
            /* outputTransform={(value) =>
                typeof value === 'string'
                    ? getConnectivityBusBarSectionData({
                          busbarSectionId: value,
                      })
                    : value
            } */
            size={'small'}
        />
    );

    const newLine1IdField = (
        <TextInput
            name={REMPLACING_LINE_ID_1}
            label={'Line1ID'}
            //formProps={{ autoFocus: true, ...filledTextField }}
        />
    );

    const newLine1NameField = (
        <TextInput
            name={REMPLACING_LINE_NAME_1}
            label={'Line1Name'}
            //formProps={{ autoFocus: true, ...filledTextField }}
        />
    );

    const newLine2IdField = (
        <TextInput
            name={REMPLACING_LINE_ID_2}
            label={'Line1ID'}
            //formProps={{ autoFocus: true, ...filledTextField }}
        />
    );

    const newLine2NameField = (
        <TextInput
            name={REMPLACING_LINE_NAME_2}
            label={'Line1Name'}
            //formProps={{ autoFocus: true, ...filledTextField }}
        />
    );

    return (
        <>
            <GridSection title="Line1" />
            <Grid container spacing={2} alignItems="center">
                {gridItem(lineToAttachTo1Field, 5)}
            </Grid>
            <GridSection title="Line2" />
            <Grid container spacing={2} alignItems="center">
                {gridItem(lineToAttachTo2Field, 5)}
            </Grid>
            <GridSection title="LineAttached" />
            <Grid container spacing={2} alignItems="center">
                {gridItem(attachedLineField, 5)}
            </Grid>
            <GridSection title="VoltageLevel" />
            <Grid container spacing={2}>
                {gridItem(voltageLevelIdField)}
                {gridItem(bbsOrNodeIdField)}
            </Grid>
            <GridSection title="ReplacingLines" />
            <Grid container spacing={2}>
                {gridItem(newLine1IdField, 6)}
                {gridItem(newLine1NameField, 6)}
                <Box sx={{ width: '100%' }} />
                {gridItem(newLine2IdField, 6)}
                {gridItem(newLine2NameField, 6)}
            </Grid>
        </>
    );
};

export default LinesAttachToSplitLinesForm;
