import clsx from 'clsx';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import LoadFlowResult from './loadflow-result';
import makeStyles from '@mui/styles/makeStyles';
import { useIntl } from 'react-intl';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { SecurityAnalysisResultTab } from './security-analysis-result-tab';
import AlertInvalidNode from './util/alert-invalid-node';

const useStyles = makeStyles((theme) => ({
    div: {
        display: 'flex',
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
}));

/**
 * control results views
 * @param studyUuid : string uuid of study
 * @param currentNode : object current node
 * @param loadFlowInfos : object result of load flow
 * @param network : object network
 * @param openVoltageLevelDiagram : function
 * @returns {JSX.Element}
 * @constructor
 */
export const ResultViewTab = ({
    studyUuid,
    currentNode,
    loadFlowInfos,
    network,
    openVoltageLevelDiagram,
    nodeDisabled,
}) => {
    const [tabIndex, setTabIndex] = useState(0);

    const classes = useStyles();

    const intl = useIntl();

    function renderLoadFlowResult() {
        return (
            <Paper className={classes.table}>
                <LoadFlowResult result={loadFlowInfos?.loadFlowResult} />
            </Paper>
        );
    }

    function renderSecurityAnalysisResult() {
        return (
            <Paper className={classes.table}>
                <SecurityAnalysisResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                    network={network}
                    openVoltageLevelDiagram={openVoltageLevelDiagram}
                />
            </Paper>
        );
    }

    return (
        <Paper className={clsx('singlestretch-child', classes.table)}>
            <div className={classes.div}>
                <Tabs
                    value={tabIndex}
                    onChange={(event, newTabIndex) => setTabIndex(newTabIndex)}
                >
                    <Tab
                        label={intl.formatMessage({
                            id: 'loadFlowResults',
                        })}
                        disabled={nodeDisabled}
                    />
                    <Tab
                        label={intl.formatMessage({
                            id: 'securityAnalysisResults',
                        })}
                        disabled={nodeDisabled}
                    />
                </Tabs>
                {nodeDisabled && <AlertInvalidNode />}
            </div>
            {tabIndex === 0 && !nodeDisabled && renderLoadFlowResult()}
            {tabIndex === 1 && !nodeDisabled && renderSecurityAnalysisResult()}
        </Paper>
    );
};

ResultViewTab.propTypes = {
    loadFlowInfos: PropTypes.object,
    network: PropTypes.object.isRequired,
    openVoltageLevelDiagram: PropTypes.func.isRequired,
    currentNode: PropTypes.object,
    studyUuid: PropTypes.string.isRequired,
    nodeDisabled: PropTypes.bool,
};
