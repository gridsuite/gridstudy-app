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
    ATTACHMENT_LINE_ID,
    ATTACHMENT_POINT_ID,
    ATTACHMENT_POINT_NAME,
    LINE_TO_ATTACH_OR_SPLIT_ID,
} from 'components/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { attachLine } from '../../../utils/rest-api';
import { sanitizeString } from '../dialogUtils';
import yup from '../../utils/yup-config';
import ModificationDialog from '../commons/modificationDialog';
import {
    getConnectivityWithoutPositionEmptyFormData,
    getConnectivityData,
    getConnectivityWithoutPositionValidationSchema,
} from '../connectivity/connectivity-form-utils';
import LineAttachToVoltageLevelForm from './line-attach-to-voltage-level-form';
import { MODIFICATION_TYPES } from 'components/utils/modification-type';
import {
    getLineToAttachOrSplitEmptyFormData,
    getLineToAttachOrSplitFormData,
    getLineToAttachOrSplitFormValidationSchema,
} from '../line-to-attach-or-split-form/line-to-attach-or-split-utils';
import { buildNewBusbarSections } from 'components/utils/utils';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { RunningStatus } from 'components/utils/running-status';
import { useOpenShortWaitFetching } from '../commons/handle-modification-form';

const emptyFormData = {
    [ATTACHMENT_LINE_ID]: '',
    [ATTACHMENT_POINT_ID]: '',
    [ATTACHMENT_POINT_NAME]: '',
    [LINE1_ID]: '',
    [LINE1_NAME]: '',
    [LINE2_ID]: '',
    [LINE2_NAME]: '',
    ...getLineToAttachOrSplitEmptyFormData(),
    ...getConnectivityWithoutPositionEmptyFormData(),
};

const formSchema = yup
    .object()
    .shape({
        [ATTACHMENT_LINE_ID]: yup.string().required(),
        [ATTACHMENT_POINT_ID]: yup.string().required(),
        [ATTACHMENT_POINT_NAME]: yup.string(),
        [LINE1_ID]: yup.string().required(),
        [LINE1_NAME]: yup.string(),
        [LINE2_ID]: yup.string().required(),
        [LINE2_NAME]: yup.string(),
        ...getLineToAttachOrSplitFormValidationSchema(),
        ...getConnectivityWithoutPositionValidationSchema(),
    })
    .required();

/**
 * Dialog to attach line to voltage level in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const LineAttachToVoltageLevelDialog = ({
    studyUuid,
    currentNode,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;

    const [attachmentLine, setAttachmentLine] = useState(null);

    const [newVoltageLevel, setNewVoltageLevel] = useState(null);

    const { snackError } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, getValues, setValue } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (lineAttach) => {
            reset({
                [LINE1_ID]: lineAttach.newLine1Id,
                [LINE1_NAME]: lineAttach.newLine1Name,
                [LINE2_ID]: lineAttach.newLine2Id,
                [LINE2_NAME]: lineAttach.newLine2Name,
                [ATTACHMENT_LINE_ID]: lineAttach?.attachmentLine?.equipmentId,
                [ATTACHMENT_POINT_ID]: lineAttach?.attachmentPointId,
                [ATTACHMENT_POINT_NAME]: lineAttach?.attachmentPointName,
                ...getLineToAttachOrSplitFormData({
                    lineToAttachOrSplitId: lineAttach?.lineToAttachToId,
                    percent: lineAttach.percent,
                }),
                ...getConnectivityData({
                    busbarSectionId: lineAttach.bbsOrBusId,
                    voltageLevelId:
                        lineAttach?.existingVoltageLevelId ??
                        lineAttach?.mayNewVoltageLevelInfos?.equipmentId,
                }),
            });
            setAttachmentLine(lineAttach?.attachmentLine);
            const newVoltageLevel = lineAttach?.mayNewVoltageLevelInfos;
            if (newVoltageLevel) {
                newVoltageLevel.busbarSections = buildNewBusbarSections(
                    newVoltageLevel?.equipmentId,
                    newVoltageLevel?.sectionCount,
                    newVoltageLevel?.busbarCount
                );
                setNewVoltageLevel(newVoltageLevel);
            }
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
                editData?.uuid,
                lineAttach[LINE_TO_ATTACH_OR_SPLIT_ID],
                parseFloat(lineAttach[SLIDER_PERCENTAGE]),
                lineAttach[ATTACHMENT_POINT_ID],
                sanitizeString(lineAttach[ATTACHMENT_POINT_NAME]),
                newVoltageLevel,
                lineAttach[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
                lineAttach[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                attachmentLine,
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
        [
            attachmentLine,
            currentNodeUuid,
            editData,
            newVoltageLevel,
            snackError,
            studyUuid,
        ]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onLineCreationDo = useCallback(
        (
            studyUuid,
            currentNodeUuid,
            lineId,
            lineName,
            seriesResistance,
            seriesReactance,
            shuntConductance1,
            shuntSusceptance1,
            shuntConductance2,
            shuntSusceptance2,
            connectivity1VlId,
            connectivity1BobbsId,
            connectivity2VlId,
            connectivity2BobbsId,
            permanentCurrentLimit1,
            permanentCurrentLimit2,
            temporaryCurrentLimits1,
            temporaryCurrentLimits2
        ) => {
            return new Promise(() => {
                const preparedLine = {
                    type: MODIFICATION_TYPES.LINE_CREATION.type,
                    equipmentId: lineId,
                    equipmentName: lineName,
                    seriesResistance: seriesResistance,
                    seriesReactance: seriesReactance,
                    shuntConductance1: shuntConductance1,
                    shuntSusceptance1: shuntSusceptance1,
                    shuntConductance2: shuntConductance2,
                    shuntSusceptance2: shuntSusceptance2,
                    currentLimits1: {
                        permanentLimit: permanentCurrentLimit1,
                        temporaryLimits: temporaryCurrentLimits1,
                    },
                    currentLimits2: {
                        permanentLimit: permanentCurrentLimit2,
                        temporaryLimits: temporaryCurrentLimits2,
                    },
                };
                setAttachmentLine(preparedLine);
                setValue(`${ATTACHMENT_LINE_ID}`, preparedLine.equipmentId, {
                    shouldValidate: true,
                    shouldDirty: true,
                });
            });
        },
        [setValue]
    );

    const onVoltageLevelCreationDo = useCallback(
        ({
            studyUuid,
            currentNodeUuid,
            voltageLevelId,
            voltageLevelName,
            substationId,
            nominalVoltage,
            lowVoltageLimit,
            highVoltageLimit,
            ipMin,
            ipMax,
            busbarCount,
            sectionCount,
            switchKinds,
            couplingDevices,
        }) => {
            return new Promise(() => {
                const preparedVoltageLevel = {
                    type: MODIFICATION_TYPES.VOLTAGE_LEVEL_CREATION.type,
                    equipmentId: voltageLevelId,
                    equipmentName: voltageLevelName,
                    substationId: substationId,
                    nominalVoltage: nominalVoltage,
                    lowVoltageLimit: lowVoltageLimit,
                    highVoltageLimit: highVoltageLimit,
                    ipMin: ipMin,
                    ipMax: ipMax,
                    busbarCount: busbarCount,
                    sectionCount: sectionCount,
                    switchKinds: switchKinds,
                    couplingDevices: couplingDevices,
                };
                preparedVoltageLevel.busbarSections = buildNewBusbarSections(
                    preparedVoltageLevel.equipmentId,
                    preparedVoltageLevel.sectionCount,
                    preparedVoltageLevel.busbarCount
                );
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
        isDataFetched:
            !isUpdate ||
            editDataFetchStatus === RunningStatus.SUCCEED ||
            editDataFetchStatus === RunningStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-attach-voltage-level-to-a-line"
                titleId="LineAttachToVoltageLevel"
                open={open}
                isDataFetching={
                    isUpdate && editDataFetchStatus === RunningStatus.RUNNING
                }
                {...dialogProps}
            >
                <LineAttachToVoltageLevelForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    onLineCreationDo={onLineCreationDo}
                    lineToEdit={attachmentLine}
                    onVoltageLevelCreationDo={onVoltageLevelCreationDo}
                    voltageLevelToEdit={newVoltageLevel}
                    onVoltageLevelChange={onVoltageLevelChange}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

LineAttachToVoltageLevelDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    editDataFetchStatus: PropTypes.string,
};

export default LineAttachToVoltageLevelDialog;
