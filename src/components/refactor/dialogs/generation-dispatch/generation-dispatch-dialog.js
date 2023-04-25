/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { LOSS_COEFFICIENT } from 'components/refactor/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { generationDispatch } from '../../../../utils/rest-api';
import yup from '../../utils/yup-config';
import ModificationDialog from '../commons/modificationDialog';
import GenerationDispatchForm from './generation-dispatch-form';

const emptyFormData = {
    [LOSS_COEFFICIENT]: null,
};

const schema = yup
    .object()
    .shape({
        [LOSS_COEFFICIENT]: yup.number().nullable().min(0).max(100).required(),
    })
    .required();

const GenerationDispatchDialog = ({
    editData,
    currentNode,
    studyUuid,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

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

    return (
        <FormProvider
            validationSchema={schema}
            removeOptional={true}
            {...methods}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-generation-dispatch"
                maxWidth={'sm'}
                titleId="GenerationDispatch"
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
};

export default GenerationDispatchDialog;
