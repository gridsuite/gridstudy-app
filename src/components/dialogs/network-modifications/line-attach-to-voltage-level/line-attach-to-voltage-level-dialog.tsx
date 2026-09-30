/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    AttachedLinePaneType,
    CustomFormProvider,
    DeepNullable,
    EquipmentType,
    LineAttachToVoltageLevelCreationDto,
    LineAttachToVoltageLevelCreationForm,
    LineAttachToVoltageLevelCreationFormData,
    lineAttachToVoltageLevelCreationDtoToForm,
    lineAttachToVoltageLevelCreationEmptyFormData,
    lineAttachToVoltageLevelCreationFormSchema,
    lineAttachToVoltageLevelCreationFormToDto,
    lineAttachToVoltageLevelEmptyAttachmentPoint,
    LineAttachToVoltageLevelIllustration,
    LineCreationDto,
    LineCreationDtoWithId,
    snackWithFallback,
    useSnackMessage,
    VoltageLevelCreationDto,
    VoltageLevelCreationPaneType,
    VoltageLevelOption,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    ATTACHMENT_LINE_ID,
    ATTACHMENT_POINT_ID,
    ATTACHMENT_POINT_NAME,
    BUS_OR_BUSBAR_SECTION,
    CONNECTIVITY,
    ID,
    SLIDER_PERCENTAGE,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ModificationDialog } from '../../commons/modificationDialog';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { attachLine } from '../../../../services/study/network-modifications';
import {
    fetchBusesOrBusbarSectionsForVoltageLevel,
    fetchVoltageLevelsListInfos,
} from '../../../../services/study/network';
import { fetchEquipmentsIds } from '../../../../services/study/network-map';
import { getNewVoltageLevelOptions, mergeVoltageLevelOptions } from '../../../utils/utils';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import { FetchStatus } from '../../../../services/utils.type';
import LineCreationDialog from '../line/creation/line-creation-dialog';
import VoltageLevelCreationDialog from '../voltage-level/creation/voltage-level-creation-dialog';

interface LineAttachEditData extends LineAttachToVoltageLevelCreationDto {
    uuid?: UUID;
}

interface LineAttachToVoltageLevelDialogProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    editData?: LineAttachEditData;
    isUpdate: boolean;
    editDataFetchStatus?: FetchStatus;
    onClose: () => void;
}

/**
 * Dialog to attach line to voltage level in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param currentRootNetworkUuid The root network uuid we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param editDataFetchStatus indicates the status of fetching EditData
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const LineAttachToVoltageLevelDialog = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: LineAttachToVoltageLevelDialogProps) => {
    const currentNodeUuid = currentNode?.id;

    const [attachmentLine, setAttachmentLine] = useState<LineCreationDtoWithId | null>(null);
    const [newVoltageLevel, setNewVoltageLevel] = useState<VoltageLevelCreationDto | null>(null);
    const [attachmentPoint, setAttachmentPoint] = useState<VoltageLevelCreationDto>(
        lineAttachToVoltageLevelEmptyAttachmentPoint
    );

    const { snackError } = useSnackMessage();

    const [voltageLevelOptions, setVoltageLevelOptions] = useState<VoltageLevelOption[]>([]);
    const [lineOptions, setLineOptions] = useState<string[]>([]);

    const formMethods = useForm<DeepNullable<LineAttachToVoltageLevelCreationFormData>>({
        defaultValues: lineAttachToVoltageLevelCreationEmptyFormData,
        resolver: yupResolver<DeepNullable<LineAttachToVoltageLevelCreationFormData>>(
            lineAttachToVoltageLevelCreationFormSchema
        ),
    });

    const { reset, setValue, getValues, trigger } = formMethods;

    useEffect(() => {
        if (editData) {
            const formData = lineAttachToVoltageLevelCreationDtoToForm(editData);
            reset(formData);

            setAttachmentLine(editData.attachmentLine ?? null);
            setAttachmentPoint(
                editData.attachmentPointDetailInformation ?? lineAttachToVoltageLevelEmptyAttachmentPoint
            );

            const newVoltageLevelInfos = editData.mayNewVoltageLevelInfos;
            if (newVoltageLevelInfos?.sectionCount && newVoltageLevelInfos?.busbarCount) {
                setNewVoltageLevel(newVoltageLevelInfos);
                const formattedVoltageLevel = {
                    id: newVoltageLevelInfos.equipmentId,
                    name: newVoltageLevelInfos.equipmentName ?? '',
                    exist: false as const,
                    busbarCount: newVoltageLevelInfos.busbarCount,
                    sectionCount: newVoltageLevelInfos.sectionCount,
                    switchKinds: newVoltageLevelInfos.switchKinds ?? [],
                };
                setVoltageLevelOptions((prev) => getNewVoltageLevelOptions(formattedVoltageLevel, undefined, prev));
            }
        }
    }, [editData, reset]);

    const onSubmit = useCallback(
        (lineAttach: LineAttachToVoltageLevelCreationFormData) => {
            const bbsOrBusId = lineAttach[CONNECTIVITY]?.busOrBusbarSection?.id;
            const currentVoltageLevelId = lineAttach[CONNECTIVITY]?.voltageLevel?.id;
            if (
                !lineAttach[SLIDER_PERCENTAGE] ||
                !attachmentPoint ||
                !attachmentLine ||
                !currentVoltageLevelId ||
                !bbsOrBusId
            ) {
                return;
            }
            const dto = lineAttachToVoltageLevelCreationFormToDto(lineAttach, {
                attachmentPoint,
                attachmentLine,
                newVoltageLevel,
            });
            attachLine({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                uuid: editData?.uuid,
                lineToAttachToId: dto.lineToAttachToId,
                percent: dto.percent,
                attachmentPointId: dto.attachmentPointId,
                attachmentPointName: dto.attachmentPointName ?? null,
                attachmentPointDetailInformation: dto.attachmentPointDetailInformation,
                mayNewVoltageLevelInfos: dto.mayNewVoltageLevelInfos ?? undefined,
                existingVoltageLevelId: dto.existingVoltageLevelId,
                bbsOrBusId: dto.bbsOrBusId,
                attachmentLine: dto.attachmentLine,
                newLine1Id: dto.newLine1Id,
                newLine1Name: dto.newLine1Name ?? null,
                newLine2Id: dto.newLine2Id,
                newLine2Name: dto.newLine2Name ?? null,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'LineAttachmentError' });
            });
        },
        [attachmentLine, attachmentPoint, currentNodeUuid, editData, newVoltageLevel, snackError, studyUuid]
    );

    useEffect(() => {
        if (studyUuid && currentNode?.id) {
            fetchVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid).then((existingVl) => {
                setVoltageLevelOptions((prev) => mergeVoltageLevelOptions(existingVl, prev));
            });
        }
    }, [studyUuid, currentNode?.id, currentRootNetworkUuid]);

    useEffect(() => {
        if (studyUuid && currentNode?.id && currentRootNetworkUuid) {
            fetchEquipmentsIds(studyUuid, currentNode.id, currentRootNetworkUuid, undefined, EquipmentType.LINE, true)
                .then((values: string[]) => {
                    setLineOptions(values.sort((a, b) => a.localeCompare(b)));
                })
                .catch((error: unknown) => {
                    snackWithFallback(snackError, error, { headerId: 'equipmentsLoadingError' });
                });
        }
    }, [studyUuid, currentNode?.id, currentRootNetworkUuid, snackError]);

    const fetchBusesOrBusbarSections = useCallback(
        (voltageLevelId: string) =>
            fetchBusesOrBusbarSectionsForVoltageLevel(
                studyUuid,
                currentNode.id,
                currentRootNetworkUuid,
                voltageLevelId
            ),
        [studyUuid, currentNode.id, currentRootNetworkUuid]
    );

    const clear = useCallback(() => {
        reset(lineAttachToVoltageLevelCreationEmptyFormData);
    }, [reset]);

    const onAttachedLineCreated = useCallback(
        ({ lineCreationInfos }: { lineCreationInfos: LineCreationDto }) => {
            return new Promise<string>(() => {
                // clean unused (required) fields by a simple copy with casting
                const {
                    type,
                    equipmentId,
                    equipmentName,
                    r,
                    x,
                    g1,
                    b1,
                    g2,
                    b2,
                    operationalLimitsGroups,
                    selectedOperationalLimitsGroupId1,
                    selectedOperationalLimitsGroupId2,
                    properties,
                } = lineCreationInfos;

                const preparedLine: LineCreationDto = {
                    type,
                    equipmentId,
                    equipmentName,
                    r,
                    x,
                    g1,
                    b1,
                    g2,
                    b2,
                    operationalLimitsGroups,
                    selectedOperationalLimitsGroupId1,
                    selectedOperationalLimitsGroupId2,
                    properties,
                } as LineCreationDto;

                setAttachmentLine(preparedLine);
                setValue(`${ATTACHMENT_LINE_ID}`, preparedLine.equipmentId, {
                    shouldValidate: true,
                    shouldDirty: true,
                });
                // Force the form dirty when attachment line props change but ID does not.
                // The value itself is never read — any non-empty string would work; we use the
                // stringified line for parity with onAttachmentPointModified and for debug visibility.
                setValue('_dirtyTrigger', JSON.stringify(preparedLine), {
                    shouldDirty: true,
                });
            });
        },
        [setValue]
    );

    const onNewVoltageLevelCreated = useCallback(
        (preparedVoltageLevel: VoltageLevelCreationDto) => {
            return new Promise<string>(() => {
                // we keep the old voltage level id, so it can be removed for from voltage level options
                const oldVoltageLevelId = newVoltageLevel?.equipmentId;

                const formattedVoltageLevel = {
                    id: preparedVoltageLevel.equipmentId,
                    name: preparedVoltageLevel.equipmentName ?? '',
                    exist: false as const,
                    busbarCount: preparedVoltageLevel.busbarCount,
                    sectionCount: preparedVoltageLevel.sectionCount,
                    switchKinds: preparedVoltageLevel.switchKinds ?? [],
                };

                // we add the new voltage level, (or replace it if it exists). And we remove the old id if it is different (in case we modify the id)
                const newVoltageLevelOptions = getNewVoltageLevelOptions(
                    formattedVoltageLevel,
                    oldVoltageLevelId,
                    voltageLevelOptions
                );

                setVoltageLevelOptions(newVoltageLevelOptions);

                setNewVoltageLevel(preparedVoltageLevel);
                // The connectivity sub-fields cannot be addressed individually: commons-ui builds their schema with
                // FieldConstants enum keys, which react-hook-form's path types resolve to never. Set the whole
                // connectivity instead, then validate the voltage level alone so that emptying the busbar section
                // does not immediately raise its own "required" error.
                setValue(
                    CONNECTIVITY,
                    {
                        ...getValues(CONNECTIVITY),
                        [VOLTAGE_LEVEL]: { [ID]: preparedVoltageLevel.equipmentId },
                        [BUS_OR_BUSBAR_SECTION]: null,
                    },
                    {
                        shouldDirty: true,
                    }
                );
                trigger(`${CONNECTIVITY}.${VOLTAGE_LEVEL}`);
            });
        },
        [newVoltageLevel?.equipmentId, voltageLevelOptions, setValue, getValues, trigger]
    );

    const onAttachmentPointModified = useCallback(
        (attachmentPointData: VoltageLevelCreationDto) => {
            return new Promise<string>(() => {
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
                setValue('_dirtyTrigger', JSON.stringify(attachmentPointData), {
                    shouldDirty: true,
                });
            });
        },
        [setValue]
    );

    const onAttachmentPointIdChanged = useCallback(
        (value: string) => {
            setAttachmentPoint((prevAttachmentPoint) => ({ ...prevAttachmentPoint, equipmentId: value }));
        },
        [setAttachmentPoint]
    );

    const onAttachmentPointNameChanged = useCallback(
        (value: string) => {
            setAttachmentPoint((prevAttachmentPoint) => ({ ...prevAttachmentPoint, equipmentName: value }));
        },
        [setAttachmentPoint]
    );

    const AttachmentPointPane: VoltageLevelCreationPaneType = useMemo(
        () =>
            function AttachmentPointPane({
                open,
                onClose,
                onCreateVoltageLevel,
                editData: vlEditData,
                isUpdate: vlIsUpdate,
            }) {
                return (
                    <VoltageLevelCreationDialog
                        open={open}
                        onClose={onClose}
                        currentNode={currentNode}
                        studyUuid={studyUuid}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        onCreateVoltageLevel={onCreateVoltageLevel}
                        editData={vlEditData}
                        isAttachmentPointModification
                        titleId="SpecifyAttachmentPoint"
                        isUpdate={vlIsUpdate}
                        editDataFetchStatus={editDataFetchStatus}
                    />
                );
            },
        [currentNode, studyUuid, currentRootNetworkUuid, editDataFetchStatus]
    );

    const NewVoltageLevelPane: VoltageLevelCreationPaneType = useMemo(
        () =>
            function NewVoltageLevelPane({
                open,
                onClose,
                onCreateVoltageLevel,
                editData: vlEditData,
                isUpdate: vlIsUpdate,
            }) {
                return (
                    <VoltageLevelCreationDialog
                        open={open}
                        onClose={onClose}
                        currentNode={currentNode}
                        studyUuid={studyUuid}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        onCreateVoltageLevel={onCreateVoltageLevel}
                        editData={vlEditData}
                        isUpdate={vlIsUpdate}
                        editDataFetchStatus={editDataFetchStatus}
                    />
                );
            },
        [currentNode, studyUuid, currentRootNetworkUuid, editDataFetchStatus]
    );

    const AttachedLinePane: AttachedLinePaneType = useMemo(
        () =>
            function AttachedLinePane({ onClose, onCreateLine, editData: lineEditData, isUpdate: lineIsUpdate }) {
                return (
                    <LineCreationDialog
                        onClose={onClose}
                        currentNode={currentNode}
                        studyUuid={studyUuid}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        displayConnectivity={false}
                        onCreateLine={onCreateLine}
                        editData={lineEditData ?? undefined}
                        isUpdate={lineIsUpdate}
                        editDataFetchStatus={editDataFetchStatus}
                    />
                );
            },
        [currentNode, studyUuid, currentRootNetworkUuid, editDataFetchStatus]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    return (
        <CustomFormProvider validationSchema={lineAttachToVoltageLevelCreationFormSchema} {...formMethods}>
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
                <LineAttachToVoltageLevelCreationForm
                    lineOptions={lineOptions}
                    voltageLevelOptions={voltageLevelOptions}
                    fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                    isUpdate={isUpdate}
                    newVoltageLevel={newVoltageLevel}
                    onNewVoltageLevelCreated={onNewVoltageLevelCreated}
                    NewVoltageLevelPane={NewVoltageLevelPane}
                    attachmentPoint={attachmentPoint}
                    onAttachmentPointModified={onAttachmentPointModified}
                    onAttachmentPointIdChanged={onAttachmentPointIdChanged}
                    onAttachmentPointNameChanged={onAttachmentPointNameChanged}
                    AttachmentPointPane={AttachmentPointPane}
                    attachmentLine={attachmentLine}
                    onAttachedLineCreated={onAttachedLineCreated}
                    AttachedLinePane={AttachedLinePane}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default LineAttachToVoltageLevelDialog;
