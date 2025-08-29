/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Box, Dialog, Fab, Theme, useTheme } from '@mui/material';
import { forwardRef, MouseEventHandler, Ref, TouchEventHandler, useCallback, useState } from 'react';
import CardHeader from './card-header';
import { UUID } from 'crypto';
import AlertCustomMessageNode from 'components/utils/alert-custom-message-node';
import { EquipmentType, LineFlowMode, mergeSx, useStateBoolean } from '@gridsuite/commons-ui';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { resetMapEquipment, setMapDataLoading, setOpenMap, setReloadMapNeeded } from 'redux/actions';
import WorldSvg from 'images/world.svg?react';
import NetworkMapTab from 'components/network/network-map-tab';
import { cardStyles } from './card-styles';
import { Close } from '@mui/icons-material';
import { FormattedMessage, useIntl } from 'react-intl';

const styles = {
    closeButton: (theme: Theme) => ({
        alignSelf: 'center',
        margin: theme.spacing(1),
        padding: theme.spacing(2),
    }),
};

interface ReactGridLayoutCustomChildComponentProps {
    style?: React.CSSProperties;
    className?: string;
    onMouseDown?: MouseEventHandler<HTMLElement>;
    onMouseUp?: MouseEventHandler<HTMLElement>;
    onTouchEnd?: TouchEventHandler<HTMLElement>;
    children?: React.ReactNode;
}

interface MapCardProps extends ReactGridLayoutCustomChildComponentProps {
    studyUuid: UUID;
    onClose: () => void;
    errorMessage?: string;
    showInSpreadsheet: (equipment: { equipmentId: string | null; equipmentType: EquipmentType | null }) => void;
    onOpenNetworkAreaDiagram: (elementId?: string) => void;
    key: string; // Required for React Grid Layout to identify the component
}

export const MapCard = forwardRef((props: MapCardProps, ref: Ref<HTMLDivElement>) => {
    const {
        studyUuid,
        onClose,
        errorMessage,
        showInSpreadsheet,
        onOpenNetworkAreaDiagram,
        ...reactGridLayoutCustomChildComponentProps
    } = props;
    const { style, children, ...otherProps } = reactGridLayoutCustomChildComponentProps;
    const [isHover, setIsHover] = useState(false);
    const intl = useIntl();

    const handleMouseEnter = () => {
        setIsHover(true);
    };
    const handleMouseLeave = () => {
        setIsHover(false);
    };

    const dispatch = useDispatch();
    const theme = useTheme();

    const mapOpen = useSelector((state: AppState) => state.mapOpen);

    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);
    const clickable = !errorMessage;

    const handleOpenMap = useCallback(() => {
        dispatch(resetMapEquipment());
        dispatch(setMapDataLoading(false));
        dispatch(setReloadMapNeeded(true));
        dispatch(setOpenMap(true));
    }, [dispatch]);

    const isInDrawingMode = useStateBoolean(false);
    const handleCloseMap = useCallback(
        (event?: any, reason?: string) => {
            if (reason && reason === 'escapeKeyDown' && isInDrawingMode.value) {
                return;
            }
            dispatch(setOpenMap(false));
            dispatch(resetMapEquipment());
            dispatch(setMapDataLoading(false));
            dispatch(setReloadMapNeeded(true));
        },
        [dispatch, isInDrawingMode]
    );

    if (!studyUuid || !currentNode || !currentRootNetworkUuid || !networkVisuParams) {
        return (
            <Box sx={mergeSx(style, cardStyles.card)} ref={ref} {...otherProps}>
                <CardHeader title={intl.formatMessage({ id: 'MapCard' })} onClose={onClose} />
                <AlertCustomMessageNode message={'MapCardNotAvailable'} noMargin style={cardStyles.alertMessage} />
                <Box sx={cardStyles.diagramContainer} /> {/* Empty container to keep the layout */}
            </Box>
        );
    }

    return (
        <Box sx={mergeSx(style, cardStyles.card)} ref={ref} {...otherProps}>
            <CardHeader title={intl.formatMessage({ id: 'MapCard' })} onClose={onClose} />
            {errorMessage && <AlertCustomMessageNode message={errorMessage} noMargin style={cardStyles.alertMessage} />}
            <Box sx={cardStyles.diagramContainer}>
                <WorldSvg
                    style={{
                        width: '100%',
                        height: '100%',
                        cursor: clickable ? 'pointer' : 'default',
                        backgroundColor: clickable && isHover ? 'rgba(0, 0, 0, 0.4)' : 'inherit',
                    }}
                    fill={clickable && isHover ? theme.palette.grey[800] : theme.palette.grey[500]}
                    onClick={
                        clickable
                            ? (e) => {
                                  e.stopPropagation();
                                  handleOpenMap();
                              }
                            : undefined
                    }
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                />
                <Dialog open={mapOpen} onClose={handleCloseMap} fullScreen>
                    <Fab
                        onClick={handleCloseMap}
                        size="small"
                        aria-label="close"
                        variant="extended"
                        sx={styles.closeButton}
                    >
                        <Close fontSize="small" />
                        <FormattedMessage id="close" />
                    </Fab>
                    <NetworkMapTab
                        studyUuid={studyUuid}
                        visible={mapOpen}
                        lineFullPath={networkVisuParams.mapParameters.lineFullPath}
                        lineParallelPath={networkVisuParams.mapParameters.lineParallelPath}
                        lineFlowMode={networkVisuParams.mapParameters.lineFlowMode as LineFlowMode}
                        currentNode={currentNode}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        showInSpreadsheet={(eq) => {
                            handleCloseMap();
                            showInSpreadsheet(eq);
                        }}
                        onOpenNetworkAreaDiagram={onOpenNetworkAreaDiagram}
                        onPolygonChanged={() => {}}
                        isInDrawingMode={isInDrawingMode}
                    ></NetworkMapTab>
                </Dialog>
            </Box>
            {children}
        </Box>
    );
});

export default MapCard;
