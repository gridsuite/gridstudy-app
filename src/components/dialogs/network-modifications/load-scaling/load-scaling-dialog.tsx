/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import LoadScalingForm from './load-scaling-form';
import { useCallback, useEffect } from 'react';
import {
    CustomFormProvider,
    FetchStatus,
    FORM_LOADING_DELAY,
    ModificationDialog,
    snackWithFallback,
    useOpenShortWaitFetching,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { VARIATION_TYPE, VARIATIONS } from 'components/utils/field-constants';
import { getVariationsSchema } from './variation/variation-utils';
import { VARIATION_TYPES } from 'components/network/constants';
import { loadScaling } from '../../../../services/study/network-modifications';
import { UUID } from 'node:crypto';
import { Variations, VariationType } from '../../../../services/network-modification-types';
import { CurrentTreeNode } from '../../../graph/tree-node.type';

interface LoadScalingFormData {
    [VARIATION_TYPE]: VariationType;
    [VARIATIONS]: Variations[];
}

const emptyFormData: LoadScalingFormData = {
    [VARIATION_TYPE]: VARIATION_TYPES.DELTA_P.id,
    [VARIATIONS]: [],
};

const formSchema = yup
    .object()
    .shape({
        [VARIATION_TYPE]: yup.string().required(),
        ...getVariationsSchema(VARIATIONS),
    })
    .required() as yup.ObjectSchema<LoadScalingFormData>;

interface LoadScalingDialogProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    isUpdate: boolean;
    editDataFetchStatus?: string;
    editData?: {
        uuid: UUID;
        [VARIATION_TYPE]: VariationType;
        [VARIATIONS]: Variations[];
    };
}

const LoadScalingDialog = ({
    editData,
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: LoadScalingDialogProps) => {
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
                [VARIATION_TYPE]: editData[VARIATION_TYPE],
                [VARIATIONS]: editData[VARIATIONS],
            });
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (loadScalingInfos: LoadScalingFormData) => {
            loadScaling(
                studyUuid,
                currentNodeUuid,
                editData?.uuid ?? undefined,
                loadScalingInfos[VARIATION_TYPE],
                loadScalingInfos[VARIATIONS]
            ).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'LoadScalingError' });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'md'}
                titleId="LoadScaling"
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <LoadScalingForm />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default LoadScalingDialog;
