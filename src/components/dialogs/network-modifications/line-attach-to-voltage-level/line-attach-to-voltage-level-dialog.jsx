/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    ATTACHMENT_LINE_ID,
    ATTACHMENT_POINT_ID,
    ATTACHMENT_POINT_NAME,
    BUS_OR_BUSBAR_SECTION,
    CONNECTIVITY,
    ID,
    LINE1_ID,
    LINE1_NAME,
    LINE2_ID,
    LINE2_NAME,
    LINE_TO_ATTACH_OR_SPLIT_ID,
    SLIDER_PERCENTAGE,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { sanitizeString } from '../../dialogUtils';
import yup from 'components/utils/yup-config';
import ModificationDialog from '../../commons/modificationDialog';
import {
    getConnectivityData,
    getConnectivityWithoutPositionEmptyFormData,
    getConnectivityWithoutPositionValidationSchema,
    getNewVoltageLevelData,
} from '../../connectivity/connectivity-form-utils';
import LineAttachToVoltageLevelForm from './line-attach-to-voltage-level-form';
import { MODIFICATION_TYPES } from 'components/utils/modification-type';
import {
    getLineToAttachOrSplitEmptyFormData,
    getLineToAttachOrSplitFormData,
    getLineToAttachOrSplitFormValidationSchema,
} from '../line-to-attach-or-split-form/line-to-attach-or-split-utils';
import { buildNewBusbarSections } from 'components/utils/utils';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { attachLine } from '../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../services/utils';
import { fetchVoltageLevelsListInfos } from '../../../../services/study/network';
import LineAttachToVoltageLevelIllustration from './line-attach-to-voltage-level-illustration';
import { getNewVoltageLevelOptions } from '../../../utils/utils';

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
 * @param editDataFetchStatus indicates the status of fetching EditData
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

    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, setValue } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (lineAttach) => {
            let formData = {
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
            };
            const newVoltageLevel = lineAttach?.mayNewVoltageLevelInfos;
            if (newVoltageLevel) {
                formData = {
                    ...formData,
                    [CONNECTIVITY]: {
                        ...formData[CONNECTIVITY],
                        [VOLTAGE_LEVEL]:
                            getNewVoltageLevelData(newVoltageLevel),
                    },
                };
            }
            reset(formData);
            setAttachmentLine(lineAttach?.attachmentLine);
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
            const currentVoltageLevelId =
                lineAttach[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID];
            const isNewVoltageLevel =
                newVoltageLevel?.equipmentId === currentVoltageLevelId;
            attachLine(
                studyUuid,
                currentNodeUuid,
                editData?.uuid,
                lineAttach[LINE_TO_ATTACH_OR_SPLIT_ID],
                parseFloat(lineAttach[SLIDER_PERCENTAGE]),
                lineAttach[ATTACHMENT_POINT_ID],
                sanitizeString(lineAttach[ATTACHMENT_POINT_NAME]),
                isNewVoltageLevel ? newVoltageLevel : null,
                currentVoltageLevelId,
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

    useEffect(() => {
        if (studyUuid && currentNode?.id) {
            fetchVoltageLevelsListInfos(studyUuid, currentNode?.id).then(
                (values) => {
                    setVoltageLevelOptions(
                        values.sort((a, b) => a?.id?.localeCompare(b?.id))
                    );
                }
            );
        }
    }, [studyUuid, currentNode?.id]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onLineCreationDo = useCallback(
        (
            studyUuid,
            currentNodeUuid,
            lineId,
            lineName,
            r,
            x,
            g1,
            b1,
            g2,
            b2,
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
                    r: r,
                    x: x,
                    g1: g1,
                    b1: b1,
                    g2: g2,
                    b2: b2,
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
            voltageLevelId,
            voltageLevelName,
            substationId,
            nominalV,
            lowVoltageLimit,
            highVoltageLimit,
            ipMin,
            ipMax,
            busbarCount,
            sectionCount,
            switchKinds,
            couplingDevices,
            topologyKind,
        }) => {
            return new Promise(() => {
                const preparedVoltageLevel = {
                    type: MODIFICATION_TYPES.VOLTAGE_LEVEL_CREATION.type,
                    equipmentId: voltageLevelId,
                    equipmentName: voltageLevelName,
                    substationId: substationId,
                    nominalV: nominalV,
                    lowVoltageLimit: lowVoltageLimit,
                    highVoltageLimit: highVoltageLimit,
                    ipMin: ipMin,
                    ipMax: ipMax,
                    busbarCount: busbarCount,
                    sectionCount: sectionCount,
                    switchKinds: switchKinds,
                    couplingDevices: couplingDevices,
                    topologyKind: topologyKind,
                };
                preparedVoltageLevel.busbarSections = buildNewBusbarSections(
                    preparedVoltageLevel.equipmentId,
                    preparedVoltageLevel.sectionCount,
                    preparedVoltageLevel.busbarCount
                );

                // we keep the old voltage level id, so it can be removed for from voltage level options
                const oldVoltageLevelId = newVoltageLevel?.equipmentId;

                const formattedVoltageLevel =
                    getNewVoltageLevelData(preparedVoltageLevel);

                // we add the new voltage level, (or replace it if it exists). And we remove the old id if it is different (in case we modify the id)
                const newVoltageLevelOptions = getNewVoltageLevelOptions(
                    formattedVoltageLevel,
                    oldVoltageLevelId,
                    voltageLevelOptions
                );

                setVoltageLevelOptions(newVoltageLevelOptions);

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
        [setValue, newVoltageLevel, voltageLevelOptions]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            editDataFetchStatus === FetchStatus.SUCCEED ||
            editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-attach-voltage-level-to-a-line"
                titleId="LineAttachToVoltageLevel"
                subtitle={<LineAttachToVoltageLevelIllustration />}
                open={open}
                isDataFetching={
                    isUpdate && editDataFetchStatus === FetchStatus.RUNNING
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
                    allVoltageLevelOptions={voltageLevelOptions}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

LineAttachToVoltageLevelDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    editDataFetchStatus: PropTypes.string,
    isUpdate: PropTypes.bool,
};

export default LineAttachToVoltageLevelDialog;
