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

export const SusceptenceAdornment = {
    position: 'end',
    text: 'S',
};

export const filledTextField = {
    variant: 'filled',
};

const func_identity = (e) => e;

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
    validationRef.current = validation;

    useEffect(() => {
        function validate() {
            const res = validateField(value, validationRef.current);
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
                value={value}
                onChange={handleChangeValue}
                {...(error && {
                    error: true,
                    helperText: intl.formatMessage({
                        id: error,
                    }),
                })}
                {...formProps}
            />
        );
    }, [label, intl, adornment, value, handleChangeValue, error, formProps]);

    useEffect(() => setValue(defaultValue), [defaultValue, clear]);
    return [value, field];
};

function toIntValue(val) {
    if (val === '-') return val;
    return parseInt(val) || 0;
}
export const useIntegerValue = ({
    label,
    defaultValue,
    validation = {},
    validationMap,
    adornment,
    transformValue = toIntValue,
    clear,
    formProps,
}) => {
    const [value, setValue] = useState(defaultValue);
    const intl = useIntl();
    const [error, setError] = useState();
    const validationRef = useRef();
    validationRef.current = { isFieldNumeric: true, ...validation };

    useEffect(() => {
        function validate() {
            const res = validateField(value, validationRef.current);
            setError(res?.errorMsgId);
            return !res.error;
        }
        validationMap.current.set(label, validate);
    }, [label, validationMap, value]);

    const handleChangeValue = useCallback(
        (event) => {
            const newValue = transformValue(event.target.value);
            setValue(newValue);
        },
        [transformValue]
    );

    const field = useMemo(() => {
        const Field = adornment ? TextFieldWithAdornment : TextField;
        return (
            <Field
                size="small"
                fullWidth
                id={label}
                label={intl.formatMessage({
                    id: label,
                })}
                value={'' + value}
                onChange={handleChangeValue}
                {...(error && {
                    error: true,
                    helperText: intl.formatMessage({
                        id: error,
                    }),
                })}
                {...(adornment && {
                    adornmentPosition: adornment.position,
                    adornmentText: adornment?.text,
                })}
                {...formProps}
            />
        );
    }, [intl, label, value, adornment, handleChangeValue, formProps, error]);

    useEffect(() => setValue(defaultValue), [defaultValue, clear]);

    return [value, field];
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

const commaToPoint = (e) => {
    // TODO: remove replace when parsing behaviour will be made according to locale
    // Replace ',' by '.' to ensure double values can be parsed correctly
    return e?.replace(',', '.');
};
export const useDoubleValue = (props) => {
    return useIntegerValue({ ...props, transformValue: commaToPoint });
};

export const useConnectivityValue = ({
    label,
    validation = {
        isFieldRequired: true,
    },
    validationMap,
    clear,
    voltageLevelOptions,
    selectedNodeUuid,
}) => {
    const [connectivity, setConnectivity] = useState({
        voltageLevel: null,
        busOrBusbarSection: null,
    });
    const [errorVoltageLevel, setErrorVoltageLevel] = useState();
    const [errorBusBarSection, setBusBarSection] = useState();
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
            setBusBarSection(resBBS?.errorMsgId);
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
                selectedNodeUuid={selectedNodeUuid}
            />
        );
    }, [
        connectivity,
        errorBusBarSection,
        errorVoltageLevel,
        intl,
        selectedNodeUuid,
        setBusOrBusbarSection,
        setVoltageLevel,
        voltageLevelOptions,
    ]);

    return [connectivity, render];
};
