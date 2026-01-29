/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import {
    CustomFormProvider,
    EquipmentInfosTypes,
    EquipmentType,
    fetchNetworkElementInfos,
    FetchStatus,
    FORM_LOADING_DELAY,
    ModificationDialog,
    sanitizeString,
    snackWithFallback,
    SubstationInfos,
    useOpenShortWaitFetching,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { ADDITIONAL_PROPERTIES, COUNTRY, EQUIPMENT_NAME } from 'components/utils/field-constants';
import SubstationModificationForm from './substation-modification-form';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifySubstation } from '../../../../../services/study/network-modifications';
import {
    getConcatenatedProperties,
    getPropertiesFromModification,
    modificationPropertiesSchema,
    Property,
    toModificationProperties,
} from '../../common/properties/property-utils';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';
import { AttributeModification } from 'services/network-modification-types';
import { useForm } from 'react-hook-form';
import { DeepNullable } from '../../../../utils/ts-utils';

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_NAME]: yup.string().nullable(),
        [COUNTRY]: yup.string().nullable(),
    })
    .concat(modificationPropertiesSchema);

export type SubstationModificationFormData = yup.InferType<typeof formSchema>;

const emptyFormData: SubstationModificationFormData = {
    [EQUIPMENT_NAME]: '',
    [COUNTRY]: null,
    [ADDITIONAL_PROPERTIES]: [],
};

interface SubstationModificationEditData {
    uuid?: UUID;
    equipmentId: string;
    equipmentName?: AttributeModification<string> | null;
    country: AttributeModification<string> | null;
    properties?: Property[] | null;
}

interface SubstationModificationDialogProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    isUpdate: boolean;
    editDataFetchStatus?: string;
    editData?: SubstationModificationEditData;
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
    const [substationToModify, setSubstationToModify] = useState<SubstationInfos>();
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);

    const formMethods = useForm<DeepNullable<SubstationModificationFormData>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<SubstationModificationFormData>>(formSchema),
    });
    const { reset, getValues } = formMethods;

    useEffect(() => {
        if (editData) {
            if (editData?.equipmentId) {
                setSelectedId(editData.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: editData.equipmentName?.value ?? '',
                [COUNTRY]: editData.country?.value ?? null,
                ...getPropertiesFromModification(editData?.properties ?? undefined),
            });
        }
    }, [reset, editData]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onEquipmentIdChange = useCallback(
        (equipmentId: string) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    currentRootNetworkUuid,
                    EquipmentType.SUBSTATION,
                    EquipmentInfosTypes.FORM.type,
                    equipmentId as UUID,
                    true
                )
                    .then((substation: SubstationInfos) => {
                        if (substation) {
                            setSubstationToModify(substation);
                            reset(
                                (formValues) => ({
                                    ...formValues,
                                    [ADDITIONAL_PROPERTIES]: getConcatenatedProperties(substation, getValues),
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
                reset(emptyFormData, { keepDefaultValues: true });
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
                name: sanitizeString(substation[EQUIPMENT_NAME]),
                country: substation[COUNTRY] ?? null,
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
            validationSchema={formSchema}
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
                {selectedId != null && (
                    <SubstationModificationForm substationToModify={substationToModify} equipmentId={selectedId} />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default SubstationModificationDialog;
