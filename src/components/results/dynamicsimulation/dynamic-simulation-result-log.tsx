/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComputationReportViewer } from '../common/computation-report-viewer';
import { REPORT_TYPES } from '../../utils/report-type';
import React, { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../redux/reducer.type';
import ComputingType from '../../computing-status/computing-type';
import RunningStatus from '../../utils/running-status';
import { useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { useIntl } from 'react-intl';
import { Box, Typography } from '@mui/material';

const styles = {
    overlay: {
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
};
const DynamicSimulationResultLog = memo(() => {
    const dynamicSimulationStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.DYNAMIC_SIMULATION]
    );

    const intl = useIntl();
    const messages = useIntlResultStatusMessages(intl);

    const overlayMessage = useMemo(() => {
        switch (dynamicSimulationStatus) {
            case RunningStatus.IDLE:
                return messages.noCalculation;
            case RunningStatus.RUNNING:
                return messages.running;
            case RunningStatus.FAILED:
            case RunningStatus.SUCCEED:
                return undefined;
            default:
                return messages.noCalculation;
        }
    }, [dynamicSimulationStatus, messages]);
    return (
        <>
            {overlayMessage ? (
                <Box sx={styles.overlay}>
                    <Typography variant={'body2'}>{overlayMessage}</Typography>
                </Box>
            ) : (
                <ComputationReportViewer
                    reportType={REPORT_TYPES.DYNAMIC_SIMULATION}
                />
            )}
        </>
    );
});

export default DynamicSimulationResultLog;
