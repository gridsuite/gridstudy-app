/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FlatParameters } from '@gridsuite/commons-ui';
import { FunctionComponent, useCallback, useState } from 'react';
import { AdvancedParameterButton } from './advanced-parameter-button';
import { CaseImportParameters } from 'services/network-conversion';
import { Box, Divider, Theme } from '@mui/material';
import { Parameter } from '@gridsuite/commons-ui/dist/components/FlatParameters/FlatParameters';

export interface ImportParametersProps {
    formatWithParameters: CaseImportParameters[];
    currentParameters: Record<string, any>;
    onChange: (paramName: string, value: any, isEdit: boolean) => void;
}

const styles = {
    paramDivider: (theme: Theme) => ({
        marginTop: theme.spacing(2),
    }),
};

export const ImportParameters: FunctionComponent<ImportParametersProps> = (
    props
) => {
    const { formatWithParameters, onChange, currentParameters } = props;

    const [areParamsDisplayed, setAreParamsDisplayed] = useState(false);

    const handleShowParametersForCaseFileClick = useCallback(() => {
        setAreParamsDisplayed((oldValue) => !oldValue);
    }, []);

    return (
        <>
            <Divider sx={styles.paramDivider} />
            <Box
                sx={{
                    marginTop: '10px',
                }}
            >
                <AdvancedParameterButton
                    showOpenIcon={areParamsDisplayed}
                    label={'importParameters'}
                    callback={handleShowParametersForCaseFileClick}
                    disabled={formatWithParameters.length === 0}
                />
                {areParamsDisplayed && (
                    <FlatParameters
                        paramsAsArray={formatWithParameters as Parameter[]}
                        initValues={currentParameters}
                        onChange={onChange}
                        variant="standard"
                    />
                )}
            </Box>
        </>
    );
};
