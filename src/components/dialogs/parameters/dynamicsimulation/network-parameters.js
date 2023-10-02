/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { Grid } from '@mui/material';
import { makeComponentsFor, TYPES } from '../util/make-component-utils';
import yup from '../../../utils/yup-config';

const NetworkParameters = ({ network, onUpdateNetwork }) => {
    const handleUpdateNetwork = useCallback(
        (newNetwork) => {
            onUpdateNetwork(newNetwork);
        },
        [onUpdateNetwork]
    );

    const defParams = {
        capacitorNoReclosingDelay: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkCapacitorNoReclosingDelay',
            validator: yup.number().required(),
        },
        danglingLineCurrentLimitMaxTimeOperation: {
            type: TYPES.float,
            description:
                'DynamicSimulationNetworkDanglingLineCurrentLimitMaxTimeOperation',
            validator: yup.number().required(),
        },
        lineCurrentLimitMaxTimeOperation: {
            type: TYPES.float,
            description:
                'DynamicSimulationNetworkLineCurrentLimitMaxTimeOperation',
            validator: yup.number().required(),
        },
        loadTp: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkLoadTp',
            validator: yup.number().required(),
        },
        loadTq: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkLoadTq',
            validator: yup.number().required(),
        },
        loadAlpha: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkLoadAlpha',
            validator: yup.number().required(),
        },
        loadAlphaLong: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkLoadAlphaLong',
            validator: yup.number().required(),
        },
        loadBeta: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkLoadBeta',
            validator: yup.number().required(),
        },
        loadBetaLong: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkLoadBetaLong',
            validator: yup.number().required(),
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
            validator: yup.number().required(),
        },
        loadZQMax: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkLoadZQMax',
            validator: yup.number().required(),
        },
        reactanceNoReclosingDelay: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkReactanceNoReclosingDelay',
            validator: yup.number().required(),
        },
        transformerCurrentLimitMaxTimeOperation: {
            type: TYPES.float,
            description:
                'DynamicSimulationNetworkTransformerCurrentLimitMaxTimeOperation',
            validator: yup.number().required(),
        },
        transformerT1StHT: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkTransformerT1StHT',
            validator: yup.number().required(),
        },
        transformerT1StTHT: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkTransformerT1StTHT',
            validator: yup.number().required(),
        },
        transformerTNextHT: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkTransformerTNextHT',
            validator: yup.number().required(),
        },
        transformerTNextTHT: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkTransformerTNextTHT',
            validator: yup.number().required(),
        },
        transformerTolV: {
            type: TYPES.float,
            description: 'DynamicSimulationNetworkTransformerTolV',
            validator: yup.number().required(),
        },
    };

    return (
        network && (
            <Grid container>
                {makeComponentsFor(defParams, network, handleUpdateNetwork)}
            </Grid>
        )
    );
};

export default NetworkParameters;
