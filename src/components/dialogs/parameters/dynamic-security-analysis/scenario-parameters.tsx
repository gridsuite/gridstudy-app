/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { makeComponents, TYPES } from '../util/make-component-utils';

export const SCENARIO_DURATION = 'scenarioDuration';

const defParams = {
    [SCENARIO_DURATION]: {
        type: TYPES.FLOAT,
        label: 'DynamicSecurityAnalysisScenarioDuration',
    },
};

function ScenarioParameters({ path }: Readonly<{ path: string }>) {
    return (
        <Grid xl={8} container>
            {makeComponents(defParams, path)}
        </Grid>
    );
}

export default ScenarioParameters;
