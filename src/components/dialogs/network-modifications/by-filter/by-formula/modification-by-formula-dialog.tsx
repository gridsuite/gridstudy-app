/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import {
    CustomFormProvider,
    DeepNullable,
    emptyModificationFormData,
    ModificationByFormulaDto,
    ModificationByFormulaFormData,
    ModificationByFormulaForm,
    modificationByFormulaDtoToForm,
    modificationByFormulaFormSchema,
    modificationByFormulaFormToDto,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useCallback, useEffect } from 'react';
import { FetchStatus } from '../../../../../services/utils';
import { useForm } from 'react-hook-form';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
import { modifyByFormula } from '../../../../../services/study/network-modifications';
import { UUID } from 'node:crypto';
import { NetworkModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';

export type ByFormulaDialogProps = NetworkModificationDialogProps & {
    editData: ModificationByFormulaDto & { uuid: UUID };
};

const ModificationByFormulaDialog = ({
    studyUuid,
    currentNode,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: ByFormulaDialogProps) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm<DeepNullable<ModificationByFormulaFormData>>({
        defaultValues: emptyModificationFormData,
        resolver: yupResolver<DeepNullable<ModificationByFormulaFormData>>(modificationByFormulaFormSchema),
    });

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            reset(modificationByFormulaDtoToForm(editData));
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyModificationFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (formData: ModificationByFormulaFormData) => {
            const dto = modificationByFormulaFormToDto(formData);
            modifyByFormula(studyUuid, currentNodeUuid, dto, editData?.uuid).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'ModifyByFormula' });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    return (
        <CustomFormProvider validationSchema={modificationByFormulaFormSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                titleId="ModifyByFormula"
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
                <ModificationByFormulaForm />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default ModificationByFormulaDialog;
