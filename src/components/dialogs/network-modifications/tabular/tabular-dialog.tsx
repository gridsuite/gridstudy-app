/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import {
    CustomFormProvider,
    getEmptyTabularFormData,
    snackWithFallback,
    TABULAR_CREATION_FIELDS,
    TABULAR_MODIFICATION_FIELDS,
    TabularForm,
    type TabularFormActionsContext,
    tabularCreationDtoToForm,
    tabularCreationFormToDto,
    tabularFormSchema,
    type TabularFormType,
    type TabularModificationDto,
    tabularModificationDtoToForm,
    tabularModificationFormToDto,
    TabularModificationType,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect, useMemo } from 'react';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form.js';
import { FORM_LOADING_DELAY } from 'components/network/constants.js';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog.js';
import { createTabularModification } from 'services/study/network-modifications.js';
import { FetchStatus } from 'services/utils.type';
import { NetworkModificationDialogProps } from '../../../graph/menus/network-modifications/network-modification-menu.type';
import { TabularStudyActions } from './tabular-study-actions';

type TabularDialogProps = NetworkModificationDialogProps & {
    editData: TabularModificationDto;
    dialogMode: TabularModificationType;
};

export function TabularDialog({
    studyUuid,
    currentNode,
    editData,
    isUpdate,
    editDataFetchStatus,
    dialogMode,
    ...dialogProps
}: Readonly<TabularDialogProps>) {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const isCreation = dialogMode === TabularModificationType.CREATION;

    const defaultEquipmentType = useMemo(() => {
        return isCreation
            ? (Object.keys(TABULAR_CREATION_FIELDS).at(0) ?? '')
            : (Object.keys(TABULAR_MODIFICATION_FIELDS).at(0) ?? '');
    }, [isCreation]);

    const formMethods = useForm<TabularFormType>({
        defaultValues: getEmptyTabularFormData(defaultEquipmentType),
        resolver: yupResolver(tabularFormSchema),
    });

    const {
        reset,
        formState: { errors },
    } = formMethods;

    const disableSave = Object.keys(errors).length > 0;

    useEffect(() => {
        if (editData) {
            reset(isCreation ? tabularCreationDtoToForm(editData) : tabularModificationDtoToForm(editData));
        }
    }, [editData, isCreation, reset]);

    const submitTabularModification = useCallback(
        (formData: TabularFormType) => {
            const { type, modificationType, modifications, csvFilename, properties } = isCreation
                ? tabularCreationFormToDto(formData)
                : tabularModificationFormToDto(formData);

            createTabularModification({
                studyUuid,
                nodeUuid: currentNodeUuid,
                modificationType,
                modifications,
                modificationUuid: editData?.uuid,
                tabularType: type,
                csvFilename,
                properties,
            }).catch((error) => {
                snackWithFallback(snackError, error, {
                    headerId: isCreation ? 'TabularCreationError' : 'TabularModificationError',
                });
            });
        },
        [currentNodeUuid, editData, isCreation, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(getEmptyTabularFormData(defaultEquipmentType));
    }, [defaultEquipmentType, reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const dataFetching = useMemo(() => {
        return isUpdate && editDataFetchStatus === FetchStatus.RUNNING;
    }, [editDataFetchStatus, isUpdate]);

    const renderStudyActions = useCallback(
        (context: TabularFormActionsContext) => <TabularStudyActions {...context} />,
        []
    );

    return (
        <CustomFormProvider validationSchema={tabularFormSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth={'lg'}
                onClear={clear}
                onSave={submitTabularModification}
                disabledSave={disableSave}
                titleId={isCreation ? 'TabularCreation' : 'TabularModification'}
                open={open}
                isDataFetching={dataFetching}
                slotProps={{ paper: { sx: { height: '95vh' } } }}
                {...dialogProps}
            >
                <TabularForm
                    dataFetching={dataFetching}
                    dialogMode={dialogMode}
                    renderActions={renderStudyActions}
                    showCsvFileName
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
}
