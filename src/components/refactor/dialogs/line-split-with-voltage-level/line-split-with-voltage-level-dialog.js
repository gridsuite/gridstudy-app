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
    LINE_TO_DIVIDE,
    LINE1_ID,
    LINE1_NAME,
    LINE2_ID,
    LINE2_NAME,
    VOLTAGE_LEVEL,
    ID,
    BUS_OR_BUSBAR_SECTION,
    SLIDER_PERCENTAGE,
} from 'components/refactor/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { divideLine } from '../../../../utils/rest-api';
import { sanitizeString } from '../../../dialogs/dialogUtils';
import yup from '../../utils/yup-config';
import ModificationDialog from '../commons/modificationDialog';
import {
    getConnectivityEmptyFormData,
    getConnectivityFormData,
    getConnectivityFormValidationSchema,
} from '../connectivity/connectivity-form-utils';
import LineSplitWithVoltageLevelForm from './line-split-with-voltage-level-form';
import {
    getPercentageAreaData,
    getPercentageAreaEmptyFormData,
    getPercentageAreaValidationSchema,
} from './percentage-area/percentage-area-utils';

const emptyFormData = {
    [LINE_TO_DIVIDE]: '',
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
        [LINE_TO_DIVIDE]: yup.string().required(),
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
const LineSplitWithVoltageLevelDialog = ({
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
        (lineSplit) => {
            reset({
                [LINE_TO_DIVIDE]: lineSplit.lineToSplitId,
                [LINE1_ID]: lineSplit.newLine1Id,
                [LINE1_NAME]: lineSplit.newLine1Name,
                [LINE2_ID]: lineSplit.newLine2Id,
                [LINE2_NAME]: lineSplit.newLine2Name,
                ...getPercentageAreaData({
                    percent: lineSplit.percent,
                }),
                ...getConnectivityFormData({
                    busbarSectionId: lineSplit.bbsOrBusId,
                    voltageLevelId:
                        lineSplit?.existingVoltageLevelId ??
                        lineSplit?.mayNewVoltageLevelInfos?.equipmentId,
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
        (lineSplit) => {
            divideLine(
                studyUuid,
                currentNodeUuid,
                editData ? editData.uuid : undefined,
                lineSplit[LINE_TO_DIVIDE],
                parseFloat(lineSplit[SLIDER_PERCENTAGE]),
                null,
                lineSplit[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
                lineSplit[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                lineSplit[LINE1_ID],
                sanitizeString(lineSplit[LINE1_NAME]),
                lineSplit[LINE2_ID],
                sanitizeString(lineSplit[LINE2_NAME])
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'ShuntCompensatorCreationError',
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
                aria-labelledby="dialog-create-voltage-level-amidst-a-line"
                titleId="LineSplitWithVoltageLevel"
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

LineSplitWithVoltageLevelDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
};

export default LineSplitWithVoltageLevelDialog;
