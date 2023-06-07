/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { Tabs, Tab, Grid } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
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

export const VoltageInitParameters = ({
    hideParameters,
    useVoltageInitParameters,
}) => {
    const classes = useStyles();
    const tabValue = useMemo(() => TAB_VALUES.voltageLimitsParamsTabValue, []);

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
                        <VoltageLimitsParameters
                            hideParameters={hideParameters}
                            useVoltageInitParameters={useVoltageInitParameters}
                        />
                    </TabPanel>
                </Grid>
            </Grid>
        </>
    );
};
