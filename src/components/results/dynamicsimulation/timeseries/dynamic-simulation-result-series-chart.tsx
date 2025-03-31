/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import CloseIcon from '@mui/icons-material/Close';
import FitScreenSharpIcon from '@mui/icons-material/FitScreenSharp';
import FullscreenExitSharpIcon from '@mui/icons-material/FullscreenExitSharp';
import PlotlySeriesChart from '../plot/plotly-series-chart';
import { Card, CardContent, CardHeader, Theme, ToggleButton, Tooltip, Typography } from '@mui/material';
import { memo, useCallback, useState } from 'react';
import TooltipIconButton from '../common/tooltip-icon-button';
import { lighten } from '@mui/material/styles';
import { useIntl } from 'react-intl';
import { Series } from '../plot/plot-types';
import { mergeSx } from '@gridsuite/commons-ui';

const styles = {
    plotScaleButton: (theme: Theme) => ({
        marginRight: theme.spacing(2),
        border: 'none',
        borderRadius: '50%',
    }),
    cardActive: (theme: Theme) => ({
        border: 'solid',
        borderColor: lighten(theme.palette.primary.main, 0.2),
    }),
    card: {
        height: '100%',
    },
    cardHeader: (theme: Theme) => ({
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

export type DynamicSimulationResultSeriesChartProps = {
    id: string;
    groupId: string;
    index: number;
    selected: boolean;
    leftSeries?: Series[];
    rightSeries?: Series[];
    onClose: (index: number) => void;
    onSelect: (index: number) => void;
    sync: boolean;
    onPlotScale: (plotId: string, plotScale: boolean) => void;
};

function DynamicSimulationResultSeriesChart({
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
}: Readonly<DynamicSimulationResultSeriesChartProps>) {
    const intl = useIntl();

    // button options switch scale plot / restore plot
    const [plotScale, setPlotScale] = useState<boolean>(false);

    const handlePlotScale = useCallback(
        (plotId: string) => {
            setPlotScale((prev) => {
                return !prev;
            });

            // propagate change
            onPlotScale(plotId, !plotScale);
        },
        [onPlotScale, plotScale]
    );

    return (
        <Card sx={mergeSx(selected ? styles.cardActive : undefined, styles.card)} onClick={() => onSelect(index)}>
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
                                tooltip={intl.formatMessage({
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
                    leftSeries={leftSeries}
                    rightSeries={rightSeries}
                    sync={sync}
                />
            </CardContent>
        </Card>
    );
}

export default memo(DynamicSimulationResultSeriesChart);
