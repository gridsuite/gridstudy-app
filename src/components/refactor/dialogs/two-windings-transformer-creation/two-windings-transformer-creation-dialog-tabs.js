import { Grid, Tab, Tabs } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { TwoWindingsTransformerCreationDialogTab } from './two-windings-transformer-creation-dialog';

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
        <Grid container>
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
                    onClick={() => setDialogWidth('sm')}
                />
                <Tab
                    onClick={() => setDialogWidth('xl')}
                    label={
                        <FormattedMessage id="TwoWindingsTransformerRatioTapChangerTab" />
                    }
                    className={getTabClass(
                        TwoWindingsTransformerCreationDialogTab.RATIO_TAP_TAB
                    )}
                />
                <Tab
                    onClick={() => setDialogWidth('xl')}
                    label={
                        <FormattedMessage id="TwoWindingsTransformerPhaseTapChangerTab" />
                    }
                    className={getTabClass(
                        TwoWindingsTransformerCreationDialogTab.PHASE_TAP_TAB
                    )}
                />
            </Tabs>
        </Grid>
    );
};

export default TwoWindingsTransformerCreationDialogTabs;
