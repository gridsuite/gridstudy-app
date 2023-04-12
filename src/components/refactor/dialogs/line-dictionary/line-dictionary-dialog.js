/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';

import yup from '../../utils/yup-config';
import ModificationDialog from '../commons/modificationDialog';
import LineDictionaryForm from './line-dictionary-form';

const schema = yup
    .object()
    .shape({
        // [TYPE]: yup.object().nullable().required(),
        // [EQUIPMENT_ID]: yup.string().nullable().required(),
    })
    .required();

const emptyFormData = {
    // [TYPE]: EQUIPMENT_TYPES.LINE,
    // [EQUIPMENT_ID]: null,
};

const LineDictionaryDialog = ({ ...dialogProps }) => {
    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

    const onSubmit = useCallback((formData) => {}, []);
    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    return (
        <FormProvider validationSchema={schema} {...methods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-line-dictionary"
                titleId="LineDictionaryDialogTitle"
                {...dialogProps}
            >
                <LineDictionaryForm />
            </ModificationDialog>
        </FormProvider>
    );
};

LineDictionaryDialog.propTypes = {};

export default LineDictionaryDialog;
