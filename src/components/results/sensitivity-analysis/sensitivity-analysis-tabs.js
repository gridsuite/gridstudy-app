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

const SensitivityAnalysisTabs = ({ sensiKindIndex, setSensiKindIndex }) => {
    return (
        <Tabs
            value={sensiKindIndex}
            onChange={(_, newTabIndex) => setSensiKindIndex(newTabIndex)}
        >
            <Tab label={<FormattedMessage id={'SensitivityInDeltaMW'} />} />
            <Tab label={<FormattedMessage id={'SensitivityInDeltaA'} />} />
            <Tab label={<FormattedMessage id={'SensitivityAtNode'} />} />
        </Tabs>
    );
};

SensitivityAnalysisTabs.propTypes = {
    setSensiKindIndex: PropTypes.func.isRequired,
    sensiKindIndex: PropTypes.number.isRequired,
};

export default SensitivityAnalysisTabs;
