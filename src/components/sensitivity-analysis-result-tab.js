/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useNodeData } from './study-container';
import {
    fetchSensitivityAnalysisResultTabbed,
    fetchSensitivityAnalysisResult,
} from '../utils/rest-api';
import WaitingLoader from './util/waiting-loader';
import SensitivityAnalysisResult from './sensitivity-analysis-result';
import React, { useCallback, useEffect, useState } from 'react';
import ReactJson from 'react-json-view';
import { LIGHT_THEME } from '@gridsuite/commons-ui';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useSelector } from 'react-redux';
import { PARAM_THEME } from '../utils/config-params';
import { FormattedMessage } from 'react-intl/lib';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
    jsonResult: {
        overflowY: 'auto',
        maxHeight: '60rem',
        lineHeight: 'normal',
    },
}));

const sensitivityAnalysisResultInvalidations = ['sensitivityAnalysisResult'];

export const FUNCTION_TYPES = [
    'BRANCH_ACTIVE_POWER_1',
    'BRANCH_CURRENT_1',
    'BUS_VOLTAGE',
];

export const SensitivityAnalysisResultTab = ({ studyUuid, nodeUuid }) => {
    const selectedTheme = useSelector((state) => state[PARAM_THEME]);

    const [nOrNkIndex, setNOrNkIndex] = useState(0);
    const [sensiKindIndex, setSensiKindIndex] = useState(0);

    const fetcher = useCallback(
        (studyUuid, nodeUuid) => {
            console.log('wanna fetch', nOrNkIndex, sensiKindIndex);
            if (nOrNkIndex === 0)
                return fetchSensitivityAnalysisResult(studyUuid, nodeUuid);
            else
                return fetchSensitivityAnalysisResultTabbed(
                    studyUuid,
                    nodeUuid,
                    {
                        isJustBefore: nOrNkIndex === 1,
                        functionType: FUNCTION_TYPES.at(sensiKindIndex),
                    }
                );
        },
        [nOrNkIndex, sensiKindIndex]
    );

    useEffect(() => {
        console.log('fetcher changed');
    }, [fetcher]);

    const [fetched, isWaiting] = useNodeData(
        studyUuid,
        nodeUuid,
        fetcher,
        sensitivityAnalysisResultInvalidations
    );

    console.log('about to show fetched', nOrNkIndex, fetched);

    return (
        <>
            <Tabs
                value={nOrNkIndex}
                onChange={(event, newTabIndex) => setNOrNkIndex(newTabIndex)}
            >
                <Tab label="all json" />
                <Tab label="N" />
                <Tab label="N-K" />
            </Tabs>
            {nOrNkIndex > 0 && (
                <SensibilityTabs
                    sensiKindIndex={sensiKindIndex}
                    setSensiKindIndex={setSensiKindIndex}
                />
            )}
            <WaitingLoader message={'LoadingRemoteData'} loading={isWaiting}>
                {nOrNkIndex === 0 && (
                    <JsonTree fetched={fetched} selectedTheme={selectedTheme} />
                )}
                {nOrNkIndex > 0 && Array.isArray(fetched) && (
                    <SensitivityAnalysisResult
                        result={fetched}
                        nOrNkIndex={nOrNkIndex}
                        sensiToIndex={sensiKindIndex}
                    />
                )}
            </WaitingLoader>
        </>
    );
};

function JsonTree(result, selectedTheme) {
    const classes = useStyles();
    return (
        <div className={classes.jsonResult}>
            <ReactJson
                src={result}
                onEdit={false}
                onAdd={false}
                onDelete={false}
                theme={
                    selectedTheme === LIGHT_THEME ? 'rjv-default' : 'monokai'
                }
            />
        </div>
    );
}

function SensibilityTabs({ sensiKindIndex, setSensiKindIndex }) {
    return (
        <Tabs
            value={sensiKindIndex}
            onChange={(event, newTabIndex) => setSensiKindIndex(newTabIndex)}
        >
            <Tab label={<FormattedMessage id={'SensitivityInDeltaMW'} />} />
            <Tab label={<FormattedMessage id={'SensitivityInDeltaA'} />} />
            <Tab label={<FormattedMessage id={'SensitivityAtNode'} />} />
        </Tabs>
    );
}
