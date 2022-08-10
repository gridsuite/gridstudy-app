/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AddCircle } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage, useIntl } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import CheckboxList from '../util/checkbox-list';
import {
    fetchContingencyAndFiltersLists,
    updateConfigParameter,
} from '../../utils/rest-api';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import DirectoryItemSelector from '../directory-item-selector';
import {
    PARAM_FAVORITE_SENSI_CONTINGENCY_LISTS,
    PARAM_FAVORITE_SENSI_QUAD_FILTERS_LISTS,
    PARAM_FAVORITE_SENSI_VARIABLES_FILTERS_LISTS,
} from '../../utils/config-params';
import { useSelector } from 'react-redux';
import { elementType } from '@gridsuite/commons-ui';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { useSnackbar } from 'notistack';
import ListItemWithDeleteButton from '../util/list-item-with-delete-button';

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
    const favoriteSensiVariablesFiltersListUuids = useSelector(
        (state) => state[PARAM_FAVORITE_SENSI_VARIABLES_FILTERS_LISTS]
    );

    const favoriteSensiContingencyListUuids = useSelector(
        (state) => state[PARAM_FAVORITE_SENSI_CONTINGENCY_LISTS]
    );

    const favoriteSensiQuadFiltersListUuids = useSelector(
        (state) => state[PARAM_FAVORITE_SENSI_QUAD_FILTERS_LISTS]
    );

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

    const { enqueueSnackbar } = useSnackbar();

    const intlRef = useIntlRef();
    const intl = useIntl();

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

    const handleContingencyChecked = useCallback((checked) => {
        setCheckedContingencyListUuids([...checked].map((item) => item.id));
    }, []);

    const handleVariablesFiltersChecked = useCallback((checked) => {
        setCheckedVariablesFiltersListUuids(
            [...checked].map((item) => item.id)
        );
    }, []);

    const handleQuadFiltersChecked = useCallback((checked) => {
        setCheckedQuadFiltersListUuids([...checked].map((item) => item.id));
    }, []);

    const saveFavoriteVariablesFilters = (newList) => {
        updateConfigParameter(
            PARAM_FAVORITE_SENSI_VARIABLES_FILTERS_LISTS,
            newList
        )
            .then()
            .catch((errorMessage) => {
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'paramsChangingError',
                        intlRef: intlRef,
                    },
                });
            });
    };

    const saveFavoriteContingencies = (newList) => {
        updateConfigParameter(PARAM_FAVORITE_SENSI_CONTINGENCY_LISTS, newList)
            .then()
            .catch((errorMessage) => {
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'paramsChangingError',
                        intlRef: intlRef,
                    },
                });
            });
    };

    const saveFavoriteQuadFilters = (newList) => {
        updateConfigParameter(PARAM_FAVORITE_SENSI_QUAD_FILTERS_LISTS, newList)
            .then()
            .catch((errorMessage) => {
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'paramsChangingError',
                        intlRef: intlRef,
                    },
                });
            });
    };

    useEffect(() => {
        if (
            favoriteSensiVariablesFiltersListUuids &&
            favoriteSensiVariablesFiltersListUuids.length > 0
        ) {
            fetchContingencyAndFiltersLists(
                favoriteSensiVariablesFiltersListUuids
            )
                .then((res) => {
                    const mapCont = res.reduce((map, obj) => {
                        map[obj.elementUuid] = {
                            id: obj.elementUuid,
                            type: obj.type,
                            name: obj.elementName,
                        };
                        return map;
                    }, {});
                    setVariablesFiltersList(
                        favoriteSensiVariablesFiltersListUuids
                            .map((id) => mapCont[id])
                            .filter((item) => item !== undefined)
                            .sort((a, b) =>
                                a.name
                                    .toLowerCase()
                                    .localeCompare(b.name.toLowerCase())
                            )
                    );
                })
                .catch(() => {
                    displayErrorMessageWithSnackbar({
                        errorMessage: '',
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'getVariablesFiltersListError',
                            intlRef: intlRef,
                        },
                    });
                });
        } else {
            setVariablesFiltersList([]);
        }
    }, [
        favoriteSensiVariablesFiltersListUuids,
        setVariablesFiltersList,
        intlRef,
        enqueueSnackbar,
    ]);

    useEffect(() => {
        if (
            favoriteSensiContingencyListUuids &&
            favoriteSensiContingencyListUuids.length > 0
        ) {
            fetchContingencyAndFiltersLists(favoriteSensiContingencyListUuids)
                .then((res) => {
                    const mapCont = res.reduce((map, obj) => {
                        map[obj.elementUuid] = {
                            id: obj.elementUuid,
                            type: obj.type,
                            name: obj.elementName,
                        };
                        return map;
                    }, {});
                    setContingencyList(
                        favoriteSensiContingencyListUuids
                            .map((id) => mapCont[id])
                            .filter((item) => item !== undefined)
                            .sort((a, b) =>
                                a.name
                                    .toLowerCase()
                                    .localeCompare(b.name.toLowerCase())
                            )
                    );
                })
                .catch(() => {
                    displayErrorMessageWithSnackbar({
                        errorMessage: '',
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'getContingencyListError',
                            intlRef: intlRef,
                        },
                    });
                });
        } else {
            setContingencyList([]);
        }
    }, [
        favoriteSensiContingencyListUuids,
        setContingencyList,
        intlRef,
        enqueueSnackbar,
    ]);

    useEffect(() => {
        if (
            favoriteSensiQuadFiltersListUuids &&
            favoriteSensiQuadFiltersListUuids.length > 0
        ) {
            fetchContingencyAndFiltersLists(favoriteSensiQuadFiltersListUuids)
                .then((res) => {
                    const mapCont = res.reduce((map, obj) => {
                        map[obj.elementUuid] = {
                            id: obj.elementUuid,
                            type: obj.type,
                            name: obj.elementName,
                        };
                        return map;
                    }, {});
                    setQuadFiltersList(
                        favoriteSensiQuadFiltersListUuids
                            .map((id) => mapCont[id])
                            .filter((item) => item !== undefined)
                            .sort((a, b) =>
                                a.name
                                    .toLowerCase()
                                    .localeCompare(b.name.toLowerCase())
                            )
                    );
                })
                .catch(() => {
                    displayErrorMessageWithSnackbar({
                        errorMessage: '',
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'getQuadFiltersListError',
                            intlRef: intlRef,
                        },
                    });
                });
        } else {
            setQuadFiltersList([]);
        }
    }, [
        favoriteSensiQuadFiltersListUuids,
        setQuadFiltersList,
        intlRef,
        enqueueSnackbar,
    ]);

    const removeFromFavoriteVariablesFilters = (toRemove) => {
        const toDelete = new Set(toRemove);
        saveFavoriteVariablesFilters(
            variablesFiltersList
                .map((e) => e.id)
                .filter((item) => !toDelete.has(item))
        );
        const newChecked = checkedVariablesFiltersListUuids.filter(
            (item) => !toDelete.has(item)
        );
        if (newChecked.length !== checkedVariablesFiltersListUuids.length)
            setCheckedVariablesFiltersListUuids(new Set(newChecked));
    };

    const addFavoritesVariablesFilters = (favorites) => {
        if (favorites && favorites.length > 0) {
            saveFavoriteVariablesFilters(
                Array.from([
                    ...new Set([
                        ...favoriteSensiVariablesFiltersListUuids,
                        ...favorites.map((item) => item.id),
                    ]),
                ])
            );
        }
        setVariablesFiltersSelectorOpen(false);
    };

    const removeFromFavoriteContingencies = (toRemove) => {
        const toDelete = new Set(toRemove);
        saveFavoriteContingencies(
            contingencyList
                .map((e) => e.id)
                .filter((item) => !toDelete.has(item))
        );
        const newChecked = checkedContingencyListUuids.filter(
            (item) => !toDelete.has(item)
        );
        if (newChecked.length !== checkedContingencyListUuids.length)
            setCheckedContingencyListUuids(new Set(newChecked));
    };

    const addFavoritesContingencies = (favorites) => {
        if (favorites && favorites.length > 0) {
            saveFavoriteContingencies(
                Array.from([
                    ...new Set([
                        ...favoriteSensiContingencyListUuids,
                        ...favorites.map((item) => item.id),
                    ]),
                ])
            );
        }
        setContingenciesSelectorOpen(false);
    };

    const removeFromFavoriteQuadFilters = (toRemove) => {
        const toDelete = new Set(toRemove);
        saveFavoriteQuadFilters(
            quadFiltersList
                .map((e) => e.id)
                .filter((item) => !toDelete.has(item))
        );
        const newChecked = checkedQuadFiltersListUuids.filter(
            (item) => !toDelete.has(item)
        );
        if (newChecked.length !== checkedQuadFiltersListUuids.length)
            setCheckedQuadFiltersListUuids(new Set(newChecked));
    };

    const addFavoritesQuadFilters = (favorites) => {
        if (favorites && favorites.length > 0) {
            saveFavoriteQuadFilters(
                Array.from([
                    ...new Set([
                        ...favoriteSensiQuadFiltersListUuids,
                        ...favorites.map((item) => item.id),
                    ]),
                ])
            );
        }
        setQuadFiltersSelectorOpen(false);
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
                            <Typography component="span" variant="h7">
                                <FormattedMessage id="VariablesToSimulate" />
                            </Typography>
                        </Grid>
                        <Grid item>
                            <CheckboxList
                                values={variablesFiltersList || []}
                                onChecked={handleVariablesFiltersChecked}
                                label={(item) => item.name}
                                id={(item) => item.id}
                                selection={checkedVariablesFiltersListUuids}
                                itemRenderer={({
                                    item,
                                    checked,
                                    handleToggle,
                                }) => (
                                    <ListItemWithDeleteButton
                                        key={item.id}
                                        value={item.id}
                                        checked={checked}
                                        primary={item.name}
                                        onClick={() => handleToggle(item)}
                                        removeFromList={(e) => {
                                            e.stopPropagation();
                                            removeFromFavoriteVariablesFilters([
                                                item.id,
                                            ]);
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item>
                            <IconButton
                                color="primary"
                                size="medium"
                                onClick={() =>
                                    setVariablesFiltersSelectorOpen(true)
                                }
                            >
                                <AddCircle />
                            </IconButton>
                        </Grid>
                        <Grid item>
                            <Typography component="span" variant="h7">
                                <FormattedMessage id="SimulatedContingencies" />
                            </Typography>
                        </Grid>
                        <Grid item>
                            <CheckboxList
                                values={contingencyList || []}
                                onChecked={handleContingencyChecked}
                                label={(item) => item.name}
                                id={(item) => item.id}
                                selection={checkedContingencyListUuids}
                                itemRenderer={({
                                    item,
                                    checked,
                                    handleToggle,
                                }) => (
                                    <ListItemWithDeleteButton
                                        key={item.id}
                                        value={item.id}
                                        checked={checked}
                                        primary={item.name}
                                        onClick={() => handleToggle(item)}
                                        removeFromList={(e) => {
                                            e.stopPropagation();
                                            removeFromFavoriteContingencies([
                                                item.id,
                                            ]);
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item>
                            <IconButton
                                color="primary"
                                size="medium"
                                onClick={() =>
                                    setContingenciesSelectorOpen(true)
                                }
                            >
                                <AddCircle />
                            </IconButton>
                        </Grid>
                        <Grid item>
                            <Typography component="span" variant="h7">
                                <FormattedMessage id="SupervisedQuadrupoles" />
                            </Typography>
                        </Grid>
                        <Grid item>
                            <CheckboxList
                                values={quadFiltersList || []}
                                onChecked={handleQuadFiltersChecked}
                                label={(item) => item.name}
                                id={(item) => item.id}
                                selection={checkedQuadFiltersListUuids}
                                itemRenderer={({
                                    item,
                                    checked,
                                    handleToggle,
                                }) => (
                                    <ListItemWithDeleteButton
                                        key={item.id}
                                        value={item.id}
                                        checked={checked}
                                        primary={item.name}
                                        onClick={() => handleToggle(item)}
                                        removeFromList={(e) => {
                                            e.stopPropagation();
                                            removeFromFavoriteQuadFilters([
                                                item.id,
                                            ]);
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item>
                            <IconButton
                                color="primary"
                                size="medium"
                                onClick={() => setQuadFiltersSelectorOpen(true)}
                            >
                                <AddCircle />
                            </IconButton>
                        </Grid>
                        <Grid item>{renderButtons()}</Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
            <DirectoryItemSelector
                open={variablesFiltersSelectorOpen}
                onClose={addFavoritesVariablesFilters}
                types={[elementType.FILTER]}
                title={intl.formatMessage({ id: 'FiltersListsSelection' })}
            />
            <DirectoryItemSelector
                open={contingenciesSelectorOpen}
                onClose={addFavoritesContingencies}
                types={[elementType.CONTINGENCY_LIST]}
                title={intl.formatMessage({ id: 'ContingencyListsSelection' })}
            />
            <DirectoryItemSelector
                open={quadFiltersSelectorOpen}
                onClose={addFavoritesQuadFilters}
                types={[elementType.FILTER]}
                title={intl.formatMessage({ id: 'FiltersListsSelection' })}
            />
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
