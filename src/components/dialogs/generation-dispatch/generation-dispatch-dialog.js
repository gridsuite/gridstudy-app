/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { LOSS_COEFFICIENT } from 'components/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import yup from '../../utils/yup-config';
import { useOpenShortWaitFetching } from '../commons/handle-modification-form';
import ModificationDialog from '../commons/modificationDialog';
import GenerationDispatchForm from './generation-dispatch-form';

import { FetchStatus } from '../../../utils/rest-api';
import { generationDispatch } from '../../../services/study';

const emptyFormData = {
    [LOSS_COEFFICIENT]: null,
};

const formSchema = yup
    .object()
    .shape({
        [LOSS_COEFFICIENT]: yup.number().nullable().min(0).max(100).required(),
    })
    .required();

const GenerationDispatchDialog = ({
    editData,
    currentNode,
    studyUuid,
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
        (generation) => {
            reset({
                [LOSS_COEFFICIENT]: generation.lossCoefficient,
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
        (generation) => {
            generationDispatch(
                studyUuid,
                currentNodeUuid,
                editData?.uuid ?? undefined,
                generation?.lossCoefficient
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'GenerationDispatchError',
                });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
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
        <FormProvider
            validationSchema={formSchema}
            removeOptional={true}
            {...formMethods}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-generation-dispatch"
                maxWidth={'sm'}
                titleId="GenerationDispatch"
                open={open}
                isDataFetching={
                    isUpdate && editDataFetchStatus === FetchStatus.RUNNING
                }
                {...dialogProps}
            >
                <GenerationDispatchForm
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

GenerationDispatchDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};

export default GenerationDispatchDialog;
