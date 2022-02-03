/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useIntl } from 'react-intl';
import { validateField } from '../util/validation-functions';
import { TextField } from '@material-ui/core';
import TextFieldWithAdornment from '../util/text-field-with-adornment';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import ConnectivityEdition from './connectivity-edition';
import { makeStyles } from '@material-ui/core/styles';

export const SusceptanceAdornment = {
    position: 'end',
    text: 'S',
};

export const filledTextField = {
    variant: 'filled',
};

const func_identity = (e) => e;

const useStyles = makeStyles((theme) => ({
    helperText: {
        margin: 0,
        marginTop: 4,
    },
}));

export const useTextValue = ({
    label,
    defaultValue = '',
    validation = {},
    validationMap,
    adornment,
    transformValue = func_identity,
    clear,
    formProps,
}) => {
    const [value, setValue] = useState(defaultValue);
    const intl = useIntl();
    const [error, setError] = useState();

    const validationRef = useRef();
    const classes = useStyles();

    validationRef.current = validation;

    useEffect(() => {
        function validate() {
            const res = validateField('' + value, validationRef.current);
            setError(res?.errorMsgId);
            return !res.error;
        }
        validationMap.current.set(label, validate);
    }, [label, validationMap, value]);

    const handleChangeValue = useCallback(
        (event) => {
            setValue(transformValue(event.target.value));
        },
        [transformValue]
    );

    const field = useMemo(() => {
        const Field = adornment ? TextFieldWithAdornment : TextField;
        return (
            <Field
                key={label}
                size="small"
                fullWidth
                id={label}
                label={intl.formatMessage({
                    id: label,
                })}
                {...(adornment && {
                    adornmentPosition: adornment.position,
                    adornmentText: adornment?.text,
                })}
                value={'' + value} // handle numerical value
                onChange={handleChangeValue}
                FormHelperTextProps={{
                    className: classes.helperText,
                }}
                {...(error && {
                    error: true,
                    helperText: intl.formatMessage({
                        id: error,
                    }),
                })}
                {...formProps}
            />
        );
    }, [
        label,
        intl,
        adornment,
        value,
        handleChangeValue,
        error,
        formProps,
        classes,
    ]);

    useEffect(() => setValue(defaultValue), [defaultValue, clear]);
    return [value, field];
};

function toIntValue(val) {
    if (val === '-') return val;
    return parseInt(val) || 0;
}

export function toPositiveIntValue(val) {
    val.replace('-', '');
    return parseInt(val) || 0;
}

export const useIntegerValue = ({
    transformValue = toIntValue,
    validation,
    ...props
}) => {
    return useTextValue({
        ...props,
        transformValue: transformValue,
        validation: { ...validation, isFieldNumeric: true },
    });
};

const toFloatValue = (val) => {
    if (val === '-') return val;
    // TODO: remove replace when parsing behaviour will be made according to locale
    // Replace ',' by '.' to ensure double values can be parsed correctly
    const tmp = val?.replace(',', '.') || '';
    if (tmp.endsWith('.')) return val;
    return parseFloat(val) || 0;
};

export const useDoubleValue = ({
    transformValue = toFloatValue,
    validation,
    ...props
}) => {
    return useTextValue({
        ...props,
        transformValue: transformValue,
        validation: { ...validation, isFieldNumeric: true },
    });
};

export const useBooleanValue = ({
    label,
    defaultValue,
    validation = {},
    validationMap,
    clear,
    formProps,
}) => {
    const [value, setValue] = useState(defaultValue);
    const intl = useIntl();

    useEffect(() => {
        function validate() {
            return true;
        }
        validationMap.current.set(label, validate);
    }, [label, validation, validationMap, value]);

    const handleChangeValue = useCallback((event) => {
        setValue(event.target.checked);
    }, []);

    const field = useMemo(() => {
        return (
            <FormControlLabel
                id={label}
                control={
                    <Switch
                        checked={value}
                        onChange={(e) => handleChangeValue(e)}
                        value="checked"
                        color="primary"
                        inputProps={{
                            'aria-label': 'primary checkbox',
                        }}
                        {...formProps}
                    />
                }
                label={intl.formatMessage({
                    id: label,
                })}
            />
        );
    }, [intl, label, value, handleChangeValue, formProps]);

    useEffect(() => setValue(defaultValue), [defaultValue, clear]);

    return [value, field];
};

export const useConnectivityValue = ({
    label,
    validation = {
        isFieldRequired: true,
    },
    validationMap,
    clear,
    voltageLevelOptions,
    workingNodeUuid,
}) => {
    const [connectivity, setConnectivity] = useState({
        voltageLevel: null,
        busOrBusbarSection: null,
    });
    const [errorVoltageLevel, setErrorVoltageLevel] = useState();
    const [errorBusBarSection, setErrorBusBarSection] = useState();
    const intl = useIntl();

    useEffect(
        () =>
            setConnectivity({
                voltageLevel: null,
                busOrBusbarSection: null,
            }),
        [clear]
    );

    useEffect(() => {
        function validate() {
            const resVL = validateField(connectivity.voltageLevel, validation);
            setErrorVoltageLevel(resVL?.errorMsgId);
            const resBBS = validateField(
                connectivity.busOrBusbarSection,
                validation
            );
            setErrorBusBarSection(resBBS?.errorMsgId);
            return !resVL.error && !resBBS.error;
        }
        validationMap.current.set(label, validate);
    }, [connectivity, label, validation, validationMap]);

    const setVoltageLevel = useCallback((newVal) => {
        setConnectivity((oldVal) => {
            return { ...oldVal, voltageLevel: newVal };
        });
    }, []);

    const setBusOrBusbarSection = useCallback((newVal) => {
        setConnectivity((oldVal) => {
            return { ...oldVal, busOrBusbarSection: newVal };
        });
    }, []);

    const render = useMemo(() => {
        return (
            <ConnectivityEdition
                voltageLevelOptions={voltageLevelOptions}
                voltageLevel={connectivity.voltageLevel}
                busOrBusbarSection={connectivity.busOrBusbarSection}
                onChangeVoltageLevel={(value) => setVoltageLevel(value)}
                onChangeBusOrBusbarSection={(busOrBusbarSection) =>
                    setBusOrBusbarSection(busOrBusbarSection)
                }
                errorVoltageLevel={errorVoltageLevel}
                helperTextVoltageLevel={
                    errorVoltageLevel &&
                    intl.formatMessage({
                        id: errorVoltageLevel,
                    })
                }
                errorBusOrBusBarSection={errorBusBarSection}
                helperTextBusOrBusBarSection={
                    errorBusBarSection &&
                    intl.formatMessage({
                        id: errorBusBarSection,
                    })
                }
                workingNodeUuid={workingNodeUuid}
            />
        );
    }, [
        connectivity,
        errorBusBarSection,
        errorVoltageLevel,
        intl,
        workingNodeUuid,
        setBusOrBusbarSection,
        setVoltageLevel,
        voltageLevelOptions,
    ]);

    return [connectivity, render];
};
