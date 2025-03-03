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
import PlotlySeriesChart from '../plot/plotly-series-chart';
import { Card, CardContent, CardHeader, ToggleButton, Tooltip, Typography } from '@mui/material';
import { memo, useCallback, useState } from 'react';
import TooltipIconButton from '../common/tooltip-icon-button';
import { lighten } from '@mui/material/styles';
import { useIntl } from 'react-intl';
import { SeriesType } from '../plot/plot-types';
import { mergeSx } from '@gridsuite/commons-ui';

const styles = {
    plotScaleButton: (theme) => ({
        marginRight: theme.spacing(2),
        border: 'none',
        borderRadius: '50%',
    }),
    cardActive: (theme) => ({
        border: 'solid',
        borderColor: lighten(theme.palette.primary.main, 0.2),
    }),
    card: {
        height: '100%',
    },
    cardHeader: (theme) => ({
        backgroundColor: lighten(theme.palette.background.paper, 0.2),
        '&:hover': {
            background: lighten(theme.palette.background.paper, 0.3),
            cursor: 'move',
        },
        padding: theme.spacing(0.5),
        color: theme.palette.primary.main,
    }),
    cardContent: {
        height: '100%',
    },
};

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
        <Card sx={mergeSx(selected && styles.cardActive, styles.card)} onClick={() => onSelect(index)}>
            <CardHeader
                sx={styles.cardHeader}
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
                            sx={styles.plotScaleButton}
                            size={'small'}
                            value={'plotScale'}
                            selected={plotScale}
                            onChange={() => handlePlotScale(id)}
                        >
                            {plotScale ? (
                                <Tooltip
                                    title={intl.formatMessage({
                                        id: 'DynamicSimulationPlotScaleDisable',
                                    })}
                                >
                                    <FullscreenExitSharpIcon />
                                </Tooltip>
                            ) : (
                                <Tooltip
                                    title={intl.formatMessage({
                                        id: 'DynamicSimulationPlotScaleEnable',
                                    })}
                                >
                                    <FitScreenSharpIcon />
                                </Tooltip>
                            )}
                        </ToggleButton>
                        {!plotScale && (
                            <TooltipIconButton
                                toolTip={intl.formatMessage({
                                    id: 'DynamicSimulationCloseGraph',
                                })}
                                onClick={() => onClose(index)}
                            >
                                <CloseIcon />
                            </TooltipIconButton>
                        )}
                    </>
                }
            />
            <CardContent
                sx={styles.cardContent}
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
