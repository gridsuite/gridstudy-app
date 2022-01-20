import clsx from 'clsx';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Paper from '@material-ui/core/Paper';
import LoadFlowResult from './loadflow-result';
import { makeStyles } from '@material-ui/core/styles';
import { useIntl } from 'react-intl';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { SecurityAnalysisResultTab } from './security-analysis-result-tab';

const useStyles = makeStyles((theme) => ({
    table: {
        display: 'flex',
        flexDirection: 'column',
    },
}));

/**
 * control results views
 * @param studyUuid : string uuid of study
 * @param selectedNodeUuid : string uuid of selected node
 * @param loadFlowInfos : object result of load flow
 * @param network : object network
 * @param openVoltageLevelDiagram : function
 * @returns {JSX.Element}
 * @constructor
 */
export const ResultViewTab = ({
    studyUuid,
    selectedNodeUuid,
    loadFlowInfos,
    network,
    openVoltageLevelDiagram,
}) => {
    const [tabIndex, setTabIndex] = useState(0);

    const classes = useStyles();

    const intl = useIntl();

    function renderLoadFlowResult() {
        return (
            <Paper style={{ flexGrow: 1 }} className={classes.table}>
                <LoadFlowResult result={loadFlowInfos?.loadFlowResult} />
            </Paper>
        );
    }

    function renderSecurityAnalysisResult() {
        return (
            <Paper
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                }}
            >
                <SecurityAnalysisResultTab
                    studyUuid={studyUuid}
                    nodeUuid={selectedNodeUuid}
                    network={network}
                    openVoltageLevelDiagram={openVoltageLevelDiagram}
                />
            </Paper>
        );
    }

    return (
        <div className={clsx('singlestretch-child', classes.table)}>
            <Tabs
                value={tabIndex}
                indicatorColor="primary"
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
            {tabIndex === 0 && renderLoadFlowResult()}
            {tabIndex === 1 && renderSecurityAnalysisResult()}
        </div>
    );
};

ResultViewTab.propTypes = {
    loadFlowInfos: PropTypes.object,
    network: PropTypes.object.isRequired,
    openVoltageLevelDiagram: PropTypes.func.isRequired,
    selectedNodeUuid: PropTypes.string.isRequired,
    studyUuid: PropTypes.string.isRequired,
};
