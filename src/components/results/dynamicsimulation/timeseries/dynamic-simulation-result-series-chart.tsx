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
import { Card, CardContent, CardHeader, Theme, Typography } from '@mui/material';
import { memo, useCallback, useState } from 'react';
import TooltipIconButton from '../../../common/tooltip-icon-button';
import { lighten } from '@mui/material/styles';
import { useIntl } from 'react-intl';
import { Series } from '../plot/plot-types';
import { mergeSx } from '@gridsuite/commons-ui';

const styles = {
    cardActionButton: (theme: Theme) => ({
        marginRight: theme.spacing(0.5),
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
                        {plotScale ? (
                            <TooltipIconButton
                                key={'disabledScale'}
                                sx={styles.cardActionButton}
                                tooltip={intl.formatMessage({
                                    id: 'DynamicSimulationPlotScaleDisable',
                                })}
                                onMouseDown={(event) => {
                                    event.stopPropagation();
                                    handlePlotScale(id);
                                }}
                            >
                                <FullscreenExitSharpIcon />
                            </TooltipIconButton>
                        ) : (
                            <TooltipIconButton
                                key={'enableScale'}
                                sx={styles.cardActionButton}
                                tooltip={intl.formatMessage({
                                    id: 'DynamicSimulationPlotScaleEnable',
                                })}
                                onMouseDown={(event) => {
                                    event.stopPropagation();
                                    handlePlotScale(id);
                                }}
                            >
                                <FitScreenSharpIcon />
                            </TooltipIconButton>
                        )}
                        {!plotScale && (
                            <TooltipIconButton
                                sx={styles.cardActionButton}
                                tooltip={intl.formatMessage({
                                    id: 'DynamicSimulationCloseGraph',
                                })}
                                onMouseDown={(event) => {
                                    event.stopPropagation();
                                    onClose(index);
                                }}
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
