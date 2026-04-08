/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import {
    CustomFormProvider,
    DeepNullable,
    emptyModificationByAssignmentFormData,
    modificationByAssignmentDtoToForm,
    modificationByAssignmentFormSchema,
    modificationByAssignmentFormToDto,
    ModificationByAssignmentForm,
    snackWithFallback,
    useSnackMessage,
    type ModificationByAssignmentFormData,
    ModificationByAssignmentDto,
} from '@gridsuite/commons-ui';
import { FC, useCallback, useEffect } from 'react';
import { FetchStatus } from '../../../../../services/utils';
import { useForm } from 'react-hook-form';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
import { modifyByAssignment } from '../../../../../services/study/network-modifications';
import { NetworkModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { UUID } from 'node:crypto';

type ModificationByAssignmentDialogProps = NetworkModificationDialogProps & {
    editData?: ModificationByAssignmentDto & { uuid: UUID };
};

const ModificationByAssignmentDialog: FC<ModificationByAssignmentDialogProps> = ({
    editData,
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();

    // "DeepNullable" to allow deeply null values as default values for required values
    // ("undefined" is accepted here in RHF, but it conflicts with MUI behaviour which does not like undefined values)
    const formMethods = useForm<DeepNullable<ModificationByAssignmentFormData>>({
        defaultValues: emptyModificationByAssignmentFormData,
        resolver: yupResolver<DeepNullable<ModificationByAssignmentFormData>>(modificationByAssignmentFormSchema),
    });

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            reset(modificationByAssignmentDtoToForm(editData));
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyModificationByAssignmentFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (formData: ModificationByAssignmentFormData) => {
            const dto = modificationByAssignmentFormToDto(formData);
            modifyByAssignment(studyUuid, currentNodeUuid, editData?.uuid, dto).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'ModifyByAssignment' });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    return (
        <CustomFormProvider validationSchema={modificationByAssignmentFormSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                titleId="ModifyByAssignment"
                open={open}
                maxWidth={'xl'}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                PaperProps={{
                    sx: {
                        height: '95vh',
                    },
                }}
                {...dialogProps}
            >
                <ModificationByAssignmentForm isModification={isUpdate} />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default ModificationByAssignmentDialog;
