/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import PlotlySeriesChart from './plot/plotly-series-chart';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { memo } from 'react';
import TooltipIconButton from './common/tooltip-icon-button';
import makeStyles from '@mui/styles/makeStyles';
import { lighten } from '@mui/material/styles';
import { useIntl } from 'react-intl';
import { SeriesType } from './plot/plot-types';

const useStyles = makeStyles((theme) => ({
    closeButton: {
        cursor: 'pointer',
    },
    cardActive: {
        border: 'solid',
        borderColor: lighten(theme.palette.primary.main, 0.2),
    },
    card: {},
    cardHeaderRoot: {
        backgroundColor: lighten(theme.palette.background.paper, 0.2),
    },
    cardHeaderAction: {
        margin: 'auto',
    },
    cardHeaderAvatar: {
        color: theme.palette.primary.main,
    },
}));

const DynamicSimulationResultSeriesChart = forwardRef(
    (
        {
            id,
            index,
            selected,
            leftSeries,
            rightSeries,
            onClose,
            onSelect,
            sync,
            onSyncEvent,
        },
        ref
    ) => {
        const classes = useStyles();
        const intl = useIntl();

        return (
            <Card
                className={
                    selected
                        ? `${classes.cardActive} ${classes.card}`
                        : classes.card
                }
                onClick={() => onSelect(index)}
            >
                <CardHeader
                    classes={{
                        root: classes.cardHeaderRoot,
                        action: classes.cardHeaderAction,
                        avatar: classes.cardHeaderAvatar,
                    }}
                    avatar={
                        <Typography variant={'h6'}>
                            {`${intl.formatMessage({
                                id: 'DynamicSimulationResultChart',
                            })} ${id}`}
                        </Typography>
                    }
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
                <CardContent
                    // to avoid the wrapper is dragged when zooming the plot
                    onMouseDown={(event) => {
                        event.stopPropagation();
                    }}
                >
                    <PlotlySeriesChart
                        id={id}
                        ref={ref}
                        leftSeries={leftSeries}
                        rightSeries={rightSeries}
                        sync={sync}
                        onSyncEvent={onSyncEvent}
                    />
                </CardContent>
            </Card>
        );
    }
);

DynamicSimulationResultSeriesChart.propTypes = {
    id: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    selected: PropTypes.bool.isRequired,
    leftSeries: SeriesType,
    rightSeries: SeriesType,
    onClose: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    sync: PropTypes.bool,
    onSyncEvent: PropTypes.func,
};

export default memo(DynamicSimulationResultSeriesChart);
