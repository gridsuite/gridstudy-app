/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dialog, DialogActions } from '@mui/material';
import { Resolver, useForm } from 'react-hook-form';
import CreateRuleForm from './create-rule-form.js';
import { getCreateRuleValidationSchema, getCreateRuleEmptyFormData } from './create-rule-dialog-utils';
import { yupResolver } from '@hookform/resolvers/yup';
import { HIGH_TAP_POSITION, LOW_TAP_POSITION } from 'components/utils/field-constants';
import CreateRuleDialogSubmitButton from './create-rule-dialog-submit-button.js';
import { CancelButton, CustomFormProvider } from '@gridsuite/commons-ui';
import { CreateRuleDialogProps, CreateRuleFormInput } from './create-rule-dialog.types.js';
import { useCallback } from 'react';

const EMPTY_FORM_DATA = getCreateRuleEmptyFormData();
const FORM_SCHEMA = getCreateRuleValidationSchema();

export const CreateRuleDialog = ({
    ruleType,
    openCreateRuleDialog,
    setOpenCreateRuleDialog,
    handleCreateTapRule,
    allowNegativeValues,
}: CreateRuleDialogProps) => {
    const formMethods = useForm<CreateRuleFormInput>({
        defaultValues: EMPTY_FORM_DATA,
        resolver: yupResolver(FORM_SCHEMA) as Resolver<CreateRuleFormInput>,
    });

    const { reset } = formMethods;

    const handleCloseDialog = useCallback(() => {
        reset(EMPTY_FORM_DATA);
        setOpenCreateRuleDialog(false);
    }, [reset, setOpenCreateRuleDialog]);

    const handleSave = useCallback(
        (data: CreateRuleFormInput) => {
            if (data[LOW_TAP_POSITION] != null && data[HIGH_TAP_POSITION] != null) {
                handleCreateTapRule(data[LOW_TAP_POSITION], data[HIGH_TAP_POSITION]);
                handleCloseDialog();
            }
        },
        [handleCreateTapRule, handleCloseDialog]
    );

    return (
        <Dialog open={openCreateRuleDialog} fullWidth={true}>
            <CustomFormProvider validationSchema={FORM_SCHEMA} {...formMethods}>
                <CreateRuleForm ruleType={ruleType} />
                <DialogActions>
                    <CancelButton onClick={handleCloseDialog} />
                    <CreateRuleDialogSubmitButton handleSave={handleSave} allowNegativeValues={allowNegativeValues} />
                </DialogActions>
            </CustomFormProvider>
        </Dialog>
    );
};
