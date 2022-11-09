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
    useState,
} from 'react';
import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import { useStyles } from '../dialogUtils';
import Grid from '@mui/material/Grid';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/ControlPoint';
import { validateField, makeErrorRecord } from '../../util/validation-functions';
import { genHelperError } from './hooks-helpers';
import ReactiveCapabilityCurveTable from "../reactive-capability-curve-table";

const minimalValue = {p:"", qminP:"", qmaxP:""};

function getId(value) {
    return value?.id ? value.id : "defaultId";
}

function getNewId() {
    return Math.random().toString(36).substring(2);
}

function hasValueCorrectFormat(valueToTest, index) {
    return !!(valueToTest
        && valueToTest[index]
        && valueToTest[index].p !== undefined
        && valueToTest[index].qminP !== undefined
        && valueToTest[index].qmaxP !== undefined);
}

function enforceMinimumValues(valueToTest) {
    let returnValue = [];
    returnValue[0] = hasValueCorrectFormat(valueToTest, 0) ? valueToTest[0] : minimalValue;
    returnValue[1] = hasValueCorrectFormat(valueToTest, 1) ? valueToTest[1] : minimalValue;
    if (valueToTest?.length > 2) {
        for (let i=2; i<valueToTest.length; i++) {
            returnValue[i] = hasValueCorrectFormat(valueToTest, i) ? valueToTest[i] : minimalValue;
        }
    }
    return returnValue;
};

export const useReactiveCapabilityCurveTableValues = ({
    //id,
    tableHeadersIds,
    //Field,
    inputForm,
    defaultValues, // format : either undefined or [{p:"", qminP:"", qmaxP:""}, {p:"", qminP:"", qmaxP:""}]
    isReactiveCapabilityCurveOn,
    disabled = false,
}) => {

    const classes = useStyles();

    // Values sent back to the parent component.
    const [values, setValues] = useState(enforceMinimumValues(defaultValues));

    // Values displayed in the form. When updated, they also updates "values".
    const [displayedValues, setDisplayedValues] = useState(enforceMinimumValues(defaultValues));
    useEffect(() => {
        // Updates the component when the correct default values are given by the parent component.
        if (defaultValues !== undefined && defaultValues.length > 0) {
            const enforcedMinimumDefaultValues = enforceMinimumValues(defaultValues);
            setValues(enforcedMinimumDefaultValues);
            setDisplayedValues(enforcedMinimumDefaultValues);
        }
    }, [defaultValues]);

    const handleDeleteItem = useCallback((index) => {
        const newValues = [...values.slice(0, index), ...values.slice(index+1)];

        setValues(newValues);
        setDisplayedValues(newValues);

        inputForm.reset();
    }, [values, displayedValues, inputForm]);

    const handleAddValue = useCallback(() => {
        const newPosition = values.length - 1;
        const newValues = [...values.slice(0, newPosition), minimalValue, ...values.slice(newPosition)];

        setValues(newValues);

        // Adds a unique ID on each displayed line, to prevent a bad rendering effect
        let newValuesForDisplay = [];
        for (let i = 0; i< newValues.length; i++) {
            newValuesForDisplay[i] = newValues[i];
            newValuesForDisplay[i].id = getNewId();
        }
        setDisplayedValues(newValuesForDisplay);
    }, [values, displayedValues]);

    const handleSetValue = useCallback((index, newValue) => {
        setValues(oldValues => [...oldValues.slice(0, index), newValue, ...oldValues.slice(index+1)]);
    }, []);

    /*useEffect(() => { // TODO CHARLY Surveiller cette fonction
        if (!isReactiveCapabilityCurveOn) {
            //TODO When isReactiveCapabilityCurveOn is false, the reactive capability curve component does not change
            // the validation of its values and they still required.
            // we update the validations of reactive capability curve values so they are not required any more.
            // is there a better way to do it ?
            function validate() {
                return !isReactiveCapabilityCurveOn;
            }

            values.forEach((value, index) => {
                inputForm.addValidation('P' + index, validate);
                inputForm.addValidation('QmaxP' + index, validate);
                inputForm.addValidation('QminP' + index, validate);
            });
        }
    }, [inputForm, values, isReactiveCapabilityCurveOn]);*/

    useEffect(() => {

        // TODO Jon
        // TODO Jon
        // TODO Jon
        // L'idée était de reprendre l'ancien useEffect de validation au dessus (actuellement commenté)
        // et d'ajouter les validations custom à l'interieur.

        function validate(value) {
            // validation custom ici
        }
        values.forEach((value, index) => {

            // Ne fonctionne pas parce que la fonction validate n'a pas de notion du contexte qui permet de fait de la validation
            let displayedValueId = getId(displayedValues[index]) + index;
            inputForm.addValidation(displayedValueId, validate);

            // Ne fonctionne pas parce que le useEffect ne se trigger pas au bon moment
            if(index === 0) {
                value.pError = true;
                value.pErrorMsgId = "Erreur P première ligne";
            }
        });

    }, [inputForm, values, displayedValues]);

    const field = useMemo(() => {
        return (
            <Grid item container spacing={2}>
                {tableHeadersIds.map((header) => (
                    <Grid key={header} item xs={3}>
                        <FormattedMessage id={header} />
                    </Grid>
                ))}

                {displayedValues.map((value, index) => {

                    const id = getId(value);
                    return (
                    <Grid key={id + index} container spacing={3} item>
                        <ReactiveCapabilityCurveTable
                            defaultValue={value}
                            onChange={handleSetValue}
                            index={index}
                            inputForm={inputForm}
                            isFieldRequired={isReactiveCapabilityCurveOn}
                            disabled={disabled}

                            // TODO Jon
                            // TODO Jon
                            // TODO Jon
                            // Ci-dessous code qui devait être utilisé après avoir garni "value" avec les résultats de tests
                            // pError={value.pError}
                            // pErrorMsg={value.pErrorMsgId}
                            // qminPError={value.qminPError}
                            // qminPErrorMsg={value.qminPErrorMsgId}
                            // qmaxPError={value.qmaxPError}
                            // qmaxPErrorMsg={value.qmaxPErrorMsgId}

                            // Ci-dessous code bidon qui permet d'afficher de façon arbitraire des erreurs au bon endroit
                            pError={Math.random() < 0.5}
                            pErrorMsgId={"Pas de chance, P est trop petit"}
                            qminPError={Math.random() < 0.5}
                            qminPErrorMsgId={"Random"}
                            qmaxPError={Math.random() < 0.5}
                            qmaxPErrorMsgId={"Message pour qMaxP"}

                        />
                        <Grid item xs={1}>
                            <IconButton
                                className={classes.icon}
                                key={id + index}
                                onClick={() => handleDeleteItem(index)}
                                disabled={ disabled ||
                                    index === 0 ||
                                    index === displayedValues.length - 1 }
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Grid>
                        {index === displayedValues.length - 1 && (
                            <Grid item xs={1}>
                                <IconButton
                                    className={classes.icon}
                                    key={id + index}
                                    onClick={handleAddValue}
                                    disabled={disabled}
                                    style={{ top: '-1em' }}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Grid>
                        )}
                    </Grid>
                );
                })}
            </Grid>
        );
    }, [
        displayedValues,
        classes.icon,
        handleAddValue,
        handleDeleteItem,
        handleSetValue,
        inputForm,
        tableHeadersIds,
        isReactiveCapabilityCurveOn,
        disabled,
    ]);

    return [values, field];
};
