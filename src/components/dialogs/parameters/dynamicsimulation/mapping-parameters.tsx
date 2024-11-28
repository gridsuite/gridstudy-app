/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../utils/yup-config';
import { Grid } from '@mui/material';
import { DefParam, ParamList, ParamProps, TYPES } from '../util/param-list';
import { useMemo } from 'react';
import { getIdOrSelf } from '../../dialog-utils';
import { AutocompleteInput } from '@gridsuite/commons-ui';
import { MappingInfos } from 'services/study/dynamic-simulation.type';

export const MAPPING = 'mapping';

export const formSchema = yup.object().shape({
    [MAPPING]: yup.string().required(),
});

export const emptyFormData = {
    [MAPPING]: '',
};

interface MappingParametersProps {
    mapping?: {
        mappings?: MappingInfos[];
    };
    path: string;
}

function MappingParameters({ mapping, path }: Readonly<MappingParametersProps>) {
    const { mappings } = mapping ?? {};

    const mappingOptions = useMemo(() => {
        return mappings?.map((elem) => elem.name) ?? [];
    }, [mappings]);

    const defParams: Record<string, DefParam> = {
        [MAPPING]: {
            type: TYPES.ENUM,
            label: 'DynamicSimulationMapping',
            options: mappingOptions,
            render: ({ defParam, path, name }: ParamProps) => {
                return (
                    <AutocompleteInput
                        name={`${path}.${name}`}
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
        <Grid xl={6} container>
            <ParamList defParams={defParams} path={path} />
        </Grid>
    );
}

export default MappingParameters;
