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
import { FormattedMessage, useIntl } from 'react-intl';
import { validateField } from '../util/validation-functions';
import {
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Tooltip,
} from '@material-ui/core';
import TextFieldWithAdornment from '../util/text-field-with-adornment';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import ConnectivityEdition from './connectivity-edition';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import { Autocomplete, createFilterOptions } from '@material-ui/lab';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/ControlPoint';
import {
    func_identity,
    toFloatValue,
    toIntValue,
    useStyles,
} from './dialogUtils';
import { getComputedLanguage } from '../../utils/language';
import { useParameterState } from '../parameters';
import { PARAM_LANGUAGE } from '../../utils/config-params';
import FindInPageIcon from '@material-ui/icons/FindInPage';

export const useInputForm = () => {
    const validationMap = useRef(new Map());
    const [toggleClear, setToggleClear] = useState(false);
    const validate = useCallback(() => {
        // Check if error list contains an error
        return Array.from(validationMap.current.values())
            .map((e) => e())
            .every((res) => res);
    }, []);
    const addValidation = useCallback((id, validate) => {
        validationMap.current.set(id, validate);
    }, []);
    const clear = useCallback(() => {
        setToggleClear((oldValue) => !oldValue);
    }, []);
    const reset = useCallback((label, validate) => {
        validationMap.current = new Map();
    }, []);
    return {
        toggleClear,
        clear,
        validate,
        addValidation,
        reset,
    };
};

function genHelperError(...errors) {
    const inError = errors.find((e) => e);
    if (inError)
        return {
            error: true,
            helperText: <FormattedMessage id={inError} />,
        };
    return {};
}

const FieldLabel = ({ label, optional }) => {
    return (
        <>
            <FormattedMessage id={label} />
            {optional && <FormattedMessage id="Optional" />}
        </>
    );
};

export const useTextValue = ({
    label,
    id,
    defaultValue = '',
    validation = {},
    adornment,
    transformValue = func_identity,
    acceptValue,
    inputForm,
    formProps,
    errorMsg,
}) => {
    const [value, setValue] = useState(defaultValue);
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
        inputForm.addValidation(id ? id : label, validate);
    }, [label, inputForm, value, id, validation]);

    const handleChangeValue = useCallback(
        (event) => {
            if (acceptValue === undefined || acceptValue(event.target.value))
                setValue(transformValue(event.target.value));
        },
        [acceptValue, transformValue]
    );

    const field = useMemo(() => {
        const Field = adornment ? TextFieldWithAdornment : TextField;
        return (
            <Field
                key={id ? id : label}
                size="small"
                fullWidth
                id={id ? id : label}
                label={FieldLabel({
                    label,
                    optional:
                        !validation.isFieldRequired && !formProps?.disabled,
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
                {...genHelperError(error, errorMsg)}
                {...formProps}
            />
        );
    }, [
        adornment,
        id,
        label,
        validation.isFieldRequired,
        value,
        handleChangeValue,
        classes.helperText,
        error,
        errorMsg,
        formProps,
    ]);

    useEffect(
        () => setValue(defaultValue),
        [defaultValue, inputForm.toggleClear]
    );
    return [value, field];
};

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

function isFloatNumber(val) {
    return /^-?[0-9]*[.,]?[0-9]*$/.test(val);
}

export const useDoubleValue = ({
    transformValue = toFloatValue,
    validation,
    ...props
}) => {
    return useTextValue({
        ...props,
        acceptValue: isFloatNumber,
        transformValue: transformValue,
        validation: { ...validation, isFieldNumeric: true },
    });
};

export const useBooleanValue = ({
    label,
    id,
    defaultValue,
    validation = {},
    inputForm,
    formProps,
}) => {
    const [value, setValue] = useState(defaultValue);
    const intl = useIntl();

    useEffect(() => {
        function validate() {
            return true;
        }
        inputForm.addValidation(id ? id : label, validate);
    }, [label, validation, inputForm, value, id]);

    const handleChangeValue = useCallback((event) => {
        setValue(event.target.checked);
    }, []);

    const field = useMemo(() => {
        return (
            <FormControlLabel
                id={id ? id : label}
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
    }, [intl, label, value, handleChangeValue, formProps, id]);

    useEffect(
        () => setValue(defaultValue),
        [defaultValue, inputForm.toggleClear]
    );

    return [value, field];
};

export const useConnectivityValue = ({
    label,
    id,
    validation = {
        isFieldRequired: true,
    },
    inputForm,
    voltageLevelOptions,
    workingNodeUuid,
    direction = 'row',
    voltageLevelIdDefaultValue,
    busOrBusbarSectionIdDefaultValue,
}) => {
    const [connectivity, setConnectivity] = useState({
        voltageLevel: null,
        busOrBusbarSection: null,
    });
    const [errorVoltageLevel, setErrorVoltageLevel] = useState();
    const [errorBusBarSection, setErrorBusBarSection] = useState();
    const intl = useIntl();

    useEffect(() => {
        setConnectivity({
            voltageLevel: null,
            busOrBusbarSection: null,
        });
    }, [inputForm.toggleClear]);

    useEffect(() => {
        setConnectivity({
            voltageLevel: voltageLevelIdDefaultValue
                ? voltageLevelOptions.find(
                      (value) => value.id === voltageLevelIdDefaultValue
                  )
                : null,
            busOrBusbarSection: busOrBusbarSectionIdDefaultValue
                ? {
                      id: busOrBusbarSectionIdDefaultValue,
                  }
                : null,
        });
    }, [
        voltageLevelOptions,
        busOrBusbarSectionIdDefaultValue,
        voltageLevelIdDefaultValue,
    ]);

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
        inputForm.addValidation(id ? id : label, validate);
    }, [connectivity, label, validation, inputForm, id]);

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
                direction={direction}
            />
        );
    }, [
        connectivity,
        direction,
        errorBusBarSection,
        errorVoltageLevel,
        intl,
        setBusOrBusbarSection,
        setVoltageLevel,
        voltageLevelOptions,
        workingNodeUuid,
    ]);

    return [connectivity, render];
};

const filter = createFilterOptions();

export const useAutocompleteField = ({
    id,
    label,
    validation = {},
    inputForm,
    formProps,
    values,
    getLabel = func_identity,
    allowNewValue = false,
    errorMsg,
    selectedValue,
    defaultValue,
}) => {
    const [value, setValue] = useState(defaultValue);
    const [error, setError] = useState('');
    const validationRef = useRef();
    validationRef.current = validation;

    useEffect(() => {
        if (defaultValue) {
            setValue(defaultValue);
        }
    }, [defaultValue]);

    useEffect(() => {
        function validate() {
            const res = validateField('' + value, validationRef.current);
            setError(res?.errorMsgId);
            return !res.error;
        }
        inputForm.addValidation(id ? id : label, validate);
    }, [label, validation, inputForm, value, id]);

    const handleChangeValue = useCallback((value) => {
        setValue(value);
    }, []);

    useEffect(() => {
        if (selectedValue) {
            setValue(selectedValue);
        }
    }, [selectedValue]);

    const field = useMemo(() => {
        return (
            <Autocomplete
                id={label}
                onChange={(event, newValue) => {
                    handleChangeValue(newValue);
                }}
                size={'small'}
                options={values}
                getOptionLabel={getLabel}
                defaultValue={value}
                value={value}
                {...(allowNewValue && {
                    filterOptions: (options, params) => {
                        const filtered = filter(options, params);
                        if (
                            params.inputValue !== '' &&
                            !options.find((opt) => opt.id === params.inputValue)
                        ) {
                            filtered.push({
                                inputValue: params.inputValue,
                                id: params.inputValue,
                            });
                        }
                        return filtered;
                    },
                })}
                renderInput={(props) => (
                    <TextField
                        {...formProps}
                        {...props}
                        size="small"
                        label={
                            <FieldLabel
                                label={label}
                                optional={!validation.isFieldRequired}
                            />
                        }
                        value={value}
                        {...genHelperError(error, errorMsg)}
                    />
                )}
            />
        );
    }, [
        label,
        values,
        getLabel,
        allowNewValue,
        handleChangeValue,
        validation.isFieldRequired,
        value,
        error,
        errorMsg,
        formProps,
    ]);

    return [value, field];
};

const DELAY = 1000;

export const useButtonWithTooltip = ({ handleClick, label }) => {
    const classes = useStyles();

    return useMemo(() => {
        return (
            <Tooltip
                title={<FormattedMessage id={label} />}
                placement="top"
                arrow
                enterDelay={DELAY}
                enterNextDelay={DELAY}
                classes={{ tooltip: classes.tooltip }}
            >
                <IconButton style={{ padding: '2px' }} onClick={handleClick}>
                    <FindInPageIcon />
                </IconButton>
            </Tooltip>
        );
    }, [label, handleClick, classes.tooltip]);
};

export const useCountryValue = (props) => {
    const [languageLocal] = useParameterState(PARAM_LANGUAGE);
    const [code, setCode] = useState(props.defaultCodeValue);

    const countriesList = useMemo(() => {
        try {
            return require('localized-countries')(
                require('localized-countries/data/' +
                    getComputedLanguage(languageLocal).substr(0, 2))
            );
        } catch (error) {
            // fallback to english if no localised list found
            return require('localized-countries')(
                require('localized-countries/data/en')
            );
        }
    }, [languageLocal]);

    useEffect(() => {
        //We only need to search for the code if we only have the label
        if (
            props.defaultLabelValue !== null &&
            props.defaultCodeValue === null
        ) {
            let res = countriesList
                .array()
                .filter(
                    (obj) =>
                        obj.label.toLowerCase() ===
                        props.defaultLabelValue.toLowerCase()
                )[0];
            setCode(res.code);
        } else if (props.defaultCodeValue !== null) {
            setCode(props.defaultCodeValue);
        } else {
            setCode(null);
        }
    }, [countriesList, props.defaultLabelValue, props.defaultCodeValue]);

    const values = useMemo(
        () => (countriesList ? Object.keys(countriesList.object()) : []),
        [countriesList]
    );
    const getOptionLabel = useCallback(
        (code) => countriesList.get(code),
        [countriesList]
    );

    return useAutocompleteField({
        values,
        getLabel: getOptionLabel,
        selectedValue: code,
        defaultValue: code,
        ...props,
    });
};

const getObjectId = (e) => e.id;
const getLabel = (e) => e.label;

export const useEnumValue = ({
    label,
    defaultValue,
    validation = {},
    inputForm,
    formProps,
    enumValues,
    doTranslation = true,
    getId = getObjectId,
    getEnumLabel = getLabel,
}) => {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        function validate() {
            return true;
        }
        inputForm.addValidation(label, validate);
    }, [label, validation, inputForm, value]);

    const handleChangeValue = useCallback((event) => {
        setValue(event.target.value);
    }, []);

    const field = useMemo(() => {
        return (
            <FormControl fullWidth size="small">
                {/*This InputLabel is necessary in order to display
                            the label describing the content of the Select*/}
                <InputLabel id="enum-type-label" variant={'filled'}>
                    <FieldLabel
                        label={label}
                        optional={!validation.isFieldRequired}
                    />
                </InputLabel>
                <Select
                    id={label}
                    value={value || ''}
                    onChange={handleChangeValue}
                    variant="filled"
                    fullWidth
                    {...formProps}
                >
                    {enumValues.map((e, index) => (
                        <MenuItem value={getId(e)} key={e.id + '_' + index}>
                            <em>
                                {doTranslation && (
                                    <FormattedMessage id={getEnumLabel(e)} />
                                )}
                                {!doTranslation && getEnumLabel(e)}
                            </em>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }, [
        getId,
        getEnumLabel,
        label,
        value,
        handleChangeValue,
        formProps,
        enumValues,
        doTranslation,
        validation.isFieldRequired,
    ]);

    useEffect(() => {
        setValue('');
    }, [inputForm.toggleClear]);

    useEffect(() => {
        setValue(defaultValue || '');
    }, [defaultValue]);

    return [value, field];
};

export const useExpandableValues = ({
    id,
    labelAddValue,
    Field,
    inputForm,
    defaultValues,
    fieldProps,
    validateItem,
}) => {
    const classes = useStyles();
    const [values, setValues] = useState([]);
    const [errors, setErrors] = useState();

    useEffect(() => {
        if (defaultValues) {
            setValues([...defaultValues]);
        } else {
            setValues([]);
        }
    }, [defaultValues]);

    const handleDeleteBusBarSection = useCallback((index) => {
        setValues((oldValues) => {
            let newValues = [...oldValues];
            newValues.splice(index, 1);
            return newValues;
        });
    }, []);

    const handleSetValue = useCallback((index, newValue) => {
        setValues((oldValues) => {
            let newValues = [...oldValues];
            newValues[index] = newValue;
            return newValues;
        });
    }, []);

    const handleAddValue = useCallback(() => {
        setValues((oldValues) => [...oldValues, {}]);
    }, []);

    useEffect(() => {
        function validation() {
            const res = validateItem(values);
            setErrors(res);
            return res?.size === 0;
        }
        inputForm.addValidation(id, validation);
    }, [inputForm, values, id, validateItem]);

    const field = useMemo(() => {
        return (
            <Grid item container>
                {values.map((value, idx) => (
                    <Grid key={id + idx} container spacing={2} item>
                        <Field
                            fieldProps={fieldProps}
                            defaultValue={value}
                            onChange={handleSetValue}
                            index={idx}
                            inputForm={inputForm}
                            errors={errors?.get(idx)}
                        />
                        <Grid item xs={1}>
                            <IconButton
                                className={classes.icon}
                                key={id + idx}
                                onClick={() => handleDeleteBusBarSection(idx)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <Button
                            fullWidth
                            className={classes.button}
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={handleAddValue}
                        >
                            <FormattedMessage id={labelAddValue} />
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        );
    }, [
        values,
        classes,
        handleAddValue,
        labelAddValue,
        id,
        fieldProps,
        handleSetValue,
        inputForm,
        errors,
        handleDeleteBusBarSection,
    ]);

    return [values, field];
};
