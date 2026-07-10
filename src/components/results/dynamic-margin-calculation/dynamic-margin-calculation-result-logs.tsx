/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComputationReportViewer } from '../common/computation-report-viewer';
import { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer.type';
import { ComputingType } from '@gridsuite/commons-ui';
import RunningStatus from '../../utils/running-status';
import { useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { useIntl } from 'react-intl';
import Overlay from '../common/Overlay';

const DynamicMarginCalculationResultLogs = memo(() => {
    const dynamicMarginCalculationStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.DYNAMIC_MARGIN_CALCULATION]
    );

    const intl = useIntl();
    const messages = useIntlResultStatusMessages(intl);

    const overlayMessage = useMemo(() => {
        switch (dynamicMarginCalculationStatus) {
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
    }, [dynamicMarginCalculationStatus, messages]);
    return (
        <Overlay message={overlayMessage}>
            <ComputationReportViewer reportType={ComputingType.DYNAMIC_MARGIN_CALCULATION} />
        </Overlay>
    );
});

export default DynamicMarginCalculationResultLogs;
