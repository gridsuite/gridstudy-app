/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    ATTACHMENT_LINE_ID,
    ATTACHMENT_POINT_ID,
    ATTACHMENT_POINT_NAME,
    LINE1_ID,
    LINE1_NAME,
    LINE2_ID,
    LINE2_NAME,
    LINE_TO_ATTACH_TO_ID,
} from 'components/refactor/utils/field-constants';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { gridItem, GridSection } from '../../../dialogs/dialogUtils';

import TextInput from '../../rhf-inputs/text-input';
import { ConnectivityForm } from '../connectivity/connectivity-form';
import {
    fetchEquipmentsIds,
    fetchVoltageLevelsIdAndTopology,
} from 'utils/rest-api';
import AutocompleteInput from 'components/refactor/rhf-inputs/autocomplete-input';
import { PercentageArea } from '../percentage-area/percentage-area';
import { Box, Button, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import AddIcon from '@mui/icons-material/ControlPoint';
import EditIcon from '@mui/icons-material/Edit';
import LineCreationDialog from '../line-creation/line-creation-dialog';
import VoltageLevelCreationDialog from 'components/dialogs/voltage-level-creation-dialog';

const LineAttachToVoltageLevelForm = ({
    studyUuid,
    currentNode,
    onLineDo,
    lineToEdit,
    onVoltageLevelDo,
    voltageLevelToEdit,
    onVoltageLevelChange,
}) => {
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);
    const [linesOptions, setLinesOptions] = useState([]);
    const [substationOptions, setSubstationOptions] = useState([]);
    const [lineDialogOpen, setLineDialogOpen] = useState(false);
    const [voltageLevelDialogOpen, setVoltageLevelDialogOpen] = useState(false);

    const onLineDialogClose = () => {
        setLineDialogOpen(false);
    };

    const openLineDialog = () => {
        setLineDialogOpen(true);
    };

    const onVoltageLevelDialogClose = () => {
        setVoltageLevelDialogOpen(false);
    };

    const openVoltageLevelDialog = () => {
        setVoltageLevelDialogOpen(true);
    };

    useEffect(() => {
        if (studyUuid && currentNode?.id)
            fetchVoltageLevelsIdAndTopology(studyUuid, currentNode?.id).then(
                (values) => {
                    setVoltageLevelOptions(
                        values.sort((a, b) => a?.id?.localeCompare(b?.id))
                    );
                }
            );
        fetchEquipmentsIds(
            studyUuid,
            currentNode.id,
            undefined,
            'LINE',
            true
        ).then((values) => {
            setLinesOptions(
                values
                    .sort((a, b) => a.localeCompare(b))
                    .map((value) => {
                        return { id: value };
                    })
            );
        });
        //to remove when VoltageLevelCreationDialog is migrated
        fetchEquipmentsIds(
            studyUuid,
            currentNode.id,
            undefined,
            'SUBSTATION',
            true
        ).then((values) => {
            setSubstationOptions(values.sort((a, b) => a.localeCompare(b)));
        });
    }, [studyUuid, currentNode?.id]);

    const areIdsEqual = useCallback((val1, val2) => val1.id === val2.id, []);
    const getObjectId = useCallback((object) => {
        if (typeof object === 'string') {
            return object;
        }

        return object.id;
    }, []);

    const allVoltageLevelOptions = useMemo(() => {
        if (!voltageLevelToEdit) {
            return voltageLevelOptions;
        } else {
            const formattedVoltageLevel = {
                id: voltageLevelToEdit.equipmentId,
                name: voltageLevelToEdit.equipmentName ?? '',
            };
            return [
                formattedVoltageLevel,
                ...voltageLevelOptions.filter(
                    (vl) => vl.id !== formattedVoltageLevel.id
                ),
            ];
        }
    }, [voltageLevelToEdit, voltageLevelOptions]);

    const getFormatedBusOrBusbarSectionOptions = useCallback(() => {
        return voltageLevelToEdit?.busbarSections?.map((busbarSection) => {
            return {
                id: busbarSection.id,
                name: busbarSection.name ?? '',
            };
        });
    }, [voltageLevelToEdit]);

    const lineToAttachField = (
        <AutocompleteInput
            isOptionEqualToValue={areIdsEqual}
            allowNewValue
            forcePopupIcon
            name={LINE_TO_ATTACH_TO_ID}
            label="LineToAttachTo"
            options={linesOptions}
            getOptionLabel={getObjectId}
            outputTransform={getObjectId}
            size={'small'}
        />
    );

    const attachmentPointIdField = (
        <TextInput name={ATTACHMENT_POINT_ID} label={'AttachmentPointId'} />
    );

    const attachmentPointNameField = (
        <TextInput name={ATTACHMENT_POINT_NAME} label={'AttachmentPointName'} />
    );

    const lineToIdField = (
        <TextInput
            name={ATTACHMENT_LINE_ID}
            label={'AttachedLineId'}
            formProps={{ disabled: true }}
        />
    );

    const newLine1IdField = <TextInput name={LINE1_ID} label={'Line1ID'} />;

    const newLine1NameField = (
        <TextInput name={LINE1_NAME} label={'Line1Name'} />
    );

    const newLine2IdField = <TextInput name={LINE2_ID} label={'Line2ID'} />;

    const newLine2NameField = (
        <TextInput name={LINE2_NAME} label={'Line2Name'} />
    );

    const connectivityForm = (
        <ConnectivityForm
            label={'AttachedVoltageLevelId'}
            withPosition={false}
            withDirectionsInfos={false}
            voltageLevelOptions={allVoltageLevelOptions}
            defaultBusOrBusbarSectionOptions={getFormatedBusOrBusbarSectionOptions()}
            studyUuid={studyUuid}
            currentNode={currentNode}
            onChangeCallback={onVoltageLevelChange}
        />
    );

    const percentageArea = (
        <PercentageArea upperLeftText={'Line1'} upperRightText={'Line2'} />
    );

    return (
        <>
            <GridSection title="LineToAttachTo" />
            <Grid container spacing={2} alignItems="center">
                {gridItem(lineToAttachField, 5)}
                {gridItem(<></>, 1)}
                {gridItem(percentageArea, 5)}
                {gridItem(<></>, 1)}
            </Grid>
            <GridSection title="AttachmentPoint" />
            <Grid container spacing={2}>
                {gridItem(attachmentPointIdField, 6)}
                {gridItem(attachmentPointNameField, 6)}
            </Grid>
            <GridSection title="VoltageLevel" />
            <Grid container spacing={2}>
                {gridItem(connectivityForm, 12)}
                {gridItem(
                    <Button
                        onClick={openVoltageLevelDialog}
                        startIcon={
                            voltageLevelToEdit ? <EditIcon /> : <AddIcon />
                        }
                    >
                        <Typography align="left">
                            <FormattedMessage id="NewVoltageLevel" />
                        </Typography>
                    </Button>
                )}
            </Grid>
            <GridSection title="AttachedLine" />
            <Grid container spacing={2}>
                {gridItem(lineToIdField, 6)}
                <Box width="100%" />
                {gridItem(
                    <Button
                        onClick={openLineDialog}
                        startIcon={lineToEdit ? <EditIcon /> : <AddIcon />}
                    >
                        <Typography align="left">
                            <FormattedMessage id="AttachedLine" />
                        </Typography>
                    </Button>
                )}
            </Grid>
            <GridSection title="Line1" />
            <Grid container spacing={2}>
                {gridItem(newLine1IdField, 6)}
                {gridItem(newLine1NameField, 6)}
            </Grid>
            <GridSection title="Line2" />
            <Grid container spacing={2}>
                {gridItem(newLine2IdField, 6)}
                {gridItem(newLine2NameField, 6)}
            </Grid>
            {voltageLevelDialogOpen && (
                <VoltageLevelCreationDialog
                    open={true}
                    onClose={onVoltageLevelDialogClose}
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                    substationOptionsPromise={Promise.resolve(
                        substationOptions
                    )}
                    onCreateVoltageLevel={onVoltageLevelDo}
                    editData={voltageLevelToEdit}
                />
            )}
            {lineDialogOpen && (
                <LineCreationDialog
                    open={true}
                    onClose={onLineDialogClose}
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                    displayConnectivity={false}
                    onCreateLine={onLineDo}
                    editData={lineToEdit}
                />
            )}
        </>
    );
};

export default LineAttachToVoltageLevelForm;
