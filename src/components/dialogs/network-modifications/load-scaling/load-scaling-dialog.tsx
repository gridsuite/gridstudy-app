/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ModificationDialog } from '../../commons/modificationDialog';
import { useCallback, useEffect } from 'react';
import {
    CustomFormProvider,
    emptyVariationScalingFormData,
    loadScalingFormSchema,
    snackWithFallback,
    useSnackMessage,
    VariationScalingFormData,
    LoadScalingForm,
    loadScalingFormToDto,
    loadScalingDtoToForm,
    VariationScalingDto,
} from '@gridsuite/commons-ui';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { loadScaling } from '../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../services/utils';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../graph/tree-node.type';

interface LoadScalingDialogProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    isUpdate: boolean;
    editDataFetchStatus?: string;
    editData?: VariationScalingDto;
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
        defaultValues: emptyVariationScalingFormData,
        resolver: yupResolver(loadScalingFormSchema),
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            reset(loadScalingDtoToForm(editData));
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyVariationScalingFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (formData: VariationScalingFormData) => {
            const dto = loadScalingFormToDto(formData);
            loadScaling(studyUuid, currentNodeUuid, editData?.uuid ?? undefined, dto).catch((error) => {
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
        <CustomFormProvider validationSchema={loadScalingFormSchema} {...formMethods}>
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
