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
    FieldConstants,
    generatorScalingFormToDto,
    snackWithFallback,
    useSnackMessage,
    emptyVariationScalingFormData,
    VariationScalingFormData,
    generatorScalingFormSchema,
    Variations,
    VariationType,
    GeneratorScalingForm,
} from '@gridsuite/commons-ui';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { generatorScaling } from '../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../services/utils';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../graph/tree-node.type';

interface GeneratorScalingDialogProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    isUpdate: boolean;
    editDataFetchStatus?: string;
    editData?: {
        uuid: UUID;
        [FieldConstants.VARIATION_TYPE]: VariationType;
        [FieldConstants.VARIATIONS]: Variations[];
    };
}

const GeneratorScalingDialog = ({
    editData,
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: GeneratorScalingDialogProps) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyVariationScalingFormData,
        resolver: yupResolver(generatorScalingFormSchema),
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            reset({
                [FieldConstants.VARIATION_TYPE]: editData[FieldConstants.VARIATION_TYPE],
                [FieldConstants.VARIATIONS]: editData[FieldConstants.VARIATIONS],
            });
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyVariationScalingFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (formData: VariationScalingFormData) => {
            const dto = generatorScalingFormToDto(formData);
            generatorScaling(studyUuid, currentNodeUuid, editData?.uuid ?? undefined, dto).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'GeneratorScalingError' });
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
        <CustomFormProvider validationSchema={generatorScalingFormSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'md'}
                titleId="GeneratorScaling"
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <GeneratorScalingForm />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default GeneratorScalingDialog;
