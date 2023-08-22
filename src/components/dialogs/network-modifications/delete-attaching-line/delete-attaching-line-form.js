/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import React, { useEffect, useState } from 'react';
import { gridItem, GridSection } from 'components/dialogs/dialogUtils';
import { TextInput } from '@gridsuite/commons-ui';
import { AutocompleteInput } from '@gridsuite/commons-ui';
import {
    ATTACHED_LINE_ID,
    LINE_TO_ATTACH_TO_1_ID,
    LINE_TO_ATTACH_TO_2_ID,
    REPLACING_LINE_1_ID,
    REPLACING_LINE_1_NAME,
} from 'components/utils/field-constants';
import { areIdsEqual, getObjectId } from 'components/utils/utils';
import { fetchEquipmentsIds } from '../../../../services/study/network-map';

const DeleteAttachingLineForm = ({ studyUuid, currentNode }) => {
    const [linesOptions, setLinesOptions] = useState([]);

    useEffect(() => {
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
    }, [studyUuid, currentNode?.id]);

    const lineToAttachTo1Field = (
        <AutocompleteInput
            isOptionEqualToValue={areIdsEqual}
            allowNewValue
            forcePopupIcon
            name={LINE_TO_ATTACH_TO_1_ID}
            label="Line1"
            options={linesOptions}
            getOptionLabel={getObjectId}
            outputTransform={getObjectId}
            size={'small'}
        />
    );

    const lineToAttachTo2Field = (
        <AutocompleteInput
            isOptionEqualToValue={areIdsEqual}
            allowNewValue
            forcePopupIcon
            name={LINE_TO_ATTACH_TO_2_ID}
            label="Line2"
            options={linesOptions}
            getOptionLabel={getObjectId}
            outputTransform={getObjectId}
            size={'small'}
        />
    );

    const attachedLineField = (
        <AutocompleteInput
            isOptionEqualToValue={areIdsEqual}
            allowNewValue
            forcePopupIcon
            name={ATTACHED_LINE_ID}
            label="LineAttached"
            options={linesOptions}
            getOptionLabel={getObjectId}
            outputTransform={getObjectId}
            size={'small'}
        />
    );

    const replacingLineIdField = (
        <TextInput name={REPLACING_LINE_1_ID} label={'ReplacingLineId'} />
    );
    const replacingLineNameField = (
        <TextInput name={REPLACING_LINE_1_NAME} label={'ReplacingLineName'} />
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
            <GridSection title="ReplacingLine" />
            <Grid container spacing={2}>
                {gridItem(replacingLineIdField, 6)}
                {gridItem(replacingLineNameField, 6)}
            </Grid>
        </>
    );
};

export default DeleteAttachingLineForm;
