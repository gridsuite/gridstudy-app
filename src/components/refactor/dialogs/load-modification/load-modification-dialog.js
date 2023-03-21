/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    ACTIVE_POWER,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    LOAD_TYPE,
    REACTIVE_POWER,
} from 'components/refactor/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { fetchEquipmentInfos, modifyLoad } from '../../../../utils/rest-api';
import { sanitizeString } from '../../../dialogs/dialogUtils';
import yup from '../../utils/yup-config';
import { useOpenOnMount } from '../commons/handle-modification-form';
import ModificationDialog from '../commons/modificationDialog';
import LoadModificationForm from './load-modification-form';

/**
 * Dialog to create a load in the network
 * @param studyUuid the study we are currently working on
 * @param defaultIdValue the default load id
 * @param currentNode The node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */

const schema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().nullable().required(),
        [EQUIPMENT_NAME]: yup.string(),
        [LOAD_TYPE]: yup.string().nullable(),
        [ACTIVE_POWER]: yup.number().nullable(),
        [REACTIVE_POWER]: yup.number().nullable(),
    })
    .required();

const LoadModificationDialog = ({
    editData,
    defaultIdValue,
    currentNode,
    studyUuid,
    ...dialogProps
}) => {
    const [loadInfos, setLoadInfos] = useState(null);
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const open = useOpenOnMount(editData, loadInfos, 200);

    const emptyFormData = useMemo(
        () => ({
            [EQUIPMENT_ID]: defaultIdValue ?? null,
            [EQUIPMENT_NAME]: '',
            [LOAD_TYPE]: null,
            [ACTIVE_POWER]: null,
            [REACTIVE_POWER]: null,
        }),
        [defaultIdValue]
    );

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset, control } = methods;
    const loadId = useWatch({
        name: EQUIPMENT_ID,
        control: control,
    });

    const fromEditDataToFormValues = useCallback(
        (load) => {
            reset({
                [EQUIPMENT_ID]: load.equipmentId,
                [EQUIPMENT_NAME]: load.equipmentName?.value ?? '',
                [LOAD_TYPE]: load.loadType?.value ?? null,
                [ACTIVE_POWER]: load.activePower?.value ?? null,
                [REACTIVE_POWER]: load.reactivePower?.value ?? null,
            });
        },
        [reset]
    );
    useEffect(() => {
        if (loadId) {
            fetchEquipmentInfos(
                studyUuid,
                currentNodeUuid,
                'loads',
                loadId,
                true
            ).then((value) => {
                if (value) {
                    setLoadInfos(value);
                }
            });
        } else {
            setLoadInfos(null);
        }
    }, [studyUuid, currentNodeUuid, loadId]);

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (load) => {
            modifyLoad(
                studyUuid,
                currentNodeUuid,
                load?.equipmentId,
                sanitizeString(load?.equipmentName),
                load?.loadType,
                load?.activePower,
                load?.reactivePower,
                undefined,
                undefined,
                editData ? true : false,
                editData ? editData.uuid : undefined
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'LoadModificationError',
                });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset, emptyFormData]);

    return (
        <>
            {open && (
                <FormProvider validationSchema={schema} {...methods}>
                    <ModificationDialog
                        fullWidth
                        onClear={clear}
                        onSave={onSubmit}
                        aria-labelledby="dialog-modify-load"
                        maxWidth={'md'}
                        titleId="ModifyLoad"
                        {...dialogProps}
                    >
                        <LoadModificationForm
                            currentNode={currentNode}
                            studyUuid={studyUuid}
                            loadInfos={loadInfos}
                        />
                    </ModificationDialog>
                </FormProvider>
            )}
        </>
    );
};

LoadModificationDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
};

export default LoadModificationDialog;
