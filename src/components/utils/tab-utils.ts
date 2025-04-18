/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Theme, darken, lighten } from '@mui/material';

const styles = {
    tabWithError: (theme: Theme) => ({
        '&.Mui-selected': { color: theme.palette.error.main },
        color: theme.palette.error.main,
    }),
    tabWithErrorIndicator: (theme: Theme) => ({
        backgroundColor: theme.palette.error.main,
    }),
};

export function getTabIndicatorStyle<T extends number | string>(tabIndexesWithError: T[], index: T) {
    return tabIndexesWithError.includes(index) ? styles.tabWithErrorIndicator : undefined;
}

export function getTabStyle<T extends number | string>(tabIndexesWithError: T[], index: T) {
    return tabIndexesWithError.includes(index) ? styles.tabWithError : undefined;
}

export const stylesLayout = {
    // <Tabs/> need attention with parents flex
    rootContainer: {
        width: '100%',
        height: '100%',
    },
    columnContainer: {
        height: '100%',
    },
    listDisplayContainer: {
        overflow: 'auto',
        flex: 1,
    },
    listDisplay: {
        height: '100%',
    },
};

export const tabStyles = {
    listTitleDisplay: (theme: Theme) => ({
        paddingTop: 1,
        paddingBottom: 1,
        paddingLeft: theme.spacing(2),
        width: '100%',
        fontSize: '1.1rem',
        backgroundColor:
            theme.palette.mode === 'light'
                ? darken(theme.palette.background.paper, 0.1)
                : theme.palette.background.paper,
    }),
    listDisplay: (theme: Theme) => ({
        ...stylesLayout.listDisplay,
        backgroundColor:
            theme.palette.mode === 'light'
                ? darken(theme.palette.background.paper, 0.1)
                : theme.palette.background.paper,
        '.MuiTab-root.MuiButtonBase-root': {
            textTransform: 'none', //tab text not upper-case
            textAlign: 'left',
            alignItems: 'stretch',
        },
        '.MuiTabs-scrollButtons.Mui-disabled': {
            opacity: 0.3,
        },
        '.MuiTabScrollButton-root:nth-of-type(1)': {
            height: '30px', //40px by default
        },
    }),
    parametersBox: (theme: Theme) => ({
        backgroundColor:
            theme.palette.mode === 'light'
                ? theme.palette.background.paper
                : lighten(theme.palette.background.paper, 0.2),
        height: '100%',
        position: 'relative',
        padding: 0,
    }),
    contentBox: {
        paddingTop: 6,
        paddingBottom: 2,
        paddingLeft: 8,
        paddingRight: 8,
        height: '100%',
    },
    dividerTab: (theme: Theme) => ({
        padding: 0,
        minHeight: theme.spacing(1),
    }),
};
