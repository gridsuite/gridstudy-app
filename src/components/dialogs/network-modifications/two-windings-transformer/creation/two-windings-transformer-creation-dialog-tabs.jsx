/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useWatch } from 'react-hook-form';
import { ENABLED, PHASE_TAP_CHANGER, RATIO_TAP_CHANGER } from 'components/utils/field-constants';
import { getTabIndicatorStyle, getTabStyle } from '../../../../utils/tab-utils';
import { TwoWindingsTransformerCreationDialogTab } from '../two-windings-transformer-utils';

const TwoWindingsTransformerCreationDialogTabs = ({ tabIndex, tabIndexesWithError, setTabIndex, setDialogWidth }) => {
    const ratioTapChangerEnabledWatch = useWatch({
        name: `${RATIO_TAP_CHANGER}.${ENABLED}`,
    });

    const phaseTapChangerEnabledWatch = useWatch({
        name: `${PHASE_TAP_CHANGER}.${ENABLED}`,
    });

    return (
        <Grid container item>
            <Tabs
                value={tabIndex}
                variant="scrollable"
                onChange={(event, newValue) => setTabIndex(newValue)}
                TabIndicatorProps={{
                    sx: getTabIndicatorStyle(tabIndexesWithError, tabIndex),
                }}
            >
                <Tab
                    label={<FormattedMessage id="TwoWindingsTransformerCharacteristicsTab" />}
                    sx={getTabStyle(tabIndexesWithError, TwoWindingsTransformerCreationDialogTab.CHARACTERISTICS_TAB)}
                    onClick={() => setDialogWidth('xl')}
                />
                <Tab
                    label={<FormattedMessage id="LimitsTab" />}
                    sx={getTabStyle(tabIndexesWithError, TwoWindingsTransformerCreationDialogTab.LIMITS_TAB)}
                    onClick={() => setDialogWidth('xl')}
                />
                <Tab
                    onClick={() => setDialogWidth('xl')}
                    label={<FormattedMessage id="TwoWindingsTransformerRatioTapChangerTab" />}
                    sx={getTabStyle(tabIndexesWithError, TwoWindingsTransformerCreationDialogTab.RATIO_TAP_TAB)}
                    disabled={!ratioTapChangerEnabledWatch}
                />
                <Tab
                    onClick={() => setDialogWidth('xl')}
                    label={<FormattedMessage id="TwoWindingsTransformerPhaseTapChangerTab" />}
                    sx={getTabStyle(tabIndexesWithError, TwoWindingsTransformerCreationDialogTab.PHASE_TAP_TAB)}
                    disabled={!phaseTapChangerEnabledWatch}
                />
            </Tabs>
        </Grid>
    );
};

export default TwoWindingsTransformerCreationDialogTabs;
