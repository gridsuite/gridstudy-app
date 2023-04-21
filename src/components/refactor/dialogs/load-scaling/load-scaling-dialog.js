/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import yup from '../../utils/yup-config';
import ModificationDialog from '../commons/modificationDialog';
import LoadScalingForm from './load-scaling-form';
import { useCallback, useEffect } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { VARIATION_TYPE, VARIATIONS } from '../../utils/field-constants';
import { getVariationsSchema } from './variation/variation-utils';
import { loadScaling } from '../../../../utils/rest-api';
import {
    FORM_LOADING_DELAY,
    VARIATION_TYPES,
} from '../../../network/constants';
import { useOpenShortWaitFetching } from 'components/refactor/dialogs/commons/handle-modification-form';

const emptyFormData = {
    [VARIATION_TYPE]: VARIATION_TYPES.DELTA_P.id,
    [VARIATIONS]: [],
};

const schema = yup
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
    isUpdate,
    isEditDataFetched,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

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

    const open = useOpenShortWaitFetching({
        isDataFetched: !isUpdate || isEditDataFetched,
        delay: FORM_LOADING_DELAY,
    });
    return (
        <FormProvider validationSchema={schema} {...methods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-load-scaling"
                maxWidth={'md'}
                titleId="LoadScaling"
                open={open}
                isDataFetching={isUpdate && !isEditDataFetched}
                {...dialogProps}
            >
                <LoadScalingForm />
            </ModificationDialog>
        </FormProvider>
    );
};

export default LoadScalingDialog;
