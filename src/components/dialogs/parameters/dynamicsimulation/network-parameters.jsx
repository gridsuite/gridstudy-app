/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { makeComponents, TYPES } from '../util/make-component-utils';
import yup from '../../../utils/yup-config';

export const NETWORK = 'network';

const CAPACITOR_NO_RECLOSING_DELAY = 'capacitorNoReclosingDelay';
const DANGLING_LINE_CURRENT_LIMIT_MAX_TIME_OPERATION = 'danglingLineCurrentLimitMaxTimeOperation';
const LINE_CURRENT_LIMIT_MAX_TIME_OPERATION = 'lineCurrentLimitMaxTimeOperation';
const LOAD_TP = 'loadTp';
const LOAD_TQ = 'loadTq';
const LOAD_ALPHA = 'loadAlpha';
const LOAD_ALPHA_LONG = 'loadAlphaLong';
const LOAD_BETA = 'loadBeta';
const LOAD_BETA_LONG = 'loadBetaLong';
const LOAD_IS_CONTROLLABLE = 'loadIsControllable';
const LOAD_IS_RESTORATIVE = 'loadIsRestorative';
const LOAD_Z_PMAX = 'loadZPMax';
const LOAD_Z_QMAX = 'loadZQMax';
const REACTANCE_NO_RECLOSING_DELAY = 'reactanceNoReclosingDelay';
const TRANSFORMER_CURRENT_LIMIT_MAX_TIME_OPERATION = 'transformerCurrentLimitMaxTimeOperation';
const TRANSFORMER_T1_ST_HT = 'transformerT1StHT';
const TRANSFORMER_T1_ST_THT = 'transformerT1StTHT';
const TRANSFORMER_T_NEXT_HT = 'transformerTNextHT';
const TRANSFORMER_T_NEXT_THT = 'transformerTNextTHT';
const TRANSFORMER_TO_LV = 'transformerTolV';

export const formSchema = yup.object().shape({
    [CAPACITOR_NO_RECLOSING_DELAY]: yup.number().required(),
    [DANGLING_LINE_CURRENT_LIMIT_MAX_TIME_OPERATION]: yup.number().required(),
    [LINE_CURRENT_LIMIT_MAX_TIME_OPERATION]: yup.number().required(),
    [LOAD_TP]: yup.number().required(),
    [LOAD_TQ]: yup.number().required(),
    [LOAD_ALPHA]: yup.number().required(),
    [LOAD_ALPHA_LONG]: yup.number().required(),
    [LOAD_BETA]: yup.number().required(),
    [LOAD_BETA_LONG]: yup.number().required(),
    [LOAD_IS_CONTROLLABLE]: yup.boolean(),
    [LOAD_IS_RESTORATIVE]: yup.boolean(),
    [LOAD_Z_PMAX]: yup.number().required(),
    [LOAD_Z_QMAX]: yup.number().required(),
    [REACTANCE_NO_RECLOSING_DELAY]: yup.number().required(),
    [TRANSFORMER_CURRENT_LIMIT_MAX_TIME_OPERATION]: yup.number().required(),
    [TRANSFORMER_T1_ST_HT]: yup.number().required(),
    [TRANSFORMER_T1_ST_THT]: yup.number().required(),
    [TRANSFORMER_T_NEXT_HT]: yup.number().required(),
    [TRANSFORMER_T_NEXT_THT]: yup.number().required(),
    [TRANSFORMER_TO_LV]: yup.number().required(),
});

export const emptyFormData = {
    [CAPACITOR_NO_RECLOSING_DELAY]: 0,
    [DANGLING_LINE_CURRENT_LIMIT_MAX_TIME_OPERATION]: 0,
    [LINE_CURRENT_LIMIT_MAX_TIME_OPERATION]: 0,
    [LOAD_TP]: 0,
    [LOAD_TQ]: 0,
    [LOAD_ALPHA]: 0,
    [LOAD_ALPHA_LONG]: 0,
    [LOAD_BETA]: 0,
    [LOAD_BETA_LONG]: 0,
    [LOAD_IS_CONTROLLABLE]: false,
    [LOAD_IS_RESTORATIVE]: false,
    [LOAD_Z_PMAX]: 0,
    [LOAD_Z_QMAX]: 0,
    [REACTANCE_NO_RECLOSING_DELAY]: 0,
    [TRANSFORMER_CURRENT_LIMIT_MAX_TIME_OPERATION]: 0,
    [TRANSFORMER_T1_ST_HT]: 0,
    [TRANSFORMER_T1_ST_THT]: 0,
    [TRANSFORMER_T_NEXT_HT]: 0,
    [TRANSFORMER_T_NEXT_THT]: 0,
    [TRANSFORMER_TO_LV]: 0,
};

const defParams = {
    [CAPACITOR_NO_RECLOSING_DELAY]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkCapacitorNoReclosingDelay',
    },
    [DANGLING_LINE_CURRENT_LIMIT_MAX_TIME_OPERATION]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkDanglingLineCurrentLimitMaxTimeOperation',
    },
    [LINE_CURRENT_LIMIT_MAX_TIME_OPERATION]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkLineCurrentLimitMaxTimeOperation',
    },
    [LOAD_TP]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkLoadTp',
    },
    [LOAD_TQ]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkLoadTq',
    },
    [LOAD_ALPHA]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkLoadAlpha',
    },
    [LOAD_ALPHA_LONG]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkLoadAlphaLong',
    },
    [LOAD_BETA]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkLoadBeta',
    },
    [LOAD_BETA_LONG]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkLoadBetaLong',
    },
    [LOAD_IS_CONTROLLABLE]: {
        type: TYPES.BOOL,
        label: 'DynamicSimulationNetworkLoadIsControllable',
    },
    [LOAD_IS_RESTORATIVE]: {
        type: TYPES.BOOL,
        label: 'DynamicSimulationNetworkLoadIsRestorative',
    },
    [LOAD_Z_PMAX]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkLoadZPMax',
    },
    [LOAD_Z_QMAX]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkLoadZQMax',
    },
    [REACTANCE_NO_RECLOSING_DELAY]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkReactanceNoReclosingDelay',
    },
    [TRANSFORMER_CURRENT_LIMIT_MAX_TIME_OPERATION]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkTransformerCurrentLimitMaxTimeOperation',
    },
    [TRANSFORMER_T1_ST_HT]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkTransformerT1StHT',
    },
    [TRANSFORMER_T1_ST_THT]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkTransformerT1StTHT',
    },
    [TRANSFORMER_T_NEXT_HT]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkTransformerTNextHT',
    },
    [TRANSFORMER_T_NEXT_THT]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkTransformerTNextTHT',
    },
    [TRANSFORMER_TO_LV]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationNetworkTransformerTolV',
    },
};

const NetworkParameters = ({ path }) => {
    return (
        <Grid sx={{ height: '100%' }} xl={6} container>
            {makeComponents(defParams, path)}
        </Grid>
    );
};

export default NetworkParameters;
