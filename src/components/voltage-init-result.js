/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import VirtualizedTable from './utils/virtualized-table';
import { useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { Stack, Typography } from '@mui/material';
import { Lens } from '@mui/icons-material';
import { green, red } from '@mui/material/colors';
import Button from '@mui/material/Button';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    cloneVoltageInitModifications,
    getVoltageInitModifications,
} from '../services/study/voltage-init';
import CircularProgress from '@mui/material/CircularProgress';
import { Box } from '@mui/system';
import VoltageInitModificationDialog from './dialogs/network-modifications/voltage-init-modification/voltage-init-modification-dialog';

const styles = {
    container: {
        display: 'flex',
        position: 'relative',
    },
    tabs: {
        position: 'relative',
        top: 0,
        left: 0,
    },
    succeed: {
        color: green[500],
    },
    fail: {
        color: red[500],
    },
    buttonApplyModifications: {
        display: 'flex',
        position: 'relative',
    },
};

const VoltageInitResult = ({ result, status }) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const { snackError } = useSnackMessage();

    const [tabIndex, setTabIndex] = useState(0);
    const [disabledApplyModifications, setDisableApplyModifications] = useState(
        !result
    );
    const [applyingModifications, setApplyingModifications] = useState(false);
    const [previewModificationsDialogOpen, setPreviewModificationsDialogOpen] =
        useState(false);
    const [voltageInitModification, setVoltageInitModification] = useState();

    const intl = useIntl();

    const viNotif = useSelector((state) => state.voltageInitNotif);

    useEffect(() => {
        setDisableApplyModifications(!result);
    }, [result, setDisableApplyModifications]);

    const closePreviewModificationsDialog = () => {
        setPreviewModificationsDialogOpen(false);
    };

    const applyModifications = useCallback(() => {
        setApplyingModifications(true);
        setDisableApplyModifications(true);
        cloneVoltageInitModifications(studyUuid, currentNode.id)
            .then(() => {
                setApplyingModifications(false);
            })
            .catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'errCloneVoltageInitModificationMsg',
                });
                setDisableApplyModifications(false);
                setApplyingModifications(false);
            });
    }, [currentNode?.id, snackError, studyUuid, setDisableApplyModifications]);

    const previewModifications = useCallback(() => {
        getVoltageInitModifications(studyUuid, currentNode.id)
            .then((modificationList) => {
                // this endpoint returns a list, but we are expecting a single modification here
                setVoltageInitModification(modificationList.at(0));
                setPreviewModificationsDialogOpen(true);
            })
            .catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'errPreviewVoltageInitModificationMsg',
                });
            });
    }, [
        currentNode?.id,
        snackError,
        studyUuid,
        setVoltageInitModification,
        setPreviewModificationsDialogOpen,
    ]);

    const renderPreviewModificationsDialog = () => {
        return (
            <VoltageInitModificationDialog
                currentNode={currentNode.id}
                studyUuid={studyUuid}
                editData={voltageInitModification}
                onClose={() => closePreviewModificationsDialog(false)}
            />
        );
    };

    function renderIndicatorsTable(indicators) {
        const rows = indicators
            ? Object.entries(indicators).map((i) => {
                  return { key: i[0], value: i[1] };
              })
            : null;
        const color = status === 'SUCCEED' ? styles.succeed : styles.fail;
        return (
            <>
                <Stack
                    direction={'row'}
                    gap={1}
                    marginBottom={-4.5}
                    marginTop={1.5}
                    marginLeft={2}
                >
                    <Typography style={{ fontWeight: 'bold' }}>
                        <FormattedMessage id="VoltageInitStatus" />
                    </Typography>
                    <Lens fontSize={'medium'} sx={color} />
                </Stack>

                <VirtualizedTable
                    rows={rows}
                    columns={[
                        {
                            dataKey: 'key',
                            label: '',
                        },
                        {
                            dataKey: 'value',
                            label: '',
                        },
                    ]}
                />
            </>
        );
    }

    function renderReactiveSlacksTable(reactiveSlacks) {
        const rows = reactiveSlacks;
        return (
            <VirtualizedTable
                rows={rows}
                columns={[
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'BusId' }),
                        dataKey: 'busId',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Slack' }),
                        dataKey: 'slack',
                    },
                ]}
            />
        );
    }

    function renderTabs() {
        return (
            <>
                <Box sx={styles.container}>
                    <Box sx={styles.tabs}>
                        <Tabs
                            value={tabIndex}
                            onChange={(event, newTabIndex) =>
                                setTabIndex(newTabIndex)
                            }
                        >
                            <Tab
                                label={intl.formatMessage({ id: 'Indicators' })}
                            />
                            <Tab
                                label={intl.formatMessage({
                                    id: 'ReactiveSlacks',
                                })}
                            />
                        </Tabs>
                    </Box>

                    <Box sx={styles.buttonApplyModifications}>
                        <Button
                            variant="outlined"
                            onClick={previewModifications}
                            disabled={disabledApplyModifications}
                        >
                            <FormattedMessage id="previewModifications" />
                        </Button>
                        {previewModificationsDialogOpen &&
                            renderPreviewModificationsDialog()}
                        {applyingModifications && (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    marginTop: '5px',
                                    marginLeft: '20px',
                                }}
                            >
                                <CircularProgress />
                            </div>
                        )}
                    </Box>
                </Box>
                <div style={{ flexGrow: 1 }}>
                    {viNotif &&
                        result &&
                        tabIndex === 0 &&
                        renderIndicatorsTable(result.indicators)}
                    {viNotif &&
                        result &&
                        tabIndex === 1 &&
                        renderReactiveSlacksTable(result.reactiveSlacks)}
                </div>
            </>
        );
    }

    return renderTabs();
};

VoltageInitResult.defaultProps = {
    result: null,
};

VoltageInitResult.propTypes = {
    result: PropTypes.object,
};

export default VoltageInitResult;
