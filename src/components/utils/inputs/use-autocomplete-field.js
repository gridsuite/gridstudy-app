/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { func_identity } from '../../dialogs/dialogUtils';
import { FormattedMessage, useIntl } from 'react-intl';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { validateField } from '../validation-functions';
import { Autocomplete, TextField } from '@mui/material';
import {
    FieldLabel,
    genHelperError,
    genHelperPreviousValue,
} from './hooks-helpers';

const QUESTIONABLE_SIZE = 1000;

/**
 * Returns the lowest index for which the two given arrays differ.
 * If full shallow match, return -1.
 * if not arrays, return undefined
 * @param a1 an array
 * @param a2 an other array
 * @returns {number|undefined}
 */
function arraysMismatchIndex(a1, a2) {
    if (!Array.isArray(a1) || !Array.isArray(a2)) {
        return undefined;
    }

    if (a1.length !== a2.length) {
        return Math.min(a1.length, a2.length);
    }

    for (var i in a2) {
        if (a1[i] !== a2[i]) {
            return i;
        }
    }
    return -1;
}

const isWorthLoading = (term, elements, old, minLen) => {
    const idx = elements.findIndex((e) => e.label === term || e.id === term);
    if (idx >= 0) {
        return false;
    }
    if (term.length < minLen) {
        return false;
    }
    if (!term.startsWith(old)) {
        return true;
    }
    if (old.length < minLen || minLen === 0) {
        return true;
    }
    if (elements.length === QUESTIONABLE_SIZE) {
        return true;
    }

    return false;
};

const defaultEntryToValue = (entry) => {
    return { id: entry };
};

export const useAutocompleteField = ({
    id,
    label,
    validation = {},
    inputForm,
    formProps,
    onSearchTermChange,
    minCharsBeforeSearch = 3,
    values,
    renderElement,
    getLabel = func_identity,
    allowNewValue = false,
    newEntryToValue = defaultEntryToValue,
    errorMsg,
    selectedValue,
    defaultValue,
    previousValue,
    loading = false,
    readOnlyTextField = false,
}) => {
    const intl = useIntl();

    const [presentedOptions, setPresentedOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(loading);
    const [expanded, setExpanded] = useState(false);
    const [userStr, setUserStr] = useState('');
    const [value, setValue] = useState(defaultValue);
    const [error, setError] = useState();
    const validationRef = useRef();

    const prevValues = useRef();
    validationRef.current = validation;

    useEffect(() => {
        if (defaultValue !== undefined) {
            setValue(defaultValue);
        }
    }, [defaultValue]);

    useEffect(() => {
        function validate() {
            const res = validateField(getLabel(value), validationRef.current);
            setError(res?.errorMsgId);
            return !res.error;
        }

        inputForm?.addValidation(id || label, validate);
    }, [label, validation, inputForm, value, selectedValue, id, getLabel]);

    const handleChangeValue = useCallback(
        (value) => {
            setValue(value);
            inputForm?.setHasChanged(true);
        },
        [inputForm]
    );

    useEffect(() => {
        if (selectedValue) {
            setValue(selectedValue);
        }
    }, [selectedValue]);

    useEffect(() => {
        const mismatchIdx = arraysMismatchIndex(prevValues.current, values);
        const shouldUpdateValueToo =
            mismatchIdx >= 0 &&
            prevValues.current.length > mismatchIdx &&
            value === prevValues.current[mismatchIdx];
        const valuesChanged = prevValues.current !== values;
        prevValues.current = values;

        if (mismatchIdx === -1) {
            if (valuesChanged) {
                setIsLoading(false);
            }

            if (!getLabel) {
                return;
            }

            const inOps = presentedOptions.find((o) => getLabel(o) === value);
            if (inOps) {
                setValue(inOps);
            }

            return;
        }

        if (!values || typeof values === 'function') {
            setIsLoading(false);
            return;
        }

        if (typeof values?.then === 'function') {
            setIsLoading(true);
        }
        const valuePromise = Promise.resolve(values);
        valuePromise.then((vals) => {
            setPresentedOptions(vals);
            if (vals?.length > mismatchIdx && shouldUpdateValueToo) {
                setValue(vals[mismatchIdx]);
            }
            setIsLoading(false);
            if (values?.length === 0) {
                setExpanded(false);
            }
        });
    }, [values, id, defaultValue, getLabel, presentedOptions, value]);

    const handleForcedSearch = useCallback(
        (term) => {
            if (!onSearchTermChange) {
                return;
            }
            setIsLoading(true);
            setExpanded(true);
            onSearchTermChange(term, true);
        },
        [onSearchTermChange]
    );

    const onOpen = useCallback(() => {
        setExpanded(true);

        if (!onSearchTermChange) {
            return;
        }
        if (isWorthLoading(userStr, presentedOptions, userStr, 0)) {
            setIsLoading(true);
            onSearchTermChange(userStr, false);
        }
    }, [presentedOptions, userStr, onSearchTermChange]);

    const handleSearchTermChange = useCallback(
        (term, reason) => {
            if (allowNewValue && reason !== 'reset') {
                let matchingOption = values?.find(
                    (val) => val.id?.toUpperCase() === term.toUpperCase()
                );
                if (matchingOption) {
                    setValue(matchingOption);
                } else {
                    setValue(newEntryToValue(term));
                }
                inputForm?.setHasChanged(true);
            }

            if (!onSearchTermChange) {
                return;
            }

            const min = minCharsBeforeSearch;

            setUserStr((old) => {
                if (isWorthLoading(term, values, old, min)) {
                    setIsLoading(true);
                    onSearchTermChange(term, false);
                }
                return term;
            });
        },
        [
            values,
            minCharsBeforeSearch,
            onSearchTermChange,
            allowNewValue,
            newEntryToValue,
            inputForm,
        ]
    );

    const field = useMemo(() => {
        const handleKeyDown = (e) => {
            if (readOnlyTextField) {
                // in readonly mode, we disable any user Key strike, except Tab for navigation
                if (e.code !== 'Tab') {
                    e.preventDefault();
                }
            } else {
                if (e.ctrlKey && e.code === 'Space') {
                    handleForcedSearch(userStr);
                }
            }
        };

        const optionEqualsToValue = (option, input) =>
            option === input ||
            option.id === input ||
            (option.id !== undefined && option.id === input?.id);

        return (
            <Autocomplete
                id={label}
                onChange={(event, newValue) => {
                    handleChangeValue(newValue);
                }}
                open={expanded}
                onOpen={onOpen}
                onClose={() => {
                    setExpanded(false);
                }}
                size={'small'}
                forcePopupIcon
                options={isLoading ? [] : presentedOptions}
                getOptionLabel={getLabel}
                defaultValue={defaultValue}
                value={value}
                loading={isLoading}
                loadingText={<FormattedMessage id="loadingOptions" />}
                {...(allowNewValue && {
                    freeSolo: true,
                    isOptionEqualToValue: optionEqualsToValue,
                    autoComplete: true,
                    blurOnSelect: true,
                    clearOnBlur: true,
                })}
                onInputChange={(_event, value, reason) =>
                    handleSearchTermChange(value, reason)
                }
                noOptionsText={intl.formatMessage({
                    id: 'element_search/noResult',
                })}
                {...(renderElement && {
                    renderOption: (optionProps, element, { inputValue }) =>
                        renderElement({
                            ...optionProps,
                            element,
                            inputValue,
                        }),
                })}
                renderInput={(props) => (
                    <TextField
                        {...formProps}
                        {...props}
                        onKeyDown={handleKeyDown}
                        size="small"
                        label={
                            <FieldLabel
                                label={label}
                                optional={validation.isFieldRequired === false}
                            />
                        }
                        value={value}
                        {...genHelperPreviousValue(previousValue)}
                        {...genHelperError(error, errorMsg)}
                    />
                )}
            />
        );
    }, [
        label,
        presentedOptions,
        getLabel,
        allowNewValue,
        handleChangeValue,
        validation.isFieldRequired,
        value,
        defaultValue,
        previousValue,
        error,
        errorMsg,
        formProps,
        isLoading,
        expanded,
        handleSearchTermChange,
        handleForcedSearch,
        intl,
        renderElement,
        onOpen,
        userStr,
        readOnlyTextField,
    ]);

    return [value, field, setValue];
};
