/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Tab, Tabs } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { TwoWindingsTransformerModificationDialogTab } from './two-windings-transformer-modification-dialog';

const useStyles = makeStyles((theme) => ({
    tabWithError: {
        '&.Mui-selected': { color: theme.palette.error.main },
        color: theme.palette.error.main,
    },
    tabWithErrorIndicator: {
        backgroundColor: theme.palette.error.main,
    },
}));

const TwoWindingsTransformerModificationDialogTabs = ({
    tabIndex,
    tabIndexesWithError,
    setTabIndex,
}) => {
    const classes = useStyles();

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
                        TwoWindingsTransformerModificationDialogTab.CHARACTERISTICS_TAB
                    )}
                />
                <Tab
                    label={<FormattedMessage id="LimitsTab" />}
                    className={getTabClass(
                        TwoWindingsTransformerModificationDialogTab.LIMITS_TAB
                    )}
                />
            </Tabs>
        </Grid>
    );
};

export default TwoWindingsTransformerModificationDialogTabs;
