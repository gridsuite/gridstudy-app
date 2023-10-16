/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { gridItem } from '../../dialogUtils';
import { AutocompleteInput } from '@gridsuite/commons-ui';
import { areIdsEqual, getObjectId } from 'components/utils/utils';
import { useEffect, useState } from 'react';
import { PercentageArea } from '../../percentage-area/percentage-area';
import { useWatch } from 'react-hook-form';
import { LINE_TO_ATTACH_OR_SPLIT_ID } from 'components/utils/field-constants';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { fetchEquipmentsIds } from '../../../../services/study/network-map';

export const LineToAttachOrSplitForm = ({ label, studyUuid, currentNode }) => {
    const [line1Substation, setLine1Substation] = useState('');
    const [line2Substation, setLine2Substation] = useState('');
    const [linesOptions, setLinesOptions] = useState([]);
    const { snackError } = useSnackMessage();
    const watchLineToAttachOrSplit = useWatch({
        name: LINE_TO_ATTACH_OR_SPLIT_ID,
    });

    useEffect(() => {
        if (studyUuid && currentNode?.id) {
            fetchEquipmentsIds(
                studyUuid,
                currentNode?.id,
                undefined,
                EQUIPMENT_TYPES.LINE,
                true
            )
                .then((values) => {
                    setLinesOptions(values.sort());
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'equipmentsLoadingError',
                    });
                });
        }
    }, [studyUuid, currentNode?.id, watchLineToAttachOrSplit, snackError]);

    useEffect(() => {
        const lineToAttachOrSplit = linesOptions.find(
            (l) => l?.id === watchLineToAttachOrSplit
        );

        setLine1Substation(
            lineToAttachOrSplit?.voltageLevelName1 ??
                lineToAttachOrSplit?.voltageLevelId1
        );
        setLine2Substation(
            lineToAttachOrSplit?.voltageLevelName2 ??
                lineToAttachOrSplit?.voltageLevelId2
        );
    }, [linesOptions, watchLineToAttachOrSplit]);

    const lineToAttachOrSplitField = (
        <AutocompleteInput
            isOptionEqualToValue={areIdsEqual}
            allowNewValue
            forcePopupIcon
            name={LINE_TO_ATTACH_OR_SPLIT_ID}
            label={label}
            options={linesOptions}
            getOptionLabel={getObjectId}
            outputTransform={getObjectId}
            size={'small'}
        />
    );
    const percentageArea = (
        <PercentageArea upperLeftText={'Line1'} upperRightText={'Line2'} />
    );
    return (
        <>
            <Grid container spacing={2} alignItems="center">
                {gridItem(lineToAttachOrSplitField, 5)}
                {gridItem(<Typography>{line1Substation}</Typography>, 1)}
                {gridItem(percentageArea, 5)}
                {gridItem(<Typography>{line2Substation}</Typography>, 1)}
            </Grid>
        </>
    );
};
