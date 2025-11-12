/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { PARAM_FAVORITE_CONTINGENCY_LISTS } from '../../utils/config-params';
import { useSelector } from 'react-redux';
import {
    CheckBoxList,
    DirectoryItemSelector,
    ElementType,
    TreeViewFinderNodeProps,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { fetchContingencyAndFiltersLists } from '../../services/directory';
import { fetchContingencyCount } from '../../services/study';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import type { UUID } from 'node:crypto';
import { toggleElementFromList } from 'components/utils/utils';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import { AppState } from '../../redux/reducer';
import { useParameterState } from './parameters/use-parameters-state';

function makeButton(onClick: () => void, message: string, disabled: boolean) {
    return (
        <Grid item>
            <Button onClick={onClick} variant="contained" disabled={disabled}>
                <FormattedMessage id={message} />
            </Button>
        </Grid>
    );
}

const CONTINGENCY_TYPES = [ElementType.CONTINGENCY_LIST];

type ContingencyListInfo = {
    id: UUID;
    name: string;
};

interface ContingencyListSelectorProps {
    open: boolean;
    onClose: () => void;
    onStart: (selectedUuids: UUID[]) => void;
}

export function ContingencyListSelector({ open, onClose, onStart }: Readonly<ContingencyListSelectorProps>) {
    const [favoriteContingencyListUuids, saveFavorites] = useParameterState(
        PARAM_FAVORITE_CONTINGENCY_LISTS,
        (newList) => newList.join()
    );
    const studyUuid = useSelector((state: AppState) => state.studyUuid as UUID);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const [contingencyList, setContingencyList] = useState<ContingencyListInfo[]>([]);

    const [simulatedContingencyCount, setSimulatedContingencyCount] = useState<number | null>(0);

    const [checkedContingencyList, setCheckedContingencyList] = useState<ContingencyListInfo[]>([]);

    const [favoriteSelectorOpen, setFavoriteSelectorOpen] = useState(false);

    const { snackError } = useSnackMessage();

    const intl = useIntl();

    const handleClose = () => {
        onClose();
    };

    const handleStart = () => {
        onStart(checkedContingencyList.map((c) => c.id));
    };

    useEffect(() => {
        if (!open || !currentNode || !currentRootNetworkUuid || !isNodeBuilt(currentNode)) {
            return;
        }

        if (checkedContingencyList.length === 0) {
            setSimulatedContingencyCount(0);
            return;
        }

        setSimulatedContingencyCount(null);
        let discardResult = false;
        fetchContingencyCount(
            studyUuid,
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
    }, [open, studyUuid, currentNode, checkedContingencyList, currentRootNetworkUuid]);

    useEffect(() => {
        if (favoriteContingencyListUuids?.length && open) {
            fetchContingencyAndFiltersLists(favoriteContingencyListUuids)
                .then((elements) => {
                    const favoriteElements = elements
                        .map((e) => ({
                            id: e.elementUuid,
                            name: e.elementName,
                        }))
                        .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
                    setContingencyList(favoriteElements);
                })
                .catch(() => {
                    snackError({
                        headerId: 'getContingencyListError',
                    });
                });
        } else {
            setContingencyList([]);
        }
    }, [favoriteContingencyListUuids, snackError, open]);

    function getSimulatedContingencyCountLabel() {
        return simulatedContingencyCount ?? '...';
    }

    const handleAddFavorite = () => {
        setFavoriteSelectorOpen(true);
    };

    const removeFromFavorites = useCallback(
        (itemsToRemove: ContingencyListInfo[]) => {
            const toRemoveIdsSet = new Set(itemsToRemove.map((e) => e.id));
            saveFavorites(contingencyList.map((e) => e.id).filter((id) => !toRemoveIdsSet.has(id)));

            setCheckedContingencyList((oldChecked) => oldChecked.filter((item) => !toRemoveIdsSet.has(item.id)));
        },
        [contingencyList, saveFavorites]
    );

    const addFavorites = (nodes: TreeViewFinderNodeProps[]) => {
        if (nodes?.length) {
            // avoid duplicates here
            const newFavoriteIdsSet = new Set<UUID>([
                ...contingencyList.map((e) => e.id),
                ...nodes.map((node) => node.id as UUID),
            ]);
            saveFavorites(Array.from([...newFavoriteIdsSet]));
        }
        setFavoriteSelectorOpen(false);
    };

    const handleSecondaryAction = useCallback(
        (item: ContingencyListInfo, isItemHovered: boolean) =>
            !isItemHovered ? null : (
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
            <Dialog open={open} onClose={handleClose} maxWidth={'sm'} fullWidth={true}>
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
}
