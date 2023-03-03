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
    LINE_TO_ATTACH_TO_ID_1,
    LINE_TO_ATTACH_TO_ID_2,
    REPLACING_LINE_ID_1,
    REPLACING_LINE_ID_2,
    REPLACING_LINE_NAME_1,
    REPLACING_LINE_NAME_2,
    VOLTAGE_LEVEL_ID,
} from 'components/refactor/utils/field-constants';
import yup from 'components/refactor/utils/yup-config';
import React, { useCallback, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { linesAttachToSplitLines } from 'utils/rest-api';
import ModificationDialog from 'components/refactor/dialogs/commons/modificationDialog';

import LinesAttachToSplitLinesForm from './lines-attach-to-split-lines-form';

const emptyFormData = {
    [LINE_TO_ATTACH_TO_ID_1]: '',
    [LINE_TO_ATTACH_TO_ID_2]: '',
    [ATTACHED_LINE_ID]: '',
    [VOLTAGE_LEVEL_ID]: '',
    [BUS_BAR_SECTION_ID]: '',
    [REPLACING_LINE_ID_1]: '',
    [REPLACING_LINE_NAME_1]: '',
    [REPLACING_LINE_ID_2]: '',
    [REPLACING_LINE_NAME_2]: '',
};

const schema = yup
    .object()
    .shape({
        [LINE_TO_ATTACH_TO_ID_1]: yup.string().required(),
        [LINE_TO_ATTACH_TO_ID_2]: yup.string().required(),
        [ATTACHED_LINE_ID]: yup.string().required(),
        [VOLTAGE_LEVEL_ID]: yup.string().required(),
        [BUS_BAR_SECTION_ID]: yup.string().required(),
        [REPLACING_LINE_ID_1]: yup.string().required(),
        [REPLACING_LINE_NAME_1]: yup.string(),
        [REPLACING_LINE_ID_2]: yup.string().required(),
        [REPLACING_LINE_NAME_2]: yup.string(),
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

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

    useEffect(() => {
        if (editData) {
            reset({
                [LINE_TO_ATTACH_TO_ID_1]: editData[LINE_TO_ATTACH_TO_ID_1],
                [LINE_TO_ATTACH_TO_ID_2]: editData[LINE_TO_ATTACH_TO_ID_2],
                [ATTACHED_LINE_ID]: editData[ATTACHED_LINE_ID],
                [VOLTAGE_LEVEL_ID]: editData[VOLTAGE_LEVEL_ID],
                [BUS_BAR_SECTION_ID]: editData[BUS_BAR_SECTION_ID],
                [REPLACING_LINE_ID_1]: editData[REPLACING_LINE_ID_1],
                [REPLACING_LINE_NAME_1]: editData[REPLACING_LINE_NAME_1],
                [REPLACING_LINE_ID_2]: editData[REPLACING_LINE_ID_2],
                [REPLACING_LINE_NAME_2]: editData[REPLACING_LINE_NAME_2],
            });
        }
    }, [editData, reset]);

    const onSubmit = useCallback(
        (linesAttachToSplitLine) => {
            linesAttachToSplitLines(
                studyUuid,
                currentNodeUuid,
                editData ? editData.uuid : undefined,
                linesAttachToSplitLine[LINE_TO_ATTACH_TO_ID_1],
                linesAttachToSplitLine[LINE_TO_ATTACH_TO_ID_2],
                linesAttachToSplitLine[ATTACHED_LINE_ID],
                linesAttachToSplitLine[VOLTAGE_LEVEL_ID],
                linesAttachToSplitLine[BUS_BAR_SECTION_ID],
                linesAttachToSplitLine[REPLACING_LINE_ID_1],
                sanitizeString(linesAttachToSplitLine[REPLACING_LINE_NAME_1]),
                linesAttachToSplitLine[REPLACING_LINE_ID_2],
                sanitizeString(linesAttachToSplitLine[REPLACING_LINE_NAME_2])
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
        <FormProvider validationSchema={schema} {...methods}>
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
                    currentNodeUuid={currentNodeUuid}
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
