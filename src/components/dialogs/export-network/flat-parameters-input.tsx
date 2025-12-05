/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo, useState } from 'react';
import { useController } from 'react-hook-form';
import { FlatParameters, Parameter } from '@gridsuite/commons-ui';
import { IGNORED_PARAMS } from '../root-network/ignored-params';
import { Collapse, IconButton, Stack, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface FlatParametersInputProps {
    name: string;
    parameters?: Parameter[];
}

export function FlatParametersInput({ name, parameters }: Readonly<FlatParametersInputProps>) {
    const [unfolded, setUnfolded] = useState(false);

    const {
        field: { onChange, value },
    } = useController({ name });

    const handleChange = useCallback(
        (paramName: string, newValue: unknown, isInEdition: boolean) => {
            if (!isInEdition) {
                const updatedParams = { ...value, [paramName]: newValue };
                onChange(updatedParams);
            }
        },
        [onChange, value]
    );

    const handleFoldChange = () => {
        setUnfolded((prev) => !prev);
    };

    const filteredParameters: Parameter[] = useMemo(() => {
        return parameters ? parameters.filter((param: Parameter) => !IGNORED_PARAMS.includes(param.name)) : [];
    }, [parameters]);

    const hasParameters = filteredParameters.length > 0;

    return (
        <>
            <Collapse in={unfolded}>
                <FlatParameters
                    paramsAsArray={filteredParameters}
                    initValues={value}
                    onChange={handleChange}
                    variant="standard"
                    selectionWithDialog={(param) => param?.possibleValues?.length > 10}
                />
            </Collapse>

            <Stack marginTop="0.7em" direction="row" justifyContent="space-between" alignItems="center">
                <Typography
                    component="span"
                    color={hasParameters ? 'text.main' : 'text.disabled'}
                    sx={{ fontWeight: 'bold' }}
                >
                    <FormattedMessage id="parameters" />
                </Typography>
                <IconButton onClick={handleFoldChange} disabled={!hasParameters}>
                    {unfolded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Stack>
        </>
    );
}
