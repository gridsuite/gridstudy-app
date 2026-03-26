/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import {
    ByFilterDeletionDto,
    ByFilterDeletionForm,
    ByFilterDeletionFormData,
    byFilterDeletionDtoToForm,
    byFilterDeletionFormToDto,
    byFilterDeletionFormSchema,
    FieldConstants,
    CustomFormProvider,
    snackWithFallback,
    useSnackMessage,
    DeepNullable,
} from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { FunctionComponent, useCallback, useEffect } from 'react';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { deleteEquipmentByFilter } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import { NetworkModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { UUID } from 'node:crypto';

const emptyFormData: DeepNullable<ByFilterDeletionFormData> = {
    [FieldConstants.TYPE]: null,
    [FieldConstants.FILTERS]: [],
};

type ByFilterDeletionDialogProps = NetworkModificationDialogProps & {
    editData?: ByFilterDeletionDto & { uuid: UUID };
};

/**
 * Dialog to delete a list of equipment by filter.
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const ByFilterDeletionDialog: FunctionComponent<ByFilterDeletionDialogProps> = ({
    studyUuid,
    currentNode,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;

    const { snackError } = useSnackMessage();

    const formMethods = useForm<DeepNullable<ByFilterDeletionFormData>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<ByFilterDeletionFormData>>(byFilterDeletionFormSchema),
    });

    const { reset } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (data: ByFilterDeletionDto) => {
            reset(byFilterDeletionDtoToForm(data));
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (formData: ByFilterDeletionFormData) => {
            const dto = byFilterDeletionFormToDto(formData);
            deleteEquipmentByFilter(studyUuid, currentNodeUuid, editData?.uuid, dto).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'UnableToDeleteEquipment' });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider validationSchema={byFilterDeletionFormSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth={'md'}
                onClear={clear}
                onSave={onSubmit}
                titleId="DeleteEquipmentByFilter"
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <ByFilterDeletionForm />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default ByFilterDeletionDialog;
