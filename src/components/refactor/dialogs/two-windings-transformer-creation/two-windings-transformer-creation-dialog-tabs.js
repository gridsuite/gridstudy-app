/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Tab, Tabs } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { TwoWindingsTransformerCreationDialogTab } from './two-windings-transformer-creation-dialog';
import { useWatch } from 'react-hook-form';
import {
    ENABLED,
    PHASE_TAP_CHANGER,
    RATIO_TAP_CHANGER,
} from '../../utils/field-constants';

const useStyles = makeStyles((theme) => ({
    tabWithError: {
        '&.Mui-selected': { color: theme.palette.error.main },
        color: theme.palette.error.main,
    },
    tabWithErrorIndicator: {
        backgroundColor: theme.palette.error.main,
    },
}));

const TwoWindingsTransformerCreationDialogTabs = ({
    tabIndex,
    tabIndexesWithError,
    setTabIndex,
    setDialogWidth,
}) => {
    const classes = useStyles();

    const ratioTapChangerEnabledWatch = useWatch({
        name: `${RATIO_TAP_CHANGER}.${ENABLED}`,
    });

    const phaseTapChangerEnabledWatch = useWatch({
        name: `${PHASE_TAP_CHANGER}.${ENABLED}`,
    });

    const getTabIndicatorClass = useCallback(
        (index) =>
            tabIndexesWithError.includes(index)
                ? {
                      indicator: classes.tabWithErrorIndicator,
                  }
                : {},
        [tabIndexesWithError, classes]
    );

    const getTabClass = useCallback(
        (index) =>
            clsx({
                [classes.tabWithError]: tabIndexesWithError.includes(index),
            }),
        [tabIndexesWithError, classes]
    );

    return (
        <Grid container item>
            <Tabs
                value={tabIndex}
                variant="scrollable"
                onChange={(event, newValue) => setTabIndex(newValue)}
                classes={getTabIndicatorClass(tabIndex)}
            >
                <Tab
                    label={
                        <FormattedMessage id="TwoWindingsTransformerCharacteristicsTab" />
                    }
                    className={getTabClass(
                        TwoWindingsTransformerCreationDialogTab.CHARACTERISTICS_TAB
                    )}
                    onClick={() => setDialogWidth('md')}
                />
                <Tab
                    label={<FormattedMessage id="LimitsTab" />}
                    className={getTabClass(
                        TwoWindingsTransformerCreationDialogTab.LIMITS_TAB
                    )}
                    onClick={() => setDialogWidth('md')}
                />
                <Tab
                    onClick={() => setDialogWidth('xl')}
                    label={
                        <FormattedMessage id="TwoWindingsTransformerRatioTapChangerTab" />
                    }
                    className={getTabClass(
                        TwoWindingsTransformerCreationDialogTab.RATIO_TAP_TAB
                    )}
                    disabled={!ratioTapChangerEnabledWatch}
                />
                <Tab
                    onClick={() => setDialogWidth('xl')}
                    label={
                        <FormattedMessage id="TwoWindingsTransformerPhaseTapChangerTab" />
                    }
                    className={getTabClass(
                        TwoWindingsTransformerCreationDialogTab.PHASE_TAP_TAB
                    )}
                    disabled={!phaseTapChangerEnabledWatch}
                />
            </Tabs>
        </Grid>
    );
};

export default TwoWindingsTransformerCreationDialogTabs;
