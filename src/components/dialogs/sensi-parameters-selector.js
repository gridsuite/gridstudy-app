/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import {
    PARAM_FAVORITE_SENSI_CONTINGENCY_LISTS,
    PARAM_FAVORITE_SENSI_BRANCH_FILTERS_LISTS,
    PARAM_FAVORITE_SENSI_VARIABLES_FILTERS_LISTS,
} from '../../utils/config-params';
import { elementType } from '@gridsuite/commons-ui';
import ContingenciesFiltersSelector from './contingencies-filters-selector';

const EquipmentType = {
    LINE: 'LINE',
    GENERATOR: 'GENERATOR',
    LOAD: 'LOAD',
    SHUNT_COMPENSATOR: 'SHUNT_COMPENSATOR',
    STATIC_VAR_COMPENSATOR: 'STATIC_VAR_COMPENSATOR',
    BATTERY: 'BATTERY',
    BUSBAR_SECTION: 'BUSBAR_SECTION',
    DANGLING_LINE: 'DANGLING_LINE',
    LCC_CONVERTER_STATION: 'LCC_CONVERTER_STATION',
    VSC_CONVERTER_STATION: 'VSC_CONVERTER_STATION',
    TWO_WINDINGS_TRANSFORMER: 'TWO_WINDINGS_TRANSFORMER',
    THREE_WINDINGS_TRANSFORMER: 'THREE_WINDINGS_TRANSFORMER',
    HVDC_LINE: 'HVDC_LINE',
    VOLTAGE_LEVEL: 'VOLTAGE_LEVEL',
    SUBSTATION: 'SUBSTATION',
};

function makeButton(onClick, message, disabled) {
    return (
        <Grid item>
            <Button onClick={onClick} variant="contained" disabled={disabled}>
                <FormattedMessage id={message} />
            </Button>
        </Grid>
    );
}

const SensiParametersSelector = (props) => {
    const [
        selectedVariablesFiltersListUuids,
        setSelectedVariablesFiltersListUuids,
    ] = useState([]);

    const [selectedContingencyListUuids, setSelectedContingencyListUuids] =
        useState([]);

    const [selectedBranchFiltersListUuids, setSelectedBranchFiltersListUuids] =
        useState([]);

    const handleClose = () => {
        props.onClose();
    };

    const handleStart = () => {
        props.onStart(
            selectedVariablesFiltersListUuids,
            selectedContingencyListUuids,
            selectedBranchFiltersListUuids
        );
    };

    const renderButtons = () => {
        return (
            <Grid container spacing={1} item justifyContent={'center'}>
                {makeButton(handleClose, 'close', false)}
                {makeButton(handleStart, 'Execute', false)}
            </Grid>
        );
    };

    return (
        <>
            <Dialog
                open={props.open}
                onClose={handleClose}
                maxWidth={'sm'}
                fullWidth={true}
            >
                <DialogTitle>
                    <Typography component="span" variant="h5">
                        <FormattedMessage id="SensibilityAnalysisParameters" />
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} direction="column" item xs={12}>
                        <Grid item>
                            <ContingenciesFiltersSelector
                                title={'VariablesToSimulate'}
                                paramName={
                                    PARAM_FAVORITE_SENSI_VARIABLES_FILTERS_LISTS
                                }
                                selectedValues={
                                    selectedVariablesFiltersListUuids
                                }
                                setSelectedValues={
                                    setSelectedVariablesFiltersListUuids
                                }
                                elementTypes={[elementType.FILTER]}
                                equipmentTypes={[
                                    EquipmentType.GENERATOR,
                                    EquipmentType.LOAD,
                                    EquipmentType.HVDC_LINE,
                                    EquipmentType.TWO_WINDINGS_TRANSFORMER,
                                ]}
                                selectorTitleId={'FiltersListsSelection'}
                                fetchErrorMsgId={'getVariablesFiltersListError'}
                            />
                        </Grid>
                        <Grid item>
                            <ContingenciesFiltersSelector
                                title={'SimulatedContingencies'}
                                paramName={
                                    PARAM_FAVORITE_SENSI_CONTINGENCY_LISTS
                                }
                                selectedValues={selectedContingencyListUuids}
                                setSelectedValues={
                                    setSelectedContingencyListUuids
                                }
                                elementTypes={[elementType.CONTINGENCY_LIST]}
                                selectorTitleId={'ContingencyListsSelection'}
                                fetchErrorMsgId={'getContingencyListError'}
                            />
                        </Grid>
                        <Grid item>
                            <ContingenciesFiltersSelector
                                title={'SupervisedBranches'}
                                paramName={
                                    PARAM_FAVORITE_SENSI_BRANCH_FILTERS_LISTS
                                }
                                selectedValues={selectedBranchFiltersListUuids}
                                setSelectedValues={
                                    setSelectedBranchFiltersListUuids
                                }
                                elementTypes={[elementType.FILTER]}
                                equipmentTypes={[
                                    EquipmentType.LINE,
                                    EquipmentType.TWO_WINDINGS_TRANSFORMER,
                                ]}
                                selectorTitleId={'FiltersListsSelection'}
                                fetchErrorMsgId={'getBranchFiltersListError'}
                            />
                        </Grid>
                        <Grid item>{renderButtons()}</Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </>
    );
};

SensiParametersSelector.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onStart: PropTypes.func.isRequired,
};

export default SensiParametersSelector;
