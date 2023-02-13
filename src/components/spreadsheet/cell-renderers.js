import { OverflowableText } from '@gridsuite/commons-ui';
import { Checkbox, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { RunningStatus } from 'components/util/running-status';
import { INVALID_LOADFLOW_OPACITY } from 'utils/colors';

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
        marginLeft: 'inherit', // use 'auto' to align right (if display is flex)
    },
}));

export const booleanCellRender = (rowData, key, style) => {
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

export const useDefaultCellRenderer = (props) => {
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
    // Note: a data may be missing in the server response (ex: p1 from 2W-Transfo).
    // In this case, its value is undefined and nothing is displayed in the cell.
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

export const useNumericDefaultCellRenderer = (props) => {
    const classes = useStyles();

    console.log(props);
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
