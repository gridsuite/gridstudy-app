/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/material';
import { forwardRef, MouseEventHandler, Ref, TouchEventHandler, useCallback, useState } from 'react';
import CardHeader from './card-header';
import { Diagram, DiagramParams, DiagramType } from './diagram.type';
import { UUID } from 'crypto';
import AlertCustomMessageNode from 'components/utils/alert-custom-message-node';
import SingleLineDiagramContent from './singleLineDiagram/single-line-diagram-content';
import NetworkAreaDiagramContent from './networkAreaDiagram/network-area-diagram-content';
import { ElementType, EquipmentType, mergeSx } from '@gridsuite/commons-ui';
import { DiagramMetadata, SLDMetadata } from '@powsybl/network-viewer';
import { DiagramAdditionalMetadata } from './diagram-common';
import { useIntl } from 'react-intl';
import { cardStyles } from './card-styles';

interface ReactGridLayoutCustomChildComponentProps {
    style?: React.CSSProperties;
    className?: string;
    onMouseDown?: MouseEventHandler<HTMLElement>;
    onMouseUp?: MouseEventHandler<HTMLElement>;
    onTouchEnd?: TouchEventHandler<HTMLElement>;
    children?: React.ReactNode;
}

interface DiagramCardProps extends ReactGridLayoutCustomChildComponentProps {
    studyUuid: UUID;
    visible: boolean;
    diagram: Diagram;
    blinking: boolean;
    loading: boolean;
    onClose: () => void;
    errorMessage?: string;
    showInSpreadsheet: (equipment: { equipmentId: string | null; equipmentType: EquipmentType | null }) => void;
    updateDiagram: (diagram: Diagram) => void;
    updateDiagramPositions: (diagram: DiagramParams) => void;
    onLoad: (elementUuid: UUID, elementType: ElementType, elementName: string) => void;
    key: string; // Required for React Grid Layout to identify the component
}

export const DiagramCard = forwardRef((props: DiagramCardProps, ref: Ref<HTMLDivElement>) => {
    const {
        studyUuid,
        visible,
        diagram,
        blinking,
        loading,
        onClose,
        errorMessage,
        showInSpreadsheet,
        updateDiagram,
        updateDiagramPositions,
        onLoad,
        ...reactGridLayoutCustomChildComponentProps
    } = props;
    const { style, children, ...otherProps } = reactGridLayoutCustomChildComponentProps;
    const intl = useIntl();

    const [diagramsInEditMode, setDiagramsInEditMode] = useState<boolean>(false);

    const handleExpandAllVoltageLevels = useCallback(() => {
        if (diagram && diagram.type === DiagramType.NETWORK_AREA_DIAGRAM) {
            updateDiagram({
                ...diagram,
                voltageLevelIds: [],
                voltageLevelToExpandIds: [...diagram.voltageLevelIds],
            });
        }
    }, [diagram, updateDiagram]);

    const handleExpandVoltageLevelId = useCallback(
        (voltageLevelIdToExpand: string) => {
            if (diagram && diagram.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                updateDiagram({
                    ...diagram,
                    voltageLevelIds: diagram.voltageLevelIds.filter((id) => id !== voltageLevelIdToExpand),
                    voltageLevelToExpandIds: [...diagram.voltageLevelToExpandIds, voltageLevelIdToExpand],
                });
            }
        },
        [diagram, updateDiagram]
    );

    const handleHideVoltageLevelId = useCallback(
        (voltageLevelIdToOmit: string) => {
            if (diagram && diagram.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                updateDiagram({
                    ...diagram,
                    voltageLevelIds: diagram.voltageLevelIds.filter((id) => id !== voltageLevelIdToOmit),
                    voltageLevelToOmitIds: [...diagram.voltageLevelToOmitIds, voltageLevelIdToOmit],
                });
            }
        },
        [diagram, updateDiagram]
    );

    const handleMoveNode = useCallback(
        (vlId: string, x: number, y: number) => {
            if (diagram && diagram.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                const updatedPositions = diagram.positions.map((position) =>
                    position.voltageLevelId === vlId ? { ...position, xposition: x, yposition: y } : position
                );

                updateDiagramPositions({
                    ...diagram,
                    positions: updatedPositions,
                });
            }
        },
        [diagram, updateDiagramPositions]
    );

    // This function is called by the diagram's contents, when they get their sizes from the backend.
    const setDiagramSize = useCallback((diagramId: UUID, diagramType: DiagramType, width: number, height: number) => {
        console.log('TODO setDiagramSize', diagramId, diagramType, width, height);
        // TODO adapt the layout w and h considering those values
    }, []);

    return (
        <Box sx={mergeSx(style, cardStyles.card)} ref={ref} {...otherProps}>
            <CardHeader
                title={loading ? intl.formatMessage({ id: 'LoadingOf' }, { value: diagram.type }) : diagram.name}
                blinking={blinking}
                onClose={onClose}
            />
            {errorMessage ? (
                <>
                    <AlertCustomMessageNode message={errorMessage} noMargin style={cardStyles.alertMessage} />
                    <Box sx={cardStyles.diagramContainer} /> {/* Empty container to keep the layout */}
                </>
            ) : (
                <Box sx={cardStyles.diagramContainer}>
                    {(diagram.type === DiagramType.VOLTAGE_LEVEL || diagram.type === DiagramType.SUBSTATION) && (
                        <SingleLineDiagramContent
                            showInSpreadsheet={showInSpreadsheet}
                            studyUuid={studyUuid}
                            diagramId={diagram.diagramUuid}
                            svg={diagram.svg?.svg ?? undefined}
                            svgType={diagram.type}
                            svgMetadata={(diagram.svg?.metadata as SLDMetadata) ?? undefined}
                            loadingState={loading}
                            diagramSizeSetter={setDiagramSize}
                            visible={visible}
                        />
                    )}
                    {diagram.type === DiagramType.NETWORK_AREA_DIAGRAM && (
                        <NetworkAreaDiagramContent
                            diagramId={diagram.diagramUuid}
                            svg={diagram.svg?.svg ?? undefined}
                            svgType={diagram.type}
                            svgMetadata={(diagram.svg?.metadata as DiagramMetadata) ?? undefined}
                            svgScalingFactor={
                                (diagram.svg?.additionalMetadata as DiagramAdditionalMetadata)?.scalingFactor ??
                                undefined
                            }
                            svgVoltageLevels={
                                (diagram.svg?.additionalMetadata as DiagramAdditionalMetadata)?.voltageLevels
                                    .map((vl) => vl.id)
                                    .filter((vlId) => vlId !== undefined) as string[]
                            }
                            loadingState={loading}
                            diagramSizeSetter={setDiagramSize}
                            visible={visible}
                            isEditNadMode={diagramsInEditMode}
                            onToggleEditNadMode={(isEditMode) => setDiagramsInEditMode(isEditMode)}
                            onLoadNad={onLoad}
                            onExpandVoltageLevel={handleExpandVoltageLevelId}
                            onExpandAllVoltageLevels={handleExpandAllVoltageLevels}
                            onHideVoltageLevel={handleHideVoltageLevelId}
                            onMoveNode={handleMoveNode}
                            customPositions={diagram.positions}
                        />
                    )}
                </Box>
            )}
            {children}
        </Box>
    );
});

export default DiagramCard;
