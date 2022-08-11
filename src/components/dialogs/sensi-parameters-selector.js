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
    PARAM_FAVORITE_SENSI_QUAD_FILTERS_LISTS,
    PARAM_FAVORITE_SENSI_VARIABLES_FILTERS_LISTS,
} from '../../utils/config-params';
import { elementType } from '@gridsuite/commons-ui';
import ContingenciesFiltersSelector from './contingencies-filters-selector';

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
    const [variablesFiltersList, setVariablesFiltersList] = useState([]);
    const [contingencyList, setContingencyList] = useState([]);
    const [quadFiltersList, setQuadFiltersList] = useState([]);

    const [
        checkedVariablesFiltersListUuids,
        setCheckedVariablesFiltersListUuids,
    ] = useState([]);

    const [checkedContingencyListUuids, setCheckedContingencyListUuids] =
        useState([]);

    const [checkedQuadFiltersListUuids, setCheckedQuadFiltersListUuids] =
        useState([]);

    const [variablesFiltersSelectorOpen, setVariablesFiltersSelectorOpen] =
        useState(false);

    const [contingenciesSelectorOpen, setContingenciesSelectorOpen] =
        useState(false);

    const [quadFiltersSelectorOpen, setQuadFiltersSelectorOpen] =
        useState(false);

    const handleClose = () => {
        props.onClose();
    };

    const handleStart = () => {
        props.onStart(
            checkedVariablesFiltersListUuids,
            checkedContingencyListUuids,
            checkedQuadFiltersListUuids
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
                    <Grid container spacing={1} direction="column" item xs={12}>
                        <Grid item>
                            <ContingenciesFiltersSelector
                                title={'VariablesToSimulate'}
                                paramName={
                                    PARAM_FAVORITE_SENSI_VARIABLES_FILTERS_LISTS
                                }
                                values={variablesFiltersList}
                                setValues={setVariablesFiltersList}
                                checkedValues={checkedVariablesFiltersListUuids}
                                setCheckedValues={
                                    setCheckedVariablesFiltersListUuids
                                }
                                openSelector={setVariablesFiltersSelectorOpen}
                                isSelectorOpen={variablesFiltersSelectorOpen}
                                elementTypes={[elementType.FILTER]}
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
                                values={contingencyList}
                                setValues={setContingencyList}
                                checkedValues={checkedContingencyListUuids}
                                setCheckedValues={
                                    setCheckedContingencyListUuids
                                }
                                openSelector={setContingenciesSelectorOpen}
                                isSelectorOpen={contingenciesSelectorOpen}
                                elementTypes={[elementType.CONTINGENCY_LIST]}
                                selectorTitleId={'ContingencyListsSelection'}
                                fetchErrorMsgId={'getContingencyListError'}
                            />
                        </Grid>
                        <Grid item>
                            <ContingenciesFiltersSelector
                                title={'SupervisedQuadrupoles'}
                                paramName={
                                    PARAM_FAVORITE_SENSI_QUAD_FILTERS_LISTS
                                }
                                values={quadFiltersList}
                                setValues={setQuadFiltersList}
                                checkedValues={checkedQuadFiltersListUuids}
                                setCheckedValues={
                                    setCheckedQuadFiltersListUuids
                                }
                                openSelector={setQuadFiltersSelectorOpen}
                                isSelectorOpen={quadFiltersSelectorOpen}
                                elementTypes={[elementType.FILTER]}
                                selectorTitleId={'FiltersListsSelection'}
                                fetchErrorMsgId={'getQuadFiltersListError'}
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
    currentNodeUuid: PropTypes.string,
};

export default SensiParametersSelector;
