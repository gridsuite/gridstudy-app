/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid2 as Grid, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useWatch } from 'react-hook-form';
import { ENABLED, PHASE_TAP_CHANGER, RATIO_TAP_CHANGER } from 'components/utils/field-constants';
import { getTabIndicatorStyle, getTabStyle } from '../../../../utils/tab-utils';
import { TwoWindingsTransformerDialogTab } from '@gridsuite/commons-ui';

interface TwoWindingsTransformerModificationDialogTabsProps {
    tabIndex: number;
    tabIndexesWithError: number[];
    setTabIndex: (index: number) => void;
}

const TwoWindingsTransformerModificationDialogTabs = ({
    tabIndex,
    tabIndexesWithError,
    setTabIndex,
}: TwoWindingsTransformerModificationDialogTabsProps) => {
    const phaseTapChangerEnabledWatch = useWatch({
        name: `${PHASE_TAP_CHANGER}.${ENABLED}`,
    });
    const ratioTapChangerEnabledWatch = useWatch({
        name: `${RATIO_TAP_CHANGER}.${ENABLED}`,
    });

    return (
        <Grid container>
            <Tabs
                value={tabIndex}
                variant="scrollable"
                onChange={(event, newValue) => setTabIndex(newValue)}
                TabIndicatorProps={{
                    sx: getTabIndicatorStyle(tabIndexesWithError, tabIndex),
                }}
            >
                <Tab
                    label={<FormattedMessage id="ConnectivityTab" />}
                    sx={getTabStyle(tabIndexesWithError, TwoWindingsTransformerDialogTab.CONNECTIVITY_TAB)}
                />
                <Tab
                    label={<FormattedMessage id="TwoWindingsTransformerCharacteristicsTab" />}
                    sx={getTabStyle(tabIndexesWithError, TwoWindingsTransformerDialogTab.CHARACTERISTICS_TAB)}
                />
                <Tab
                    label={<FormattedMessage id="LimitsTab" />}
                    sx={getTabStyle(tabIndexesWithError, TwoWindingsTransformerDialogTab.LIMITS_TAB)}
                />
                <Tab
                    label={<FormattedMessage id="StateEstimationTab" />}
                    sx={getTabStyle(tabIndexesWithError, TwoWindingsTransformerDialogTab.STATE_ESTIMATION_TAB)}
                />
                <Tab
                    label={<FormattedMessage id="TwoWindingsTransformerRatioTapChangerTab" />}
                    sx={getTabStyle(tabIndexesWithError, TwoWindingsTransformerDialogTab.RATIO_TAP_TAB)}
                    disabled={!ratioTapChangerEnabledWatch}
                />
                <Tab
                    label={<FormattedMessage id="TwoWindingsTransformerPhaseTapChangerTab" />}
                    sx={getTabStyle(tabIndexesWithError, TwoWindingsTransformerDialogTab.PHASE_TAP_TAB)}
                    disabled={!phaseTapChangerEnabledWatch}
                />
            </Tabs>
        </Grid>
    );
};

export default TwoWindingsTransformerModificationDialogTabs;
