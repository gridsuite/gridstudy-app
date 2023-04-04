/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    CONNECTIVITY,
    LINE1_ID,
    LINE1_NAME,
    LINE2_ID,
    LINE2_NAME,
    VOLTAGE_LEVEL,
    ID,
    BUS_OR_BUSBAR_SECTION,
    SLIDER_PERCENTAGE,
    LINE_TO_ATTACH_OR_SPLIT_ID,
} from 'components/refactor/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { divideLine } from '../../../../utils/rest-api';
import { sanitizeString } from '../../../dialogs/dialogUtils';
import yup from '../../utils/yup-config';
import ModificationDialog from '../commons/modificationDialog';
import {
    getConnectivityData,
    getConnectivityWithoutPositionEmptyFormData,
    getConnectivityWithoutPositionValidationSchema,
} from '../connectivity/connectivity-form-utils';
import LineSplitWithVoltageLevelForm from './line-split-with-voltage-level-form';
import {
    getLineToAttachOrSplitEmptyFormData,
    getLineToAttachOrSplitFormData,
    getLineToAttachOrSplitFormValidationSchema,
} from '../line-to-attach-or-split-form/line-to-attach-or-split-utils';
import { MODIFICATION_TYPES } from 'components/util/modification-type';
import { useOpenShortWaitFetching } from '../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';

const emptyFormData = {
    [LINE1_ID]: '',
    [LINE1_NAME]: '',
    [LINE2_ID]: '',
    [LINE2_NAME]: '',
    ...getLineToAttachOrSplitEmptyFormData(),
    ...getConnectivityWithoutPositionEmptyFormData(),
};

const schema = yup
    .object()
    .shape({
        [LINE1_ID]: yup.string().required(),
        [LINE1_NAME]: yup.string(),
        [LINE2_ID]: yup.string().required(),
        [LINE2_NAME]: yup.string(),
        ...getLineToAttachOrSplitFormValidationSchema(),
        ...getConnectivityWithoutPositionValidationSchema(),
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
    isUpdate,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;

    const [newVoltageLevel, setNewVoltageLevel] = useState(null);

    const { snackError } = useSnackMessage();

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset, getValues, setValue } = methods;

    const fromEditDataToFormValues = useCallback(
        (lineSplit) => {
            reset({
                [LINE1_ID]: lineSplit.newLine1Id,
                [LINE1_NAME]: lineSplit.newLine1Name,
                [LINE2_ID]: lineSplit.newLine2Id,
                [LINE2_NAME]: lineSplit.newLine2Name,
                ...getLineToAttachOrSplitFormData({
                    lineToAttachOrSplitId: lineSplit.lineToSplitId,
                    percent: lineSplit.percent,
                }),
                ...getConnectivityData({
                    busbarSectionId: lineSplit.bbsOrBusId,
                    voltageLevelId:
                        lineSplit?.existingVoltageLevelId ??
                        lineSplit?.mayNewVoltageLevelInfos?.equipmentId,
                }),
            });
            setNewVoltageLevel(lineSplit?.mayNewVoltageLevelInfos);
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
                editData?.uuid,
                lineSplit[LINE_TO_ATTACH_OR_SPLIT_ID],
                parseFloat(lineSplit[SLIDER_PERCENTAGE]),
                newVoltageLevel,
                lineSplit[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
                lineSplit[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                lineSplit[LINE1_ID],
                sanitizeString(lineSplit[LINE1_NAME]),
                lineSplit[LINE2_ID],
                sanitizeString(lineSplit[LINE2_NAME])
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'LineDivisionError',
                });
            });
        },
        [currentNodeUuid, editData, newVoltageLevel, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onVoltageLevelCreationDo = useCallback(
        ({
            studyUuid,
            currentNodeUuid,
            voltageLevelId,
            voltageLevelName,
            nominalVoltage,
            substationId,
            busbarSections,
            busbarConnections,
        }) => {
            return new Promise(() => {
                const preparedVoltageLevel = {
                    type: MODIFICATION_TYPES.VOLTAGE_LEVEL_CREATION.type,
                    equipmentId: voltageLevelId,
                    equipmentName: voltageLevelName,
                    nominalVoltage: nominalVoltage,
                    substationId: substationId,
                    busbarSections: busbarSections,
                    busbarConnections: busbarConnections,
                };
                setNewVoltageLevel(preparedVoltageLevel);
                setValue(
                    `${CONNECTIVITY}.${VOLTAGE_LEVEL}`,
                    {
                        [ID]: preparedVoltageLevel.equipmentId,
                    },
                    {
                        shouldValidate: true,
                        shouldDirty: true,
                    }
                );
            });
        },
        [setValue]
    );

    const onVoltageLevelChange = useCallback(() => {
        const currentVoltageLevelId = getValues(
            `${CONNECTIVITY}.${VOLTAGE_LEVEL}.${ID}`
        );
        if (
            newVoltageLevel &&
            currentVoltageLevelId !== newVoltageLevel?.equipmentId
        ) {
            setNewVoltageLevel(null);
        }
    }, [getValues, newVoltageLevel]);

    const open = useOpenShortWaitFetching({
        mainData: editData,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <FormProvider validationSchema={schema} {...methods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-voltage-level-amidst-a-line"
                titleId="LineSplitWithVoltageLevel"
                open={open}
                editData={editData}
                isUpdate={isUpdate}
                {...dialogProps}
            >
                <LineSplitWithVoltageLevelForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    onVoltageLevelCreationDo={onVoltageLevelCreationDo}
                    voltageLevelToEdit={newVoltageLevel}
                    onVoltageLevelChange={onVoltageLevelChange}
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
