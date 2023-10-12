/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../utils/yup-config';
import { Grid } from '@mui/material';
import { makeComponents } from '../util/make-component-utils';
import { AutocompleteInput } from '@gridsuite/commons-ui';
import { getIdOrSelf } from '../../dialogUtils';

export const MAPPING = 'mapping';

export const formSchema = yup.object().shape({
    [MAPPING]: yup.string().required(),
});

export const emptyFormData = {
    [MAPPING]: '',
};

const MappingParameters = ({ mapping, path }) => {
    const { mappings } = mapping ?? {};

    const defParams = {
        [MAPPING]: {
            label: 'DynamicSimulationMapping',
            values: mappings?.map((elem) => elem.name) ?? [],
            render: (defParam, key) => {
                return (
                    <AutocompleteInput
                        name={`${path}.${key}`}
                        label={''}
                        options={defParam.values}
                        fullWidth
                        size={'small'}
                        getOptionLabel={getIdOrSelf}
                    />
                );
            },
        },
    };

    return <Grid container>{makeComponents(defParams)}</Grid>;
};

export default MappingParameters;
