/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { FILTERS, ID, NAME, TYPE } from '../../../../utils/field-constants';
import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { FunctionComponent, useCallback, useEffect } from 'react';
import ModificationDialog from '../../../commons/modificationDialog';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { deleteEquipmentByFilter } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import ByFilterDeletionForm from './by-filter-deletion-form';
import {
    ByFilterDeletionDialogProps,
    ByFilterDeletionEditData,
    ByFilterDeletionFormData,
} from './by-filter-deletion.type';

const formSchema = yup
    .object()
    .shape({
        [TYPE]: yup.mixed<keyof typeof EQUIPMENT_TYPES>().required(),
        [FILTERS]: yup
            .array()
            .of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                })
            )
            .required()
            .min(1, 'FieldIsRequired'),
    })
    .required();

const emptyFormData = {
    [TYPE]: null,
    [FILTERS]: [],
};

/**
 * Dialog to delete a list of equipment by filter.
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param onClose on modification dialog close
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const ByFilterDeletionDialog: FunctionComponent<ByFilterDeletionDialogProps> = ({
    studyUuid,
    currentNode,
    editData,
    isUpdate,
    editDataFetchStatus,
    onClose,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;

    const { snackError } = useSnackMessage();

    const formMethods = useForm<ByFilterDeletionFormData>({
        defaultValues: emptyFormData,
        resolver: yupResolver<ByFilterDeletionFormData>(formSchema),
    });

    const { reset } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (editData: ByFilterDeletionEditData) => {
            reset({
                [TYPE]: EQUIPMENT_TYPES[editData.equipmentType] as keyof typeof EQUIPMENT_TYPES,
                [FILTERS]: editData.filters,
            });
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
            deleteEquipmentByFilter(
                studyUuid,
                currentNodeUuid,
                formData[TYPE],
                formData[FILTERS],
                editData?.uuid
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'UnableToDeleteEquipment',
                });
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
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onClose={onClose}
                onSave={onSubmit}
                aria-labelledby="dialog-by-filter-equipment-deletion"
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
