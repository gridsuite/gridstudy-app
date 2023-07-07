import WaitingLoader from 'components/utils/waiting-loader';
import ShortCircuitAnalysisResult from './shortcircuit-analysis-result-table';
import { useSelector } from 'react-redux';
import {
    fetchSelectiveShortCircuitAnalysisResult,
    fetchShortCircuitAnalysisResult,
} from 'utils/rest-api';
import {
    ShortcircuitAnalysisResult,
    ShortcircuitAnalysisType,
} from './shortcircuit-analysis-result.type';
import { useNodeData } from 'components/study-container';
import { ReduxState } from 'redux/reducer.type';
import { FunctionComponent } from 'react';
import { ComputingType } from 'components/computing-status/computing-type';
import { RunningStatus } from 'components/utils/running-status';

interface ShortCircuitAnalysisGlobalResultProps {
    analysisType: ShortcircuitAnalysisType;
}

const shortCircuitAnalysisResultInvalidations = ['shortCircuitAnalysisResult'];
const selectiveShortCircuitAnalysisResultInvalidations = [
    'selectiveShortCircuitAnalysisResult',
];

export const ShortCircuitAnalysisGlobalResult: FunctionComponent<
    ShortCircuitAnalysisGlobalResultProps
> = ({ analysisType }) => {
    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );
    const selectiveShortcircuitAnalysisState = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.SELECTIVE_SHORTCIRCUIT_ANALYSIS]
    );

    const resultsFetcher =
        analysisType === ShortcircuitAnalysisType.GLOBAL
            ? fetchShortCircuitAnalysisResult
            : fetchSelectiveShortCircuitAnalysisResult;

    const resultsInvalidationsNotif =
        analysisType === ShortcircuitAnalysisType.GLOBAL
            ? shortCircuitAnalysisResultInvalidations
            : selectiveShortCircuitAnalysisResultInvalidations;

    const [shortCircuitAnalysisResult, isWaitingShortCircuitAnalysisResult] =
        useNodeData(
            studyUuid,
            currentNode?.id,
            resultsFetcher,
            resultsInvalidationsNotif
        ) as [ShortcircuitAnalysisResult, boolean];

    console.log(shortCircuitAnalysisResult);

    return (
        <WaitingLoader
            message={'LoadingRemoteData'}
            loading={
                selectiveShortcircuitAnalysisState === RunningStatus.RUNNING ||
                isWaitingShortCircuitAnalysisResult
            }
        >
            <ShortCircuitAnalysisResult result={shortCircuitAnalysisResult} />
        </WaitingLoader>
    );
};
