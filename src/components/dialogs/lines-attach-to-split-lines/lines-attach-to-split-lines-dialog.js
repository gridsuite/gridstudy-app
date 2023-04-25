/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { sanitizeString } from 'components/dialogs/dialogUtils';
import PropTypes from 'prop-types';
import {
    ATTACHED_LINE_ID,
    BUS_BAR_SECTION_ID,
    REPLACING_LINE_1_ID,
    REPLACING_LINE_2_ID,
    REPLACING_LINE_1_NAME,
    REPLACING_LINE_2_NAME,
    VOLTAGE_LEVEL_ID,
    LINE_TO_ATTACH_TO_1_ID,
    LINE_TO_ATTACH_TO_2_ID,
    CONNECTIVITY,
    VOLTAGE_LEVEL,
    ID,
    BUS_OR_BUSBAR_SECTION,
} from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';
import React, { useCallback, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { linesAttachToSplitLines } from 'utils/rest-api';
import ModificationDialog from 'components/dialogs/commons/modificationDialog';

import LinesAttachToSplitLinesForm from './lines-attach-to-split-lines-form';
import {
    getConnectivityWithoutPositionEmptyFormData,
    getConnectivityWithoutPositionValidationSchema,
    getConnectivityData,
} from '../connectivity/connectivity-form-utils';

const emptyFormData = {
    [LINE_TO_ATTACH_TO_1_ID]: null,
    [LINE_TO_ATTACH_TO_2_ID]: null,
    [ATTACHED_LINE_ID]: null,
    [REPLACING_LINE_1_ID]: '',
    [REPLACING_LINE_1_NAME]: '',
    [REPLACING_LINE_2_ID]: '',
    [REPLACING_LINE_2_NAME]: '',
    ...getConnectivityWithoutPositionEmptyFormData(),
};

const formSchema = yup
    .object()
    .shape({
        [LINE_TO_ATTACH_TO_1_ID]: yup.string().nullable().required(),
        [LINE_TO_ATTACH_TO_2_ID]: yup.string().nullable().required(),
        [ATTACHED_LINE_ID]: yup.string().nullable().required(),
        [REPLACING_LINE_1_ID]: yup.string().required(),
        [REPLACING_LINE_1_NAME]: yup.string(),
        [REPLACING_LINE_2_ID]: yup.string().required(),
        [REPLACING_LINE_2_NAME]: yup.string(),
        ...getConnectivityWithoutPositionValidationSchema(),
    })
    .required();

/**
 * Dialog to attach a line to a (possibly new) voltage level.
 * @param studyUuid the study we are currently working on
 * @param currentNode The node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const LinesAttachToSplitLinesDialog = ({
    editData,
    currentNode,
    studyUuid,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            reset({
                [LINE_TO_ATTACH_TO_1_ID]: editData[LINE_TO_ATTACH_TO_1_ID],
                [LINE_TO_ATTACH_TO_2_ID]: editData[LINE_TO_ATTACH_TO_2_ID],
                [ATTACHED_LINE_ID]: editData[ATTACHED_LINE_ID],
                [REPLACING_LINE_1_ID]: editData[REPLACING_LINE_1_ID],
                [REPLACING_LINE_1_NAME]: editData[REPLACING_LINE_1_NAME],
                [REPLACING_LINE_2_ID]: editData[REPLACING_LINE_2_ID],
                [REPLACING_LINE_2_NAME]: editData[REPLACING_LINE_2_NAME],
                ...getConnectivityData({
                    voltageLevelId: editData[VOLTAGE_LEVEL_ID],
                    busbarSectionId: editData[BUS_BAR_SECTION_ID],
                }),
            });
        }
    }, [editData, reset]);

    const onSubmit = useCallback(
        (linesAttachToSplitLine) => {
            linesAttachToSplitLines(
                studyUuid,
                currentNodeUuid,
                editData ? editData.uuid : undefined,
                linesAttachToSplitLine[LINE_TO_ATTACH_TO_1_ID],
                linesAttachToSplitLine[LINE_TO_ATTACH_TO_2_ID],
                linesAttachToSplitLine[ATTACHED_LINE_ID],
                linesAttachToSplitLine[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
                linesAttachToSplitLine[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[
                    ID
                ],
                linesAttachToSplitLine[REPLACING_LINE_1_ID],
                sanitizeString(linesAttachToSplitLine[REPLACING_LINE_1_NAME]),
                linesAttachToSplitLine[REPLACING_LINE_2_ID],
                sanitizeString(linesAttachToSplitLine[REPLACING_LINE_2_NAME])
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'LineAttachmentError',
                });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'md'}
                titleId="LinesAttachToSplitLines"
                aria-labelledby="dialog-attach-lines-to-split-lines"
                {...dialogProps}
            >
                <LinesAttachToSplitLinesForm
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

LinesAttachToSplitLinesDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
};

export default LinesAttachToSplitLinesDialog;
