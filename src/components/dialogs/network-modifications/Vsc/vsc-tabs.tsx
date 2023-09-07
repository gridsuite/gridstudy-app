import React, { FunctionComponent, useCallback } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { Grid, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { VSC_CREATION_TABS } from './creation/vsc-creation-dialog';

const useStyles = makeStyles((theme) => ({
    tabWithError: {
        '&.Mui-selected': { color: theme.palette.error.main },
        color: theme.palette.error.main,
    },
    tabWithErrorIndicator: {
        backgroundColor: theme.palette.error.main,
    },
}));

interface VscTabsProps {
    tabIndex: number;
    tabIndexesWithError: number[];
    setTabIndex: React.Dispatch<React.SetStateAction<number>>;
}

const VscTabs: FunctionComponent<VscTabsProps> = ({
    tabIndex,
    tabIndexesWithError,
    setTabIndex,
}) => {
    const classes = useStyles();

    const getTabIndicatorClass = useCallback(
        (index: number) =>
            tabIndexesWithError.includes(index)
                ? {
                      indicator: classes.tabWithErrorIndicator,
                  }
                : {},
        [tabIndexesWithError, classes]
    );

    const getTabClass = useCallback(
        (index: number) =>
            clsx({
                [classes.tabWithError]: tabIndexesWithError.includes(index),
            }),
        [tabIndexesWithError, classes]
    );

    return (
        <>
            <Grid container>
                <Tabs
                    value={tabIndex}
                    variant="scrollable"
                    onChange={(event, newValue) => setTabIndex(newValue)}
                    classes={getTabIndicatorClass(tabIndex)}
                >
                    <Tab
                        label={<FormattedMessage id="HVDC_LINE" />}
                        className={getTabClass(VSC_CREATION_TABS.HVDC_LINE_TAB)}
                    />
                    <Tab
                        label={<FormattedMessage id="converterStation1" />}
                        className={getTabClass(
                            VSC_CREATION_TABS.CONVERTER_STATION_1
                        )}
                    />
                    <Tab
                        label={<FormattedMessage id="converterStation2" />}
                        className={getTabClass(
                            VSC_CREATION_TABS.CONVERTER_STATION_2
                        )}
                    />
                </Tabs>
            </Grid>
        </>
    );
};

export default VscTabs;
