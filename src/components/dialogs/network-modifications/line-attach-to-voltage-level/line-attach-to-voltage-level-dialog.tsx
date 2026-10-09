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
    FieldConstants,
    LineAttachToVoltageLevelCreationDto,
    LineAttachToVoltageLevelCreationForm,
    LineAttachToVoltageLevelCreationFormData,
    lineAttachToVoltageLevelCreationDtoToForm,
    lineAttachToVoltageLevelCreationEmptyFormData,
    lineAttachToVoltageLevelCreationFormSchema,
    lineAttachToVoltageLevelCreationFormToDto,
    LineAttachToVoltageLevelIllustration,
    snackWithFallback,
    useSnackMessage,
    VoltageLevelCreationDto,
    VoltageLevelCreationPaneType,
    VoltageLevelOption,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { CONNECTIVITY, SLIDER_PERCENTAGE } from 'components/utils/field-constants';
import { ComponentProps, useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ModificationDialog } from '../../commons/modificationDialog';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { attachLine } from '../../../../services/study/network-modifications';
import {
    fetchBusesOrBusbarSectionsForVoltageLevel,
    fetchVoltageLevelsListInfos,
} from '../../../../services/study/network';
import { getNewVoltageLevelOptions, mergeVoltageLevelOptions } from '../../../utils/utils';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import { FetchStatus } from '../../../../services/utils.type';
import LineCreationDialog from '../line/creation/line-creation-dialog';
import VoltageLevelCreationDialog from '../voltage-level/creation/voltage-level-creation-dialog';
import { useLineOptions } from '../../commons/use-line-options';

interface LineAttachToVoltageLevelDialogProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    editData?: LineAttachToVoltageLevelCreationDto;
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

    const [newVoltageLevel, setNewVoltageLevel] = useState<VoltageLevelCreationDto | null>(null);

    const { snackError } = useSnackMessage();

    const [voltageLevelOptions, setVoltageLevelOptions] = useState<VoltageLevelOption[]>([]);
    const lineOptions = useLineOptions(studyUuid, currentNode?.id, currentRootNetworkUuid);

    const formMethods = useForm<DeepNullable<LineAttachToVoltageLevelCreationFormData>>({
        defaultValues: lineAttachToVoltageLevelCreationEmptyFormData,
        resolver: yupResolver<DeepNullable<LineAttachToVoltageLevelCreationFormData>>(
            lineAttachToVoltageLevelCreationFormSchema
        ),
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            const formData = lineAttachToVoltageLevelCreationDtoToForm(editData);
            reset(formData);

            const newVoltageLevelInfos = editData.mayNewVoltageLevelInfos;
            if (newVoltageLevelInfos?.sectionCount && newVoltageLevelInfos?.busbarCount) {
                setNewVoltageLevel(newVoltageLevelInfos);
                const formattedVoltageLevel = {
                    id: newVoltageLevelInfos.equipmentId,
                    name: newVoltageLevelInfos.equipmentName ?? '',
                    exist: false,
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
                !lineAttach[FieldConstants.ATTACHMENT_POINT_DETAIL] ||
                !lineAttach[FieldConstants.ATTACHMENT_LINE] ||
                !currentVoltageLevelId ||
                !bbsOrBusId
            ) {
                return;
            }
            const dto = lineAttachToVoltageLevelCreationFormToDto(lineAttach);
            attachLine(studyUuid, currentNodeUuid, editData?.uuid, dto).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'LineAttachmentError' });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    useEffect(() => {
        if (studyUuid && currentNode?.id) {
            fetchVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid).then((existingVl) => {
                setVoltageLevelOptions((prev) => mergeVoltageLevelOptions(existingVl, prev));
            });
        }
    }, [studyUuid, currentNode?.id, currentRootNetworkUuid]);

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

    const onNewVoltageLevelCreated = useCallback(
        (preparedVoltageLevel: VoltageLevelCreationDto) => {
            return new Promise<string>(() => {
                // we keep the old voltage level id, so it can be removed for from voltage level options
                const oldVoltageLevelId = newVoltageLevel?.equipmentId;

                const formattedVoltageLevel = {
                    id: preparedVoltageLevel.equipmentId,
                    name: preparedVoltageLevel.equipmentName ?? '',
                    exist: false,
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
                // LineAttachToVoltageLevelCreationForm updates the connectivity field itself.
            });
        },
        [newVoltageLevel?.equipmentId, voltageLevelOptions]
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
            }: ComponentProps<VoltageLevelCreationPaneType>) {
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
            function AttachedLinePane({
                onClose,
                onCreateLine,
                editData: lineEditData,
                isUpdate: lineIsUpdate,
            }: ComponentProps<AttachedLinePaneType>) {
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
                    onNewVoltageLevelCreated={onNewVoltageLevelCreated}
                    NewVoltageLevelPane={NewVoltageLevelPane}
                    AttachmentPointPane={AttachmentPointPane}
                    AttachedLinePane={AttachedLinePane}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default LineAttachToVoltageLevelDialog;
