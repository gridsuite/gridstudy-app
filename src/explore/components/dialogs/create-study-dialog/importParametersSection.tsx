/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Divider } from '@mui/material';
import { FlatParameters } from '@gridsuite/commons-ui';
import React, { useState, FunctionComponent } from 'react';
import AdvancedParameterButton from './advancedParameterButton';
import {
    CURRENT_PARAMETERS,
    FORMATTED_CASE_PARAMETERS,
} from '../../utils/field-constants';
import { useController, useWatch } from 'react-hook-form';
import Box from '@mui/material/Box';

const ImportParametersSection: FunctionComponent = () => {
    const [isParamsDisplayed, setIsParamsDisplayed] = useState(false);

    const {
        field: { onChange, value: currentParameters },
    } = useController({
        name: CURRENT_PARAMETERS,
    });

    const formatWithParameters = useWatch({
        name: FORMATTED_CASE_PARAMETERS,
    });

    const handleParamsChange = (
        paramName: string,
        value: string | string[] | boolean,
        isEdit: boolean
    ): void => {
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
                    label={'importParameters'}
                    onClick={handleShowParametersClick}
                    disabled={formatWithParameters.length === 0}
                />
                {isParamsDisplayed && (
                    <FlatParameters
                        paramsAsArray={formatWithParameters}
                        initValues={currentParameters}
                        onChange={handleParamsChange}
                        variant="standard"
                        selectionWithDialog={(param) => {
                            if (param.possibleValues) {
                                return param.possibleValues.length > 10;
                            } else {
                                return false;
                            }
                        }}
                    />
                )}
            </Box>
        </>
    );
};

export default ImportParametersSection;
