/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dialog, DialogActions } from '@mui/material';
import { useForm } from 'react-hook-form';
import CreateRuleForm from './create-rule-form';
import { getCreateRuleValidationSchema, getCreateRuteEmptyFormData } from './create-rule-dialog-utils';
import { yupResolver } from '@hookform/resolvers/yup';
import { HIGH_TAP_POSITION, LOW_TAP_POSITION } from 'components/utils/field-constants';
import CreateRuleDialogSubmitButton from './create-rule-dialog-submit-button';
import { CancelButton, CustomFormProvider } from '@gridsuite/commons-ui';

const emptyFormData = getCreateRuteEmptyFormData();
const formSchema = getCreateRuleValidationSchema();

export const CreateRuleDialog = (props) => {
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { allowNegativeValues, handleCreateTapRule, setOpenCreateRuleDialog } = props;

    const { reset } = formMethods;

    const handleCloseDialog = () => {
        reset(emptyFormData);
        setOpenCreateRuleDialog(false);
    };

    const handleSave = (data) => {
        handleCreateTapRule(data[LOW_TAP_POSITION], data[HIGH_TAP_POSITION]);
        handleCloseDialog();
    };

    return (
        <Dialog open={props.openCreateRuleDialog} fullWidth={true}>
            <CustomFormProvider validationSchema={formSchema} {...formMethods}>
                <CreateRuleForm {...props} />
                <DialogActions>
                    <CancelButton onClick={handleCloseDialog} />
                    <CreateRuleDialogSubmitButton handleSave={handleSave} allowNegativeValues={allowNegativeValues} />
                </DialogActions>
            </CustomFormProvider>
        </Dialog>
    );
};
