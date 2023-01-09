/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import CloseIcon from '@mui/icons-material/Close';
import PlotlySeriesChart from './plot/plotly-series-chart';
import { Card, CardContent, CardHeader, Grid } from '@mui/material';
import { memo } from 'react';
import TooltipIconButton from './common/tooltip-icon-button';
import AddIcon from '@mui/icons-material/Add';
import makeStyles from '@mui/styles/makeStyles';
import { lighten } from '@mui/material/styles';
const useStyles = makeStyles((theme) => ({
    closeButton: {
        borderRadius: '50%',
        marginRight: theme.spacing(10),
        cursor: 'pointer',
    },
    cardActive: {
        border: 'solid',
        borderColor: theme.palette.primary.main,
        marginTop: theme.spacing(2),
    },
    card: {
        marginTop: theme.spacing(2),
    },
    cardHeader: {
        backgroundColor: lighten(theme.palette.background.paper, 0.2),
    },
}));
const DynamicSimulationResultSeriesChart = ({
    selected,
    leftSeries,
    rightSeries,
    onClose,
    onSelect,
}) => {
    const classes = useStyles();
    // Plotly
    return (
        <Card
            className={
                selected
                    ? `${classes.cardActive} ${classes.card}}`
                    : classes.card
            }
            onClick={onSelect}
        >
            <CardHeader
                className={classes.cardHeader}
                action={
                    <TooltipIconButton
                        toolTip={'Close graph'}
                        className={classes.CloseButton}
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </TooltipIconButton>
                }
            />
            <CardContent>
                <PlotlySeriesChart
                    leftSeries={leftSeries}
                    rightSeries={rightSeries}
                />
            </CardContent>
        </Card>
    );
};

export default memo(DynamicSimulationResultSeriesChart);
