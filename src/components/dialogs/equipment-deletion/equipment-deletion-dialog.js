/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../../utils/yup-config';
import { TYPE, EQUIPMENT_ID } from '../../utils/field-constants';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { FormProvider, useForm } from 'react-hook-form';
import React, { useCallback, useEffect } from 'react';
import { deleteEquipment } from '../../../utils/rest-api';
import ModificationDialog from '../commons/modificationDialog';
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import DeleteEquipmentForm from './equipment-deletion-form';
import PropTypes from 'prop-types';

const formSchema = yup
    .object()
    .shape({
        [TYPE]: yup.object().nullable().required(),
        [EQUIPMENT_ID]: yup.string().nullable().required(),
    })
    .required();

const emptyFormData = {
    [TYPE]: EQUIPMENT_TYPES.LINE,
    [EQUIPMENT_ID]: null,
};

/**
 * Dialog to delete an equipment from its type and ID.
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const EquipmentDeletionDialog = ({
    studyUuid,
    currentNode,
    editData,
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

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (formData) => {
            const equipmentType = formData[TYPE];
            deleteEquipment(
                studyUuid,
                currentNodeUuid,
                equipmentType.type.endsWith('CONVERTER_STATION')
                    ? EQUIPMENT_TYPES.HVDC_CONVERTER_STATION.type
                    : equipmentType.type,
                formData[EQUIPMENT_ID],
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

    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-equipment-deletion"
                titleId="DeleteEquipment"
                {...dialogProps}
            >
                <DeleteEquipmentForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

EquipmentDeletionDialog.propTypes = {
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    editData: PropTypes.object,
};

export default EquipmentDeletionDialog;
