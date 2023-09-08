/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Tab, Tabs } from '@mui/material';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { TwoWindingsTransformerModificationDialogTab } from './two-windings-transformer-modification-dialog';
import { useWatch } from 'react-hook-form';
import {
    ENABLED,
    PHASE_TAP_CHANGER,
    RATIO_TAP_CHANGER,
} from 'components/utils/field-constants';

const styles = {
    tabWithError: (theme) => ({
        '&.Mui-selected': { color: theme.palette.error.main },
        color: theme.palette.error.main,
    }),
    tabWithErrorIndicator: (theme) => ({
        backgroundColor: theme.palette.error.main,
    }),
};

const TwoWindingsTransformerModificationDialogTabs = ({
    tabIndex,
    tabIndexesWithError,
    setTabIndex,
}) => {
    const phaseTapChangerEnabledWatch = useWatch({
        name: `${PHASE_TAP_CHANGER}.${ENABLED}`,
    });
    const ratioTapChangerEnabledWatch = useWatch({
        name: `${RATIO_TAP_CHANGER}.${ENABLED}`,
    });

    const getTabIndicatorStyle = useCallback(
        (index) =>
            tabIndexesWithError.includes(index)
                ? styles.tabWithErrorIndicator
                : undefined,
        [tabIndexesWithError]
    );

    const getTabStyle = useCallback(
        (index) =>
            tabIndexesWithError.includes(index)
                ? styles.tabWithError
                : undefined,
        [tabIndexesWithError]
    );

    return (
        <Grid container item>
            <Tabs
                value={tabIndex}
                variant="scrollable"
                onChange={(event, newValue) => setTabIndex(newValue)}
                TabIndicatorProps={{ sx: getTabIndicatorStyle(tabIndex) }}
            >
                <Tab
                    label={
                        <FormattedMessage id="TwoWindingsTransformerCharacteristicsTab" />
                    }
                    sx={getTabStyle(
                        TwoWindingsTransformerModificationDialogTab.CHARACTERISTICS_TAB
                    )}
                />
                <Tab
                    label={<FormattedMessage id="LimitsTab" />}
                    sx={getTabStyle(
                        TwoWindingsTransformerModificationDialogTab.LIMITS_TAB
                    )}
                />
                <Tab
                    label={
                        <FormattedMessage id="TwoWindingsTransformerRatioTapChangerTab" />
                    }
                    sx={getTabStyle(
                        TwoWindingsTransformerModificationDialogTab.RATIO_TAP_TAB
                    )}
                    disabled={!ratioTapChangerEnabledWatch}
                />
                <Tab
                    label={
                        <FormattedMessage id="TwoWindingsTransformerPhaseTapChangerTab" />
                    }
                    sx={getTabStyle(
                        TwoWindingsTransformerModificationDialogTab.PHASE_TAP_TAB
                    )}
                    disabled={!phaseTapChangerEnabledWatch}
                />
            </Tabs>
        </Grid>
    );
};

export default TwoWindingsTransformerModificationDialogTabs;
