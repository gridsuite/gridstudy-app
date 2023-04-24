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
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    ID,
    VOLTAGE_LEVEL,
} from 'components/util/field-constants';
import { areIdsEqual, getObjectId } from 'components/util/utils';
import React, { useCallback, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useIntl } from 'react-intl';
import {
    fetchBusbarSectionsForVoltageLevel,
    fetchBusesForVoltageLevel,
} from '../../../utils/rest-api';
import PositionDiagramPane from '../../diagrams/singleLineDiagram/position-diagram-pane';
import { isNodeBuilt } from '../../graph/util/model-functions';
import { CONNECTION_DIRECTIONS } from '../../network/constants';
import AutocompleteInput from '../../util/rhf-inputs/autocomplete-input';
import IntegerInput from '../../util/rhf-inputs/integer-input';
import SelectInput from '../../util/rhf-inputs/select-input';
import TextInput from '../../util/rhf-inputs/text-input';
import {
    getConnectivityBusBarSectionData,
    getConnectivityVoltageLevelData,
} from './connectivity-form-utils';

/**
 * Hook to handle a 'connectivity value' (voltage level, bus or bus bar section)
 * @param id optional id that has to be defined if the component is used more than once in a form
 * @param direction direction of placement. Either 'row' or 'column', 'row' by default.
 * @param withDirectionsInfos
 * @param withPosition
 * @param voltageLevelOptions list of network voltage levels
 * @param newBusOrBusbarSectionOptions list of bus or bus bar sections for the newly created voltage level
 * @param studyUuid the study we are currently working on
 * @param currentNode the currently selected tree node
 * @param onVoltageLevelChangeCallback callback to be called when the voltage level changes
 * @returns {[{voltageLevel: null, busOrBusbarSection: null},unknown]}
 */
export const ConnectivityForm = ({
    id = CONNECTIVITY,
    label = 'VoltageLevel',
    direction = 'row',
    withDirectionsInfos = true,
    withPosition = false,
    voltageLevelOptions = [],
    newBusOrBusbarSectionOptions,
    studyUuid,
    currentNode,
    onVoltageLevelChangeCallback,
}) => {
    const currentNodeUuid = currentNode?.id;
    const [busOrBusbarSectionOptions, setBusOrBusbarSectionOptions] = useState(
        []
    );

    const [isDiagramPaneOpen, setIsDiagramPaneOpen] = useState(false);

    const intl = useIntl();

    const { setValue, getValues } = useFormContext();

    const watchVoltageLevelId = useWatch({
        name: `${id}.${VOLTAGE_LEVEL}.${ID}`,
    });

    useEffect(() => {
        if (newBusOrBusbarSectionOptions?.length > 0) {
            setBusOrBusbarSectionOptions(newBusOrBusbarSectionOptions);
        } else if (watchVoltageLevelId) {
            const voltageLevelTopologyKind = voltageLevelOptions.find(
                (vl) => vl.id === watchVoltageLevelId
            )?.topologyKind;
            switch (voltageLevelTopologyKind) {
                case 'NODE_BREAKER':
                    fetchBusbarSectionsForVoltageLevel(
                        studyUuid,
                        currentNodeUuid,
                        watchVoltageLevelId
                    ).then((busbarSections) => {
                        setBusOrBusbarSectionOptions(busbarSections);
                    });
                    break;

                case 'BUS_BREAKER':
                    fetchBusesForVoltageLevel(
                        studyUuid,
                        currentNodeUuid,
                        watchVoltageLevelId
                    ).then((buses) => setBusOrBusbarSectionOptions(buses));
                    break;

                default:
                    setBusOrBusbarSectionOptions([]);
                    break;
            }
        } else {
            setBusOrBusbarSectionOptions([]);
        }
    }, [
        watchVoltageLevelId,
        studyUuid,
        currentNodeUuid,
        newBusOrBusbarSectionOptions,
        voltageLevelOptions,
    ]);

    const handleChange = useCallback(() => {
        onVoltageLevelChangeCallback?.();
        setValue(`${id}.${BUS_OR_BUSBAR_SECTION}`, null);
    }, [id, onVoltageLevelChangeCallback, setValue]);

    useEffect(() => {
        const currentBusOrBusbarSection = getValues(
            `${id}.${BUS_OR_BUSBAR_SECTION}`
        );
        if (
            busOrBusbarSectionOptions?.length > 0 &&
            !currentBusOrBusbarSection
        ) {
            setValue(
                `${id}.${BUS_OR_BUSBAR_SECTION}`,
                busOrBusbarSectionOptions[0]
            );
        }
    }, [busOrBusbarSectionOptions, setValue, id, getValues]);

    const newVoltageLevelField = (
        <AutocompleteInput
            isOptionEqualToValue={areIdsEqual}
            outputTransform={(value) =>
                typeof value === 'string'
                    ? getConnectivityVoltageLevelData({ voltageLevelId: value })
                    : value
            }
            onChangeCallback={handleChange}
            allowNewValue
            forcePopupIcon
            name={`${id}.${VOLTAGE_LEVEL}`}
            label={label}
            options={voltageLevelOptions}
            getOptionLabel={getObjectId}
            size={'small'}
        />
    );

    const newBusOrBusbarSectionField = (
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
        <TextInput name={`${id}.${CONNECTION_NAME}`} label="ConnectionName" />
    );

    const newConnectionDirectionField = (
        <SelectInput
            name={`${id}.${CONNECTION_DIRECTION}`}
            label="ConnectionDirection"
            options={CONNECTION_DIRECTIONS}
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

    const positionIconAdorment = useCallback(
        (isNodeBuilt, clickCallback) => {
            return (
                <IconButton
                    {...(isNodeBuilt &&
                        watchVoltageLevelId && { onClick: clickCallback })}
                    disableRipple={!isNodeBuilt || !watchVoltageLevelId}
                >
                    <Tooltip
                        title={intl.formatMessage({
                            id: isNodeBuilt
                                ? 'DisplayTakenPositions'
                                : 'NodeNotBuildPositionMessage',
                        })}
                    >
                        {isNodeBuilt && watchVoltageLevelId ? (
                            <ExploreOutlinedIcon color="action" />
                        ) : (
                            <ExploreOffOutlinedIcon color="action" />
                        )}
                    </Tooltip>
                </IconButton>
            );
        },
        [watchVoltageLevelId, intl]
    );

    const newConnectionPositionField = (
        <IntegerInput
            name={`${id}.${CONNECTION_POSITION}`}
            label="ConnectionPosition"
            customAdornment={positionIconAdorment(
                isNodeBuilt(currentNode),
                handleClickOpenDiagramPane
            )}
            clearable={true}
        />
    );

    const gridSize =
        direction && (direction === 'column' || direction === 'column-reverse')
            ? 12
            : 6;
    const conditionalSize = withPosition && withDirectionsInfos ? 4 : gridSize;
    return (
        <>
            <Grid container direction={direction || 'row'} spacing={2}>
                <Grid item xs={conditionalSize} align="start">
                    {newVoltageLevelField}
                </Grid>
                <Grid item xs={conditionalSize} align="start">
                    {newBusOrBusbarSectionField}
                </Grid>

                {withDirectionsInfos && (
                    <>
                        {withPosition && (
                            <>
                                <Grid item xs={gridSize} align="start" />
                                <Grid item xs={gridSize} align="start" />
                            </>
                        )}
                        <Grid item xs={conditionalSize} align="start">
                            {newConnectionNameField}
                        </Grid>
                        <Grid item xs={conditionalSize} align="start">
                            {newConnectionDirectionField}
                        </Grid>
                        {withPosition && (
                            <>
                                <Grid xs={conditionalSize} item align="start">
                                    {newConnectionPositionField}
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
            />
        </>
    );
};
