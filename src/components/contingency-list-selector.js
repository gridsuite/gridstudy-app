/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';

import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import CheckboxList from './util/checkbox-list';
import {
    fetchContingencyCount,
    fetchContingencyLists,
    updateConfigParameter,
} from '../utils/rest-api';
import Button from '@material-ui/core/Button';
import Alert from '@material-ui/lab/Alert';
import Grid from '@material-ui/core/Grid';
import DirectoryItemSelector from './directory-item-selector';
import { PARAM_FAVORITE_CONTINGENCY_LISTS } from '../utils/config-params';
import { useSelector } from 'react-redux';
import { elementType } from '@gridsuite/commons-ui/lib/utils/elementType';

function makeButton(onClick, message, disabled) {
    return (
        <Grid item>
            <Button
                onClick={onClick}
                variant="contained"
                color="primary"
                disabled={disabled}
            >
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

    const handleClose = () => {
        props.onClose();
    };

    const handleStart = () => {
        props.onStart(checkedContingencyListUuids);
    };

    const handleChecked = (checked) => {
        setCheckedContingencyListUuids(checked);
    };

    const saveFavourite = (newList) => {
        const existingLists = new Set(contingencyList.map((item) => item.id));
        updateConfigParameter(
            PARAM_FAVORITE_CONTINGENCY_LISTS,
            newList.filter((item) => existingLists.has(item))
        ).then();
    };

    useEffect(() => {
        setSimulatedContingencyCount(null);
        fetchContingencyCount(studyUuid, checkedContingencyListUuids).then(
            (contingencyCount) => {
                setSimulatedContingencyCount(contingencyCount);
            }
        );
    }, [studyUuid, checkedContingencyListUuids]);

    useEffect(() => {
        /* TODO : waiting for explore-server to asks for uuids metadata */
        fetchContingencyLists().then((res) => {
            const mapCont = res.reduce((map, obj) => {
                map[obj.id] = obj;
                return map;
            }, {});
            setContingencyList(
                favoriteContingencyListUuids
                    .map((id) => mapCont[id])
                    .filter((item) => item !== undefined)
                    .sort((a, b) =>
                        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                    )
            );
        });
    }, [favoriteContingencyListUuids, setContingencyList]);

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
        saveFavourite(
            favoriteContingencyListUuids.filter((item) => !toDelete.has(item))
        );
        const newChecked = checkedContingencyListUuids.filter(
            (item) => !toDelete.has(item)
        );
        if (newChecked.length !== checkedContingencyListUuids.length)
            setCheckedContingencyListUuids(newChecked);
    };

    const addFavorites = useCallback(
        (favorites) => {
            if (favorites) {
                updateConfigParameter(
                    PARAM_FAVORITE_CONTINGENCY_LISTS,
                    Array.from([
                        ...new Set([
                            ...favoriteContingencyListUuids,
                            ...favorites.map((item) => item.id),
                        ]),
                    ])
                ).then();
            }

            setFavoriteSelectorOpen(false);
        },
        [setFavoriteSelectorOpen, favoriteContingencyListUuids]
    );

    const renderButtons = () => {
        return (
            <Grid container spacing={1} item justifyContent={'center'}>
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
                                removeFromList={(e) => removeFromFavorite([e])}
                                selection={checkedContingencyListUuids}
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
                types={[
                    elementType.FILTERS_CONTINGENCY_LIST,
                    elementType.SCRIPT_CONTINGENCY_LIST,
                ]}
                title={<FormattedMessage id={'ContingencyListsSelection'} />}
            />
        </>
    );
};

ContingencyListSelector.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onStart: PropTypes.func.isRequired,
};

export default ContingencyListSelector;
