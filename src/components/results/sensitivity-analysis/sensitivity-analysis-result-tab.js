/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SensitivityAnalysisTabs from './sensitivity-analysis-tabs';
import PagedSensitivityResult from './paged-sensitivity-analysis-result';

const SensitivityAnalysisResultTab = ({ studyUuid, nodeUuid }) => {
    const [nOrNkIndex, setNOrNkIndex] = useState(0);
    const [sensiKindIndex, setSensiKindIndex] = useState(0);

    return (
        <>
            <SensitivityAnalysisTabs
                sensiKindIndex={sensiKindIndex}
                setSensiKindIndex={setSensiKindIndex}
            />
            <Tabs
                value={nOrNkIndex}
                onChange={(_, newTabIndex) => setNOrNkIndex(newTabIndex)}
            >
                <Tab label="N" />
                <Tab label="N-K" />
            </Tabs>
            <PagedSensitivityResult
                nOrNkIndex={nOrNkIndex}
                sensiKindIndex={sensiKindIndex}
                studyUuid={studyUuid}
                nodeUuid={nodeUuid}
            />
        </>
    );
};

SensitivityAnalysisResultTab.propTypes = {
    studyUuid: PropTypes.string.isRequired,
    nodeUuid: PropTypes.string.isRequired,
};

export default SensitivityAnalysisResultTab;
