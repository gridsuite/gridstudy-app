import { TextField, Tooltip } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { useIntl } from 'react-intl';

export const TableNumericalInput = ({
    name,
    defaultValue,
    min,
    max,
    setColumnError,
    resetColumnError,
    forceLineUpdate,
    columnDefinition,
    setter,
    style,
    inputProps,
    ...props
}) => {
    const { trigger } = useFormContext();
    const {
        field: { onChange, value },
        fieldState: { error },
    } = useController({ name });

    const intl = useIntl();

    // const isValid = useCallback((val, minVal, maxVal) => {
    //     if (isNaN(val)) {
    //         return false;
    //     }
    //     let valFloat = parseFloat(val);
    //     if (isNaN(valFloat)) {
    //         return false;
    //     }
    //     return (
    //         (minVal === undefined || valFloat >= minVal) &&
    //         (maxVal === undefined || valFloat <= maxVal)
    //     );
    // }, []);

    // const validateChange = useCallback(
    //     (newVal) => {
    //         if (isValid(newVal, min, max)) {
    //             setError(false);
    //             resetColumnError(columnDefinition.dataKey);
    //         } else {
    //             setError(true);
    //             setColumnError(columnDefinition.dataKey);
    //         }
    //     },
    //     [
    //         setError,
    //         min,
    //         max,
    //         isValid,
    //         setColumnError,
    //         resetColumnError,
    //         columnDefinition.dataKey,
    //     ]
    // );

    // const validateEvent = useCallback(
    //     (ev) => {
    //         const newVal = ev.target.value;
    //         setUserChangeInProgress(true);
    //         setter(newVal);
    //         setCurrentValue(newVal);
    //     },
    //     [setter]
    // );

    // useEffect(() => {
    //     // validate the initial state, or any further update
    //     validateChange(currentValue);
    // }, [currentValue, validateChange]);

    // const onFocusOut = useCallback(
    //     (ev) => {
    //         if (userChangeInProgress && columnDefinition.forceUpdateOnChange) {
    //             setUserChangeInProgress(false);
    //             // force a parent update: all Editors will be updated. Ex: usefull to propagate min/max updates
    //             forceLineUpdate();
    //         }
    //     },
    //     [
    //         forceLineUpdate,
    //         userChangeInProgress,
    //         columnDefinition.forceUpdateOnChange,
    //     ]
    // );

    const handleInputChange = (e) => {
        onChange(e.target.value);
        trigger(name);
    };

    const renderNumericText = () => {
        return (
            <TextField
                value={value}
                onChange={handleInputChange}
                {...props}
                error={error?.message}
                type="Number"
                size={'small'}
                margin={'none'}
                style={{ ...style, padding: 0 }}
                inputProps={{
                    style: {
                        textAlign: 'center',
                        fontSize: 'small',
                    },
                    min: { min },
                    max: { max },
                    step: 'any',
                    lang: 'en-US', // to have . as decimal separator
                    ...inputProps,
                }}
            />
        );
    };

    const renderNumericTextWithTooltip = () => {
        let tooltip = '';
        if (min !== undefined && max !== undefined) {
            tooltip = intl.formatMessage({ id: 'MinMax' }, { min, max });
        } else if (min !== undefined) {
            tooltip = intl.formatMessage({ id: 'OnlyMin' }, { min });
        } else if (max !== undefined) {
            tooltip = intl.formatMessage({ id: 'OnlyMax' }, { max });
        }
        if (tooltip !== '') {
            return <Tooltip title={tooltip}>{renderNumericText()}</Tooltip>;
        }
        return renderNumericText();
    };

    return <div>{renderNumericTextWithTooltip()}</div>;
};
