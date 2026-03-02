/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ADD_SUBSTATION_CREATION,
    BUS_BAR_COUNT,
    IS_ATTACHMENT_POINT_CREATION,
    SECTION_COUNT,
    SUBSTATION_CREATION,
    SUBSTATION_CREATION_ID,
    SUBSTATION_NAME,
} from 'components/utils/field-constants';
import React, { useCallback, useEffect, useState } from 'react';
import {
    CountrySelectionInput,
    EquipmentType,
    fetchDefaultCountry,
    FieldConstants,
    IntegerInput,
    PropertiesForm,
    TextInput,
    VL_SUBSTATION_ID,
    VoltageLevelCreationForm,
} from '@gridsuite/commons-ui';
import { Box, Grid, Paper, Tooltip } from '@mui/material';

import { CouplingOmnibusForm } from '../coupling-omnibus/coupling-omnibus-form';
import { SwitchesBetweenSections } from '../switches-between-sections/switches-between-sections';
import { fetchEquipmentsIds } from '../../../../../services/study/network-map';
import { useFormContext, useWatch } from 'react-hook-form';
import GridItem from '../../../commons/grid-item';
import GridSection from '../../../commons/grid-section';
import IconButton from '@mui/material/IconButton';
import { useIntl } from 'react-intl';
import DeleteIcon from '@mui/icons-material/Delete';
import LineSeparator from '../../../commons/line-separator';
import { UUID } from 'node:crypto';

interface StudyVoltageLevelCreationFormProps {
    currentNodeUuid: UUID;
    studyUuid: UUID;
    currentRootNetworkUuid: UUID;
}

const StudyVoltageLevelCreationForm = ({
    currentNodeUuid,
    studyUuid,
    currentRootNetworkUuid,
}: StudyVoltageLevelCreationFormProps) => {
    const intl = useIntl();
    const { setValue, getValues } = useFormContext();
    const [substations, setSubstations] = useState<string[]>([]);
    const watchBusBarCount = useWatch({ name: BUS_BAR_COUNT });
    const watchSectionCount = useWatch({ name: SECTION_COUNT });
    const watchAddSubstationCreation = useWatch({ name: ADD_SUBSTATION_CREATION });
    const watchIsAttachmentPointCreation = useWatch({ name: IS_ATTACHMENT_POINT_CREATION });

    useEffect(() => {
        // in new substation mode, set the default country
        if (watchAddSubstationCreation && !getValues(FieldConstants.COUNTRY)) {
            fetchDefaultCountry().then((country) => {
                if (country) {
                    setValue(FieldConstants.COUNTRY, country);
                }
            });
        }
    }, [setValue, getValues, watchAddSubstationCreation]);

    useEffect(() => {
        if (studyUuid && currentNodeUuid && currentRootNetworkUuid) {
            fetchEquipmentsIds(
                studyUuid,
                currentNodeUuid,
                currentRootNetworkUuid,
                undefined,
                EquipmentType.SUBSTATION,
                true
            ).then((values: string[]) => {
                setSubstations(values.sort((a, b) => a.localeCompare(b)));
            });
        }
    }, [studyUuid, currentNodeUuid, currentRootNetworkUuid]);

    function getCustomPaper(children: React.ReactNode) {
        return (
            <Paper>
                <Box>
                    {children}
                    <LineSeparator />
                    <IconButton
                        color="primary"
                        sx={{ justifyContent: 'flex-start', fontSize: 'medium', marginLeft: '2%', width: '100%' }}
                        onMouseDown={handleAddButton}
                    >
                        {`${intl.formatMessage({ id: 'CreateSubstation' })} : ${getValues(VL_SUBSTATION_ID)}`}
                    </IconButton>
                </Box>
            </Paper>
        );
    }

    const handleAddButton = useCallback(() => {
        setValue(SUBSTATION_CREATION_ID, getValues(VL_SUBSTATION_ID));
        setValue(ADD_SUBSTATION_CREATION, true);
    }, [setValue, getValues]);

    const handleDeleteButton = useCallback(() => {
        setValue(ADD_SUBSTATION_CREATION, false);
        // clear the fields of the new substation
        setValue(SUBSTATION_CREATION_ID, null);
        setValue(SUBSTATION_NAME, null);
        setValue(FieldConstants.COUNTRY, null);
    }, [setValue]);

    const customSubstationSection = watchAddSubstationCreation ? (
        <Grid>
            <Grid item xs={12} container spacing={2}></Grid>
            <GridSection title={intl.formatMessage({ id: 'CreateSubstation' })} />
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <TextInput name={SUBSTATION_CREATION_ID} label={'SubstationId'} />
                </Grid>
                <Grid item xs={4}>
                    <TextInput name={SUBSTATION_NAME} label={'substationName'} />
                </Grid>
                <Grid item xs={3}>
                    <CountrySelectionInput name={FieldConstants.COUNTRY} label={'Country'} size={'small'} />
                </Grid>
                {!watchIsAttachmentPointCreation && (
                    <Grid item xs={1}>
                        <Tooltip
                            title={intl.formatMessage({
                                id: 'DeleteRows',
                            })}
                        >
                            <IconButton onClick={handleDeleteButton}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                )}
            </Grid>
            <PropertiesForm id={SUBSTATION_CREATION} networkElementType={'substation'} />
            <Grid item xs={12} paddingTop={2}>
                <LineSeparator />
            </Grid>
        </Grid>
    ) : undefined;

    const displayOmnibus = watchBusBarCount > 1 || watchSectionCount > 1;

    const topologySection = !watchIsAttachmentPointCreation ? (
        <>
            <GridSection title={'BusBarSections'} />
            <Grid container spacing={2}>
                <GridItem size={4}>
                    <IntegerInput name={BUS_BAR_COUNT} label={'BusBarCount'} />
                </GridItem>
                <GridItem size={4}>
                    <IntegerInput name={SECTION_COUNT} label={'numberOfSections'} />
                </GridItem>
                <SwitchesBetweenSections />
            </Grid>
            {displayOmnibus && (
                <>
                    <GridSection title={'Coupling_Omnibus'} />
                    <Grid container>
                        <GridItem size={12}>
                            <CouplingOmnibusForm />
                        </GridItem>
                    </Grid>
                </>
            )}
        </>
    ) : null;

    return (
        <VoltageLevelCreationForm
            substationOptions={substations}
            substationFieldAdditionalProps={{
                PaperComponent: ({ children }: { children: React.ReactNode }) => getCustomPaper(children),
                noOptionsText: '',
            }}
            customSubstationSection={customSubstationSection}
            hideNominalVoltage={watchIsAttachmentPointCreation}
        >
            {topologySection}
        </VoltageLevelCreationForm>
    );
};

export default StudyVoltageLevelCreationForm;
