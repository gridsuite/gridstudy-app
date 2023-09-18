/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Alert from '@mui/material/Alert';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import { OverflowableText } from '@gridsuite/commons-ui';

/**
 * Dialog to delete an element
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param {EventListener} onClick Event to submit the deletion
 * @param {Array} items Items for deletion confirmation
 * @param {String} multipleDeleteFormatMessageId Format message id for multiple delete
 * @param {String} simpleDeleteFormatMessageId Format message id for simple delete
 * @param {String} error Error message
 */
const styles = {
    tooltip: {
        maxWidth: '1000px',
    },
};
const DeleteDialog = ({
    open,
    onClose,
    onClick,
    items,
    multipleDeleteFormatMessageId,
    simpleDeleteFormatMessageId,
    error,
}) => {
    const intl = useIntl();

    const [itemsState, setItemState] = useState([]);

    const [loadingState, setLoadingState] = useState(false);

    const openRef = useRef(null);

    useEffect(() => {
        if (open && !openRef.current) {
            setItemState(items);
            setLoadingState(false);
        }
        openRef.current = open;
    }, [open, items]);

    const handleClose = (_, reasonOfClose) => {
        if (
            reasonOfClose &&
            reasonOfClose === 'backdropClick' &&
            loadingState
        ) {
            return;
        }
        onClose();
    };

    const handleClick = () => {
        console.debug('Request for deletion');
        setLoadingState(true);
        onClick();
    };

    const buildTitle = (items) => {
        return items.length === 1
            ? intl.formatMessage(
                  { id: 'deleteItemDialogTitle' },
                  {
                      itemName: (
                          <OverflowableText
                              text={items[0].elementName}
                              style={{ marginLeft: '1%' }}
                              tooltipSx={styles.tooltip}
                          />
                      ),
                  }
              )
            : intl.formatMessage(
                  { id: 'deleteMultipleItemsDialogTitle' },
                  { itemsCount: items.length }
              );
    };

    const renderElement = (items) => {
        const isBig = items[0].elementName?.length > 72;

        const style = isBig
            ? { width: '100%', fontWeight: 'bold' }
            : {
                  fontWeight: 'bold',
                  marginLeft: 'initial',
                  marginRight: 'initial',
                  verticalAlign: 'middle',
                  display: 'inline-block',
              };
        return (
            <OverflowableText
                text={items[0].elementName}
                style={style}
                tooltipSx={styles.tooltip}
            />
        );
    };

    const buildItemsToDeleteGrid = (
        items,
        multipleDeleteFormatMessageId,
        simpleDeleteFormatMessageId
    ) => {
        return (
            items &&
            (items.length > 1 ? (
                <Grid>
                    <Grid item>
                        <span>
                            {intl.formatMessage(
                                {
                                    id: multipleDeleteFormatMessageId,
                                },
                                { itemsCount: items.length }
                            )}
                        </span>
                    </Grid>
                    {items.slice(0, 10).map((file) => (
                        <Grid item key={file.elementUuid}>
                            <span>
                                {
                                    <div
                                        style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {
                                            <OverflowableText
                                                text={file.elementName}
                                                style={{ width: '100%' }}
                                                tooltipSx={styles.tooltip}
                                            />
                                        }
                                    </div>
                                }
                            </span>
                        </Grid>
                    ))}
                    {items.length > 10 && (
                        <Grid item>
                            <span>
                                {intl.formatMessage(
                                    {
                                        id: 'additionalItems',
                                    },
                                    { itemsCount: items.length - 10 }
                                )}
                            </span>
                        </Grid>
                    )}
                </Grid>
            ) : (
                <Grid>
                    <Grid item>
                        <span>
                            {intl.formatMessage(
                                {
                                    id: simpleDeleteFormatMessageId,
                                },
                                {
                                    itemName: (
                                        <span>
                                            {items.length === 1 &&
                                                renderElement(items)}
                                        </span>
                                    ),
                                }
                            )}
                        </span>
                    </Grid>
                </Grid>
            ))
        );
    };
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="dialog-title-delete"
        >
            <DialogTitle style={{ display: 'flex' }}>
                {buildTitle(itemsState)}
            </DialogTitle>
            <DialogContent>
                {buildItemsToDeleteGrid(
                    itemsState,
                    multipleDeleteFormatMessageId,
                    simpleDeleteFormatMessageId
                )}
                {error !== '' && <Alert severity="error">{error}</Alert>}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    disabled={loadingState}
                >
                    <FormattedMessage id="cancel" />
                </Button>
                <Button onClick={handleClick} disabled={loadingState}>
                    {(loadingState && <CircularProgress size={24} />) || (
                        <FormattedMessage id="delete" />
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

DeleteDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    items: PropTypes.array.isRequired,
    multipleDeleteFormatMessageId: PropTypes.string.isRequired,
    simpleDeleteFormatMessageId: PropTypes.string.isRequired,
    error: PropTypes.string.isRequired,
};

export default DeleteDialog;
