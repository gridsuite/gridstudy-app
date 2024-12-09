/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Checkbox, Tooltip, IconButton, Box } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { INVALID_LOADFLOW_OPACITY } from 'utils/colors';
import EditIcon from '@mui/icons-material/Edit';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useSelector } from 'react-redux';
import { isNodeReadOnly } from '../../graph/util/model-functions';

import { mergeSx } from '../../utils/functions';
import { isBlankOrEmpty } from 'components/utils/validation-functions';
import { AppState } from '../../../redux/reducer';
import { IntlShape } from 'react-intl';
import { ICellRendererParams } from 'ag-grid-community';

const styles = {
    editCell: {
        position: 'absolute',
        left: 0,
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    referenceEditRow: (theme: Theme) => ({
        '& button': {
            color: theme.palette.primary.main,
            cursor: 'initial',
        },
    }),
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
    valueInvalid: {
        opacity: INVALID_LOADFLOW_OPACITY,
    },
    numericValue: {
        marginLeft: 'inherit',
    },
    leftFade: (theme: Theme) => ({
        background:
            'linear-gradient(to right, ' +
            theme.palette.primary.main +
            ' 0%, ' +
            theme.palette.primary.main +
            ' 2%, rgba(0,0,0,0) 12%)',
        borderBottomLeftRadius: theme.spacing(0.8),
        borderTopLeftRadius: theme.spacing(0.8),
    }),
};

export const NA_Value = 'N/A';

export const BooleanCellRenderer = (props: any) => {
    const isChecked = Boolean(props.value);
    return (
        <div>
            {isChecked !== undefined && (
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

export const formatCell = (props: any) => {
    let value = props?.valueFormatted || props.value;
    let tooltipValue = undefined;
    if (props.colDef.valueGetter) {
        value = props?.context?.network
            ? props.colDef.valueGetter(props, props.context.network)
            : props.colDef.valueGetter(props);
    }
    if (props.applyFluxConvention) {
        value = props.applyFluxConvention(value);
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

export const DefaultCellRenderer = (props: any) => {
    const cellValue = formatCell(props);
    return (
        <Box sx={mergeSx(styles.tableCell)}>
            <Tooltip
                disableFocusListener
                disableTouchListener
                title={cellValue.tooltip ? cellValue.tooltip : cellValue.value}
            >
                <Box
                    sx={mergeSx(
                        styles.overflow,
                        props?.colDef?.cellRendererParams?.isValueInvalid ? styles.valueInvalid : undefined
                    )}
                    children={cellValue.value}
                />
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

export const EditableCellRenderer = (props: any) => {
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const isRootNode = useMemo(() => isNodeReadOnly(currentNode), [currentNode]);

    const handleStartEditing = useCallback(() => {
        props.setEditingData({
            ...props.data,
            metadata: {
                equipmentType: props.equipmentType,
            },
        });
    }, [props]);

    return (
        <Box sx={styles.editCell}>
            <IconButton size={'small'} onClick={handleStartEditing} disabled={isRootNode || props.context.isEditing}>
                <EditIcon />
            </IconButton>
        </Box>
    );
};

export const ReferenceLineCellRenderer = () => {
    return (
        <Box sx={mergeSx(styles.referenceEditRow, styles.leftFade, styles.editCell)}>
            <IconButton size={'small'} style={{ backgroundColor: 'transparent' }} disableRipple>
                <MoreHorizIcon />
            </IconButton>
        </Box>
    );
};

export const EditingCellRenderer = (props: any) => {
    const validateEdit = useCallback(() => {
        props.handleSubmitEditing(props);
    }, [props]);

    const resetEdit = useCallback(() => {
        props.rollbackEdit();
    }, [props]);

    const isFormInvalid = useMemo(
        () => Object.entries(props.context.editErrors).length !== 0,
        [props.context.editErrors]
    );

    return (
        <Box sx={mergeSx(styles.leftFade, styles.editCell)}>
            <IconButton size={'small'} onClick={validateEdit} disabled={isFormInvalid}>
                <CheckIcon />
            </IconButton>

            <IconButton size={'small'} onClick={resetEdit}>
                <ClearIcon />
            </IconButton>
        </Box>
    );
};

export const formatNAValue = (value: string, intl: IntlShape): string => {
    return value === NA_Value ? intl.formatMessage({ id: 'Undefined' }) : value;
};
