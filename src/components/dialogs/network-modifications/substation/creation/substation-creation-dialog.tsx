/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useForm } from 'react-hook-form';
import { ModificationDialog } from '../../../commons/modificationDialog';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { useCallback, useEffect } from 'react';
import {
    copyEquipmentPropertiesForCreation,
    CustomFormProvider,
    EquipmentType,
    fetchDefaultCountry,
    FieldConstants,
    getPropertiesFromModification,
    snackWithFallback,
    SubstationCreationDto,
    substationCreationEmptyFormData,
    SubstationCreationForm,
    SubstationCreationFormData,
    substationCreationFormSchema,
    toModificationProperties,
    useSnackMessage,
    DeepNullable,
    sanitizeString,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFormSearchCopy } from '../../../commons/use-form-search-copy';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { createSubstation } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';
import { SubstationInfos } from '../substation-dialog.type';

interface SubstationCreationDialogProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    isUpdate: boolean;
    editDataFetchStatus?: string;
    editData?: SubstationCreationDto & { uuid: UUID };
}

/**
 * Dialog to create a substation in the network
 * @param editData the data to edit
 * @param currentNode The node we are currently working on
 * @param studyUuid the study we are currently working on
 * @param currentRootNetworkUuid The root network we are currently working on
 * @param isUpdate check if edition form
 * @param editDataFetchStatus indicates the status of fetching EditData
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const SubstationCreationDialog = ({
    editData,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: SubstationCreationDialogProps) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm<DeepNullable<SubstationCreationFormData>>({
        defaultValues: substationCreationEmptyFormData,
        resolver: yupResolver<DeepNullable<SubstationCreationFormData>>(substationCreationFormSchema),
    });

    const { reset, getValues } = formMethods;

    const fromSearchCopyToFormValues = (substation: SubstationInfos) => {
        reset(
            {
                [FieldConstants.EQUIPMENT_ID]: substation.id + '(1)',
                [FieldConstants.EQUIPMENT_NAME]: substation.name ?? '',
                [FieldConstants.COUNTRY]: substation.country,
                ...copyEquipmentPropertiesForCreation(substation),
            },
            { keepDefaultValues: true }
        );
    };

    const searchCopy = useFormSearchCopy(fromSearchCopyToFormValues, EquipmentType.SUBSTATION);

    useEffect(() => {
        if (editData) {
            reset({
                [FieldConstants.EQUIPMENT_ID]: editData.equipmentId,
                [FieldConstants.EQUIPMENT_NAME]: editData.equipmentName ?? '',
                [FieldConstants.COUNTRY]: editData.country,
                ...getPropertiesFromModification(editData.properties),
            });
        }
    }, [reset, editData]);

    // We set the default country only in creation mode
    useEffect(() => {
        if (!isUpdate) {
            fetchDefaultCountry().then((country) => {
                if (country) {
                    reset({
                        ...getValues(),
                        [FieldConstants.COUNTRY]: country,
                    });
                }
            });
        }
    }, [reset, getValues, isUpdate]);

    const clear = useCallback(() => {
        reset();
    }, [reset]);

    const onSubmit = useCallback(
        (substation: SubstationCreationFormData) => {
            createSubstation({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                substationId: substation[FieldConstants.EQUIPMENT_ID],
                substationName: sanitizeString(substation[FieldConstants.EQUIPMENT_NAME]),
                country: substation[FieldConstants.COUNTRY] ?? null,
                isUpdate: !!editData,
                modificationUuid: editData ? editData.uuid : undefined,
                properties: toModificationProperties(substation),
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'SubstationCreationError' });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider validationSchema={substationCreationFormSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'md'}
                titleId="CreateSubstation"
                searchCopy={searchCopy}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <SubstationCreationForm />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EquipmentType.SUBSTATION}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default SubstationCreationDialog;
