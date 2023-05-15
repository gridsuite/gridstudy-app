/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    LINE1_ID,
    LINE1_NAME,
    LINE2_ID,
    LINE2_NAME,
} from 'components/utils/field-constants';
import React, { useEffect, useMemo, useState } from 'react';
import { gridItem, GridSection } from '../dialogUtils';
import AddIcon from '@mui/icons-material/ControlPoint';
import EditIcon from '@mui/icons-material/Edit';
import TextInput from '../../utils/rhf-inputs/text-input';
import { ConnectivityForm } from '../connectivity/connectivity-form';
import { fetchVoltageLevelsIdAndTopology } from 'utils/rest-api';
import { Button, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { LineToAttachOrSplitForm } from '../line-to-attach-or-split-form/line-to-attach-or-split-form';
import VoltageLevelCreationDialog from '../voltage-level/creation/voltage-level-creation-dialog';

const LineSplitWithVoltageLevelForm = ({
    studyUuid,
    currentNode,
    onVoltageLevelCreationDo,
    voltageLevelToEdit,
    onVoltageLevelChange,
}) => {
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);
    const [voltageLevelDialogOpen, setVoltageLevelDialogOpen] = useState(false);

    const onVoltageLevelDialogClose = () => {
        setVoltageLevelDialogOpen(false);
    };

    const openVoltageLevelDialog = () => {
        setVoltageLevelDialogOpen(true);
    };

    useEffect(() => {
        if (studyUuid && currentNode?.id) {
            fetchVoltageLevelsIdAndTopology(studyUuid, currentNode?.id).then(
                (values) => {
                    setVoltageLevelOptions(
                        values.sort((a, b) => a?.id?.localeCompare(b?.id))
                    );
                }
            );
        }
    }, [studyUuid, currentNode?.id]);

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

    const lineToSplitForm = (
        <LineToAttachOrSplitForm
            label={'LineToSplit'}
            studyUuid={studyUuid}
            currentNode={currentNode}
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
            label={'VoltageLevelToSplitAt'}
            withPosition={false}
            withDirectionsInfos={false}
            voltageLevelOptions={allVoltageLevelOptions}
            newBusOrBusbarSectionOptions={voltageLevelToEdit?.busbarSections}
            studyUuid={studyUuid}
            currentNode={currentNode}
            onVoltageLevelChangeCallback={onVoltageLevelChange}
        />
    );

    return (
        <>
            <GridSection title="LineToSplit" />
            {gridItem(lineToSplitForm, 12)}
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
                    onCreateVoltageLevel={onVoltageLevelCreationDo}
                    editData={voltageLevelToEdit}
                />
            )}
        </>
    );
};

export default LineSplitWithVoltageLevelForm;
