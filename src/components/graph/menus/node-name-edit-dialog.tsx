/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, isObjectEmpty } from '@gridsuite/commons-ui';
import { useCallback, useEffect } from 'react';
import { Grid } from '@mui/material';
import { NAME } from '../../utils/field-constants';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../../utils/yup-config';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer.type';
import { UniqueCheckNameInput } from 'components/graph/menus/unique-check-name-input';
import { isNodeExists } from 'services/study';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';

export interface FormData {
    [NAME]: string;
}

interface BaseDialogProps {
    open: boolean;
    onSave: (data: FormData) => void;
    onClose: () => void;
    titleId: string;
    initialName?: string;
}

const getSchema = () => {
    return yup
        .object()
        .shape({
            [NAME]: yup.string().trim().required(),
        })
        .required();
};

const emptyFormData: FormData = { [NAME]: '' };

const NodeNameEditDialog: React.FC<BaseDialogProps> = ({
    open,
    onSave,
    onClose,
    titleId,
    initialName,
    ...dialogProps
}) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(getSchema()),
    });

    const {
        reset,
        formState: { errors },
    } = formMethods;

    useEffect(() => {
        if (open) {
            reset({ [NAME]: initialName ?? '' });
        }
    }, [initialName, open, reset]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const handleSave = useCallback(
        (values: FormData) => {
            onSave(values);
        },
        [onSave]
    );

    const isFormValid = isObjectEmpty(errors);

    return (
        <CustomFormProvider validationSchema={getSchema()} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth={'xs'}
                open={open}
                onClose={onClose}
                onClear={clear}
                onSave={handleSave}
                aria-labelledby="dialog-name-edit"
                {...dialogProps}
                titleId={titleId}
                disabledSave={!isFormValid}
            >
                <Grid container spacing={1} direction="column">
                    <Grid item>
                        <UniqueCheckNameInput
                            name={NAME}
                            autoFocus
                            studyUuid={studyUuid}
                            elementExists={isNodeExists}
                            errorMessageKey="nameAlreadyUsed"
                            catchMessageKey="NodeUpdateError"
                            formProps={{ fullWidth: true }}
                        />
                    </Grid>
                </Grid>
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default NodeNameEditDialog;
