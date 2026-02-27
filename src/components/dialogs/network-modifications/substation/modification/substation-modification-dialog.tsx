/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ModificationDialog } from '../../../commons/modificationDialog';
import { useCallback, useEffect, useState } from 'react';
import {
    CustomFormProvider,
    EquipmentType,
    getConcatenatedProperties,
    snackWithFallback,
    toModificationProperties,
    useSnackMessage,
    DeepNullable,
    sanitizeString,
    FieldConstants,
    SubstationModificationForm,
    SubstationModificationFormData,
    substationModificationEmptyFormData,
    substationModificationFormSchema,
    SubstationModificationInfos,
    SubstationModificationDto,
    substationModificationDtoToForm,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifySubstation } from '../../../../../services/study/network-modifications';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import { FetchStatus } from '../../../../../services/utils';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';
import { useForm } from 'react-hook-form';

interface SubstationModificationDialogProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    isUpdate: boolean;
    editDataFetchStatus?: string;
    editData?: SubstationModificationDto;
    defaultIdValue?: string;
}

/**
 * Dialog to modify a substation in the network
 * @param editData the data to edit
 * @param defaultIdValue the default substation id
 * @param currentNode The node we are currently working on
 * @param currentRootNetworkUuid The root network we are currently working on
 * @param studyUuid the study we are currently working on
 * @param isUpdate check if edition form
 * @param editDataFetchStatus indicates the status of fetching EditData
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const SubstationModificationDialog = ({
    editData, // contains data when we try to edit an existing hypothesis from the current node's list
    defaultIdValue, // Used to pre-select an equipmentId when calling this dialog from the network map
    currentNode,
    currentRootNetworkUuid,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: SubstationModificationDialogProps) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState(defaultIdValue ?? null);
    const [substationToModify, setSubstationToModify] = useState<SubstationModificationInfos>();
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);

    const formMethods = useForm<DeepNullable<SubstationModificationFormData>>({
        defaultValues: substationModificationEmptyFormData,
        resolver: yupResolver<DeepNullable<SubstationModificationFormData>>(substationModificationFormSchema),
    });
    const { reset, getValues } = formMethods;

    useEffect(() => {
        if (editData) {
            if (editData?.equipmentId) {
                setSelectedId(editData.equipmentId);
            }
            reset(substationModificationDtoToForm(editData));
        }
    }, [reset, editData]);

    const clear = useCallback(() => {
        reset(substationModificationEmptyFormData);
    }, [reset]);

    const onEquipmentIdChange = useCallback(
        (equipmentId: string) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    currentRootNetworkUuid,
                    EQUIPMENT_TYPES.SUBSTATION,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((substation: SubstationModificationInfos) => {
                        if (substation) {
                            setSubstationToModify(substation);
                            reset(
                                (formValues) => ({
                                    ...formValues,
                                    [FieldConstants.EQUIPMENT_ID]: equipmentId,
                                    [FieldConstants.ADDITIONAL_PROPERTIES]: getConcatenatedProperties(
                                        substation,
                                        getValues
                                    ),
                                }),
                                { keepDirty: true }
                            );
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            setSubstationToModify(undefined);
                        }
                    });
            } else {
                setSubstationToModify(undefined);
                reset(substationModificationEmptyFormData, { keepDefaultValues: true });
            }
        },
        [studyUuid, currentRootNetworkUuid, currentNodeUuid, reset, getValues, editData]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (substation: SubstationModificationFormData) => {
            modifySubstation({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                id: selectedId,
                name: sanitizeString(substation[FieldConstants.EQUIPMENT_NAME]),
                country: substation[FieldConstants.COUNTRY] ?? null,
                properties: toModificationProperties(substation),
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'SubstationModificationError' });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid, selectedId]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider
            validationSchema={substationModificationFormSchema}
            {...formMethods}
            removeOptional={true}
            isNodeBuilt={isNodeBuilt(currentNode)}
            isUpdate={isUpdate}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'md'}
                titleId="ModifySubstation"
                open={open}
                keepMounted={true}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EquipmentType.SUBSTATION}
                        fillerHeight={5}
                    />
                )}
                {selectedId != null && <SubstationModificationForm substationToModify={substationToModify} />}
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default SubstationModificationDialog;
