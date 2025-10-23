/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/material';
import { forwardRef, MouseEventHandler, Ref, TouchEventHandler, useCallback, useMemo } from 'react';
import CustomCardHeader from '../custom-card-header';
import { type Diagram, DiagramAdditionalMetadata, type DiagramParams, DiagramType } from './diagram.type';
import type { UUID } from 'node:crypto';
import AlertCustomMessageNode from 'components/utils/alert-custom-message-node';
import SingleLineDiagramContent from './singleLineDiagram/single-line-diagram-content';
import NetworkAreaDiagramContent from './networkAreaDiagram/network-area-diagram-content';
import { EquipmentType, mergeSx } from '@gridsuite/commons-ui';
import { DiagramMetadata, SLDMetadata } from '@powsybl/network-viewer';
import { useIntl } from 'react-intl';
import { cardStyles } from '../card-styles';
import { type CreateDiagramFuncType, type UpdateDiagramFuncType } from '../../hooks/diagram-model.types';

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
    createDiagram: CreateDiagramFuncType<DiagramParams>;
    updateDiagram: UpdateDiagramFuncType;
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
        createDiagram,
        updateDiagram,
        ...reactGridLayoutCustomChildComponentProps
    } = props;
    const { style, children, ...otherProps } = reactGridLayoutCustomChildComponentProps;

    const intl = useIntl();

    // This function is called by the diagram's contents, when they get their sizes from the backend.
    const setDiagramSize = useCallback((diagramId: UUID, diagramType: DiagramType, width: number, height: number) => {
        console.log('TODO setDiagramSize', diagramId, diagramType, width, height);
        // TODO adapt the layout w and h considering those values.
    }, []);

    const cardTitle = useMemo((): string => {
        if (loading) {
            return intl.formatMessage({ id: 'loadingOptions' });
        }
        if (errorMessage) {
            return intl.formatMessage({ id: 'diagramLoadingFail' }, { diagramName: diagram.name });
        }
        return diagram.name;
    }, [loading, errorMessage, diagram.name, intl]);

    return (
        <Box sx={mergeSx(style, cardStyles.card)} ref={ref} {...otherProps}>
            <CustomCardHeader title={cardTitle} blinking={blinking} onClose={onClose} />
            {errorMessage ? (
                <>
                    <AlertCustomMessageNode message={errorMessage} noMargin style={cardStyles.alertMessage} />
                    <Box sx={cardStyles.diagramContainer} /> {/* Empty container to keep the layout */}
                </>
            ) : (
                <Box sx={cardStyles.diagramContainer}>
                    {(diagram.type === DiagramType.VOLTAGE_LEVEL || diagram.type === DiagramType.SUBSTATION) && (
                        <SingleLineDiagramContent
                            diagramParams={diagram}
                            showInSpreadsheet={showInSpreadsheet}
                            studyUuid={studyUuid}
                            svg={diagram.svg?.svg ?? undefined}
                            svgMetadata={(diagram.svg?.metadata as SLDMetadata) ?? undefined}
                            loadingState={loading}
                            diagramSizeSetter={setDiagramSize}
                            visible={visible}
                            onNewVoltageLevelDiagram={createDiagram}
                            onNextVoltageLevelDiagram={updateDiagram}
                        />
                    )}
                    {diagram.type === DiagramType.NETWORK_AREA_DIAGRAM && (
                        <NetworkAreaDiagramContent
                            diagramParams={diagram}
                            showInSpreadsheet={showInSpreadsheet}
                            svg={diagram.svg?.svg ?? undefined}
                            svgMetadata={(diagram.svg?.metadata as DiagramMetadata) ?? undefined}
                            svgScalingFactor={
                                (diagram.svg?.additionalMetadata as DiagramAdditionalMetadata)?.scalingFactor ??
                                undefined
                            }
                            svgVoltageLevels={(
                                diagram.svg?.additionalMetadata as DiagramAdditionalMetadata
                            )?.voltageLevels
                                .map((vl) => vl.id)
                                .filter((vlId) => vlId !== undefined)}
                            loadingState={loading}
                            diagramSizeSetter={setDiagramSize}
                            visible={visible}
                            onVoltageLevelClick={createDiagram}
                            onNadChange={updateDiagram}
                        />
                    )}
                </Box>
            )}
            {children}
        </Box>
    );
});

export default DiagramCard;
