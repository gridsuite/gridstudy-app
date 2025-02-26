/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl/lib';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { PARAM_DEVELOPER_MODE } from '../../../utils/config-params';
import {
    COMPUTATION_RESULTS_LOGS,
    SENSITIVITY_AT_NODE,
    SENSITIVITY_IN_DELTA_A,
    SENSITIVITY_IN_DELTA_MW,
} from './sensitivity-analysis-result-utils';
import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';

const SensitivityAnalysisTabs = ({ sensiKind, setSensiKind }) => {
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const sensiKindTabs = [
        SENSITIVITY_IN_DELTA_MW,
        SENSITIVITY_IN_DELTA_A,
        ...((enableDeveloperMode && [SENSITIVITY_AT_NODE]) || []),
        COMPUTATION_RESULTS_LOGS,
    ];

    return (
        <Tabs
            value={sensiKindTabs.indexOf(sensiKind)}
            onChange={(_, newTabIndex) => setSensiKind(sensiKindTabs[newTabIndex])}
        >
            {sensiKindTabs.map((sensiKind) => (
                <Tab label={<FormattedMessage id={sensiKind} />} key={sensiKind} />
            ))}
        </Tabs>
    );
};

SensitivityAnalysisTabs.propTypes = {
    setSensiKind: PropTypes.func.isRequired,
    sensiKind: PropTypes.string.isRequired,
};

export default SensitivityAnalysisTabs;
