/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/material';
import { forwardRef, MouseEventHandler, Ref, TouchEventHandler, useCallback, useState } from 'react';
import CardHeader from './card-header';
import { Diagram, DiagramType } from './diagram.type';
import { UUID } from 'crypto';
import AlertCustomMessageNode from 'components/utils/alert-custom-message-node';
import SingleLineDiagramContent from './singleLineDiagram/single-line-diagram-content';
import NetworkAreaDiagramContent from './networkAreaDiagram/network-area-diagram-content';
import DiagramFooter from './diagram-footer';
import { ElementType, EquipmentType, mergeSx } from '@gridsuite/commons-ui';
import { DiagramMetadata, SLDMetadata } from '@powsybl/network-viewer';
import { DiagramAdditionalMetadata, NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS } from './diagram-common';
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
        onLoad,
        ...reactGridLayoutCustomChildComponentProps
    } = props;
    const { style, children, ...otherProps } = reactGridLayoutCustomChildComponentProps;
    const intl = useIntl();

    const [diagramsInEditMode, setDiagramsInEditMode] = useState<UUID[]>([]);

    // This function is called by the diagram's contents, when they get their sizes from the backend.
    const setDiagramSize = useCallback((diagramId: UUID, diagramType: DiagramType, width: number, height: number) => {
        console.log('TODO setDiagramSize', diagramId, diagramType, width, height);
        // TODO adapt the layout w and h considering those values
    }, []);

    const handleToggleEditMode = useCallback((diagramUuid: UUID) => {
        setDiagramsInEditMode((prev) =>
            prev.includes(diagramUuid) ? prev.filter((id) => id !== diagramUuid) : [...prev, diagramUuid]
        );
    }, []);

    const onChangeDepth = useCallback(
        (newDepth: number) => {
            if (diagram && diagram.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                updateDiagram({
                    ...diagram,
                    depth: newDepth,
                });
            }
        },
        [diagram, updateDiagram]
    );

    return (
        <Box sx={mergeSx(style, cardStyles.card)} ref={ref} {...otherProps}>
            <CardHeader title={diagram.name} blinking={blinking} onClose={onClose} />
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
                    {(diagram.type === DiagramType.NETWORK_AREA_DIAGRAM ||
                        diagram.type === DiagramType.NAD_FROM_ELEMENT) && (
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
                            isEditNadMode={diagramsInEditMode.includes(diagram.diagramUuid)}
                            onToggleEditNadMode={(isEditMode) => handleToggleEditMode(diagram.diagramUuid)}
                            onLoadNadFromElement={onLoad}
                        />
                    )}
                    {diagram.type === DiagramType.NETWORK_AREA_DIAGRAM && (
                        <DiagramFooter
                            showCounterControls={diagramsInEditMode.includes(diagram.diagramUuid)}
                            counterText={intl.formatMessage({
                                id: 'depth',
                            })}
                            counterValue={diagram.depth}
                            onIncrementCounter={() => onChangeDepth(diagram.depth + 1)}
                            onDecrementCounter={() => onChangeDepth(diagram.depth - 1)}
                            incrementCounterDisabled={
                                diagram.voltageLevelIds.length > NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS // loadingState ||
                            }
                            decrementCounterDisabled={diagram.depth === 0} // loadingState ||
                        />
                    )}
                </Box>
            )}
            {children}
        </Box>
    );
});

export default DiagramCard;
