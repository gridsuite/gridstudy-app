/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, MODIFICATION_TYPES, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
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
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { sanitizeString } from '../../dialog-utils';
import yup from 'components/utils/yup-config';
import { ModificationDialog } from '../../commons/modificationDialog';
import {
    getConnectivityData,
    getConnectivityWithoutPositionEmptyFormData,
    getConnectivityWithoutPositionValidationSchema,
    getNewVoltageLevelData,
} from '../../connectivity/connectivity-form-utils';
import LineAttachToVoltageLevelForm from './line-attach-to-voltage-level-form';
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
        [ATTACHMENT_POINT_NAME]: yup.string().nullable(),
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
 * @param currentRootNetworkUuid The root network uuid we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const LineAttachToVoltageLevelDialog = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;

    const [attachmentLine, setAttachmentLine] = useState(null);

    const [newVoltageLevel, setNewVoltageLevel] = useState(null);
    const [attachmentPoint, setAttachmentPoint] = useState({ type: MODIFICATION_TYPES.VOLTAGE_LEVEL_CREATION.type });

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
                        lineAttach?.existingVoltageLevelId ?? lineAttach?.mayNewVoltageLevelInfos?.equipmentId,
                }),
            };
            const newVoltageLevelInfos = lineAttach?.mayNewVoltageLevelInfos;
            if (newVoltageLevelInfos) {
                formData = {
                    ...formData,
                    [CONNECTIVITY]: {
                        ...formData[CONNECTIVITY],
                        [VOLTAGE_LEVEL]: getNewVoltageLevelData(newVoltageLevelInfos),
                    },
                };
            }
            reset(formData);
            setAttachmentLine(lineAttach?.attachmentLine);
            setAttachmentPoint(lineAttach?.attachmentPointDetailInformation);
            if (newVoltageLevelInfos) {
                newVoltageLevelInfos.busbarSections = buildNewBusbarSections(
                    newVoltageLevelInfos?.equipmentId,
                    newVoltageLevelInfos?.sectionCount,
                    newVoltageLevelInfos?.busbarCount
                );
                setNewVoltageLevel(newVoltageLevelInfos);
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
            const currentVoltageLevelId = lineAttach[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID];
            const isNewVoltageLevel = newVoltageLevel?.equipmentId === currentVoltageLevelId;
            attachLine({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                lineToAttachToId: lineAttach[LINE_TO_ATTACH_OR_SPLIT_ID],
                percent: parseFloat(lineAttach[SLIDER_PERCENTAGE]),
                attachmentPointId: lineAttach[ATTACHMENT_POINT_ID],
                attachmentPointName: sanitizeString(lineAttach[ATTACHMENT_POINT_NAME]),
                attachmentPointDetailInformation: attachmentPoint,
                mayNewVoltageLevelInfos: isNewVoltageLevel ? newVoltageLevel : null,
                existingVoltageLevelId: currentVoltageLevelId,
                bbsOrBusId: lineAttach[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                attachmentLine: attachmentLine,
                newLine1Id: lineAttach[LINE1_ID],
                newLine1Name: sanitizeString(lineAttach[LINE1_NAME]),
                newLine2Id: lineAttach[LINE2_ID],
                newLine2Name: sanitizeString(lineAttach[LINE2_NAME]),
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'LineAttachmentError' });
            });
        },
        [attachmentLine, attachmentPoint, currentNodeUuid, editData?.uuid, newVoltageLevel, snackError, studyUuid]
    );

    useEffect(() => {
        if (studyUuid && currentNode?.id) {
            fetchVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid).then((values) => {
                setVoltageLevelOptions(values.sort((a, b) => a?.id?.localeCompare(b?.id)));
            });
        }
    }, [studyUuid, currentNode?.id, currentRootNetworkUuid]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onLineCreationDo = useCallback(
        (lineCreationInfo) => {
            return new Promise(() => {
                const preparedLine = {
                    type: MODIFICATION_TYPES.LINE_CREATION.type,
                    lineId: lineCreationInfo.lineId,
                    lineName: lineCreationInfo.lineName,
                    r: lineCreationInfo.r,
                    x: lineCreationInfo.x,
                    g1: lineCreationInfo.g1,
                    b1: lineCreationInfo.b1,
                    g2: lineCreationInfo.g2,
                    b2: lineCreationInfo.b2,
                    operationalLimitsGroups: lineCreationInfo.operationalLimitsGroups,
                    selectedOperationalLimitsGroupId1: lineCreationInfo.selectedOperationalLimitsGroupId1,
                    selectedOperationalLimitsGroupId2: lineCreationInfo.selectedOperationalLimitsGroupId2,
                    properties: lineCreationInfo.properties,
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
            substationCreation,
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
            properties,
        }) => {
            return new Promise(() => {
                const preparedVoltageLevel = {
                    type: MODIFICATION_TYPES.VOLTAGE_LEVEL_CREATION.type,
                    equipmentId: voltageLevelId,
                    equipmentName: voltageLevelName,
                    substationId: substationId,
                    substationCreation: substationCreation,
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
                    properties: properties,
                };
                preparedVoltageLevel.busbarSections = buildNewBusbarSections(
                    preparedVoltageLevel.equipmentId,
                    preparedVoltageLevel.sectionCount,
                    preparedVoltageLevel.busbarCount
                );

                // we keep the old voltage level id, so it can be removed for from voltage level options
                const oldVoltageLevelId = newVoltageLevel?.equipmentId;

                const formattedVoltageLevel = getNewVoltageLevelData(preparedVoltageLevel);

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

    const onAttachmentPointModificationDo = useCallback(
        ({
            voltageLevelId,
            voltageLevelName,
            nominalV,
            substationCreation,
            lowVoltageLimit,
            highVoltageLimit,
            busbarCount,
            sectionCount,
            ipMin,
            ipMax,
            topologyKind,
            properties,
        }) => {
            return new Promise(() => {
                const attachmentPointData = {
                    type: MODIFICATION_TYPES.VOLTAGE_LEVEL_CREATION.type,
                    equipmentId: voltageLevelId,
                    equipmentName: voltageLevelName,
                    nominalV: nominalV,
                    substationCreation: substationCreation,
                    lowVoltageLimit: lowVoltageLimit,
                    highVoltageLimit: highVoltageLimit,
                    busbarCount: busbarCount,
                    sectionCount: sectionCount,
                    ipMin: ipMin,
                    ipMax: ipMax,
                    topologyKind: topologyKind,
                    properties: properties,
                };
                setAttachmentPoint(attachmentPointData);
                setValue(`${ATTACHMENT_POINT_ID}`, attachmentPointData.equipmentId, {
                    shouldValidate: true,
                    shouldDirty: true,
                });
                setValue(`${ATTACHMENT_POINT_NAME}`, attachmentPointData.equipmentName, {
                    shouldValidate: true,
                    shouldDirty: true,
                });
                // this is only used to validate schema if something was changed except ID or NAME and not used elsewhere
                setValue('test', attachmentPointData, {
                    shouldValidate: true,
                    shouldDirty: true,
                });
            });
        },
        [setValue]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                titleId="LineAttachToVoltageLevel"
                subtitle={<LineAttachToVoltageLevelIllustration />}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <LineAttachToVoltageLevelForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    onLineCreationDo={onLineCreationDo}
                    lineToEdit={attachmentLine}
                    onVoltageLevelCreationDo={onVoltageLevelCreationDo}
                    voltageLevelToEdit={newVoltageLevel}
                    onAttachmentPointModificationDo={onAttachmentPointModificationDo}
                    attachmentPoint={attachmentPoint}
                    setAttachmentPoint={setAttachmentPoint}
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
    currentRootNetworkUuid: PropTypes.string,
    editDataFetchStatus: PropTypes.string,
    isUpdate: PropTypes.bool,
};

export default LineAttachToVoltageLevelDialog;
