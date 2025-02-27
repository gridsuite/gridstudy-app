/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { makeComponents, TYPES } from '../util/make-component-utils';
import { NetworkEnum } from './dynamic-simulation-utils';

const defParams = {
    [NetworkEnum.CAPACITOR_NO_RECLOSING_DELAY]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkCapacitorNoReclosingDelay',
    },
    [NetworkEnum.DANGLING_LINE_CURRENT_LIMIT_MAX_TIME_OPERATION]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkDanglingLineCurrentLimitMaxTimeOperation',
    },
    [NetworkEnum.LINE_CURRENT_LIMIT_MAX_TIME_OPERATION]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkLineCurrentLimitMaxTimeOperation',
    },
    [NetworkEnum.LOAD_TP]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkLoadTp',
    },
    [NetworkEnum.LOAD_TQ]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkLoadTq',
    },
    [NetworkEnum.LOAD_ALPHA]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkLoadAlpha',
    },
    [NetworkEnum.LOAD_ALPHA_LONG]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkLoadAlphaLong',
    },
    [NetworkEnum.LOAD_BETA]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkLoadBeta',
    },
    [NetworkEnum.LOAD_BETA_LONG]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkLoadBetaLong',
    },
    [NetworkEnum.LOAD_IS_CONTROLLABLE]: {
        type: TYPES.BOOL,
        label: 'DynamicSimulationNetworkLoadIsControllable',
    },
    [NetworkEnum.LOAD_IS_RESTORATIVE]: {
        type: TYPES.BOOL,
        label: 'DynamicSimulationNetworkLoadIsRestorative',
    },
    [NetworkEnum.LOAD_Z_PMAX]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkLoadZPMax',
    },
    [NetworkEnum.LOAD_Z_QMAX]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkLoadZQMax',
    },
    [NetworkEnum.REACTANCE_NO_RECLOSING_DELAY]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkReactanceNoReclosingDelay',
    },
    [NetworkEnum.TRANSFORMER_CURRENT_LIMIT_MAX_TIME_OPERATION]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkTransformerCurrentLimitMaxTimeOperation',
    },
    [NetworkEnum.TRANSFORMER_T1_ST_HT]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkTransformerT1StHT',
    },
    [NetworkEnum.TRANSFORMER_T1_ST_THT]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkTransformerT1StTHT',
    },
    [NetworkEnum.TRANSFORMER_T_NEXT_HT]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkTransformerTNextHT',
    },
    [NetworkEnum.TRANSFORMER_T_NEXT_THT]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkTransformerTNextTHT',
    },
    [NetworkEnum.TRANSFORMER_TO_LV]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkTransformerTolV',
    },
};

const NetworkParameters = ({ path }: { path: string }) => {
    return (
        <Grid sx={{ height: '100%' }} xl={8} container>
            {makeComponents(defParams, path)}
        </Grid>
    );
};

export default NetworkParameters;
