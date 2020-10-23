/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import VirtualizedTable from './util/virtualized-table';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import { useIntl } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';

const LoadFlowResult = ({ result }) => {
    const useStyles = makeStyles((theme) => ({
        grid: {
            padding: theme.spacing(1),
        },
        label: {
            paddingTop: '75px',
        },
        table: {
            height: '100%',
        },
        card: {
            display: 'inline-block',
            width: '38%',
        },
        tablePaper: {
            display: 'inline-block',
            float: 'right',
            width: '60%',
            height: '100%',
        },
    }));

    const intl = useIntl();
    const classes = useStyles();

    function renderLoadFlowResult() {
        return (
            <>
                <Card className={classes.card}>
                    <CardContent>
                        <List className={classes.root}>
                            <ListItem divider>
                                <Grid container className={classes.grid}>
                                    <Grid item xs={1}>
                                        <Typography
                                            component="span"
                                            variant="body1"
                                        >
                                            <Box
                                                fontWeight="fontWeightBold"
                                                m={1}
                                            >
                                                <FormattedMessage id="isOk" />:
                                            </Box>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={11}>
                                        <Typography
                                            component="span"
                                            variant="body1"
                                        >
                                            <Box m={1}>
                                                {result.ok.toString()}
                                            </Box>
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </ListItem>

                            <ListItem divider>
                                <Grid container className={classes.grid}>
                                    <Grid item xs={1}>
                                        <Typography
                                            component="span"
                                            variant="body1"
                                        >
                                            <Box
                                                fontWeight="fontWeightBold"
                                                m={1}
                                            >
                                                <FormattedMessage id="metrics" />
                                                :
                                            </Box>
                                        </Typography>
                                    </Grid>
                                    <Grid
                                        container
                                        item
                                        className={classes.grid}
                                    >
                                        {Object.keys(result.metrics).map(
                                            (key) => (
                                                <>
                                                    <Grid
                                                        item
                                                        xs={4}
                                                        className={
                                                            classes.subGrid
                                                        }
                                                    >
                                                        <Typography
                                                            component="span"
                                                            variant="body1"
                                                        >
                                                            <Box m={1}>
                                                                {key}:
                                                            </Box>
                                                        </Typography>
                                                    </Grid>
                                                    <Divider />
                                                    <Grid
                                                        item
                                                        xs={8}
                                                        className={
                                                            classes.subGrid
                                                        }
                                                    >
                                                        <Typography
                                                            component="span"
                                                            variant="body1"
                                                        >
                                                            <Box m={1}>
                                                                {
                                                                    result
                                                                        .metrics[
                                                                        key
                                                                    ]
                                                                }
                                                            </Box>
                                                        </Typography>
                                                    </Grid>
                                                    <Divider />
                                                </>
                                            )
                                        )}
                                    </Grid>
                                </Grid>
                            </ListItem>

                            <ListItem>
                                <Grid container className={classes.grid}>
                                    <Grid item xs={1}>
                                        <Typography
                                            component="span"
                                            variant="body1"
                                        >
                                            <Box
                                                fontWeight="fontWeightBold"
                                                m={1}
                                            >
                                                <FormattedMessage id="logs" />:
                                            </Box>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={11}>
                                        <Typography
                                            component="span"
                                            variant="body1"
                                        >
                                            <Box m={1}>{result.logs}</Box>
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>
                <Paper className={classes.tablePaper}>
                    <VirtualizedTable
                        className={classes.table}
                        rowCount={result.componentResults.length}
                        rowGetter={({ index }) =>
                            result.componentResults[index]
                        }
                        columns={[
                            {
                                width: 200,
                                label: intl.formatMessage({
                                    id: 'componentNum',
                                }),
                                dataKey: 'componentNum',
                            },
                            {
                                width: 200,
                                label: intl.formatMessage({
                                    id: 'status',
                                }),
                                dataKey: 'status',
                            },
                            {
                                width: 200,
                                label: intl.formatMessage({
                                    id: 'iterationCount',
                                }),
                                dataKey: 'iterationCount',
                            },
                            {
                                width: 200,
                                label: intl.formatMessage({
                                    id: 'slackBusId',
                                }),
                                dataKey: 'slackBusId',
                            },
                            {
                                width: 400,
                                label: intl.formatMessage({
                                    id: 'slackBusActivePowerMismatch',
                                }),
                                dataKey: 'slackBusActivePowerMismatch',
                            },
                        ]}
                    />
                </Paper>
            </>
        );
    }

    return result && renderLoadFlowResult();
};

LoadFlowResult.defaultProps = {
    result: null,
};

LoadFlowResult.propTypes = {
    result: PropTypes.object,
};

export default LoadFlowResult;
