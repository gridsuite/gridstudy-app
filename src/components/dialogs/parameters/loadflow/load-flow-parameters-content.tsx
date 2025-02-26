/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { mergeSx } from '@gridsuite/commons-ui';
import { Box, Grid } from '@mui/material';
import { TabPanel } from '../parameters';
import { TAB_VALUES } from './load-flow-parameters-utils';
import LoadFlowGeneralParameters from './load-flow-general-parameters';
import LimitReductionsTableForm from '../common/limitreductions/limit-reductions-table-form';
import ParameterLineSlider from '../widget/parameter-line-slider';
import { PARAM_LIMIT_REDUCTION, PARAM_PROVIDER_OPENLOADFLOW } from 'utils/config-params';
import {
    alertThresholdMarks,
    MAX_VALUE_ALLOWED_FOR_LIMIT_REDUCTION,
    MIN_VALUE_ALLOWED_FOR_LIMIT_REDUCTION,
} from './constants';
import { ILimitReductionsByVoltageLevel } from '../common/limitreductions/columns-definitions';
import { LoadFlowParametersInfos } from 'services/study/loadflow.type';
import { SpecificParameterInfos } from '../parameters.type';
import { styles } from '../parameters-style';

const LoadFlowParametersContent = ({
    selectedTab,
    currentProvider,
    specificParameters,
    params,
    defaultLimitReductions,
}: {
    selectedTab: TAB_VALUES;
    currentProvider: string;
    specificParameters: SpecificParameterInfos[];
    params: LoadFlowParametersInfos | null;
    defaultLimitReductions: ILimitReductionsByVoltageLevel[];
}) => {
    return (
        <Box
            sx={{
                flexGrow: 1,
                overflow: 'auto',
                paddingLeft: 1,
            }}
        >
            <Grid
                container
                sx={mergeSx(styles.scrollableGrid, {
                    maxHeight: '100%',
                })}
            >
                <Grid item sx={{ width: '100%' }}>
                    <TabPanel value={selectedTab} index={TAB_VALUES.GENERAL}>
                        <LoadFlowGeneralParameters provider={currentProvider} specificParams={specificParameters} />
                    </TabPanel>
                    <TabPanel value={selectedTab} index={TAB_VALUES.LIMIT_REDUCTIONS}>
                        <Grid container sx={{ width: '100%' }}>
                            {currentProvider === PARAM_PROVIDER_OPENLOADFLOW ? (
                                <LimitReductionsTableForm limits={params?.limitReductions ?? defaultLimitReductions} />
                            ) : (
                                <ParameterLineSlider
                                    paramNameId={PARAM_LIMIT_REDUCTION}
                                    label="LimitReduction"
                                    marks={alertThresholdMarks}
                                    minValue={MIN_VALUE_ALLOWED_FOR_LIMIT_REDUCTION}
                                    maxValue={MAX_VALUE_ALLOWED_FOR_LIMIT_REDUCTION}
                                />
                            )}
                        </Grid>
                    </TabPanel>
                </Grid>
            </Grid>
        </Box>
    );
};

export default LoadFlowParametersContent;
