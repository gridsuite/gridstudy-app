/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    DeepNullable,
    EquipmentType,
    LineSplitWithVoltageLevelCreationForm,
    LineSplitWithVoltageLevelCreationFormData,
    lineSplitWithVoltageLevelCreationDtoToForm,
    LineSplitWithVoltageLevelCreationDto,
    lineSplitWithVoltageLevelCreationEmptyFormData,
    lineSplitWithVoltageLevelCreationFormSchema,
    lineSplitWithVoltageLevelCreationFormToDto,
    LineSplitWithVoltageLevelIllustration,
    NewVoltageLevelPaneType,
    snackWithFallback,
    useSnackMessage,
    VoltageLevelCreationDto,
    VoltageLevelOption,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    CONNECTIVITY,
    ID,
    LINE1_ID,
    LINE2_ID,
    LINE_TO_ATTACH_OR_SPLIT_ID,
    SLIDER_PERCENTAGE,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ModificationDialog } from '../../commons/modificationDialog';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { divideLine } from '../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../services/utils.type';
import {
    fetchBusesOrBusbarSectionsForVoltageLevel,
    fetchVoltageLevelsListInfos,
} from '../../../../services/study/network';
import { fetchEquipmentsIds } from '../../../../services/study/network-map';
import { getNewVoltageLevelOptions, mergeVoltageLevelOptions } from '../../../utils/utils';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import VoltageLevelCreationDialog from '../voltage-level/creation/voltage-level-creation-dialog';

interface LineSplitEditData extends LineSplitWithVoltageLevelCreationDto {
    uuid?: UUID;
}

interface LineSplitWithVoltageLevelDialogProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    editData?: LineSplitEditData;
    isUpdate: boolean;
    editDataFetchStatus?: FetchStatus;
    onClose: () => void;
}

/**
 * Dialog to create line split with voltage level in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param currentRootNetworkUuid The root network uuid we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const LineSplitWithVoltageLevelDialog = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: LineSplitWithVoltageLevelDialogProps) => {
    const [voltageLevelOptions, setVoltageLevelOptions] = useState<VoltageLevelOption[]>([]);
    const [lineOptions, setLineOptions] = useState<string[]>([]);

    const currentNodeUuid = currentNode?.id;

    const [newVoltageLevel, setNewVoltageLevel] = useState<VoltageLevelCreationDto | null>(null);

    const { snackError } = useSnackMessage();

    const formMethods = useForm<DeepNullable<LineSplitWithVoltageLevelCreationFormData>>({
        defaultValues: lineSplitWithVoltageLevelCreationEmptyFormData,
        resolver: yupResolver<DeepNullable<LineSplitWithVoltageLevelCreationFormData>>(
            lineSplitWithVoltageLevelCreationFormSchema
        ),
    });

    const { reset, setValue } = formMethods;

    useEffect(() => {
        if (editData) {
            const formData = lineSplitWithVoltageLevelCreationDtoToForm(editData);
            reset(formData);

            const editNewVoltageLevel = editData.mayNewVoltageLevelInfos;
            if (editNewVoltageLevel) {
                setNewVoltageLevel(editNewVoltageLevel);
                const formattedVoltageLevel = {
                    id: editNewVoltageLevel.equipmentId,
                    name: editNewVoltageLevel.equipmentName ?? '',
                    exist: false as const,
                    busbarCount: editNewVoltageLevel.busbarCount,
                    sectionCount: editNewVoltageLevel.sectionCount,
                    switchKinds: editNewVoltageLevel.switchKinds ?? [],
                };
                setVoltageLevelOptions((prev) => getNewVoltageLevelOptions(formattedVoltageLevel, undefined, prev));
            }
        }
    }, [editData, reset]);

    const onSubmit = useCallback(
        (lineSplit: LineSplitWithVoltageLevelCreationFormData) => {
            if (
                !lineSplit?.[CONNECTIVITY] ||
                !lineSplit[LINE_TO_ATTACH_OR_SPLIT_ID] ||
                !lineSplit[SLIDER_PERCENTAGE] ||
                !lineSplit[LINE1_ID] ||
                !lineSplit[LINE2_ID]
            ) {
                return;
            }
            const dto = lineSplitWithVoltageLevelCreationFormToDto(lineSplit, newVoltageLevel);
            divideLine({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                lineToSplitId: dto.lineToSplitId,
                percent: dto.percent,
                mayNewVoltageLevelInfos: dto.mayNewVoltageLevelInfos,
                existingVoltageLevelId: dto.existingVoltageLevelId,
                bbsOrBusId: dto.bbsOrBusId,
                newLine1Id: dto.newLine1Id,
                newLine1Name: dto.newLine1Name ?? null,
                newLine2Id: dto.newLine2Id,
                newLine2Name: dto.newLine2Name ?? null,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'LineDivisionError' });
            });
        },
        [currentNodeUuid, editData, newVoltageLevel, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(lineSplitWithVoltageLevelCreationEmptyFormData);
    }, [reset]);

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

    const onVoltageLevelCreationDo = useCallback(
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

                // we add the new voltage level (or replace it if it exists). And we remove the old id if it is different (in case we modify the id)
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

    const NewVoltageLevelPane: NewVoltageLevelPaneType = useMemo(
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

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    return (
        <CustomFormProvider validationSchema={lineSplitWithVoltageLevelCreationFormSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                titleId="LineSplitWithVoltageLevel"
                subtitle={<LineSplitWithVoltageLevelIllustration />}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <LineSplitWithVoltageLevelCreationForm
                    lineOptions={lineOptions}
                    voltageLevelOptions={voltageLevelOptions}
                    fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                    newVoltageLevel={newVoltageLevel}
                    onNewVoltageLevelCreated={onVoltageLevelCreationDo}
                    isUpdate={isUpdate}
                    NewVoltageLevelPane={NewVoltageLevelPane}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default LineSplitWithVoltageLevelDialog;
