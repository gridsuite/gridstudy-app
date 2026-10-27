/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';
import { useCallback, useEffect } from 'react';
import {
    CustomFormProvider,
    DeepNullable,
    NetworkReductionDto,
    NetworkReductionForm,
    NetworkReductionFormData,
    emptyNetworkReductionFormData,
    networkReductionDtoToForm,
    networkReductionFormSchema,
    networkReductionFormToDto,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { FetchStatus } from 'services/utils.type';
import { FORM_LOADING_DELAY } from '../../../network/constants';
import { NetworkModificationDialogProps } from '../../../graph/menus/network-modifications/network-modification-menu.type';
import { networkReduction } from 'services/study/network-modifications';

export type NetworkReductionDialogProps = NetworkModificationDialogProps & {
    editData?: NetworkReductionDto;
};

export function NetworkReductionDialog({
    editData,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<NetworkReductionDialogProps>) {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm<DeepNullable<NetworkReductionFormData>>({
        defaultValues: emptyNetworkReductionFormData,
        resolver: yupResolver<DeepNullable<NetworkReductionFormData>>(networkReductionFormSchema),
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            reset(networkReductionDtoToForm(editData));
        }
    }, [editData, reset]);

    const onSubmit = useCallback(
        async (form: NetworkReductionFormData) => {
            try {
                const dto = networkReductionFormToDto(form);
                await networkReduction(studyUuid, currentNodeUuid, editData?.uuid, dto);
            } catch (error) {
                snackWithFallback(snackError, error, {
                    headerId: 'NetworkReductionError',
                });
            }
        },
        [editData?.uuid, studyUuid, currentNodeUuid, snackError]
    );

    const clear = useCallback(() => {
        reset(emptyNetworkReductionFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider validationSchema={networkReductionFormSchema} removeOptional={true} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'md'}
                titleId="NetworkReduction"
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <NetworkReductionForm />
            </ModificationDialog>
        </CustomFormProvider>
    );
}
