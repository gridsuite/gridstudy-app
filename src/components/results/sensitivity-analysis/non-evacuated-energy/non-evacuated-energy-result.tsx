/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { FunctionComponent, useCallback } from 'react';

import { NonEvacuatedEnergyResultProps } from './non-evacuated-energy-result.type';
import Button from '@mui/material/Button';
import { Box } from '@mui/system';
import { FormattedMessage } from 'react-intl';

const styles = {
    buttonExportResult: {
        display: 'flex',
        position: 'relative',
    },
};

export const NonEvacuatedEnergyResult: FunctionComponent<
    NonEvacuatedEnergyResultProps
> = ({ result, studyUuid, nodeUuid, isWaiting }) => {
    const exportResult = useCallback(() => {
        const fileSaver = require('file-saver');
        const blob = new Blob([JSON.stringify(result, null, 2)], {
            type: 'application/json',
        });
        fileSaver.saveAs(blob, 'non_evacuated_energy_result.json');
    }, [result]);

    const renderResult = () => {
        return (
            result && (
                <Box sx={styles.buttonExportResult}>
                    <Button
                        variant="outlined"
                        onClick={exportResult}
                        disabled={!result}
                    >
                        <FormattedMessage id="exportResult" />
                    </Button>
                </Box>
            )
        );
    };

    return <>{renderResult()}</>;
};
