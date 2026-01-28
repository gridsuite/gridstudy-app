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
    CustomFormProvider,
    EquipmentType,
    fetchDefaultCountry,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { useFormSearchCopy } from '../../../commons/use-form-search-copy';
import { ADDITIONAL_PROPERTIES, COUNTRY, EQUIPMENT_ID, EQUIPMENT_NAME } from 'components/utils/field-constants';
import SubstationCreationForm from './substation-creation-form';
import { sanitizeString } from '../../../dialog-utils';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { createSubstation } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import {
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    getPropertiesFromModification,
    Property,
    toModificationProperties,
} from '../../common/properties/property-utils';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';
import { DeepNullable } from 'components/utils/ts-utils';
import { SubstationInfos } from '../substation-dialog.type';

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string().nullable(),
        [COUNTRY]: yup.string().nullable(),
    })
    .concat(creationPropertiesSchema);

export type SubstationCreationFormData = yup.InferType<typeof formSchema>;

const emptyFormData: SubstationCreationFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [COUNTRY]: null,
    [ADDITIONAL_PROPERTIES]: [],
};

interface SubstationCreationEditData {
    uuid?: UUID;
    equipmentId: string;
    equipmentName?: string;
    country: string | null;
    properties?: Property[] | null;
}

interface SubstationCreationDialogProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    isUpdate: boolean;
    editDataFetchStatus?: string;
    editData?: SubstationCreationEditData;
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
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<SubstationCreationFormData>>(formSchema),
    });

    const { reset, getValues } = formMethods;

    const fromSearchCopyToFormValues = (substation: SubstationInfos) => {
        reset(
            {
                [EQUIPMENT_ID]: substation.id + '(1)',
                [EQUIPMENT_NAME]: substation.name ?? '',
                [COUNTRY]: substation.country,
                ...copyEquipmentPropertiesForCreation(substation),
            },
            { keepDefaultValues: true }
        );
    };

    const searchCopy = useFormSearchCopy(fromSearchCopyToFormValues, EquipmentType.SUBSTATION);

    useEffect(() => {
        if (editData) {
            reset({
                [EQUIPMENT_ID]: editData.equipmentId,
                [EQUIPMENT_NAME]: editData.equipmentName ?? '',
                [COUNTRY]: editData.country,
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
                        [COUNTRY]: country,
                    });
                }
            });
        }
    }, [reset, getValues, isUpdate]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (substation: SubstationCreationFormData) => {
            createSubstation({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                substationId: substation[EQUIPMENT_ID],
                substationName: sanitizeString(substation[EQUIPMENT_NAME]),
                country: substation[COUNTRY] ?? null,
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
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
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
