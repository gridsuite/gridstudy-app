/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Checkbox, Tooltip, IconButton, Menu, MenuItem } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { ReactNode, useEffect, useRef, useState } from 'react';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useDispatch, useSelector } from 'react-redux';
import { setCalculationSelections } from '../../../redux/actions';
import { AppState } from '../../../redux/reducer';

import { isBlankOrEmpty } from 'components/utils/validation-functions';
import { ICellRendererParams } from 'ag-grid-community';
import { CustomCellRendererProps } from 'ag-grid-react';
import { mergeSx } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';
import { CalculationRowType, CalculationType } from './calculation.type';
import { isCalculationRow } from './calculation-utils';

const styles = {
    tableCell: (theme: Theme) => ({
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
    menuItemLabel: {
        marginLeft: 1,
    },
    calculationButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: 0,
        minWidth: 'auto',
        minHeight: 'auto',
    },
};

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
    const cellValue = formatNumericCell(props.value, props.fractionDigits);
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

export const RowIndexCellRenderer = (props: CustomCellRendererProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const intl = useIntl();

    // Get tab UUID from context passed via column definition
    const tabUuid = props.colDef?.context?.tabUuid || '';

    const dispatch = useDispatch();
    const calculationSelections = useSelector((state: AppState) => state.calculationSelections);

    // Get selections for current tab
    const selections = calculationSelections[tabUuid] || [];

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelectionChange = (option: CalculationType) => {
        const newSelections = selections.includes(option)
            ? selections.filter((item) => item !== option)
            : [...selections, option];

        dispatch(setCalculationSelections(tabUuid, newSelections));
    };

    if (isCalculationRow(props.data?.rowType)) {
        if (props.data?.rowType === CalculationRowType.CALCULATION_BUTTON) {
            return (
                <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <IconButton size="small" aria-label="calculate" onClick={handleClick} sx={styles.calculationButton}>
                        <CalculateIcon fontSize="small" />
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                        <MenuItem dense onClick={() => handleSelectionChange(CalculationType.AVERAGE)}>
                            <Checkbox
                                checked={selections.includes(CalculationType.AVERAGE)}
                                size="small"
                                disableRipple
                            />
                            <Box sx={styles.menuItemLabel}>
                                {intl.formatMessage({ id: 'spreadsheet/calculation/average' })}
                            </Box>
                        </MenuItem>
                        <MenuItem dense onClick={() => handleSelectionChange(CalculationType.SUM)}>
                            <Checkbox checked={selections.includes(CalculationType.SUM)} size="small" disableRipple />
                            <Box sx={styles.menuItemLabel}>
                                {intl.formatMessage({ id: 'spreadsheet/calculation/sum' })}
                            </Box>
                        </MenuItem>
                        <MenuItem dense onClick={() => handleSelectionChange(CalculationType.MIN)}>
                            <Checkbox checked={selections.includes(CalculationType.MIN)} size="small" disableRipple />
                            <Box sx={styles.menuItemLabel}>
                                {intl.formatMessage({ id: 'spreadsheet/calculation/min' })}
                            </Box>
                        </MenuItem>
                        <MenuItem dense onClick={() => handleSelectionChange(CalculationType.MAX)}>
                            <Checkbox checked={selections.includes(CalculationType.MAX)} size="small" disableRipple />
                            <Box sx={styles.menuItemLabel}>
                                {intl.formatMessage({ id: 'spreadsheet/calculation/max' })}
                            </Box>
                        </MenuItem>
                    </Menu>
                </Box>
            );
        }

        // Row with calculation results - show appropriate label
        if (props.data?.rowType === CalculationRowType.CALCULATION) {
            let label = '';
            switch (props.data.calculationType) {
                case CalculationType.SUM:
                    label = intl.formatMessage({ id: 'spreadsheet/calculation/sum_abbrev' });
                    break;
                case CalculationType.AVERAGE:
                    label = intl.formatMessage({ id: 'spreadsheet/calculation/average_abbrev' });
                    break;
                case CalculationType.MIN:
                    label = intl.formatMessage({ id: 'spreadsheet/calculation/min_abbrev' });
                    break;
                case CalculationType.MAX:
                    label = intl.formatMessage({ id: 'spreadsheet/calculation/max_abbrev' });
                    break;
            }

            return (
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        fontWeight: 'bold',
                    }}
                >
                    {label}
                </Box>
            );
        }

        return null;
    }

    // For normal rows, return the row index number
    return props.value;
};
