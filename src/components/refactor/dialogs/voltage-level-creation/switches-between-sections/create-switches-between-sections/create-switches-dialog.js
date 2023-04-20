/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button, Dialog, DialogActions } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import CreateSwitchesDialogSubmitButton from './create-switches-dialog-submit-button';
import CreateSwitchesForm from './create-switches-form';
import {
    getCreateSwitchesEmptyFormData,
    getCreateSwitchesValidationSchema,
} from './create-switches-dialog-utils';
import { SWITCH_KINDS } from 'components/refactor/utils/field-constants';
import yup from 'components/refactor/utils/yup-config';
import { useEffect } from 'react';

const schema = yup.object().shape({
    ...getCreateSwitchesValidationSchema(),
});

export const CreateSwitchesDialog = (props) => {
    const sectionCount = props.sectionCount;
    const emptyFormData = getCreateSwitchesEmptyFormData(sectionCount);
    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });
    const {
        handleCreateSwitchesDialog,
        setOpenCreateSwitchesDialog,
        openCreateSwitchesDialog,
        switchKinds,
    } = props;

    const { reset } = methods;

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
            <FormProvider validationSchema={schema} {...methods}>
                <CreateSwitchesForm id={SWITCH_KINDS} />
                <DialogActions>
                    <Button onClick={handleCloseDialog}>
                        <FormattedMessage id="cancel" />
                    </Button>
                    <CreateSwitchesDialogSubmitButton handleSave={handleSave} />
                </DialogActions>
            </FormProvider>
        </Dialog>
    );
};
