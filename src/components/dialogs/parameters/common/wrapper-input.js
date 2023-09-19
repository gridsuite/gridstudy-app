/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { styles } from '../parameters';
import * as yup from 'yup';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import React, { useEffect } from 'react';
import { Grid } from '@mui/material';
import { FormattedMessage } from 'react-intl';

const WrapperInput = ({ value, label, callback, validator, children }) => {
    const formSchema = yup.object().shape({
        value: validator,
    });

    const formMethods = useForm({
        defaultValues: {
            value: value,
        },
        resolver: yupResolver(formSchema),
    });

    const { handleSubmit, watch } = formMethods;

    // to commit by onChange rather than onSubmit
    useEffect(() => {
        const subscription = watch(handleSubmit(callback));
        return () => subscription.unsubscribe();
    }, [handleSubmit, watch, callback]);

    return (
        <>
            <Grid item xs={8} sx={styles.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <FormProvider validationSchema={formSchema} {...formMethods}>
                <Grid item container xs={4} sx={styles.controlItem}>
                    {children}
                </Grid>
            </FormProvider>
        </>
    );
};

export default WrapperInput;
