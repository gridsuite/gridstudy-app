/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage, useIntl } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import CheckboxList from '../utils/checkbox-list';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import DirectoryItemSelector from '../directory-item-selector';
import { PARAM_FAVORITE_CONTINGENCY_LISTS } from '../../utils/config-params';
import { useSelector } from 'react-redux';
import { elementType } from '@gridsuite/commons-ui';
import { useSnackMessage } from '@gridsuite/commons-ui';
import ListItemWithDeleteButton from '../utils/list-item-with-delete-button';
import { updateConfigParameter } from '../../services/config';
import { fetchContingencyAndFiltersLists } from '../../services/directory';
import { fetchContingencyCount } from '../../services/study';
import { isNodeBuilt } from 'components/graph/util/model-functions';

function makeButton(onClick, message, disabled) {
    return (
        <Grid item>
            <Button onClick={onClick} variant="contained" disabled={disabled}>
                <FormattedMessage id={message} />
            </Button>
        </Grid>
    );
}

const CONTINGENCY_TYPES = [elementType.CONTINGENCY_LIST];
const ContingencyListSelector = (props) => {
    const favoriteContingencyListUuids = useSelector(
        (state) => state[PARAM_FAVORITE_CONTINGENCY_LISTS]
    );

    const currentNode = useSelector((state) => state.currentTreeNode);

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
        if (isNodeBuilt(currentNode) && props.open) {
            fetchContingencyCount(
                props.studyUuid,
                currentNode.id,
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
    }, [props.open, props.studyUuid, currentNode, checkedContingencyListUuids]);

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
    }, [favoriteContingencyListUuids, snackError]);

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
        if (newChecked.length !== checkedContingencyListUuids.length) {
            setCheckedContingencyListUuids(new Set(newChecked));
        }
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
                types={CONTINGENCY_TYPES}
                title={intl.formatMessage({ id: 'ContingencyListsSelection' })}
            />
        </>
    );
};

ContingencyListSelector.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onStart: PropTypes.func.isRequired,
    studyUuid: PropTypes.string,
    currentNodeUuid: PropTypes.string,
};

export default ContingencyListSelector;
