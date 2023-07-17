import WaitingLoader from 'components/utils/waiting-loader';
import ShortCircuitAnalysisResult from './shortcircuit-analysis-result-table';
import { useSelector } from 'react-redux';
import {
    fetchOneBusShortCircuitAnalysisResult,
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
const oneBusShortCircuitAnalysisResultInvalidations = [
    'oneBusShortCircuitAnalysisResult',
];

export const ShortCircuitAnalysisGlobalResult: FunctionComponent<
    ShortCircuitAnalysisGlobalResultProps
> = ({ analysisType }) => {
    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );
    const oneBusShortcircuitAnalysisState = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS]
    );

    const resultsFetcher =
        analysisType === ShortcircuitAnalysisType.ALL_BUSES
            ? fetchShortCircuitAnalysisResult
            : fetchOneBusShortCircuitAnalysisResult;

    const resultsInvalidationsNotif =
        analysisType === ShortcircuitAnalysisType.ALL_BUSES
            ? shortCircuitAnalysisResultInvalidations
            : oneBusShortCircuitAnalysisResultInvalidations;

    const [
        shortCircuitAnalysisResult,
        isWaitingShortCircuitAnalysisResult,
        errorMessage,
    ] = useNodeData(
        studyUuid,
        currentNode?.id,
        resultsFetcher,
        resultsInvalidationsNotif
    ) as [ShortcircuitAnalysisResult, boolean, string];

    const isLoading =
        analysisType === ShortcircuitAnalysisType.ALL_BUSES
            ? isWaitingShortCircuitAnalysisResult
            : oneBusShortcircuitAnalysisState === RunningStatus.RUNNING ||
              isWaitingShortCircuitAnalysisResult;

    console.log(errorMessage);

    return (
        <WaitingLoader message={'LoadingRemoteData'} loading={isLoading}>
            <ShortCircuitAnalysisResult result={shortCircuitAnalysisResult} />
        </WaitingLoader>
    );
};
