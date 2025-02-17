/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComputationReportViewer } from '../common/computation-report-viewer';
import { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import ComputingType from '../../computing-status/computing-type';
import RunningStatus from '../../utils/running-status';
import { useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { useIntl } from 'react-intl';
import Overlay from '../common/Overlay';

const DynamicSecurityAnalysisResultLogs = memo(() => {
    const dynamicSecurityAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.DYNAMIC_SECURITY_ANALYSIS]
    );

    const intl = useIntl();
    const messages = useIntlResultStatusMessages(intl);

    const overlayMessage = useMemo(() => {
        switch (dynamicSecurityAnalysisStatus) {
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
    }, [dynamicSecurityAnalysisStatus, messages]);
    return (
        <Overlay message={overlayMessage}>
            <ComputationReportViewer reportType={ComputingType.DYNAMIC_SECURITY_ANALYSIS} />
        </Overlay>
    );
});

export default DynamicSecurityAnalysisResultLogs;
