/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import {
    ACTIVE_POWER,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    LOAD_TYPE,
    REACTIVE_POWER,
} from 'components/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { modifyLoad } from '../../../../utils/rest-api';
import { sanitizeString } from '../../dialogUtils';
import yup from '../../../utils/yup-config';
import ModificationDialog from '../../commons/modificationDialog';
import LoadModificationForm from './load-modification-form';
import { FetchStatus } from 'utils/rest-api';

/**
 * Dialog to create a load in the network
 * @param studyUuid the study we are currently working on
 * @param defaultIdValue the default load id
 * @param currentNode The node we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */

const formSchema = yup
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
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);

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

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

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

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED ||
                editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED ||
                    dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });
    return (
        <FormProvider
            validationSchema={formSchema}
            removeOptional={true}
            {...formMethods}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-modify-load"
                maxWidth={'md'}
                titleId="ModifyLoad"
                open={open}
                keepMounted={true}
                isDataFetching={
                    isUpdate &&
                    (editDataFetchStatus === FetchStatus.RUNNING ||
                        dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                <LoadModificationForm
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                    setDataFetchStatus={setDataFetchStatus}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

LoadModificationDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};

export default LoadModificationDialog;
