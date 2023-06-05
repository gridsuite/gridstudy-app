/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { Tabs, Tab, Grid } from '@mui/material';
import {
    FILTERS,
    HIGH_VOLTAGE_LIMIT,
    ID,
    LOW_VOLTAGE_LIMIT,
    NAME,
    VOLTAGE_LIMITS,
} from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { getVoltageInitParameters } from 'utils/rest-api';
import { useStyles, TabPanel } from '../parameters';
import VoltageLimitsParameters from './voltage-limits-parameters';

export const useGetVoltageInitParameters = () => {
    const studyUuid = useSelector((state) => state.studyUuid);
    const { snackError } = useSnackMessage();
    const [voltageInitParams, setVoltageInitParams] = useState(null);

    useEffect(() => {
        if (studyUuid) {
            getVoltageInitParameters(studyUuid)
                .then((params) => setVoltageInitParams(params))
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'paramsRetrievingError',
                    });
                });
        }
    }, [studyUuid, snackError]);

    return [voltageInitParams, setVoltageInitParams];
};

const TAB_VALUES = {
    voltageLimitsParamsTabValue: 'VoltageLimits',
};

const formSchema = yup
    .object()
    .shape({
        [VOLTAGE_LIMITS]: yup
            .array()
            .of(
                yup.object().shape({
                    [FILTERS]: yup
                        .array()
                        .of(
                            yup.object().shape({
                                [ID]: yup.string().required(),
                                [NAME]: yup.string().required(),
                            })
                        )
                        .min(1, 'FilterInputMinError'),
                    [LOW_VOLTAGE_LIMIT]: yup.number().nullable(),
                    [HIGH_VOLTAGE_LIMIT]: yup.number().nullable(),
                })
            )
            .required(),
    })
    .required();

export const VoltageInitParameters = ({ useVoltageInitParameters }) => {
    const classes = useStyles();

    const [tabValue, setTabValue] = useState(
        TAB_VALUES.voltageLimitsParamsTabValue
    );

    const emptyFormData = {
        [VOLTAGE_LIMITS]: [],
    };

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, control } = formMethods;

    return (
        <>
            <Grid
                container
                key="dsParameters"
                className={classes.scrollableGrid}
            >
                <Grid item maxWidth="md" width="100%">
                    <Tabs value={tabValue} variant="scrollable">
                        <Tab
                            label={<FormattedMessage id="VoltageLimits" />}
                            value={TAB_VALUES.voltageLimitsParamsTabValue}
                        />
                    </Tabs>
                    <TabPanel
                        value={tabValue}
                        index={TAB_VALUES.voltageLimitsParamsTabValue}
                    >
                        <FormProvider
                            validationSchema={formSchema}
                            {...formMethods}
                        >
                            <VoltageLimitsParameters
                                control={control}
                                reset={reset}
                                emptyFormData={emptyFormData}
                                useVoltageInitParameters={
                                    useVoltageInitParameters
                                }
                            />
                        </FormProvider>
                    </TabPanel>
                </Grid>
            </Grid>
        </>
    );
};
