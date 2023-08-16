/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import VirtualizedTable from './utils/virtualized-table';
import makeStyles from '@mui/styles/makeStyles';
import { useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { Stack, Typography } from '@mui/material';
import { Lens } from '@mui/icons-material';
import { green, red } from '@mui/material/colors';
import Button from '@mui/material/Button';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { cloneVoltageInitModifications } from '../services/study/voltage-init';

const useStyles = makeStyles((theme) => ({
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
}));

const VoltageInitResult = ({ result, status }) => {
    const classes = useStyles();
    const studyUuid = decodeURIComponent(useParams().studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const { snackError } = useSnackMessage();

    const [tabIndex, setTabIndex] = useState(0);
    const [disabledApplyModifications, setDisableApplyModifications] = useState(
        !result
    );

    const intl = useIntl();

    const viNotif = useSelector((state) => state.voltageInitNotif);

    useEffect(() => {
        setDisableApplyModifications(!result);
    }, [result, setDisableApplyModifications]);

    const applyModifications = useCallback(() => {
        setDisableApplyModifications(true);
        cloneVoltageInitModifications(studyUuid, currentNode.id).catch(
            (errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'errCloneVoltageInitModificationMsg',
                });
                setDisableApplyModifications(false);
            }
        );
    }, [currentNode?.id, snackError, studyUuid, setDisableApplyModifications]);

    function renderIndicatorsTable(indicators) {
        const rows = indicators
            ? Object.entries(indicators).map((i) => {
                  return { key: i[0], value: i[1] };
              })
            : null;
        const color = status === 'SUCCEED' ? classes.succeed : classes.fail;
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
                    <Lens fontSize={'medium'} className={color} />
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
                <div className={classes.container}>
                    <div className={classes.tabs}>
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
                    </div>

                    <div className={classes.buttonApplyModifications}>
                        <Button
                            variant="outlined"
                            onClick={applyModifications}
                            disabled={disabledApplyModifications}
                        >
                            <FormattedMessage id="applyModifications" />
                        </Button>
                    </div>
                </div>
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
