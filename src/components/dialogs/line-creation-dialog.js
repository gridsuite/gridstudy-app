/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import ModificationDialog from './modificationDialog';
import Grid from '@mui/material/Grid';
import makeStyles from '@mui/styles/makeStyles';
import { useSnackMessage } from '@gridsuite/commons-ui';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import { createLine } from '../../utils/rest-api';
import {
    useDoubleValue,
    useInputForm,
    useTextValue,
} from './inputs/input-hooks';
import {
    AmpereAdornment,
    filledTextField,
    gridItem,
    OhmAdornment,
    sanitizeString,
    SusceptanceAdornment,
} from './dialogUtils';
import EquipmentSearchDialog from './equipment-search-dialog';
import { useFormSearchCopy } from './form-search-copy-hook';
import { useConnectivityValue } from './connectivity-edition';
import { UNDEFINED_CONNECTION_DIRECTION } from '../network/constants';

const useStyles = makeStyles((theme) => ({
    helperText: {
        margin: 0,
        marginTop: 4,
    },
    popper: {
        style: {
            width: 'fit-content',
        },
    },
    h3: {
        marginBottom: 0,
        paddingBottom: 1,
    },
}));

/**
 * Dialog to create a line in the network
 * @param voltageLevelOptionsPromise Promise handling list of voltage level options
 * @param currentNodeUuid the node we are currently working on
 * @param editData the data to edit
 * @param onCreateLine callback to customize line creation process
 * @param displayConnectivity to display connectivity section or not
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const LineCreationDialog = ({
    editData,
    voltageLevelOptionsPromise,
    currentNodeUuid,
    onCreateLine = createLine,
    displayConnectivity = true,
    ...dialogProps
}) => {
    const classes = useStyles();

    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const toFormValues = (line) => {
        return {
            equipmentId: line.id + '(1)',
            equipmentName: line.name ?? '',
            seriesResistance: line.r,
            seriesReactance: line.x,
            shuntConductance1: line.g1,
            shuntSusceptance1: line.b1,
            shuntConductance2: line.g2,
            shuntSusceptance2: line.b2,
            voltageLevelId1: line.voltageLevelId1,
            busOrBusbarSectionId1: null,
            voltageLevelId2: line.voltageLevelId2,
            busOrBusbarSectionId2: null,
            currentLimits1: {
                permanentLimit: line.permanentLimit1,
            },
            currentLimits2: {
                permanentLimit: line.permanentLimit2,
            },
            connectionDirection1: line.connectionDirection1,
            connectionName1: line.connectionName1,
            connectionDirection2: line.connectionDirection2,
            connectionName2: line.connectionName2,
            connectionPosition1: line.connectionPosition1,
            connectionPosition2: line.connectionPosition2,
        };
    };

    const equipmentPath = 'lines';

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        equipmentPath,
        toFormValues,
        setFormValues,
    });

    useEffect(() => {
        if (editData) {
            setFormValues(editData);
        }
    }, [editData]);

    const [lineId, lineIdField] = useTextValue({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentId,
    });

    const [lineName, lineNameField] = useTextValue({
        label: 'Name',
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentName,
    });

    const [seriesResistance, seriesResistanceField] = useDoubleValue({
        label: 'SeriesResistanceText',
        validation: { isFieldRequired: true, isFieldNumeric: true },
        adornment: OhmAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.seriesResistance,
    });

    const [seriesReactance, seriesReactanceField] = useDoubleValue({
        label: 'SeriesReactanceText',
        validation: { isFieldRequired: true, isFieldNumeric: true },
        adornment: OhmAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.seriesReactance,
    });

    const [shuntConductance1, shuntConductance1Field] = useDoubleValue({
        label: 'ShuntConductanceText',
        id: 'ShuntConductance1',
        validation: { isFieldRequired: false, isFieldNumeric: true },
        adornment: SusceptanceAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.shuntConductance1,
    });

    const [shuntSusceptance1, shuntSusceptance1Field] = useDoubleValue({
        label: 'ShuntSusceptanceText',
        id: 'ShuntSusceptance1',
        validation: { isFieldRequired: false, isFieldNumeric: true },
        adornment: SusceptanceAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.shuntSusceptance1,
    });

    const [shuntConductance2, shuntConductance2Field] = useDoubleValue({
        label: 'ShuntConductanceText',
        id: 'ShuntConductance2',
        validation: { isFieldRequired: false, isFieldNumeric: true },
        adornment: SusceptanceAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.shuntConductance2,
    });

    const [shuntSusceptance2, shuntSusceptance2Field] = useDoubleValue({
        label: 'ShuntSusceptanceText',
        id: 'ShuntSusceptance2',
        validation: { isFieldRequired: false, isFieldNumeric: true },
        adornment: SusceptanceAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.shuntSusceptance2,
    });

    const [connectivity1, connectivity1Field] = useConnectivityValue({
        label: 'Connectivity',
        id: 'Connectivity1',
        validation: { isFieldRequired: displayConnectivity },
        inputForm: inputForm,
        voltageLevelOptionsPromise: voltageLevelOptionsPromise,
        currentNodeUuid: currentNodeUuid,
        direction: 'column',
        voltageLevelIdDefaultValue: formValues?.voltageLevelId1 || null,
        busOrBusbarSectionIdDefaultValue:
            formValues?.busOrBusbarSectionId1 || null,
        connectionDirectionValue: formValues?.connectionDirection1 ?? '',
        connectionNameValue: formValues?.connectionName1,
        withPosition: true,
        connectionPositionValue: formValues?.connectionPosition1,
    });

    const [connectivity2, connectivity2Field] = useConnectivityValue({
        label: 'Connectivity',
        id: 'Connectivity2',
        validation: { isFieldRequired: displayConnectivity },
        inputForm: inputForm,
        voltageLevelOptionsPromise: voltageLevelOptionsPromise,
        currentNodeUuid: currentNodeUuid,
        direction: 'column',
        voltageLevelIdDefaultValue: formValues?.voltageLevelId2 || null,
        busOrBusbarSectionIdDefaultValue:
            formValues?.busOrBusbarSectionId2 || null,
        connectionDirectionValue: formValues?.connectionDirection2 ?? '',
        connectionNameValue: formValues?.connectionName2,
        withPosition: true,
        connectionPositionValue: formValues?.connectionPosition2,
    });

    const [permanentCurrentLimit1, permanentCurrentLimit1Field] =
        useDoubleValue({
            label: 'PermanentCurrentLimitText',
            validation: {
                isFieldRequired: false,
                isFieldNumeric: true,
                valueGreaterThan: '0',
                errorMsgId: 'permanentCurrentLimitGreaterThanZero',
            },
            adornment: AmpereAdornment,
            inputForm: inputForm,
            defaultValue: formValues?.currentLimits1?.permanentLimit,
        });

    const [permanentCurrentLimit2, permanentCurrentLimit2Field] =
        useDoubleValue({
            label: 'PermanentCurrentLimitText',
            validation: {
                isFieldRequired: false,
                isFieldNumeric: true,
                valueGreaterThan: '0',
                errorMsgId: 'permanentCurrentLimitGreaterThanZero',
            },
            adornment: AmpereAdornment,
            inputForm: inputForm,
            defaultValue: formValues?.currentLimits2?.permanentLimit,
        });

    const handleValidation = () => {
        return inputForm.validate();
    };

    const handleSave = () => {
        onCreateLine(
            studyUuid,
            currentNodeUuid,
            lineId,
            sanitizeString(lineName),
            seriesResistance,
            seriesReactance,
            shuntConductance1,
            shuntSusceptance1,
            shuntConductance2,
            shuntSusceptance2,
            connectivity1?.voltageLevel?.id,
            connectivity1?.busOrBusbarSection?.id,
            connectivity2?.voltageLevel?.id,
            connectivity2?.busOrBusbarSection?.id,
            permanentCurrentLimit1,
            permanentCurrentLimit2,
            editData ? true : false,
            editData ? editData.uuid : undefined,
            connectivity1?.connectionName?.id ?? null,
            connectivity1?.connectionDirection?.id ??
                UNDEFINED_CONNECTION_DIRECTION,
            connectivity2?.connectionName?.id ?? null,
            connectivity2?.connectionDirection?.id ??
                UNDEFINED_CONNECTION_DIRECTION,
            connectivity1?.connectionPosition?.id ?? null,
            connectivity2?.connectionPosition?.id ?? null
        ).catch((error) => {
            snackError({
                messageTxt: error.message,
                headerId: 'LineCreationError',
            });
        });
    };

    const clear = () => {
        inputForm.reset();
        setFormValues(null);
    };

    return (
        <>
            <ModificationDialog
                onClear={clear}
                onValidation={handleValidation}
                onSave={handleSave}
                disabledSave={!inputForm.hasChanged}
                aria-labelledby="dialog-create-line"
                fullWidth={true}
                titleId="CreateLine"
                searchCopy={searchCopy}
                {...dialogProps}
            >
                <Grid container spacing={2}>
                    {gridItem(lineIdField)}
                    {gridItem(lineNameField)}
                </Grid>
                {displayConnectivity && (
                    <>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <h3 className={classes.h3}>
                                    <FormattedMessage id="Connectivity" />
                                </h3>
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <h4 className={classes.h4}>
                                    <FormattedMessage id="Side1" />
                                </h4>
                            </Grid>
                            <Grid item xs={6}>
                                <h4 className={classes.h4}>
                                    <FormattedMessage id="Side2" />
                                </h4>
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item container xs={6} direction="column">
                                <Grid container direction="column" spacing={2}>
                                    {gridItem(connectivity1Field, 12)}
                                </Grid>
                            </Grid>
                            <Grid item container direction="column" xs={6}>
                                <Grid container direction="column" spacing={2}>
                                    {gridItem(connectivity2Field, 12)}
                                </Grid>
                            </Grid>
                        </Grid>
                    </>
                )}
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <h3>
                            <FormattedMessage id="Characteristics" />
                        </h3>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    {gridItem(seriesResistanceField)}
                    {gridItem(seriesReactanceField)}
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <h4 className={classes.h4}>
                            <FormattedMessage id="Side1" />
                        </h4>
                    </Grid>
                    <Grid item xs={6}>
                        <h4 className={classes.h4}>
                            <FormattedMessage id="Side2" />
                        </h4>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item container xs={6} spacing={2}>
                        {gridItem(shuntConductance1Field, 12)}
                        {gridItem(shuntSusceptance1Field, 12)}
                    </Grid>
                    <Grid item container xs={6} spacing={2}>
                        {gridItem(shuntConductance2Field, 12)}
                        {gridItem(shuntSusceptance2Field, 12)}
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <h3 className={classes.h3}>
                            <FormattedMessage id="Limits" />
                        </h3>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <h4 className={classes.h4}>
                            <FormattedMessage id="Side1" />
                        </h4>
                    </Grid>
                    <Grid item xs={6}>
                        <h4 className={classes.h4}>
                            <FormattedMessage id="Side2" />
                        </h4>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item container xs={6} direction="column">
                        {gridItem(permanentCurrentLimit1Field, 12)}
                    </Grid>
                    <Grid item container direction="column" xs={6}>
                        {gridItem(permanentCurrentLimit2Field, 12)}
                    </Grid>
                </Grid>
            </ModificationDialog>
            <EquipmentSearchDialog
                open={searchCopy.isDialogSearchOpen}
                onClose={searchCopy.handleCloseSearchDialog}
                equipmentType={'LINE'}
                onSelectionChange={searchCopy.handleSelectionChange}
                currentNodeUuid={currentNodeUuid}
            />
        </>
    );
};

LineCreationDialog.propTypes = {
    editData: PropTypes.object,
    voltageLevelOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    currentNodeUuid: PropTypes.string,
    onCreateLine: PropTypes.func,
    displayConnectivity: PropTypes.bool,
};

export default LineCreationDialog;
