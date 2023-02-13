/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import PropTypes from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';
import FitScreenSharpIcon from '@mui/icons-material/FitScreenSharp';
import FullscreenExitSharpIcon from '@mui/icons-material/FullscreenExitSharp';
import PlotlySeriesChart from './plot/plotly-series-chart';
import {
    Card,
    CardContent,
    CardHeader,
    ToggleButton,
    Typography,
} from '@mui/material';
import { memo, useCallback, useState } from 'react';
import TooltipIconButton from './common/tooltip-icon-button';
import makeStyles from '@mui/styles/makeStyles';
import { lighten } from '@mui/material/styles';
import { useIntl } from 'react-intl';
import { SeriesType } from './plot/plot-types';

const useStyles = makeStyles((theme) => ({
    plotScaleButton: {
        marginRight: theme.spacing(2),
        border: 'none',
        borderRadius: '50%',
    },
    closeButton: {
        cursor: 'pointer',
    },
    cardActive: {
        border: 'solid',
        borderColor: lighten(theme.palette.primary.main, 0.2),
    },
    card: {
        height: '100%',
    },
    cardHeaderRoot: {
        backgroundColor: lighten(theme.palette.background.paper, 0.2),
        '&:hover': {
            background: lighten(theme.palette.background.paper, 0.3),
            cursor: 'move',
        },
        padding: theme.spacing(0.5),
    },
    cardHeaderAction: {},
    cardHeaderAvatar: {
        color: theme.palette.primary.main,
    },
    cardContent: {
        height: '100%',
    },
}));

const DynamicSimulationResultSeriesChart = ({
    id,
    groupId,
    index,
    selected,
    leftSeries,
    rightSeries,
    onClose,
    onSelect,
    sync,
    onPlotScale = () => {},
}) => {
    const classes = useStyles();
    const intl = useIntl();

    // button options switch scale plot / restore plot
    const [plotScale, setPlotScale] = useState(false);

    const handlePlotScale = useCallback(
        (plotId) => {
            setPlotScale((prev) => {
                return !prev;
            });

            // propagate change
            onPlotScale(plotId, !plotScale);
        },
        [onPlotScale, plotScale]
    );

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
                    <Typography variant={'subtitle1'}>
                        {`${intl.formatMessage({
                            id: 'DynamicSimulationResultChart',
                        })} ${id}`}
                    </Typography>
                }
                action={
                    <>
                        <ToggleButton
                            className={classes.plotScaleButton}
                            size={'small'}
                            value={'plotScale'}
                            selected={plotScale}
                            onChange={() => handlePlotScale(id)}
                        >
                            {plotScale ? (
                                <FullscreenExitSharpIcon />
                            ) : (
                                <FitScreenSharpIcon />
                            )}
                        </ToggleButton>
                        <TooltipIconButton
                            toolTip={'Close graph'}
                            className={classes.CloseButton}
                            onClick={() => onClose(index)}
                        >
                            <CloseIcon />
                        </TooltipIconButton>
                    </>
                }
            />
            <CardContent
                className={classes.cardContent}
                // to avoid the wrapper is dragged when zooming the plot
                onMouseDown={(event) => {
                    event.stopPropagation();
                }}
            >
                <PlotlySeriesChart
                    id={id}
                    groupId={groupId}
                    index={index}
                    leftSeries={leftSeries}
                    rightSeries={rightSeries}
                    sync={sync}
                />
            </CardContent>
        </Card>
    );
};

DynamicSimulationResultSeriesChart.propTypes = {
    id: PropTypes.string.isRequired,
    groupId: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    selected: PropTypes.bool.isRequired,
    leftSeries: SeriesType,
    rightSeries: SeriesType,
    onClose: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    sync: PropTypes.bool,
};

export default memo(DynamicSimulationResultSeriesChart);
