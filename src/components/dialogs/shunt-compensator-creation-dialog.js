/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { useSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';
import {
    filledTextField,
    SusceptenceAdornment,
    useBooleanValue,
    useConnectivityValue,
    useDoubleValue,
    useIntegerValue,
    useTextValue,
} from './input-hooks';
import { createShuntCompensator } from '../../utils/rest-api';

const useStyles = makeStyles((theme) => ({
    helperText: {
        margin: 0,
        marginTop: 4,
    },
    h3: {
        marginBottom: 0,
        paddingBottom: 1,
    },
}));

const GridSection = ({ title }) => {
    const classes = useStyles();
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <h3 className={classes.h3}>
                    <FormattedMessage id={title} />
                </h3>
            </Grid>
        </Grid>
    );
};

const disabledChecked = { disabled: true };

/**
 * Dialog to create a shunt compensator in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param voltageLevelOptions : the network voltageLevels available
 * @param selectedNodeUuid : the currently selected tree node
 */
const ShuntCompensatorCreationDialog = ({
    open,
    onClose,
    voltageLevelOptions,
    selectedNodeUuid,
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const intl = useIntl();
    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const validationMap = useRef(new Map());

    const [clear, setClear] = useState(false);

    const [shuntCompensatorId, shuntCompensatorIdField] = useTextValue({
        label: 'ID',
        validation: { isFieldRequired: true },
        validationMap: validationMap,
        clear: clear,
        formProps: filledTextField,
    });

    const [shuntCompensatorName, shuntCompensatorNameField] = useTextValue({
        label: 'NameOptional',
        validationMap: validationMap,
        clear: clear,
        formProps: filledTextField,
    });

    const [maximumNumberOfSections, maximumNumberOfSectionsField] =
        useIntegerValue({
            label: 'ShuntMaximumNumberOfSections',
            defaultValue: 1,
            validation: {
                isValueGreaterOrEqualTo: '1',
                errorMsgId: 'shuntCompensatorErrorMaximumLessThanOne',
            },
            validationMap: validationMap,
            clear: clear,
        });

    const [currentNumberOfSections, currentNumberOfSectionsField] =
        useIntegerValue({
            label: 'ShuntCurrentNumberOfSections',
            defaultValue: 0,
            validation: {
                isValueLessOrEqualTo: maximumNumberOfSections,
                errorMsgId: 'shuntCompensatorErrorCurrentLessThanMaximum',
            },
            validationMap: validationMap,
            clear: clear,
        });

    const [identicalSections, identicalSectionsField] = useBooleanValue({
        label: 'ShuntIdenticalSections',
        defaultValue: true,
        validation: { isFieldRequired: true },
        validationMap: validationMap,
        formProps: disabledChecked,
        clear: clear,
    });

    const [susceptancePerSection, susceptancePerSectionField] = useDoubleValue({
        label: 'ShuntSusceptancePerSection',
        defaultValue: 0,
        validation: { isFieldRequired: true },
        validationMap: validationMap,
        adornment: SusceptenceAdornment,
        clear: clear,
    });

    const [connectivity, connectivityField] = useConnectivityValue({
        label: 'Connectivity',
        validationMap: validationMap,
        voltageLevelOptions: voltageLevelOptions,
        selectedNodeUuid: selectedNodeUuid,
    });

    const handleSave = () => {
        // Check if error list contains an error
        let isInvalid = Array.from(validationMap.current.values())
            .map((e) => e())
            .some((res) => !res);

        if (!isInvalid) {
            createShuntCompensator(
                studyUuid,
                selectedNodeUuid,
                shuntCompensatorId,
                shuntCompensatorName ? shuntCompensatorName : null,
                maximumNumberOfSections,
                currentNumberOfSections,
                identicalSections,
                susceptancePerSection,
                connectivity
            )
                .then(() => {
                    handleCloseAndClear();
                })
                .catch((errorMessage) => {
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'ShuntCompensatorCreationError',
                            intlRef: intlRef,
                        },
                    });
                });
        }
    };

    const clearValues = useCallback(() => {
        setClear(!clear);
    }, [clear]);

    const handleClose = useCallback(() => {
        validationMap.current = new Map();
        onClose();
    }, [onClose]);

    const handleCloseAndClear = () => {
        clearValues();
        handleClose();
    };

    function gridItem(field, size = 6) {
        return (
            <Grid item xs={size} align="start">
                {field}
            </Grid>
        );
    }

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={handleClose}
            aria-labelledby="dialog-create-shuntCompensator"
        >
            <DialogTitle>
                {intl.formatMessage({ id: 'CreateShuntCompensator' })}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    {gridItem(shuntCompensatorIdField)}
                    {gridItem(shuntCompensatorNameField)}
                </Grid>
                <GridSection title="Characteristics" />
                <Grid container spacing={2}>
                    {gridItem(maximumNumberOfSectionsField)}
                    {gridItem(currentNumberOfSectionsField)}
                </Grid>
                <Grid container spacing={2}>
                    {gridItem(identicalSectionsField)}
                    {gridItem(susceptancePerSectionField)}
                </Grid>
                <GridSection title="Connectivity" />
                <Grid container spacing={2}>
                    {gridItem(connectivityField, 12)}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseAndClear} variant="text">
                    <FormattedMessage id="close" />
                </Button>
                <Button onClick={handleSave} variant="text">
                    <FormattedMessage id="save" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ShuntCompensatorCreationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    voltageLevelOptions: PropTypes.arrayOf(PropTypes.object),
    selectedNodeUuid: PropTypes.string,
};

export default ShuntCompensatorCreationDialog;
