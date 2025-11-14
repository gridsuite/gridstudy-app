/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Divider } from '@mui/material';
import { FieldConstants, FlatParameters, Parameter } from '@gridsuite/commons-ui';
import { useMemo, useState } from 'react';
import { useController, useWatch } from 'react-hook-form';
import AdvancedParameterButton from './advanced-parameters-button';

// FIXME: To be removed when gridsuite supports subnetworks.
const IGNORED_PARAMS = ['iidm.import.cgmes.cgm-with-subnetworks', 'iidm.import.cgmes.cgm-with-subnetworks-defined-by'];

export default function ImportParametersSection() {
    const [isParamsDisplayed, setIsParamsDisplayed] = useState(false);

    const {
        field: { onChange, value: currentParameters },
    } = useController({
        name: FieldConstants.CURRENT_PARAMETERS,
    });

    const formatWithParameters = useWatch({
        name: FieldConstants.FORMATTED_CASE_PARAMETERS,
    });

    const handleParamsChange = (paramName: string, value: unknown, isEdit: boolean): void => {
        if (!isEdit) {
            onChange({
                ...currentParameters,
                ...{ [paramName]: value },
            });
        }
    };

    const handleShowParametersClick = () => {
        setIsParamsDisplayed((prevIsParamsDisplayed) => !prevIsParamsDisplayed);
    };

    const filteredParams = useMemo(
        () =>
            formatWithParameters.filter(
                (param: Parameter) => !IGNORED_PARAMS || IGNORED_PARAMS.indexOf(param.name) === -1
            ),
        [formatWithParameters]
    );

    return (
        <>
            <Divider sx={{ marginTop: '20px' }} />
            <Box
                sx={{
                    marginTop: '10px',
                }}
            >
                <AdvancedParameterButton
                    showOpenIcon={isParamsDisplayed}
                    label="importParameters"
                    onClick={handleShowParametersClick}
                    disabled={formatWithParameters.length === 0}
                />
                {isParamsDisplayed && (
                    <FlatParameters
                        paramsAsArray={filteredParams}
                        initValues={currentParameters}
                        onChange={handleParamsChange}
                        variant="standard"
                        selectionWithDialog={(param: Parameter) => param.possibleValues?.length > 10}
                    />
                )}
            </Box>
        </>
    );
}
