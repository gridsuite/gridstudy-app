/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage, useIntl } from 'react-intl';
import { PARAM_FAVORITE_CONTINGENCY_LISTS } from '../../utils/config-params';
import { useSelector } from 'react-redux';
import { ElementType } from '@gridsuite/commons-ui';
import { useSnackMessage, CheckBoxList } from '@gridsuite/commons-ui';
import { updateConfigParameter } from '../../services/config';
import { fetchContingencyAndFiltersLists } from '../../services/directory';
import { fetchContingencyCount } from '../../services/study';
import { DirectoryItemSelector } from '@gridsuite/commons-ui';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { toggleElementFromList } from 'components/utils/utils';
import { Grid, DialogActions, Button, DialogTitle, Typography, Dialog, DialogContent, Alert } from '@mui/material';

function makeButton(onClick, message, disabled) {
    return (
        <Grid item>
            <Button onClick={onClick} variant="contained" disabled={disabled}>
                <FormattedMessage id={message} />
            </Button>
        </Grid>
    );
}

const CONTINGENCY_TYPES = [ElementType.CONTINGENCY_LIST];
const ContingencyListSelector = (props) => {
    const favoriteContingencyListUuids = useSelector((state) => state[PARAM_FAVORITE_CONTINGENCY_LISTS]);

    const currentNode = useSelector((state) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state) => state.currentRootNetworkUuid);

    const [contingencyList, setContingencyList] = useState([]);

    const [simulatedContingencyCount, setSimulatedContingencyCount] = useState(0);

    const [checkedContingencyList, setCheckedContingencyList] = useState([]);

    const [favoriteSelectorOpen, setFavoriteSelectorOpen] = useState(false);

    const { snackError } = useSnackMessage();

    const intl = useIntl();

    const handleClose = () => {
        props.onClose();
    };

    const handleStart = () => {
        props.onStart(checkedContingencyList.map((c) => c.id));
    };

    const saveFavorites = useCallback(
        (newList) => {
            updateConfigParameter(PARAM_FAVORITE_CONTINGENCY_LISTS, newList)
                .then()
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'paramsChangingError',
                    });
                });
        },
        [snackError]
    );

    useEffect(() => {
        if (!isNodeBuilt(currentNode) || !props.open) {
            return;
        }

        if (checkedContingencyList.length === 0) {
            setSimulatedContingencyCount(0);
            return;
        }

        setSimulatedContingencyCount(null);
        let discardResult = false;
        fetchContingencyCount(
            props.studyUuid,
            currentNode.id,
            currentRootNetworkUuid,
            checkedContingencyList.map((c) => c.id)
        ).then((contingencyCount) => {
            if (!discardResult) {
                setSimulatedContingencyCount(contingencyCount);
            }
        });
        return () => {
            discardResult = true;
        };
    }, [props.open, props.studyUuid, currentNode, checkedContingencyList, currentRootNetworkUuid]);

    useEffect(() => {
        if (favoriteContingencyListUuids && favoriteContingencyListUuids.length > 0 && props.open) {
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
                            .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
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
    }, [favoriteContingencyListUuids, snackError, props.open]);

    function getSimulatedContingencyCountLabel() {
        return simulatedContingencyCount != null ? simulatedContingencyCount : '...';
    }

    const handleAddFavorite = () => {
        setFavoriteSelectorOpen(true);
    };

    const removeFromFavorites = useCallback(
        (toRemove) => {
            const toRemoveIdsSet = new Set(toRemove.map((e) => e.id));
            saveFavorites(contingencyList.map((e) => e.id).filter((id) => !toRemoveIdsSet.has(id)));

            setCheckedContingencyList((oldChecked) => oldChecked.filter((item) => !toRemoveIdsSet.has(item.id)));
        },
        [contingencyList, saveFavorites]
    );

    const addFavorites = (favorites) => {
        if (favorites && favorites.length > 0) {
            // avoid duplicates here
            const newFavoriteIdsSet = new Set([
                ...contingencyList.map((e) => e.id),
                ...favorites.map((item) => item.id),
            ]);
            saveFavorites(Array.from([...newFavoriteIdsSet]));
        }
        setFavoriteSelectorOpen(false);
    };

    const handleSecondaryAction = useCallback(
        (item, isItemHovered) =>
            isItemHovered && (
                <IconButton
                    style={{
                        alignItems: 'end',
                    }}
                    edge="end"
                    onClick={(e) => {
                        e.stopPropagation();
                        removeFromFavorites([item]);
                    }}
                    size={'small'}
                >
                    <DeleteIcon />
                </IconButton>
            ),
        [removeFromFavorites]
    );

    return (
        <>
            <Dialog open={props.open} onClose={handleClose} maxWidth={'sm'} fullWidth={true}>
                <DialogTitle>
                    <Typography component="span" variant="h5">
                        <FormattedMessage id="ContingencyListsSelection" />
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <CheckBoxList
                        items={contingencyList || []}
                        getItemId={(v) => v.id}
                        getItemLabel={(v) => v.name}
                        selectedItems={checkedContingencyList}
                        onSelectionChange={setCheckedContingencyList}
                        secondaryAction={handleSecondaryAction}
                        onItemClick={(contingencyList) =>
                            setCheckedContingencyList((oldCheckedElements) => [
                                ...toggleElementFromList(contingencyList, oldCheckedElements, (element) => element.id),
                            ])
                        }
                    />
                    <Alert variant="standard" severity="info">
                        <FormattedMessage
                            id="xContingenciesWillBeSimulated"
                            values={{
                                x: getSimulatedContingencyCountLabel(),
                            }}
                        />
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center' }}>
                    {makeButton(handleClose, 'close', false)}
                    {makeButton(handleAddFavorite, 'AddContingencyList', false)}
                    {makeButton(
                        () => removeFromFavorites(checkedContingencyList),
                        'DeleteContingencyList',
                        checkedContingencyList.length === 0
                    )}
                    {makeButton(handleStart, 'Execute', simulatedContingencyCount === 0)}
                </DialogActions>
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
