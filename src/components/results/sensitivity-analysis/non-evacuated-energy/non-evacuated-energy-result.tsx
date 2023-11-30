/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { FunctionComponent } from 'react';

import { useSelector } from 'react-redux';
import { ReduxState } from '../../../../redux/reducer.type';
import { NonEvacuatedEnergyResultProps } from './non-evacuated-energy-result.type';
import ReactJson from 'react-json-view';
import { PARAM_THEME } from '../../../../utils/config-params';
import { LIGHT_THEME } from '@gridsuite/commons-ui';
import Paper from '@mui/material/Paper';

const styles = {
    nonEvacuatedEnergyResult: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        overflowY: 'auto',
        margin: 1,
    },
};

export const NonEvacuatedEnergyResult: FunctionComponent<
    NonEvacuatedEnergyResultProps
> = ({ result, studyUuid, nodeUuid, isWaiting }) => {
    const theme = useSelector((state: ReduxState) => state[PARAM_THEME]);

    const renderResult = () => {
        return (
            result && (
                <Paper sx={styles.nonEvacuatedEnergyResult}>
                    <ReactJson
                        src={result}
                        onEdit={false}
                        onAdd={false}
                        onDelete={false}
                        theme={
                            theme === LIGHT_THEME ? 'rjv-default' : 'monokai'
                        }
                    />
                </Paper>
            )
        );
    };

    return <>{renderResult()}</>;
};
