/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import yup from '../../util/yup-config';
import ModificationDialog from '../commons/modificationDialog';
import LoadScalingForm from './load-scaling-form';
import { useCallback, useEffect } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { VARIATION_TYPE, VARIATIONS } from '../../util/field-constants';
import { getVariationsSchema } from './variation/variation-utils';
import { loadScaling } from '../../../utils/rest-api';
import { VARIATION_TYPES } from '../../network/constants';

const emptyFormData = {
    [VARIATION_TYPE]: VARIATION_TYPES.DELTA_P.id,
    [VARIATIONS]: [],
};

const formSchema = yup
    .object()
    .shape({
        [VARIATION_TYPE]: yup.string().required(),
        ...getVariationsSchema(VARIATIONS),
    })
    .required();

const LoadScalingDialog = ({
    editData,
    currentNode,
    studyUuid,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            reset({
                [VARIATION_TYPE]: editData.variationType,
                [VARIATIONS]: editData.variations,
            });
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (loadScalingInfos) => {
            loadScaling(
                studyUuid,
                currentNodeUuid,
                editData?.uuid ?? undefined,
                loadScalingInfos[VARIATION_TYPE],
                loadScalingInfos[VARIATIONS]
            ).catch((errorMessage) => {
                snackError({
                    messageTxt: errorMessage,
                    headerId: 'LoadScalingError',
                });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-load-scaling"
                maxWidth={'md'}
                titleId="LoadScaling"
                {...dialogProps}
            >
                <LoadScalingForm />
            </ModificationDialog>
        </FormProvider>
    );
};

export default LoadScalingDialog;
