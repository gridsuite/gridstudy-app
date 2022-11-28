/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';

import { FormattedMessage, useIntl } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import CheckboxList from '../util/checkbox-list';
import {
    fetchContingencyCount,
    fetchContingencyAndFiltersLists,
    updateConfigParameter,
} from '../../utils/rest-api';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import DirectoryItemSelector from '../directory-item-selector';
import { PARAM_FAVORITE_CONTINGENCY_LISTS } from '../../utils/config-params';
import { useSelector } from 'react-redux';
import { elementType } from '@gridsuite/commons-ui';
import { useSnackMessage } from '../../utils/messages';
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

const ContingencyListSelector = (props) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const favoriteContingencyListUuids = useSelector(
        (state) => state[PARAM_FAVORITE_CONTINGENCY_LISTS]
    );

    const [contingencyList, setContingencyList] = useState([]);

    const [simulatedContingencyCount, setSimulatedContingencyCount] =
        useState(0);

    const [checkedContingencyListUuids, setCheckedContingencyListUuids] =
        useState([]);

    const [favoriteSelectorOpen, setFavoriteSelectorOpen] = useState(false);

    const { snackError } = useSnackMessage();

    const intl = useIntl();

    const handleClose = () => {
        props.onClose();
    };

    const handleStart = () => {
        props.onStart(checkedContingencyListUuids);
    };

    const handleChecked = useCallback((checked) => {
        setCheckedContingencyListUuids([...checked].map((item) => item.id));
    }, []);

    const saveFavorite = (newList) => {
        updateConfigParameter(PARAM_FAVORITE_CONTINGENCY_LISTS, newList)
            .then()
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'paramsChangingError',
                });
            });
    };

    useEffect(() => {
        setSimulatedContingencyCount(null);
        var discardResult = false;
        if (props.currentNodeUuid !== null) {
            fetchContingencyCount(
                studyUuid,
                props.currentNodeUuid,
                checkedContingencyListUuids
            ).then((contingencyCount) => {
                if (!discardResult) {
                    setSimulatedContingencyCount(contingencyCount);
                }
            });
        }
        return () => {
            discardResult = true;
        };
    }, [studyUuid, props.currentNodeUuid, checkedContingencyListUuids]);

    useEffect(() => {
        if (
            favoriteContingencyListUuids &&
            favoriteContingencyListUuids.length > 0
        ) {
            fetchContingencyAndFiltersLists(favoriteContingencyListUuids)
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
                        favoriteContingencyListUuids
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
                    snackError({
                        headerId: 'getContingencyListError',
                    });
                });
        } else {
            setContingencyList([]);
        }
    }, [favoriteContingencyListUuids, setContingencyList, snackError]);

    function getSimulatedContingencyCountLabel() {
        return simulatedContingencyCount != null
            ? simulatedContingencyCount
            : '...';
    }

    const handleAddFavorite = () => {
        setFavoriteSelectorOpen(true);
    };

    const removeFromFavorite = (toRemove) => {
        const toDelete = new Set(toRemove);
        saveFavorite(
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

    const addFavorites = (favorites) => {
        if (favorites && favorites.length > 0) {
            saveFavorite(
                Array.from([
                    ...new Set([
                        ...favoriteContingencyListUuids,
                        ...favorites.map((item) => item.id),
                    ]),
                ])
            );
        }
        setFavoriteSelectorOpen(false);
    };

    const renderButtons = () => {
        return (
            <Grid container spacing={1} item justifyContent={'center'}>
                {makeButton(handleClose, 'close', false)}
                {makeButton(handleAddFavorite, 'AddContingencyList', false)}
                {makeButton(
                    () => removeFromFavorite(checkedContingencyListUuids),
                    'DeleteContingencyList',
                    checkedContingencyListUuids.length === 0
                )}
                {makeButton(
                    handleStart,
                    'Execute',
                    simulatedContingencyCount === 0
                )}
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
                        <FormattedMessage id="ContingencyListsSelection" />
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={1} direction="column" item xs={12}>
                        <Grid item>
                            <CheckboxList
                                values={contingencyList || []}
                                onChecked={handleChecked}
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
                                            removeFromFavorite([item.id]);
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item>
                            <Alert variant="standard" severity="info">
                                <FormattedMessage
                                    id="xContingenciesWillBeSimulated"
                                    values={{
                                        x: getSimulatedContingencyCountLabel(),
                                    }}
                                />
                            </Alert>
                        </Grid>
                        {renderButtons()}
                    </Grid>
                </DialogContent>
            </Dialog>
            <DirectoryItemSelector
                open={favoriteSelectorOpen}
                onClose={addFavorites}
                types={[elementType.CONTINGENCY_LIST]}
                title={intl.formatMessage({ id: 'ContingencyListsSelection' })}
            />
        </>
    );
};

ContingencyListSelector.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onStart: PropTypes.func.isRequired,
    currentNodeUuid: PropTypes.string,
};

export default ContingencyListSelector;
