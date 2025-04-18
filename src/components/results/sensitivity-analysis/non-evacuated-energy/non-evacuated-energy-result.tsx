/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent, useCallback } from 'react';

import { NonEvacuatedEnergyResultProps } from './non-evacuated-energy-result.type';
import { FormattedMessage } from 'react-intl';
import { RunningStatus } from '../../../utils/running-status';
import fileSaver from 'file-saver';
import { Box, Button } from '@mui/material';

const styles = {
    buttonExportResult: {
        display: 'flex',
        position: 'relative',
        marginTop: '10px',
    },
};

export const NonEvacuatedEnergyResult: FunctionComponent<NonEvacuatedEnergyResultProps> = ({ result, status }) => {
    const exportResult = useCallback(() => {
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
                        disabled={!result || status !== RunningStatus.SUCCEED}
                    >
                        <FormattedMessage id="exportResult" />
                    </Button>
                </Box>
            )
        );
    };

    return <>{renderResult()}</>;
};
