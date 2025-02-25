/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { makeComponents, TYPES } from '../util/make-component-utils';
import ParameterLineDirectoryItemsInput from '../widget/parameter-line-directory-items-input';
import { ElementType } from '@gridsuite/commons-ui';

export const CONTINGENCIES_START_TIME = 'contingenciesStartTime';
export const CONTINGENCIES_LIST_INFOS = 'contingencyListInfos';

const defParams = {
    [CONTINGENCIES_START_TIME]: {
        type: TYPES.FLOAT,
        label: 'DynamicSecurityAnalysisContingenciesStartTime',
    },
};

function ContingencyParameters({ path }: Readonly<{ path: string }>) {
    return (
        <Grid xl={8} container>
            {makeComponents(defParams, path)}
            <ParameterLineDirectoryItemsInput
                name={`${path}.${CONTINGENCIES_LIST_INFOS}`}
                elementType={ElementType.CONTINGENCY_LIST}
                label={'ContingencyListsSelection'}
                hideErrorMessage={true}
            />
        </Grid>
    );
}

export default ContingencyParameters;
