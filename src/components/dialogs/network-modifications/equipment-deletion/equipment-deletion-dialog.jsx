/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { DELETION_SPECIFIC_DATA, EQUIPMENT_ID, TYPE } from '../../../utils/field-constants';
import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect } from 'react';
import ModificationDialog from '../../commons/modificationDialog';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import DeleteEquipmentForm from './equipment-deletion-form';
import PropTypes from 'prop-types';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { deleteEquipment } from '../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../services/utils';

const formSchema = yup
    .object()
    .shape({
        [TYPE]: yup.string().nullable().required(),
        [EQUIPMENT_ID]: yup.string().nullable().required(),
    })
    .required();

const emptyFormData = {
    [TYPE]: null,
    [EQUIPMENT_ID]: null,
    [DELETION_SPECIFIC_DATA]: null,
};

/**
 * Dialog to delete an equipment from its type and ID.
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param defaultIdValue the default equipment id
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const EquipmentDeletionDialog = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    editData,
    isUpdate,
    defaultIdValue, // Used to pre-select an equipmentId when calling this dialog from the SLD/map
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
                [EQUIPMENT_ID]: editData.equipmentId,
            });
        },
        [reset]
    );

    const fromMenuDataValues = useCallback(
        (menuSelectId) => {
            reset({
                [TYPE]: EQUIPMENT_TYPES.HVDC_LINE,
                [EQUIPMENT_ID]: menuSelectId,
                [DELETION_SPECIFIC_DATA]: null,
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        } else if (defaultIdValue) {
            fromMenuDataValues(defaultIdValue);
        }
    }, [fromEditDataToFormValues, editData, fromMenuDataValues, defaultIdValue]);

    const onSubmit = useCallback(
        (formData) => {
            deleteEquipment(
                studyUuid,
                currentNodeUuid,
                formData[TYPE],
                formData[EQUIPMENT_ID],
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
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-equipment-deletion"
                titleId="DeleteEquipment"
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <DeleteEquipmentForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    editData={editData}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

EquipmentDeletionDialog.propTypes = {
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    currentRootNetworkUuid: PropTypes.string,
    editData: PropTypes.object,
    isUpdate: PropTypes.bool,
    defaultIdValue: PropTypes.string,
    editDataFetchStatus: PropTypes.string,
};

export default EquipmentDeletionDialog;
