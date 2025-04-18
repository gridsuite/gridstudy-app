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
import { useEffect } from 'react';
import { CancelButton, CustomFormProvider } from '@gridsuite/commons-ui';

const formSchema = yup.object().shape({
    ...getCreateSwitchesValidationSchema(),
});

export const CreateSwitchesDialog = (props) => {
    const sectionCount = props.sectionCount;
    const emptyFormData = getCreateSwitchesEmptyFormData(sectionCount);
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const { handleCreateSwitchesDialog, setOpenCreateSwitchesDialog, openCreateSwitchesDialog, switchKinds } = props;

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

    const handleSave = (data) => {
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
