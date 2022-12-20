/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import React, { useEffect, useMemo, useState } from 'react';
import {
    fetchBusbarSectionsForVoltageLevel,
    fetchBusesForVoltageLevel,
} from '../../utils/rest-api';
import { getIdOrSelf } from '../../components/dialogs/dialogUtils';
import { useSelector } from 'react-redux';
import { useAutocompleteField } from '../../components/dialogs/inputs/use-autocomplete-field';
import {
    useOptionalEnumValue,
    useIntegerValue,
    useTextValue,
} from '../../components/dialogs/inputs/input-hooks';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import ExploreOffOutlinedIcon from '@mui/icons-material/ExploreOffOutlined';

import PositionDiagramPane from '../diagrams/singleLineDiagram/position-diagram-pane';
import { Tooltip } from '@mui/material';
import {
    CONNECTION_DIRECTIONS,
    UNDEFINED_CONNECTION_DIRECTION,
} from '../network/constants';
import { useIntl } from 'react-intl';
import { isNodeBuilt } from '../graph/util/model-functions';
import { ReactHookFormTextField } from './inputs/text-field/react-hook-form-text-field';
import { useFormContext } from 'react-hook-form';
import * as yup from 'yup';
import { ReactHookFormAutocomplete } from './inputs/select-field/react-hook-form-autocomplete';
import { ReactHookFormSelect } from './inputs/select-field/react-hook-form-select';
import { ReactHookFormNumberTextField } from './inputs/text-field/react-hook-form-number-text-field';

/**
 * Creates a callback for _getting_ bus or busbar section for a given voltage level in a node.
 * Usable firstly for giving to hereunder ConnectivityEdition.
 * @param studyUuid uuid of the study where to look for the voltage level bus(bar section)s.
 * @param currentNodeUuid uuid of the node of the study where to look for the voltage level bus(bar section)s.
 * @returns {(function(*, *): void)|*}
 */
export function makeRefreshBusOrBusbarSectionsCallback(
    studyUuid,
    currentNodeUuid
) {
    return (voltageLevel, putter) => {
        switch (voltageLevel?.topologyKind) {
            case 'NODE_BREAKER':
                fetchBusbarSectionsForVoltageLevel(
                    studyUuid,
                    currentNodeUuid,
                    voltageLevel.id
                ).then((busbarSections) => {
                    putter(busbarSections);
                });
                break;

            case 'BUS_BREAKER':
                fetchBusesForVoltageLevel(
                    studyUuid,
                    currentNodeUuid,
                    voltageLevel.id
                ).then((buses) => putter(buses));
                break;

            default:
                putter([]);
                break;
        }
    };
}

function ided(objOrId) {
    if (!objOrId) return null;
    if (typeof objOrId?.id === 'string') return objOrId;

    return { id: objOrId };
}

const connectivityValidationSchema = {
    connectivity: yup.object().shape({
        voltageLevel: yup.object().nullable().required().shape({
            id: yup.string(),
            name: yup.string(),
            substationId: yup.string(),
            nominalVoltage: yup.string(),
            topologyKind: yup.string(),
        }),
        busOrBusbarSection: yup.object().nullable().required().shape({
            id: yup.string(),
            name: yup.string(),
        }),
        connectionDirection: yup.string(),
        connectionName: yup.string(),
        connectionPosition: yup.string(),
    }),
};

export const getConnectivityFormValidationSchema = () => {
    return connectivityValidationSchema;
};

/**
 * Hook to handle a 'connectivity value' (voltage level, bus or bus bar section)
 * @param label optional label, no more so useful, except for debug purpose
 * @param id optional id that has to be defined if the hook is used more than once in a form
 * @param validation field validation option
 * @param inputForm optional form for inputs basis
 * @param voltageLevelOptionsPromise a promise that will bring available voltage levels
 * @param currentNodeUuid current node id
 * @param direction direction of placement. Either 'row' or 'column', 'row' by default.
 * @param voltageLevelIdDefaultValue
 * @param busOrBusbarSectionIdDefaultValue
 * @param connectionDirectionValue
 * @param connectionNameValue
 * @param connectionPositionValue
 * @param withPosition
 * @param withDirectionsInfos
 * @returns {[{voltageLevel: null, busOrBusbarSection: null},unknown]}
 */
export const ConnectivityForm = ({
    label,
    id,
    validation = {
        isFieldRequired: true,
    },
    inputForm,
    voltageLevelOptionsPromise,
    currentNodeUuid,
    direction = 'row',
    voltageLevelIdDefaultValue,
    busOrBusbarSectionIdDefaultValue,
    connectionDirectionValue,
    connectionNameValue,
    connectionPositionValue,
    withDirectionsInfos = true,
    withPosition = false,
}) => {
    const [bbsIdInitOver, setBbsIdInitOver] = useState(null);
    const studyUuid = useSelector((state) => state.studyUuid);
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);

    const [busOrBusbarSectionOptions, setBusOrBusbarSectionOptions] = useState(
        []
    );
    const [isDiagramPaneOpen, setIsDiagramPaneOpen] = useState(false);
    const intl = useIntl();
    const currentNode = useSelector((state) => state.currentTreeNode);

    const methods = useFormContext();
    const {
        control,
        formState: { errors: yupErrors },
        watch,
    } = methods;

    const watchVoltageLevel = watch('connectivity.voltageLevel');

    useEffect(() => {
        if (!voltageLevelOptionsPromise) return;

        voltageLevelOptionsPromise.then((values) => {
            setVoltageLevelOptions(
                values.sort((a, b) => a.id.localeCompare(b.id))
            );
        });
    }, [voltageLevelOptionsPromise]);

    const newVoltageLevelField = (
        <ReactHookFormAutocomplete
            id={id ? id + '/voltage-level' : 'voltage-level'}
            validation={validation}
            values={voltageLevelOptions}
            defaultValue={voltageLevelIdDefaultValue}
            getLabel={getIdOrSelf}
            allowNewValue={true}
            inputForm={inputForm}
            name="connectivity.voltageLevel"
            label="VoltageLevel"
            control={control}
            errorMessage={yupErrors?.connectivity?.voltageLevel?.message}
        />
    );

    const newBusOrBusbarSectionField = (
        <ReactHookFormAutocomplete
            id={id ? id + '/bus-bar-bus' : 'bus-bar-bus'}
            validation={validation}
            values={busOrBusbarSectionOptions}
            defaultValue={bbsIdInitOver}
            getLabel={getIdOrSelf}
            allowNewValue={true}
            inputForm={inputForm}
            name="connectivity.busOrBusbarSection"
            label="BusBarBus"
            control={control}
            errorMessage={yupErrors?.connectivity?.busOrBusbarSection?.message}
        />
    );

    const newConnectionNameField = (
        <ReactHookFormTextField
            name="connectivity.connectionName"
            label="ConnectionName"
            control={control}
            errorMessage={yupErrors?.connectivity?.connectionName?.message}
        />
    );

    const newConnectionDirectionField = (
        <ReactHookFormSelect
            name="connectivity.connectionDirection"
            label="ConnectionDirection"
            options={CONNECTION_DIRECTIONS}
            size="small"
            fullWidth
            control={control}
            errorMessage={yupErrors?.connectivity?.connectionDirection?.message}
        />
    );

    const newConnectionPositionField = (
        <ReactHookFormNumberTextField
            name="connectivity.connectionPosition"
            label="ConnectionPosition"
            control={control}
            errorMessage={yupErrors?.connectivity?.connectionPosition?.message}
        />
    );

    // const [voltageLevelObjOrId, voltageLevelField] = useAutocompleteField({
    //     id: id ? id + '/voltage-level' : 'voltage-level',
    //     label: 'VoltageLevel',
    //     validation: validation,
    //     values: voltageLevelOptions,
    //     defaultValue: voltageLevelIdDefaultValue,
    //     getLabel: getIdOrSelf,
    //     allowNewValue: true,
    //     inputForm: inputForm,
    // });

    // const [busOrBusbarSectionObjOrId, busOrBusbarSectionField] =
    //     useAutocompleteField({
    //         id: id ? id + '/bus-bar-bus' : 'bus-bar-bus',
    //         label: 'BusBarBus',
    //         validation: validation,
    //         values: busOrBusbarSectionOptions,
    //         defaultValue: bbsIdInitOver,
    //         getLabel: getIdOrSelf,
    //         allowNewValue: true,
    //         inputForm: inputForm,
    //     });

    // const [connectionDirection, connectionDirectionField] =
    //     useOptionalEnumValue({
    //         label: 'ConnectionDirection',
    //         inputForm: inputForm,
    //         enumObjects: CONNECTION_DIRECTIONS,
    //         validation: {
    //             isFieldRequired: false,
    //         },
    //         defaultValue:
    //             connectionDirectionValue &&
    //             connectionDirectionValue !== UNDEFINED_CONNECTION_DIRECTION
    //                 ? connectionDirectionValue
    //                 : null,
    //     });

    // const [connectionName, connectionNameField] = useTextValue({
    //     label: 'ConnectionName',
    //     validation: { isFieldRequired: false },
    //     inputForm: inputForm,
    //     defaultValue: connectionNameValue,
    // });

    // const [connectionPosition, connectionPositionField] = useIntegerValue({
    //     label: 'ConnectionPosition',
    //     validation: { isFieldRequired: false },
    //     inputForm: inputForm,
    //     defaultValue: connectionPositionValue,
    // });

    useEffect(() => {
        setBbsIdInitOver(busOrBusbarSectionIdDefaultValue);
    }, [
        voltageLevelOptions,
        busOrBusbarSectionIdDefaultValue,
        voltageLevelIdDefaultValue,
    ]);

    useEffect(() => {
        if (watchVoltageLevel) {
            if (watchVoltageLevel?.id !== voltageLevelIdDefaultValue) {
                setBbsIdInitOver(null);
            }

            const asyncRefreshFunc = makeRefreshBusOrBusbarSectionsCallback(
                studyUuid,
                currentNodeUuid
            );
            asyncRefreshFunc(watchVoltageLevel, setBusOrBusbarSectionOptions);
        }
    }, [
        watchVoltageLevel,
        voltageLevelIdDefaultValue,
        studyUuid,
        currentNodeUuid,
    ]);

    useEffect(() => {});

    const gridSize =
        direction && (direction === 'column' || direction === 'column-reverse')
            ? 12
            : 6;

    // const connectivity = useMemo(() => {
    //     if (!voltageLevelObjOrId)
    //         return {
    //             voltageLevel: null,
    //             busOrBusbarSection: null,
    //             connectionDirection: null,
    //             connectionName: null,
    //             connectionPosition: null,
    //         };

    //     const ret = {
    //         voltageLevel: ided(voltageLevelObjOrId),
    //         busOrBusbarSection: ided(busOrBusbarSectionObjOrId),
    //         connectionDirection: ided(connectionDirection),
    //         connectionName: ided(connectionName),
    //         connectionPosition: ided(connectionPosition),
    //     };
    //     return ret;
    // }, [
    //     voltageLevelObjOrId,
    //     busOrBusbarSectionObjOrId,
    //     connectionDirection,
    //     connectionName,
    //     connectionPosition,
    // ]);

    const handleClickOpenDiagramPane = () => {
        setIsDiagramPaneOpen(true);
    };

    const handleCloseDiagramPane = () => {
        setIsDiagramPaneOpen(false);
    };

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
                                <Grid
                                    item
                                    xs={(60 * gridSize) / 100}
                                    align="start"
                                >
                                    {newConnectionPositionField}
                                </Grid>
                                <Grid
                                    item
                                    xs={(5 * gridSize) / 100}
                                    align="start"
                                    display="flex"
                                    alignItems="center"
                                >
                                    <Tooltip
                                        title={intl.formatMessage({
                                            id: !isNodeBuilt(currentNode)
                                                ? 'NodeNotBuildPositionMessage'
                                                : 'DisplayTakenPositions',
                                        })}
                                    >
                                        {!isNodeBuilt(currentNode) ? (
                                            <ExploreOffOutlinedIcon color="action" />
                                        ) : (
                                            <ExploreOutlinedIcon
                                                onClick={
                                                    handleClickOpenDiagramPane
                                                }
                                                color="action"
                                                cursor="pointer"
                                            />
                                        )}
                                    </Tooltip>
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
                voltageLevelId={watchVoltageLevel}
                currentNodeUuid={currentNodeUuid}
            />
        </>
    );
};
