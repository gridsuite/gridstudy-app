/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Button, Dialog, DialogActions } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { FormProvider, useForm } from 'react-hook-form';
import CreateRuleForm from './create-rule-form';
import {
    getCreateRuleValidationSchema,
    getCreateRuteEmptyFormData,
} from './create-rule-dialog-utils';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    HIGH_TAP_POSITION,
    LOW_TAP_POSITION,
} from 'components/refactor/utils/field-constants';
import CreateRuleDialogSubmitButton from './create-rule-dialog-submit-button';

const emptyFormData = getCreateRuteEmptyFormData();
const schema = getCreateRuleValidationSchema();

export const CreateRuleDialog = (props) => {
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const {
        allowNegativeValues,
        handleCreateTapRule,
        setOpenCreateRuleDialog,
    } = props;

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
            <FormProvider validationSchema={schema} {...formMethods}>
                <CreateRuleForm {...props} />
                <DialogActions>
                    <Button onClick={handleCloseDialog}>
                        <FormattedMessage id="cancel" />
                    </Button>
                    <CreateRuleDialogSubmitButton
                        handleSave={handleSave}
                        allowNegativeValues={allowNegativeValues}
                    />
                </DialogActions>
            </FormProvider>
        </Dialog>
    );
};
