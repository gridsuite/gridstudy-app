/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Checkbox, Tooltip } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { ReactNode, useEffect, useRef, useState } from 'react';

import { mergeSx } from '../../utils/functions';
import { isBlankOrEmpty } from 'components/utils/validation-functions';
import { IntlShape } from 'react-intl';
import { ICellRendererParams } from 'ag-grid-community';
import { CustomCellRendererProps } from 'ag-grid-react';

const styles = {
    tableCell: (theme: Theme) => ({
        fontSize: 'small',
        cursor: 'initial',
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
};

export const NA_Value = 'N/A';

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
    return { value: value.toFixed(fractionDigits ?? 2), tooltip: value };
};

export const formatCell = (props: any) => {
    let value = props?.valueFormatted || props.value;
    let tooltipValue = undefined;
    if (props.colDef.valueGetter) {
        value = props?.context?.network
            ? props.colDef.valueGetter(props, props.context.network)
            : props.colDef.valueGetter(props);
    }
    if (value != null && props.colDef.numeric && props.colDef.fractionDigits) {
        // only numeric rounded cells have a tooltip (their raw numeric value)
        tooltipValue = value;
        value = parseFloat(value).toFixed(props.colDef.fractionDigits);
    }
    if (props.colDef.numeric && isNaN(value)) {
        value = null;
    }
    return { value: value, tooltip: tooltipValue };
};

export const convertDuration = (duration: number) => {
    if (!duration || isNaN(duration)) {
        return '';
    }

    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    if (seconds === 0) {
        return minutes + ' mn';
    }

    if (minutes === 0) {
        return seconds + ' s';
    }

    return `${minutes}' ${seconds}"`;
};

export interface NumericCellRendererProps extends CustomCellRendererProps {
    fractionDigits?: number;
}

export const NumericCellRenderer = (props: NumericCellRendererProps) => {
    const cellValue = formatNumericCell(props.value, props.fractionDigits);
    return (
        <Box sx={mergeSx(styles.tableCell)}>
            <Tooltip
                disableFocusListener
                disableTouchListener
                title={cellValue.tooltip ? cellValue.tooltip : cellValue.value}
            >
                <Box sx={styles.overflow} children={cellValue.value} />
            </Tooltip>
        </Box>
    );
};

export const DefaultCellRenderer = (props: CustomCellRendererProps) => {
    const cellValue = formatCell(props);
    return (
        <Box sx={mergeSx(styles.tableCell)}>
            <Tooltip disableFocusListener disableTouchListener title={cellValue.value}>
                <Box sx={styles.overflow} children={cellValue.value?.toString()} />
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
                    }}
                >
                    {renderHighlightedText(param.value)}
                </Box>
            </Tooltip>
        </Box>
    );
};

export const PropertiesCellRenderer = (props: any) => {
    const cellValue = formatCell(props);
    // different properties are seperated with |
    // tooltip message contains properties in seperated lines
    return (
        <Box sx={mergeSx(styles.tableCell)}>
            <Tooltip
                title={
                    <div style={{ whiteSpace: 'pre-line' }}>
                        {cellValue.value && cellValue.value.replaceAll(' | ', '\n')}
                    </div>
                }
            >
                <Box sx={styles.overflow} children={cellValue.value} />
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
                <Box sx={styles.overflow} children={cellValue} />
            </Tooltip>
        </Box>
    );
};

export const formatNAValue = (value: string, intl: IntlShape): string => {
    return value === NA_Value ? intl.formatMessage({ id: 'Undefined' }) : value;
};
