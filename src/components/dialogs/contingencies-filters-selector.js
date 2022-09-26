/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { AddCircle } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import {
    fetchContingencyAndFiltersLists,
    updateConfigParameter,
} from '../../utils/rest-api';
import DirectoryItemSelector from '../directory-item-selector';
import CheckboxList from '../util/checkbox-list';
import ListItemWithDeleteButton from '../util/list-item-with-delete-button';

const ContingenciesFiltersSelector = ({
    title,
    paramName,
    selectedValues,
    setSelectedValues,
    elementTypes,
    selectorTitleId,
    fetchErrorMsgId,
}) => {
    const intlRef = useIntlRef();
    const intl = useIntl();

    const [values, setValues] = useState([]);

    const [directoryItemSelectorOpen, setDirectoryItemSelectorOpen] =
        useState(false);

    const { enqueueSnackbar } = useSnackbar();

    const favoriteListUuids = useSelector((state) => state[paramName]);

    const handleFavoriteChecked = useCallback(
        (checked) => {
            setSelectedValues([...checked].map((item) => item.id));
        },
        [setSelectedValues]
    );

    const saveFavorite = (newList) => {
        updateConfigParameter(paramName, newList)
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

    const addFavorites = (favorites) => {
        if (favorites && favorites.length > 0) {
            saveFavorite(
                Array.from([
                    ...new Set([
                        ...favoriteListUuids,
                        ...favorites.map((item) => item.id),
                    ]),
                ])
            );
        }
        setDirectoryItemSelectorOpen(false);
    };

    const removeFromFavorite = (toRemove) => {
        const toDelete = new Set(toRemove);
        saveFavorite(
            values.map((e) => e.id).filter((item) => !toDelete.has(item))
        );
        const newChecked = selectedValues.filter((item) => !toDelete.has(item));
        if (newChecked.length !== selectedValues.length)
            setSelectedValues(new Set(newChecked));
    };

    useEffect(() => {
        if (favoriteListUuids && favoriteListUuids.length > 0) {
            fetchContingencyAndFiltersLists(favoriteListUuids)
                .then((res) => {
                    const mapCont = res.reduce((map, obj) => {
                        map[obj.elementUuid] = {
                            id: obj.elementUuid,
                            type: obj.type,
                            name: obj.elementName,
                        };
                        return map;
                    }, {});
                    setValues(
                        favoriteListUuids
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
                            headerMessageId: fetchErrorMsgId,
                            intlRef: intlRef,
                        },
                    });
                });
        } else {
            setValues([]);
        }
    }, [
        favoriteListUuids,
        setValues,
        intlRef,
        fetchErrorMsgId,
        enqueueSnackbar,
    ]);

    return (
        <>
            <Grid container direction="column" item xs={12}>
                <Grid item>
                    <Typography component="span" variant="h7">
                        <FormattedMessage id={title} />
                    </Typography>
                </Grid>
                <Grid item>
                    <CheckboxList
                        values={values || []}
                        onChecked={handleFavoriteChecked}
                        label={(item) => item.name}
                        id={(item) => item.id}
                        selection={selectedValues}
                        disablePadding
                        itemRenderer={({ item, checked, handleToggle }) => (
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
                    <IconButton
                        color="primary"
                        size="medium"
                        onClick={() => setDirectoryItemSelectorOpen(true)}
                    >
                        <AddCircle />
                    </IconButton>
                </Grid>
            </Grid>
            <DirectoryItemSelector
                open={directoryItemSelectorOpen}
                onClose={addFavorites}
                types={elementTypes}
                title={intl.formatMessage({ id: selectorTitleId })}
            />
        </>
    );
};

ContingenciesFiltersSelector.propTypes = {
    title: PropTypes.string.isRequired,
    paramName: PropTypes.string.isRequired,
    selectedValues: PropTypes.array.isRequired,
    setSelectedValues: PropTypes.func.isRequired,
    elementTypes: PropTypes.array.isRequired,
    selectorTitleId: PropTypes.string.isRequired,
    fetchErrorMsgId: PropTypes.string.isRequired,
};

export default ContingenciesFiltersSelector;
