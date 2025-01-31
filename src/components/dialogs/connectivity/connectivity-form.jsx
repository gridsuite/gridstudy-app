/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import ExploreOffOutlinedIcon from '@mui/icons-material/ExploreOffOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import { IconButton, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid';
import {
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    ID,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useIntl } from 'react-intl';
import PositionDiagramPane from '../../diagrams/singleLineDiagram/position-diagram-pane';
import { isNodeBuilt } from '../../graph/util/model-functions';
import { CONNECTION_DIRECTIONS, getConnectionDirectionLabel } from '../../network/constants';
import { AutocompleteInput, IntegerInput, SelectInput, SwitchInput, TextInput } from '@gridsuite/commons-ui';
import { fetchBusesOrBusbarSectionsForVoltageLevel } from 'services/study/network';
import CheckboxNullableInput from '../../utils/rhf-inputs/boolean-nullable-input';
import { areIdsEqual, getObjectId } from '../../utils/utils';
import { getConnectivityBusBarSectionData, getConnectivityVoltageLevelData } from './connectivity-form-utils';

/**
 * Hook to handle a 'connectivity value' (voltage level, bus or bus bar section)
 * @param id optional id that has to be defined if the component is used more than once in a form
 * @param voltageLevelSelectLabel label to display for the voltage level auto complete component
 * @param direction direction of placement. Either 'row' or 'column', 'row' by default.
 * @param withDirectionsInfos
 * @param withPosition
 * @param voltageLevelOptions list of network voltage levels
 * @param newBusOrBusbarSectionOptions list of bus or bus bar sections for the newly created voltage level
 * @param studyUuid the study we are currently working on
 * @param currentNode the currently selected tree node
 * @param currentRootNetworkUuid The root network uuid we are currently working on
 * @param onVoltageLevelChangeCallback callback to be called when the voltage level changes
 * @param isEquipmentModification connectivity form is used in a modification form or not
 * @param previousValues previous values of connectivity form's fields
 * @returns JSX.Element
 */
export const ConnectivityForm = ({
    id = CONNECTIVITY,
    voltageLevelSelectLabel = 'VOLTAGE_LEVEL',
    direction = 'row',
    withDirectionsInfos = true,
    withPosition = false,
    voltageLevelOptions = [],
    newBusOrBusbarSectionOptions = [],
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    onVoltageLevelChangeCallback = undefined,
    isEquipmentModification = false,
    previousValues,
}) => {
    const currentNodeUuid = currentNode?.id;
    const [busOrBusbarSectionOptions, setBusOrBusbarSectionOptions] = useState([]);

    const [isDiagramPaneOpen, setIsDiagramPaneOpen] = useState(false);

    const intl = useIntl();

    const { setValue, getValues } = useFormContext();

    const watchVoltageLevelId = useWatch({
        name: `${id}.${VOLTAGE_LEVEL}.${ID}`,
    });

    useEffect(() => {
        if (isEquipmentModification) {
            return;
        }
        if (watchVoltageLevelId) {
            const existingVoltageLevelOption = voltageLevelOptions.find((option) => option.id === watchVoltageLevelId);
            if (existingVoltageLevelOption) {
                fetchBusesOrBusbarSectionsForVoltageLevel(
                    studyUuid,
                    currentNodeUuid,
                    currentRootNetworkUuid,
                    watchVoltageLevelId
                ).then((busesOrbusbarSections) => {
                    setBusOrBusbarSectionOptions(busesOrbusbarSections || []);
                    if (!busesOrbusbarSections?.length) {
                        setValue(`${id}.${BUS_OR_BUSBAR_SECTION}`, null);
                    }
                });
            } else {
                setBusOrBusbarSectionOptions([]);
                setValue(`${id}.${BUS_OR_BUSBAR_SECTION}`, null);
            }
        } else {
            setBusOrBusbarSectionOptions([]);
            setValue(`${id}.${BUS_OR_BUSBAR_SECTION}`, null);
        }
    }, [
        watchVoltageLevelId,
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        voltageLevelOptions,
        setValue,
        id,
        isEquipmentModification,
    ]);

    useEffect(() => {
        if (isEquipmentModification) {
            return;
        }
        if (newBusOrBusbarSectionOptions?.length > 0) {
            setBusOrBusbarSectionOptions(newBusOrBusbarSectionOptions);
        }
    }, [newBusOrBusbarSectionOptions, isEquipmentModification]);

    const handleChange = useCallback(() => {
        onVoltageLevelChangeCallback?.();
    }, [onVoltageLevelChangeCallback]);

    useEffect(() => {
        if (isEquipmentModification) {
            return;
        }
        const currentBusOrBusbarSection = getValues(`${id}.${BUS_OR_BUSBAR_SECTION}`);
        if (busOrBusbarSectionOptions?.length > 0 && currentBusOrBusbarSection?.id !== null) {
            setValue(`${id}.${BUS_OR_BUSBAR_SECTION}`, currentBusOrBusbarSection);
        }
    }, [busOrBusbarSectionOptions, setValue, id, getValues, isEquipmentModification]);

    const newVoltageLevelField = isEquipmentModification ? (
        <AutocompleteInput
            name={`${id}.${VOLTAGE_LEVEL}.${ID}`}
            label={voltageLevelSelectLabel}
            options={voltageLevelOptions}
            disabled={isEquipmentModification}
            size={'small'}
        />
    ) : (
        <AutocompleteInput
            isOptionEqualToValue={areIdsEqual}
            outputTransform={(value) =>
                typeof value === 'string' ? getConnectivityVoltageLevelData({ voltageLevelId: value }) : value
            }
            onChangeCallback={handleChange}
            allowNewValue
            forcePopupIcon
            name={`${id}.${VOLTAGE_LEVEL}`}
            label={voltageLevelSelectLabel}
            options={voltageLevelOptions}
            getOptionLabel={getObjectId}
            size={'small'}
        />
    );

    const previousConnectedField = useMemo(() => {
        if (!isEquipmentModification) {
            return null;
        }
        return previousValues?.terminalConnected
            ? intl.formatMessage({ id: 'connected' })
            : intl.formatMessage({ id: 'disconnected' });
    }, [intl, previousValues, isEquipmentModification]);

    const connectedField = isEquipmentModification ? (
        <CheckboxNullableInput name={`${id}.${CONNECTED}`} label="connected" previousValue={previousConnectedField} />
    ) : (
        <SwitchInput name={`${id}.${CONNECTED}`} label="connected" />
    );

    const newBusOrBusbarSectionField = isEquipmentModification ? (
        <AutocompleteInput
            name={`${id}.${BUS_OR_BUSBAR_SECTION}.${ID}`}
            label="BusBarBus"
            options={busOrBusbarSectionOptions}
            disabled={isEquipmentModification}
            size={'small'}
        />
    ) : (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            //hack to work with freesolo autocomplete
            //setting null programatically when freesolo is enable wont empty the field
            name={`${id}.${BUS_OR_BUSBAR_SECTION}`}
            label="BusBarBus"
            options={busOrBusbarSectionOptions}
            getOptionLabel={getObjectId}
            isOptionEqualToValue={areIdsEqual}
            inputTransform={(value) => (value === null ? '' : value)}
            outputTransform={(value) =>
                typeof value === 'string'
                    ? getConnectivityBusBarSectionData({
                          busbarSectionId: value,
                      })
                    : value
            }
            size={'small'}
        />
    );

    const newConnectionNameField = (
        <TextInput
            name={`${id}.${CONNECTION_NAME}`}
            label="ConnectionName"
            previousValue={isEquipmentModification ? previousValues?.connectablePosition?.connectionName : null}
        />
    );

    const previousConnectionDirectionLabel = isEquipmentModification
        ? getConnectionDirectionLabel(previousValues?.connectablePosition?.connectionDirection) ?? null
        : null;

    const newConnectionDirectionField = (
        <SelectInput
            name={`${id}.${CONNECTION_DIRECTION}`}
            label="ConnectionDirection"
            options={CONNECTION_DIRECTIONS}
            previousValue={
                previousConnectionDirectionLabel &&
                intl.formatMessage({
                    id: previousConnectionDirectionLabel,
                })
            }
            fullWidth
            size={'small'}
        />
    );

    const handleClickOpenDiagramPane = useCallback(() => {
        setIsDiagramPaneOpen(true);
    }, []);

    const handleCloseDiagramPane = useCallback(() => {
        setIsDiagramPaneOpen(false);
    }, []);

    const newConnectionPositionField = (
        <IntegerInput
            name={`${id}.${CONNECTION_POSITION}`}
            label="ConnectionPosition"
            previousValue={isEquipmentModification ? previousValues?.connectablePosition?.connectionPosition : null}
            clearable={true}
        />
    );

    const newPositionIconField = (
        <IconButton
            {...(isNodeBuilt(currentNode) && watchVoltageLevelId && { onClick: handleClickOpenDiagramPane })}
            disableRipple={!isNodeBuilt(currentNode) || !watchVoltageLevelId}
            edge="start"
        >
            <Tooltip
                title={intl.formatMessage({
                    id: !isNodeBuilt(currentNode)
                        ? 'NodeNotBuildPositionMessage'
                        : watchVoltageLevelId
                        ? 'DisplayTakenPositions'
                        : 'NoVoltageLevelPositionMessage',
                })}
            >
                {isNodeBuilt(currentNode) && watchVoltageLevelId ? (
                    <ExploreOutlinedIcon color="action" />
                ) : (
                    <ExploreOffOutlinedIcon color="action" />
                )}
            </Tooltip>
        </IconButton>
    );

    const gridSize = direction && (direction === 'column' || direction === 'column-reverse') ? 24 : 12;
    const conditionalSize = withPosition && withDirectionsInfos ? 8 : gridSize;
    return (
        <>
            <Grid container direction={direction || 'row'} spacing={2} columns={24}>
                <Grid item xs={conditionalSize} align="start">
                    {newVoltageLevelField}
                </Grid>
                <Grid item xs={conditionalSize} align="start">
                    {newBusOrBusbarSectionField}
                </Grid>

                {withDirectionsInfos && (
                    <>
                        <Grid item xs={conditionalSize} align="start">
                            {connectedField}
                        </Grid>
                        <Grid item xs={conditionalSize} align="start">
                            {newConnectionNameField}
                        </Grid>
                        <Grid item xs={conditionalSize} align="start">
                            {newConnectionDirectionField}
                        </Grid>
                        {withPosition && (
                            <>
                                <Grid xs={conditionalSize - 1} item align="start">
                                    {newConnectionPositionField}
                                </Grid>
                                <Grid xs={1} item align="start">
                                    {newPositionIconField}
                                </Grid>
                            </>
                        )}
                    </>
                )}
            </Grid>
            <PositionDiagramPane
                studyUuid={studyUuid}
                open={isDiagramPaneOpen}
                onClose={handleCloseDiagramPane}
                voltageLevelId={{ id: watchVoltageLevelId }}
                currentNodeUuid={currentNodeUuid}
                currentRootNetworkUuid={currentRootNetworkUuid}
            />
        </>
    );
};
