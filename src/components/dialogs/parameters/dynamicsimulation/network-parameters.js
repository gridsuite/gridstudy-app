/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useMemo } from 'react';
import { debounce, Grid } from '@mui/material';
import { makeComponentsFor, TYPES } from '../util/make-component-utils';

const NetworkParameters = ({ network, onUpdateNetwork }) => {
    const handleUpdateNetwork = useCallback(
        (newNetwork) => {
            onUpdateNetwork({ newNetwork });
        },
        [onUpdateNetwork]
    );

    const delayedHandleUpdateNetwork = useMemo(
        () => debounce(handleUpdateNetwork, 500),
        [handleUpdateNetwork]
    );

    const defParams = {
        capacitorNoReclosingDelay: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkCapacitorNoReclosingDelay',
        },
        danglingLineCurrentLimitMaxTimeOperation: {
            type: TYPES.float,
            description:
                'DynamicSimulationNetworkDanglingLineCurrentLimitMaxTimeOperation',
        },
        lineCurrentLimitMaxTimeOperation: {
            type: TYPES.float,
            description:
                'DynamicSimulationNetworkLineCurrentLimitMaxTimeOperation',
        },
        loadTp: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkLoadTp',
        },
        loadTq: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkLoadTq',
        },
        loadAlpha: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkLoadAlpha',
        },
        loadAlphaLong: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkLoadAlphaLong',
        },
        loadBeta: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkLoadBeta',
        },
        loadBetaLong: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkLoadBetaLong',
        },
        loadIsControllable: {
            type: TYPES.bool,
            description: 'DynamicSimulationNetworkLoadIsControllable',
        },
        loadIsRestorative: {
            type: TYPES.bool,
            description: 'DynamicSimulationNetworkLoadIsRestorative',
        },
        loadZPMax: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkLoadZPMax',
        },
        loadZQMax: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkLoadZQMax',
        },
        reactanceNoReclosingDelay: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkReactanceNoReclosingDelay',
        },
        transformerCurrentLimitMaxTimeOperation: {
            type: TYPES.float,
            description:
                'DynamicSimulationNetworkTransformerCurrentLimitMaxTimeOperation',
        },
        transformerT1StHT: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkTransformerT1StHT',
        },
        transformerT1StTHT: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkTransformerT1StTHT',
        },
        transformerTNextHT: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkTransformerTNextHT',
        },
        transformerTNextTHT: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkTransformerTNextTHT',
        },
        transformerTolV: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkTransformerTolV',
        },
    };

    return (
        network && (
            <Grid container>
                {makeComponentsFor(
                    defParams,
                    network,
                    delayedHandleUpdateNetwork
                )}
            </Grid>
        )
    );
};

export default NetworkParameters;
