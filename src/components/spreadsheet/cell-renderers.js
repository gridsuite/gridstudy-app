import { OverflowableText } from '@gridsuite/commons-ui';
import { Checkbox, Tooltip, IconButton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { RunningStatus } from 'components/util/running-status';
import { INVALID_LOADFLOW_OPACITY } from 'utils/colors';
import EditIcon from '@mui/icons-material/Edit';
import { useEffect } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const useStyles = makeStyles((theme) => ({
    tableCell: {
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
    },
    valueInvalid: {
        opacity: INVALID_LOADFLOW_OPACITY,
    },
    numericValue: {
        marginLeft: 'inherit',
    },
    referenceEditRow: {
        '& button': {
            color: theme.palette.primary.main,
            cursor: 'initial',
        },
        padding: 0,
    },
    leftFade: {
        background:
            'linear-gradient(to right, ' +
            theme.palette.primary.main +
            ' 0%, ' +
            theme.palette.primary.main +
            ' 2%, rgba(0,0,0,0) 12%)',
        borderBottomLeftRadius: theme.spacing(0.5),
        borderTopLeftRadius: theme.spacing(0.5),
    },
    topEditRow: {
        borderTop: '1px solid ' + theme.palette.primary.main,
        borderBottom: '1px solid ' + theme.palette.primary.main,
    },
}));

export const BooleanCellRenderer = (rowData, key, style) => {
    const isChecked = rowData.value;
    return (
        <div key={key} style={style}>
            <div>
                {isChecked !== undefined && (
                    <Checkbox
                        color="default"
                        checked={isChecked}
                        disableRipple={true}
                    />
                )}
            </div>
        </div>
    );
};

export const DefaultCellRenderer = (props) => {
    const classes = useStyles();
    return (
        <OverflowableText
            className={clsx({
                [classes.valueInvalid]:
                    props.colDef.canBeInvalidated &&
                    props.loadFlowStatus !== RunningStatus.SUCCEED,
                [classes.numericValue]: props.colDef.numeric,
            })}
            text={props.value}
        />
    );
};

export const formatCell = (props) => {
    let value = props.value;
    let tooltipValue = undefined;
    if (props.colDef.valueGetter) {
        value = props.colDef.valueGetter(props, props.network);
    }
    if (props.colDef.normed) {
        value = props.colDef.normed(props.fluxConvention, value);
    }
    if (
        value !== undefined &&
        props.colDef.numeric &&
        props.colDef.fractionDigits
    ) {
        // only numeric rounded cells have a tooltip (their raw numeric value)
        tooltipValue = value;
        value = parseFloat(value).toFixed(props.colDef.fractionDigits);
    }
    return { value: value, tooltip: tooltipValue };
};

export const NumericCellRenderer = (props) => {
    const classes = useStyles();
    const cellValue = formatCell(props);
    return (
        <div key={props.rowIndex}>
            <div className={classes.tableCell}>
                {cellValue.tooltip !== undefined ? (
                    <Tooltip
                        disableFocusListener
                        disableTouchListener
                        title={cellValue.tooltip}
                    >
                        <div
                            children={cellValue.value}
                            className={clsx({
                                [classes.valueInvalid]:
                                    props.colDef.canBeInvalidated &&
                                    props.loadFlowStatus !==
                                        RunningStatus.SUCCEED,
                                [classes.numericValue]: props.colDef.numeric,
                            })}
                        />
                    </Tooltip>
                ) : (
                    <OverflowableText
                        className={clsx({
                            [classes.valueInvalid]:
                                props.colDef.canBeInvalidated &&
                                props.loadFlowStatus !== RunningStatus.SUCCEED,
                            [classes.numericValue]: props.colDef.numeric,
                        })}
                        text={cellValue.value}
                    />
                )}
            </div>
        </div>
    );
};

export const EditableCellRenderer = (props) => {
    const classes = useStyles();
    return (
        <div style={props.style}>
            <div className={classes.editCell}>
                <IconButton
                    size={'small'}
                    onClick={() => {
                        props.setEditingData({
                            ...props.data,
                            metadata: {
                                equipmentType: props.equipmentType,
                            },
                        });
                    }}
                >
                    <EditIcon />
                </IconButton>
            </div>
        </div>
    );
};

export const DisabledEditCellRenderer = (props) => {
    const classes = useStyles();
    return (
        <div style={props.style}>
            <div className={classes.editCell}>
                <IconButton size={'small'} disabled>
                    <EditIcon />
                </IconButton>
            </div>
        </div>
    );
};

export const EditedLineCellRenderer = (props) => {
    const classes = useStyles();
    return (
        <div className={clsx(classes.referenceEditRow, classes.leftFade)}>
            <div className={classes.editCell}>
                <IconButton
                    size={'small'}
                    style={{ backgroundColor: 'transparent' }}
                    disableRipple
                >
                    <MoreHorizIcon />
                </IconButton>
            </div>
        </div>
    );
};

export const EditingCellRenderer = (props) => {
    const classes = useStyles();

    useEffect(() => {
        const editRow = props.api?.getPinnedTopRow(0);
        if (editRow) {
            props.api?.startEditingCell({
                rowIndex: editRow.rowIndex,
                colKey: 'edit',
                rowPinned: editRow.rowPinned,
            });
        }
    }, [props.api]);

    function validateEdit() {
        props.api?.stopEditing();
        props.setIsValidatingData(true);
    }

    function resetEdit() {
        props.api?.stopEditing(true);
        props.setEditingData();
    }

    return (
        <div
            style={props.style}
            className={clsx(classes.topEditRow, classes.leftFade)}
        >
            <div className={classes.editCell}>
                <>
                    <IconButton size={'small'} onClick={resetEdit}>
                        <ClearIcon />
                    </IconButton>
                    {Object.entries(props.errors).length === 0 && (
                        <IconButton size={'small'} onClick={validateEdit}>
                            <CheckIcon />
                        </IconButton>
                    )}
                </>
            </div>
        </div>
    );
};
