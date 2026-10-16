/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useIntl } from 'react-intl';
import {
    CustomFormProvider,
    limitSetsTabularModificationEmptyFormData,
    LimitSetsTabularModificationForm,
    type LimitSetsTabularModificationDto,
    limitSetsTabularModificationDtoToForm,
    limitSetsTabularModificationFormSchema,
    limitSetsTabularModificationFormToDto,
    type LimitSetsTabularModificationFormType,
    snackWithFallback,
    useSnackMessage,
    ModificationType,
} from '@gridsuite/commons-ui';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useMemo } from 'react';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../network/constants';
import { ModificationDialog } from '../../commons/modificationDialog';
import type { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import { FetchStatus } from 'services/utils.type';
import { createTabularModification } from '../../../../services/study/network-modifications';

interface LimitSetsModificationDialogProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    editData: LimitSetsTabularModificationDto;
    isUpdate: boolean;
    editDataFetchStatus: FetchStatus;
}

export function LimitSetsModificationDialog({
    studyUuid,
    currentNode,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<LimitSetsModificationDialogProps>) {
    const currentNodeUuid = currentNode?.id;
    const intl = useIntl();

    const { snackError } = useSnackMessage();
    const formMethods = useForm<LimitSetsTabularModificationFormType>({
        defaultValues: limitSetsTabularModificationEmptyFormData,
        resolver: yupResolver(limitSetsTabularModificationFormSchema),
    });

    const {
        reset,
        formState: { errors },
    } = formMethods;

    const disableSave = Object.keys(errors).length > 0;

    const clear = useCallback(() => {
        reset(limitSetsTabularModificationEmptyFormData);
    }, [reset]);

    useEffect(() => {
        if (editData) {
            reset(limitSetsTabularModificationDtoToForm(editData));
        }
    }, [editData, reset, intl]);

    const dataFetching = useMemo(() => {
        return isUpdate && editDataFetchStatus === FetchStatus.RUNNING;
    }, [editDataFetchStatus, isUpdate]);

    const onSubmit = useCallback<SubmitHandler<LimitSetsTabularModificationFormType>>(
        (formData) => {
            const { modificationType, modifications, csvFilename } = limitSetsTabularModificationFormToDto(formData);

            createTabularModification({
                studyUuid,
                nodeUuid: currentNodeUuid,
                modificationType,
                modifications,
                modificationUuid: editData?.uuid,
                tabularType: ModificationType.LIMIT_SETS_TABULAR_MODIFICATION,
                csvFilename,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'TabularModificationError' });
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
        <CustomFormProvider validationSchema={limitSetsTabularModificationFormSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth={'lg'}
                onClear={clear}
                onSave={onSubmit}
                titleId="LimitSetsTabularModification"
                open={open}
                isDataFetching={dataFetching}
                disabledSave={disableSave}
                slotProps={{ paper: { sx: { height: '95vh' } } }}
                {...dialogProps}
            >
                <LimitSetsTabularModificationForm dataFetching={dataFetching} />
            </ModificationDialog>
        </CustomFormProvider>
    );
}
