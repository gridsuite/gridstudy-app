/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FieldConstants, filledTextField, TextInput } from '@gridsuite/commons-ui';
import CountrySelectionInput from 'components/utils/rhf-inputs/country-selection-input';
import { useLocalizedCountries } from 'components/utils/localized-countries-hook';
import { TextField, Grid } from '@mui/material';
import { PropertiesForm } from '@gridsuite/commons-ui';
import GridItem from '../../../commons/grid-item';
import { SubstationInfos } from '../substation-dialog.type';

interface SubstationModificationFormProps {
    substationToModify?: SubstationInfos | null;
    equipmentId: string;
}

const SubstationModificationForm = ({ substationToModify, equipmentId }: Readonly<SubstationModificationFormProps>) => {
    const { translate } = useLocalizedCountries();

    const substationIdField = (
        <TextField
            size="small"
            fullWidth
            label={'ID'}
            value={equipmentId}
            InputProps={{
                readOnly: true,
            }}
            disabled
            {...filledTextField}
        />
    );

    const substationNameField = (
        <TextInput
            name={FieldConstants.EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
            previousValue={substationToModify?.name}
            clearable
        />
    );

    const substationCountryField = (
        <CountrySelectionInput
            name={FieldConstants.COUNTRY}
            label={'Country'}
            formProps={filledTextField}
            size={'small'}
            previousValue={substationToModify?.country ? translate(substationToModify.country) : ''}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                <GridItem size={4}>{substationIdField}</GridItem>
                <GridItem size={4}>{substationNameField}</GridItem>
                <GridItem size={4}>{substationCountryField}</GridItem>
            </Grid>
            <PropertiesForm networkElementType={'substation'} isModification={true} />
        </>
    );
};

export default SubstationModificationForm;
