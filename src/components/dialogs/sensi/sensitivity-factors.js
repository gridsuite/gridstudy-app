﻿/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useInputForm } from '../inputs/input-hooks';
import { useExpandableSensitivityFactors } from './expandable-sensitivity-factors';
import React, { useMemo } from 'react';
import Grid from '@mui/material/Grid';

export const useSensitivityFactors = ({ id, Field, initialValues }) => {
    const inputForm = useInputForm();

    const [factors, factorsField] = useExpandableSensitivityFactors({
        id: id,
        labelAddValue: 'AddSensitivityFactor',
        Field: Field,
        inputForm: inputForm,
        isRequired: false,
        initialValues: initialValues,
    });

    const field = useMemo(() => {
        return (
            <>
                <Grid container item direction="row" spacing={2}>
                    {factorsField}
                </Grid>
            </>
        );
    }, [factorsField]);

    return [factors, field];
};
