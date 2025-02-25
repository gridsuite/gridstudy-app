/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { DefParam, makeComponents, TYPES } from '../util/make-component-utils';
import { FunctionComponent, useMemo } from 'react';
import { getIdOrSelf } from '../../dialog-utils';
import { AutocompleteInput } from '@gridsuite/commons-ui';
import { MappingInfos } from 'services/study/dynamic-simulation.type';
import { MAPPING } from './dynamic-simulation-utils';

interface MappingParametersProps {
    mapping?: {
        mappings?: MappingInfos[];
    };
    path: string;
}

const MappingParameters: FunctionComponent<MappingParametersProps> = ({ mapping, path }) => {
    const { mappings } = mapping ?? {};

    const mappingOptions = useMemo(() => {
        return mappings?.map((elem) => elem.name) ?? [];
    }, [mappings]);

    const defParams: Record<string, DefParam> = {
        [MAPPING]: {
            type: TYPES.ENUM,
            label: 'DynamicSimulationMapping',
            options: mappingOptions,
            render: (defParam, path, key) => {
                return (
                    <AutocompleteInput
                        name={`${path}.${key}`}
                        label={''}
                        options={defParam.options ?? []}
                        fullWidth
                        size={'small'}
                        getOptionLabel={getIdOrSelf}
                    />
                );
            },
        },
    };

    return (
        <Grid xl={8} container>
            {makeComponents(defParams, path)}
        </Grid>
    );
};

export default MappingParameters;
