import clsx from 'clsx';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Paper from '@material-ui/core/Paper';
import SecurityAnalysisResult from '../components/security-analysis-result';
import LoadFlowResult from '../components/loadflow-result';
import { fetchSecurityAnalysisResult } from '../utils/rest-api';
import { makeStyles } from '@material-ui/core/styles';
import { useIntl } from 'react-intl';
import { useNodeData } from './study-controller';
import WaitingLoader from '../components/util/waiting-loader';
import { useState } from 'react';

const SecurityAnalysisResultContainer = ({
    studyUuid,
    nodeUuid,
    network,
    openVoltageLevelDiagram,
}) => {
    const [securityAnalysisResult, isWaiting] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchSecurityAnalysisResult,
        ['securityAnalysisResult']
    );

    function onClickNmKConstraint(row, column) {
        if (network) {
            if (column.dataKey === 'subjectId') {
                let vlId;
                let substationId;

                let equipment = network.getLineOrTransformer(row.subjectId);
                if (equipment) {
                    if (row.side) {
                        vlId =
                            row.side === 'ONE'
                                ? equipment.voltageLevelId1
                                : row.side === 'TWO'
                                ? equipment.voltageLevelId2
                                : equipment.voltageLevelId3;
                    } else {
                        vlId = equipment.voltageLevelId1;
                    }
                    const vl = network.getVoltageLevel(vlId);
                    substationId = vl.substationId;
                } else {
                    equipment = network.getVoltageLevel(row.subjectId);
                    if (equipment) {
                        vlId = equipment.id;
                        substationId = equipment.substationId;
                    }
                }
                openVoltageLevelDiagram(vlId, substationId);
            }
        }
    }

    return (
        <WaitingLoader message={'LoadingRemoteData'} loading={isWaiting}>
            <SecurityAnalysisResult
                result={securityAnalysisResult}
                onClickNmKConstraint={onClickNmKConstraint}
            />
        </WaitingLoader>
    );
};

const useStyles = makeStyles((theme) => ({
    table: {
        display: 'flex',
        flexDirection: 'column',
    },
}));

export function ResultViewController({
    studyUuid,
    selectedNodeUuid,
    loadFlowInfos,
    network,
    openVoltageLevelDiagram,
}) {
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
                <SecurityAnalysisResultContainer
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
}
