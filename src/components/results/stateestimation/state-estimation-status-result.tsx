/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent } from 'react';

import { Stack, Typography } from '@mui/material';

import { StateEstimationResultStatusProps } from './state-estimation-result.type';

import { FormattedMessage } from 'react-intl';

const styles = {
    typography: {
        fontWeight: 'bold',
    },
    valueTypography: {
        marginLeft: '10px',
    },
};

export const StateEstimationStatusResult: FunctionComponent<StateEstimationResultStatusProps> = ({ result }) => {
    const renderStateEstimationStatusResult = () => {
        return (
            <>
                {result.hasOwnProperty('status') && (
                    <Stack direction={'row'} gap={1} marginBottom={2} marginTop={1.5} marginLeft={2}>
                        <Typography sx={styles.typography}>
                            <FormattedMessage id="StateEstimationStatus" />
                        </Typography>
                        <Typography sx={styles.valueTypography}>{result.status}</Typography>
                    </Stack>
                )}

                {result.hasOwnProperty('qualityLevel') && (
                    <Stack direction={'row'} gap={1} marginBottom={2} marginTop={1.5} marginLeft={2}>
                        <Typography sx={styles.typography}>
                            <FormattedMessage id="StateEstimationQuality" />
                        </Typography>
                        <Typography sx={styles.valueTypography}>{result.qualityLevel}</Typography>
                    </Stack>
                )}
            </>
        );
    };

    return renderStateEstimationStatusResult();
};
