/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import {
    TYPE,
    DELETION_SPECIFIC_DATA,
    FILTERS,
    ID,
    NAME,
    SPECIFIC_METADATA,
} from '../../../utils/field-constants';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { FormProvider, useForm } from 'react-hook-form';
import React, { useCallback, useEffect } from 'react';
import ModificationDialog from '../../commons/modificationDialog';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import PropTypes from 'prop-types';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { byFilterDeleteEquipment } from '../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../services/utils';
import ByFilterDeletionForm from './by-filter-deletion-form';

const formSchema = yup
    .object()
    .shape({
        [TYPE]: yup.string().required(),
        [FILTERS]: yup
            .array()
            .of(
                yup.object().shape({
                    [ID]: yup.string().required(),
                    [NAME]: yup.string().required(),
                    [SPECIFIC_METADATA]: yup.object().shape({
                        [TYPE]: yup.string(),
                    }),
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
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const ByFilterDeletionDialog = ({
    studyUuid,
    currentNode,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;

    const { snackError } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (editData) => {
            reset({
                [TYPE]: EQUIPMENT_TYPES[editData.equipmentType],
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
        (formData) => {
            byFilterDeleteEquipment(
                studyUuid,
                currentNodeUuid,
                formData[TYPE],
                formData[FILTERS],
                editData?.uuid,
                formData[DELETION_SPECIFIC_DATA]
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
            !isUpdate ||
            editDataFetchStatus === FetchStatus.SUCCEED ||
            editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-by-filter-equipment-deletion"
                titleId="DeleteEquipmentByFilter"
                open={open}
                isDataFetching={
                    isUpdate && editDataFetchStatus === FetchStatus.RUNNING
                }
                {...dialogProps}
            >
                <ByFilterDeletionForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    editData={editData}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

ByFilterDeletionDialog.propTypes = {
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    editData: PropTypes.object,
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};

export default ByFilterDeletionDialog;
