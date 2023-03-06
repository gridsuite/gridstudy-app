/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import { Box } from '@mui/system';
import AutocompleteInput from 'components/refactor/rhf-inputs/autocomplete-input';
import {
    ATTACHED_LINE_ID,
    BUS_BAR_SECTION_ID,
    ID,
    LINE_TO_ATTACH_TO_1_ID,
    LINE_TO_ATTACH_TO_2_ID,
    REPLACING_LINE_1_ID,
    REPLACING_LINE_2_ID,
    REPLACING_LINE_1_NAME,
    REPLACING_LINE_2_NAME,
    TOPOLOGY_KIND,
    VOLTAGE_LEVEL_ID,
} from 'components/refactor/utils/field-constants';
import React, { useCallback, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
    fetchBusbarSectionsForVoltageLevel,
    fetchBusesForVoltageLevel,
    fetchEquipmentsIds,
    fetchVoltageLevelsIdAndTopology,
} from 'utils/rest-api';
import { gridItem, GridSection } from 'components/dialogs/dialogUtils';
import TextInput from 'components/refactor/rhf-inputs/text-input';

const LinesAttachToSplitLinesForm = ({ currentNodeUuid, studyUuid }) => {
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);
    const [linesIds, setLinesIds] = useState([]);
    const [busOrBusbarSectionOptions, setBusOrBusbarSectionOptions] = useState(
        []
    );
    const { setValue } = useFormContext();

    const watchVoltageLevelId = useWatch({
        name: `${VOLTAGE_LEVEL_ID}`,
    });

    const getObjectId = useCallback((object) => {
        if (typeof object === 'string') {
            return object;
        }

        return object?.id;
    }, []);

    const resetBusBarSection = useCallback(() => {
        setValue(`${BUS_BAR_SECTION_ID}`, null);
    }, [setValue]);

    useEffect(() => {
        if (studyUuid && currentNodeUuid)
            fetchVoltageLevelsIdAndTopology(studyUuid, currentNodeUuid).then(
                (values) => {
                    setVoltageLevelOptions(
                        values.sort((a, b) => a.id.localeCompare(b.id))
                    );
                }
            );
    }, [studyUuid, currentNodeUuid]);

    useEffect(() => {
        fetchEquipmentsIds(
            studyUuid,
            currentNodeUuid,
            undefined,
            'LINE',
            true
        ).then((values) => {
            setLinesIds(values?.sort((a, b) => a.localeCompare(b)));
        });
    }, [studyUuid, currentNodeUuid]);

    useEffect(() => {
        if (watchVoltageLevelId) {
            const voltageLevel = voltageLevelOptions.find(
                (voltageLevel) => voltageLevel[ID] === watchVoltageLevelId
            );
            const topologyKind = voltageLevel?.[TOPOLOGY_KIND];

            switch (topologyKind) {
                case 'NODE_BREAKER':
                    fetchBusbarSectionsForVoltageLevel(
                        studyUuid,
                        currentNodeUuid,
                        watchVoltageLevelId
                    ).then((busbarSections) => {
                        const busbarSectionsIds = busbarSections?.map(
                            (busbarSection) => busbarSection[ID]
                        );
                        setBusOrBusbarSectionOptions(busbarSectionsIds);
                    });
                    break;

                case 'BUS_BREAKER':
                    fetchBusesForVoltageLevel(
                        studyUuid,
                        currentNodeUuid,
                        watchVoltageLevelId
                    ).then((buses) => {
                        const busesIds = buses?.map((buse) => buse[ID]);
                        setBusOrBusbarSectionOptions(busesIds);
                    });
                    break;

                default:
                    setBusOrBusbarSectionOptions([]);
                    break;
            }
        } else {
            setBusOrBusbarSectionOptions([]);
        }
    }, [watchVoltageLevelId, studyUuid, currentNodeUuid, voltageLevelOptions]);

    const lineToAttachTo1Field = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={LINE_TO_ATTACH_TO_1_ID}
            label="Line1"
            options={linesIds}
            size={'small'}
        />
    );

    const lineToAttachTo2Field = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={LINE_TO_ATTACH_TO_2_ID}
            label="Line2"
            options={linesIds}
            size={'small'}
        />
    );

    const attachedLineField = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={ATTACHED_LINE_ID}
            label="LineAttached"
            options={linesIds}
            size={'small'}
        />
    );

    const voltageLevelIdField = (
        <AutocompleteInput
            outputTransform={getObjectId}
            allowNewValue
            forcePopupIcon
            name={VOLTAGE_LEVEL_ID}
            label="AttachedVoltageLevelId"
            options={voltageLevelOptions.map((voltageLevel) => voltageLevel.id)}
            onChangeCallback={resetBusBarSection}
            size={'small'}
        />
    );

    const bbsOrNodeIdField = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={BUS_BAR_SECTION_ID}
            label="BusBarBus"
            options={busOrBusbarSectionOptions}
            inputTransform={(value) => (value === null ? '' : value)}
            size={'small'}
        />
    );

    const newLine1IdField = (
        <TextInput name={REPLACING_LINE_1_ID} label={'Line1ID'} />
    );

    const newLine1NameField = (
        <TextInput name={REPLACING_LINE_1_NAME} label={'Line1Name'} />
    );

    const newLine2IdField = (
        <TextInput name={REPLACING_LINE_2_ID} label={'Line2ID'} />
    );

    const newLine2NameField = (
        <TextInput name={REPLACING_LINE_2_NAME} label={'Line2Name'} />
    );

    return (
        <>
            <GridSection title="Line1" />
            <Grid container spacing={2} alignItems="center">
                {gridItem(lineToAttachTo1Field, 5)}
            </Grid>
            <GridSection title="Line2" />
            <Grid container spacing={2} alignItems="center">
                {gridItem(lineToAttachTo2Field, 5)}
            </Grid>
            <GridSection title="LineAttached" />
            <Grid container spacing={2} alignItems="center">
                {gridItem(attachedLineField, 5)}
            </Grid>
            <GridSection title="VoltageLevel" />
            <Grid container spacing={2}>
                {gridItem(voltageLevelIdField)}
                {gridItem(bbsOrNodeIdField)}
            </Grid>
            <GridSection title="ReplacingLines" />
            <Grid container spacing={2}>
                {gridItem(newLine1IdField, 6)}
                {gridItem(newLine1NameField, 6)}
                <Box sx={{ width: '100%' }} />
                {gridItem(newLine2IdField, 6)}
                {gridItem(newLine2NameField, 6)}
            </Grid>
        </>
    );
};

export default LinesAttachToSplitLinesForm;
