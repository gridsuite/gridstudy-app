/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Typography } from '@mui/material';
import { makeComponentsFor, TYPES } from '../util/make-component-utils';
import { useCallback } from 'react';

const MappingParameters = ({ mapping, onUpdateMapping }) => {
    const { mappings } = mapping;

    const handleUpdateMapping = useCallback(
        (newMapping) => {
            onUpdateMapping(newMapping);
        },
        [onUpdateMapping]
    );

    const defParams = {
        mapping: {
            type: TYPES.enum,
            description: 'DynamicSimulationMapping',
            values: mappings.reduce((obj, curr) => {
                obj[curr.name] = curr.name;
                return obj;
            }, {}),
            renderValue: (value) => value,
        },
    };

    return (
        <Grid container>
            <Typography>{`Mapping: ${JSON.stringify(mapping)}`}</Typography>
            {makeComponentsFor(defParams, mapping, handleUpdateMapping)}
        </Grid>
    );
};

export default MappingParameters;
