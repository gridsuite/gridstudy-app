import Dialog from '@mui/material/Dialog';
import { Alert } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import {
    fetchFeederPositions,
    getVoltageLevelSingleLineDiagram,
} from '../../../utils/rest-api';
import { useSelector } from 'react-redux';
import {
    PARAM_CENTER_LABEL,
    PARAM_COMPONENT_LIBRARY,
    PARAM_DIAGONAL_LABEL,
    PARAM_USE_NAME,
} from '../../../utils/config-params';
import PositionDiagram from './PositionDiagram';
import { SvgType } from './single-line-diagram';
import { AutoSizer } from 'react-virtualized';
import { useIntl } from 'react-intl';

const PositionDiagramPane = ({
    open,
    onClose,
    voltageLevelId,
    currentNodeUuid,
    studyUuid,
}) => {
    const useName = useSelector((state) => state[PARAM_USE_NAME]);
    const centerName = useSelector((state) => state[PARAM_CENTER_LABEL]);
    const diagonalName = useSelector((state) => state[PARAM_DIAGONAL_LABEL]);
    const componentLibrary = useSelector(
        (state) => state[PARAM_COMPONENT_LIBRARY]
    );
    const [enableSld, setEnableSld] = useState(false);

    const [svgUrl, setSvgUrl] = useState(null);
    const intl = useIntl();
    const handleClose = () => {
        onClose();
        setEnableSld(false);
        setSvgUrl(null);
    };

    const getVoltageLevelSingleLineDiagramUrl = useCallback(
        () =>
            getVoltageLevelSingleLineDiagram(
                studyUuid,
                currentNodeUuid,
                voltageLevelId?.id,
                useName,
                centerName,
                diagonalName,
                componentLibrary,
                true
            ),
        [
            studyUuid,
            currentNodeUuid,
            voltageLevelId?.id,
            useName,
            centerName,
            diagonalName,
            componentLibrary,
        ]
    );

    const getFeederPositions = useCallback(() => {
        fetchFeederPositions(studyUuid, currentNodeUuid, voltageLevelId?.id)
            .then((res) => {
                if (res) {
                    console.log('res:', res);
                }
            })
            .catch((err) => {
                console.log('err:', err);
            });
    }, [currentNodeUuid, studyUuid, voltageLevelId?.id]);

    useEffect(() => {
        if (voltageLevelId?.id !== undefined) {
            getFeederPositions();
            setEnableSld(true);
            setSvgUrl(getVoltageLevelSingleLineDiagramUrl());
        } else {
            setEnableSld(false);
        }
    }, [
        getFeederPositions,
        getVoltageLevelSingleLineDiagramUrl,
        svgUrl,
        voltageLevelId,
    ]);

    return (
        <AutoSizer>
            {(width, height) => (
                <Dialog
                    onClose={handleClose}
                    open={open}
                    maxWidth
                    scroll="body"
                >
                    {!voltageLevelId?.id && (
                        <Alert severity="error">
                            {intl.formatMessage({
                                id: 'ErrorNoVoltageSelected',
                            })}
                        </Alert>
                    )}

                    {enableSld && (
                        <PositionDiagram
                            onClose={handleClose}
                            diagramTitle={voltageLevelId?.id ?? ''}
                            svgUrl={svgUrl}
                            svgType={SvgType.VOLTAGE_LEVEL}
                            isComputationRunning={false}
                            totalWidth={width}
                            totalHeight={height}
                        />
                    )}
                </Dialog>
            )}
        </AutoSizer>
    );
};

export default PositionDiagramPane;
