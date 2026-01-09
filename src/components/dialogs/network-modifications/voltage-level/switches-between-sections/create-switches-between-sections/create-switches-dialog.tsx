/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dialog, DialogActions } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import CreateSwitchesDialogSubmitButton from './create-switches-dialog-submit-button';
import CreateSwitchesForm from './create-switches-form';
import { getCreateSwitchesEmptyFormData, getCreateSwitchesValidationSchema } from './create-switches-dialog-utils';
import { SWITCH_KINDS } from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';
import React, { useEffect } from 'react';
import { CancelButton, CustomFormProvider } from '@gridsuite/commons-ui';
import { CreateSwitchesFormData, SwitchKindData } from '../switches-between-sections';

const formSchema = yup.object().shape({
    ...getCreateSwitchesValidationSchema(),
}) as yup.ObjectSchema<CreateSwitchesFormData>;

interface CreateSwitchesDialogProps {
    sectionCount: number;
    handleCreateSwitchesDialog: (data: CreateSwitchesFormData) => void;
    setOpenCreateSwitchesDialog: React.Dispatch<React.SetStateAction<boolean>>;
    openCreateSwitchesDialog: boolean;
    switchKinds: SwitchKindData[];
}

export const CreateSwitchesDialog = ({
    sectionCount,
    handleCreateSwitchesDialog,
    setOpenCreateSwitchesDialog,
    openCreateSwitchesDialog,
    switchKinds,
}: CreateSwitchesDialogProps) => {
    const emptyFormData = getCreateSwitchesEmptyFormData(sectionCount);
    const formMethods = useForm<CreateSwitchesFormData>({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (switchKinds?.length > 0) {
            reset({
                [SWITCH_KINDS]: switchKinds,
            });
        }
    }, [switchKinds, reset]);

    const handleCloseDialog = () => {
        reset(emptyFormData);
        setOpenCreateSwitchesDialog(false);
    };

    const handleSave = (data: CreateSwitchesFormData) => {
        handleCreateSwitchesDialog(data);
        handleCloseDialog();
    };

    return (
        <Dialog open={openCreateSwitchesDialog} fullWidth={true}>
            <CustomFormProvider validationSchema={formSchema} {...formMethods}>
                <CreateSwitchesForm id={SWITCH_KINDS} />
                <DialogActions>
                    <CancelButton onClick={handleCloseDialog} />
                    <CreateSwitchesDialogSubmitButton handleSave={handleSave} />
                </DialogActions>
            </CustomFormProvider>
        </Dialog>
    );
};
