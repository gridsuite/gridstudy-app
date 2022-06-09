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
import { isNodeValid } from './graph/util/model-functions';
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
 * @param workingNode : object working node
 * @param selectedNode : object selected node
 * @param loadFlowInfos : object result of load flow
 * @param network : object network
 * @param openVoltageLevelDiagram : function
 * @returns {JSX.Element}
 * @constructor
 */
export const ResultViewTab = ({
    studyUuid,
    workingNode,
    selectedNode,
    loadFlowInfos,
    network,
    openVoltageLevelDiagram,
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
                    nodeUuid={workingNode?.id}
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
                    />
                    <Tab
                        label={intl.formatMessage({
                            id: 'securityAnalysisResults',
                        })}
                    />
                </Tabs>
                {!isNodeValid(workingNode, selectedNode) &&
                    selectedNode?.type !== 'ROOT' && <AlertInvalidNode />}
            </div>
            {tabIndex === 0 && renderLoadFlowResult()}
            {tabIndex === 1 && renderSecurityAnalysisResult()}
        </Paper>
    );
};

ResultViewTab.propTypes = {
    loadFlowInfos: PropTypes.object,
    network: PropTypes.object.isRequired,
    openVoltageLevelDiagram: PropTypes.func.isRequired,
    workingNode: PropTypes.object,
    selectedNode: PropTypes.object,
    studyUuid: PropTypes.string.isRequired,
};
