/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl/lib';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { PARAM_DEVELOPER_MODE } from '../../../utils/config-params';
import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';
import {
    COMPUTATION_RESULTS_LOGS,
    SensiTab,
    SENSITIVITY_AT_NODE,
    SENSITIVITY_IN_DELTA_A,
    SENSITIVITY_IN_DELTA_MW,
} from './sensitivity-analysis-result.type';

export type SensitivityAnalysisTabsProps = {
    sensiTab: SensiTab;
    setSensiTab: (sensiTab: SensiTab) => void;
};
function SensitivityAnalysisTabs({ sensiTab, setSensiTab }: Readonly<SensitivityAnalysisTabsProps>) {
    const [isDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const sensiTabs = [
        SENSITIVITY_IN_DELTA_MW,
        SENSITIVITY_IN_DELTA_A,
        ...((isDeveloperMode && ([SENSITIVITY_AT_NODE] as const satisfies Partial<SensiTab>[])) || []),
        COMPUTATION_RESULTS_LOGS,
    ] as const satisfies Partial<SensiTab>[];

    return (
        <Tabs value={sensiTab} onChange={(_, newSensiTab) => setSensiTab(newSensiTab)}>
            {sensiTabs.map((sensiTab) => (
                <Tab label={<FormattedMessage id={sensiTab} />} value={sensiTab} key={sensiTab} />
            ))}
        </Tabs>
    );
}

export default SensitivityAnalysisTabs;
