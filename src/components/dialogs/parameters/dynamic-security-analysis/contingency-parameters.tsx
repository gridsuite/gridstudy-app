/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../utils/yup-config';
import { Grid } from '@mui/material';
import { makeComponents, TYPES } from '../util/make-component-utils';
import ParameterLineDirectoryItemsInput from '../widget/parameter-line-directory-items-input';
import { ElementType, NAME } from '@gridsuite/commons-ui';
import { ID } from '../../../utils/field-constants';

export const CONTINGENCIES_START_TIME = 'contingenciesStartTime';
export const CONTINGENCIES_LIST_INFOS = 'contingencyListInfos';

export const formSchema = yup.object().shape({
    [CONTINGENCIES_START_TIME]: yup.number().required().nonNullable(),
    [CONTINGENCIES_LIST_INFOS]: yup
        .array()
        .of(
            yup.object().shape({
                [ID]: yup.string().required(),
                [NAME]: yup.string().required(),
            })
        )
        .required(),
});

export const emptyFormData = {
    [CONTINGENCIES_START_TIME]: 0,
    [CONTINGENCIES_LIST_INFOS]: [],
};

const defParams = {
    [CONTINGENCIES_START_TIME]: {
        type: TYPES.FLOAT,
        label: 'DynamicSecurityAnalysisContingenciesStartTime',
    },
};

function ContingencyParameters({ path }: { path: string }) {
    return (
        <Grid xl={6} container>
            {makeComponents(defParams, path)}
            <ParameterLineDirectoryItemsInput
                name={`${path}.${CONTINGENCIES_LIST_INFOS}`}
                elementType={ElementType.CONTINGENCY_LIST}
                label={'ContingencyListsSelection'}
                hideErrorMessage
            />
        </Grid>
    );
}

export default ContingencyParameters;
