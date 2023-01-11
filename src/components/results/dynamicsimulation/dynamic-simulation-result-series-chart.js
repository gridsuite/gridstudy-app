/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import CloseIcon from '@mui/icons-material/Close';
import PlotlySeriesChart from './plot/plotly-series-chart';
import { Card, CardContent, CardHeader } from '@mui/material';
import { memo } from 'react';
import TooltipIconButton from './common/tooltip-icon-button';
import makeStyles from '@mui/styles/makeStyles';
import { lighten } from '@mui/material/styles';
const useStyles = makeStyles((theme) => ({
    closeButton: {
        cursor: 'pointer',
    },
    cardActive: {
        border: 'solid',
        borderColor: lighten(theme.palette.primary.main, 0.2),
        marginTop: theme.spacing(2),
    },
    card: {
        marginTop: theme.spacing(2),
    },
    cardHeaderRoot: {
        backgroundColor: lighten(theme.palette.background.paper, 0.2),
    },
    cardHeaderAction: {
        margin: 'auto',
    },
}));
const DynamicSimulationResultSeriesChart = ({
    id,
    index,
    selected,
    leftSeries,
    rightSeries,
    onClose,
    onSelect,
    onRelayout,
    revision,
    plotEvent,
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
            onClick={() => onSelect(index)}
        >
            <CardHeader
                classes={{
                    root: classes.cardHeaderRoot,
                    action: classes.cardHeaderAction,
                }}
                action={
                    <TooltipIconButton
                        toolTip={'Close graph'}
                        className={classes.CloseButton}
                        onClick={() => onClose(index)}
                    >
                        <CloseIcon />
                    </TooltipIconButton>
                }
            />
            <CardContent>
                <PlotlySeriesChart
                    id={id}
                    index={index}
                    leftSeries={leftSeries}
                    rightSeries={rightSeries}
                    onRelayout={onRelayout}
                    revision={revision}
                    plotEvent={plotEvent}
                />
            </CardContent>
        </Card>
    );
};

export default memo(DynamicSimulationResultSeriesChart);
