/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Checkbox, Tooltip } from '@mui/material';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { isBlankOrEmpty } from 'components/utils/validation-functions';
import { ICellRendererParams } from 'ag-grid-community';
import { CustomCellRendererProps } from 'ag-grid-react';
import { mergeSx, type MuiStyles } from '@gridsuite/commons-ui';

const styles = {
    tableCell: (theme) => ({
        fontSize: 'small',
        cursor: 'inherit',
        display: 'flex',
        '&:before': {
            content: '""',
            position: 'absolute',
            left: theme.spacing(0.5),
            right: theme.spacing(0.5),
            bottom: 0,
        },
    }),
    overflow: {
        whiteSpace: 'pre',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    numericValue: {
        marginLeft: 'inherit',
    },
} as const satisfies MuiStyles;

export const BooleanCellRenderer = (props: any) => {
    const isChecked = props.value;
    return (
        <div>
            {props.value !== undefined && (
                <Checkbox style={{ padding: 0 }} color="default" checked={isChecked} disableRipple={true} />
            )}
        </div>
    );
};

export const BooleanNullableCellRenderer = (props: any) => {
    return (
        <div>
            <Checkbox
                style={{ padding: 0 }}
                color="default"
                checked={props.value === true}
                indeterminate={isBlankOrEmpty(props.value)}
                disableRipple={true}
            />
        </div>
    );
};

const formatNumericCell = (value: number, fractionDigits?: number) => {
    if (value === null || isNaN(value)) {
        return { value: null };
    }
    return { value: value.toFixed(fractionDigits ?? 2), tooltip: value?.toString() };
};

const formatCell = (props: any) => {
    let value = props?.valueFormatted || props.value;
    let tooltipValue = undefined;
    // we use valueGetter only if value is not defined
    if (!value && props.colDef.valueGetter) {
        props.colDef.valueGetter(props);
    }
    if (value != null && props.colDef.context?.numeric && props.colDef.context?.fractionDigits) {
        // only numeric rounded cells have a tooltip (their raw numeric value)
        tooltipValue = value;
        value = parseFloat(value).toFixed(props.colDef.context.fractionDigits);
    }
    if (props.colDef.context?.numeric && isNaN(value)) {
        value = null;
    }
    return { value: value, tooltip: tooltipValue };
};

export interface NumericCellRendererProps extends CustomCellRendererProps {
    fractionDigits?: number;
}

export const NumericCellRenderer = (props: NumericCellRendererProps) => {
    const numericalValue = typeof props.value === 'number' ? props.value : Number.parseFloat(props.value);
    const cellValue = formatNumericCell(numericalValue, props.fractionDigits);
    return (
        <Box sx={mergeSx(styles.tableCell)}>
            <Tooltip
                disableFocusListener
                disableTouchListener
                title={cellValue.tooltip ? cellValue.tooltip : cellValue.value?.toString()}
            >
                <Box sx={styles.overflow}>{cellValue.value}</Box>
            </Tooltip>
        </Box>
    );
};

export const DefaultCellRenderer = (props: CustomCellRendererProps) => {
    const cellValue = formatCell(props);
    return (
        <Box sx={mergeSx(styles.tableCell)}>
            <Tooltip disableFocusListener disableTouchListener title={cellValue.value?.toString()}>
                <Box sx={styles.overflow}>{cellValue.value?.toString()}</Box>
            </Tooltip>
        </Box>
    );
};

export const NetworkModificationNameCellRenderer = (props: CustomCellRendererProps) => {
    return (
        <Box sx={mergeSx(styles.tableCell)}>
            <Tooltip
                disableFocusListener
                disableTouchListener
                title={props.value}
                componentsProps={{
                    tooltip: {
                        sx: {
                            maxWidth: 'none',
                        },
                    },
                }}
            >
                <Box sx={styles.overflow}>{props.value}</Box>
            </Tooltip>
        </Box>
    );
};

export const MessageLogCellRenderer = ({
    param,
    highlightColor,
    currentHighlightColor,
    searchTerm,
    currentResultIndex,
    searchResults,
}: {
    param: ICellRendererParams;
    highlightColor?: string;
    currentHighlightColor?: string;
    searchTerm?: string;
    currentResultIndex?: number;
    searchResults?: number[];
}) => {
    const marginLeft = (param.data?.depth ?? 0) * 2; // add indentation based on depth
    const textRef = useRef<HTMLDivElement>(null);
    const [isEllipsisActive, setIsEllipsisActive] = useState(false);

    const checkEllipsis = () => {
        if (textRef.current) {
            const zoomLevel = window.devicePixelRatio;
            const adjustedScrollWidth = textRef.current.scrollWidth / zoomLevel;
            const adjustedClientWidth = textRef.current.clientWidth / zoomLevel;
            setIsEllipsisActive(adjustedScrollWidth > adjustedClientWidth);
        }
    };

    useEffect(() => {
        checkEllipsis();
        const resizeObserver = new ResizeObserver(() => checkEllipsis());
        if (textRef.current) {
            resizeObserver.observe(textRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [param.value]);

    const escapeRegExp = (string: string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const renderHighlightedText = (value: string) => {
        if (!searchTerm || searchTerm === '') {
            return value;
        }

        const escapedSearchTerm = escapeRegExp(searchTerm);
        const parts = value.split(new RegExp(`(${escapedSearchTerm})`, 'gi'));
        return (
            <span>
                {parts.map((part: string, index: number) =>
                    part.toLowerCase() === searchTerm.toLowerCase() ? (
                        <span
                            key={`${part}-${index}`}
                            style={{
                                backgroundColor:
                                    searchResults &&
                                    currentResultIndex !== undefined &&
                                    searchResults[currentResultIndex] === param.node.rowIndex
                                        ? currentHighlightColor
                                        : highlightColor,
                            }}
                        >
                            {part}
                        </span>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    return (
        <Box sx={mergeSx(styles.tableCell)}>
            <Tooltip disableFocusListener disableTouchListener title={isEllipsisActive ? param.value : ''}>
                <Box
                    ref={textRef}
                    sx={{
                        ...styles.overflow,
                        marginLeft,
                    }}
                >
                    {renderHighlightedText(param.value)}
                </Box>
            </Tooltip>
        </Box>
    );
};

export const ContingencyCellRenderer = ({ value }: { value: { cellValue: ReactNode; tooltipValue: ReactNode } }) => {
    const { cellValue, tooltipValue } = value ?? {};

    if (cellValue == null || tooltipValue == null) {
        return null;
    }

    return (
        <Box sx={mergeSx(styles.tableCell)}>
            <Tooltip title={<div style={{ whiteSpace: 'pre-line' }}>{tooltipValue}</div>}>
                <Box sx={styles.overflow}>{cellValue}</Box>
            </Tooltip>
        </Box>
    );
};
