/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Theme } from '@mui/material';

export const styles = {
    title: (theme: Theme) => ({
        padding: theme.spacing(2),
    }),
    minWidthMedium: (theme: Theme) => ({
        minWidth: theme.spacing(20),
    }),
    parameterName: (theme: Theme) => ({
        fontWeight: 'bold',
        marginTop: theme.spacing(1),
    }),
    controlItem: {
        justifyContent: 'flex-end',
        flexGrow: 1,
    },
    controlParametersItem: {
        justifyContent: 'flex-start',
        flexGrow: 1,
        height: 'fit-content',
        paddingBottom: 4,
    },
    button: (theme: Theme) => ({
        marginBottom: theme.spacing(2),
        marginLeft: theme.spacing(1),
    }),
    subgroupParameters: (theme: Theme) => ({
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
    }),
    subgroupParametersAccordion: {
        '&:before': {
            display: 'none',
        },
        background: 'none',
    },
    subgroupParametersAccordionSummary: (theme: Theme) => ({
        flexDirection: 'row-reverse',
        '& .MuiAccordionSummary-expandIconWrapper': {
            transform: 'rotate(-90deg)',
        },
        '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
            transform: 'rotate(0deg)',
        },
        '& .MuiAccordionSummary-content': {
            marginLeft: theme.spacing(0),
        },
    }),
    subgroupParametersAccordionDetails: (theme: Theme) => ({
        padding: theme.spacing(0),
    }),
    marginTopButton: {
        marginTop: '10px',
        position: 'sticky',
        bottom: 0,
    },
    scrollableGrid: (theme: Theme) => ({
        overflowY: 'auto',
        overflowX: 'hidden',
        maxHeight: '85%', // TODO This needs to be refactored
        paddingRight: theme.spacing(2),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(1),
        flexGrow: 1,
    }),
    singleItem: (theme: Theme) => ({
        display: 'flex',
        flex: 'auto',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    }),
    firstTextField: (theme: Theme) => ({
        marginLeft: theme.spacing(3),
    }),
    secondTextField: (theme: Theme) => ({
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(2),
    }),
    singleTextField: (theme: Theme) => ({
        display: 'flex',
        marginRight: theme.spacing(2),
        marginLeft: theme.spacing(1),
    }),
    tooltip: (theme: Theme) => ({
        marginLeft: theme.spacing(1),
    }),
    text: (theme: Theme) => ({
        display: 'flex',
        marginBottom: theme.spacing(1),
        marginTop: theme.spacing(1),
    }),
    multipleItems: (theme: Theme) => ({
        display: 'flex',
        flex: 'auto',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    }),
    tabWithError: (theme: Theme) => ({
        '&.Mui-selected': { color: theme.palette.error.main },
        color: theme.palette.error.main,
    }),
    tabWithErrorIndicator: (theme: Theme) => ({
        backgroundColor: theme.palette.error.main,
    }),
    panel: (theme: Theme) => ({
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
    }),
    adjustExistingLimitsInfo: (theme: Theme) => ({
        display: 'flex',
        alignItems: 'center',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    }),
    circularProgress: (theme: Theme) => ({
        marginRight: theme.spacing(2),
        color: theme.palette.primary.contrastText,
    }),
    icon: (theme: Theme) => ({
        width: theme.spacing(3),
    }),
    modificationsTitle: (theme: Theme) => ({
        display: 'flex',
        alignItems: 'center',
        margin: theme.spacing(0),
        padding: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        overflow: 'hidden',
    }),
};
