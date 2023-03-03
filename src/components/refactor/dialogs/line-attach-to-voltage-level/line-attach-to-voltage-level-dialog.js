/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    CONNECTIVITY,
    LINE_TO_ATTACH_TO,
    LINE1_ID,
    LINE1_NAME,
    LINE2_ID,
    LINE2_NAME,
    VOLTAGE_LEVEL,
    ID,
    BUS_OR_BUSBAR_SECTION,
    SLIDER_PERCENTAGE,
    ATTACHMENT_LINE_ID,
    ATTACHMENT_POINT_ID,
    ATTACHMENT_POINT_NAME,
} from 'components/refactor/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { attachLine } from '../../../../utils/rest-api';
import { sanitizeString } from '../../../dialogs/dialogUtils';
import yup from '../../utils/yup-config';
import ModificationDialog from '../commons/modificationDialog';
import {
    getConnectivityEmptyFormData,
    getConnectivityFormData,
    getConnectivityFormValidationSchema,
} from '../connectivity/connectivity-form-utils';
import LineSplitWithVoltageLevelForm from './line-attach-to-voltage-level-form';
import {
    getPercentageAreaData,
    getPercentageAreaEmptyFormData,
    getPercentageAreaValidationSchema,
} from '../percentage-area/percentage-area-utils';

const emptyFormData = {
    [LINE_TO_ATTACH_TO]: null,
    [ATTACHMENT_LINE_ID]: '',
    [ATTACHMENT_POINT_ID]: '',
    [ATTACHMENT_POINT_NAME]: '',
    [LINE1_ID]: '',
    [LINE1_NAME]: '',
    [LINE2_ID]: '',
    [LINE2_NAME]: '',
    ...getPercentageAreaEmptyFormData(),
    ...getConnectivityEmptyFormData(),
};

const schema = yup
    .object()
    .shape({
        [LINE_TO_ATTACH_TO]: yup.object().nullable().required(),
        [ATTACHMENT_LINE_ID]: yup.string(),
        [ATTACHMENT_POINT_ID]: yup.string().required(),
        [ATTACHMENT_POINT_NAME]: yup.string(),
        [LINE1_ID]: yup.string().required(),
        [LINE1_NAME]: yup.string(),
        [LINE2_ID]: yup.string().required(),
        [LINE2_NAME]: yup.string(),
        ...getPercentageAreaValidationSchema(),
        ...getConnectivityFormValidationSchema(),
    })
    .required();

/**
 * Dialog to create line split with voltage level in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const LinesAttachToSplitLinesDialog = ({
    studyUuid,
    currentNode,
    editData,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;

    const { snackError } = useSnackMessage();

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

    const fromEditDataToFormValues = useCallback(
        (lineAttach) => {
            reset({
                [LINE_TO_ATTACH_TO]: lineAttach.lineToSplitId,
                [LINE1_ID]: lineAttach.newLine1Id,
                [LINE1_NAME]: lineAttach.newLine1Name,
                [LINE2_ID]: lineAttach.newLine2Id,
                [LINE2_NAME]: lineAttach.newLine2Name,
                ...getPercentageAreaData({
                    percent: lineAttach.percent,
                }),
                ...getConnectivityFormData({
                    busbarSectionId: lineAttach.bbsOrBusId,
                    voltageLevelId:
                        lineAttach?.existingVoltageLevelId ??
                        lineAttach?.mayNewVoltageLevelInfos?.equipmentId,
                }),
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (lineAttach) => {
            attachLine(
                studyUuid,
                currentNodeUuid,
                editData ? editData.uuid : undefined,
                lineAttach[LINE_TO_ATTACH_TO]?.[ID],
                parseFloat(lineAttach[SLIDER_PERCENTAGE]),
                lineAttach[ATTACHMENT_POINT_ID],
                sanitizeString(lineAttach[ATTACHMENT_POINT_NAME]),
                null,
                lineAttach[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
                lineAttach[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                lineAttach[ATTACHMENT_LINE_ID],
                lineAttach[LINE1_ID],
                sanitizeString(lineAttach[LINE1_NAME]),
                lineAttach[LINE2_ID],
                sanitizeString(lineAttach[LINE2_NAME])
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'LineAttachmentError',
                });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    return (
        <FormProvider validationSchema={schema} {...methods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-attach-voltage-level-to-a-line"
                titleId="LineAttachToVoltageLevel"
                {...dialogProps}
            >
                <LineSplitWithVoltageLevelForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
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
