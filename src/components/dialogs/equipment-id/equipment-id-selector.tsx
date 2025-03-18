/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { filledTextField } from '../dialog-utils';
import { UUID } from 'crypto';
import { Autocomplete, TextField, Grid, CircularProgress, Box } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { EquipmentType, ExtendedEquipmentType, FieldLabel } from '@gridsuite/commons-ui';
import { FormFiller } from './formFiller.js';
import { FormattedMessage } from 'react-intl';
import { fetchEquipmentsIds } from '../../../services/study/network-map';
import GridItem from '../commons/grid-item';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';

const styles = {
    message: (theme: Theme) => ({
        fontSize: 'small',
        fontStyle: 'italic',
        color: theme.palette.text.secondary,
    }),
    hidden: {
        color: 'rgba(0,0,0,0)',
        width: 0,
    },
};

interface EquipmentIdSelectorProps {
    defaultValue: string | null;
    setSelectedId: (value: string) => void;
    equipmentType: EquipmentType | ExtendedEquipmentType;
    readOnly?: boolean;
    fillerHeight?: number;
    fillerMessageId?: string;
    loading?: boolean;
}
export function EquipmentIdSelector({
    defaultValue,
    setSelectedId,
    equipmentType,
    readOnly = false,
    fillerHeight,
    fillerMessageId = 'idSelector.idNeeded',
    loading = false,
}: Readonly<EquipmentIdSelectorProps>) {
    const [equipmentOptions, setEquipmentOptions] = useState<string[]>([]);
    const [selectedValue, setSelectedValue] = useState<string>();
    const currentNodeUuid = useSelector((state: AppState) => state.currentTreeNode?.id);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid as UUID);
    const studyUuid = useSelector((state: AppState) => state.studyUuid as UUID);

    useEffect(() => {
        if (currentNodeUuid) {
            fetchEquipmentsIds(studyUuid, currentNodeUuid, currentRootNetworkUuid, [], equipmentType, true).then(
                (values) => {
                    setEquipmentOptions(values.sort((a: string, b: string) => a.localeCompare(b)));
                }
            );
        }
    }, [studyUuid, currentNodeUuid, currentRootNetworkUuid, equipmentType]);

    // We go through this effect to force a rerender and display the loading icon.
    useEffect(() => {
        if (selectedValue) {
            setSelectedId(selectedValue);
        }
    }, [selectedValue, setSelectedId]);

    const handleChange = (newId: string | null, reason: string) => {
        if (newId && (reason === 'createOption' || reason === 'selectOption')) {
            setSelectedValue(newId);
        } else if (reason === 'clear') {
            setSelectedValue(undefined);
        }
    };

    const equipmentIdField = (
        <Autocomplete
            value={defaultValue}
            freeSolo
            size="small"
            autoComplete
            blurOnSelect
            autoSelect={false}
            forcePopupIcon
            onChange={(_, data, reason) => handleChange(data, reason)}
            onInputChange={(_, data, reason) => handleChange(data, reason)}
            options={equipmentOptions}
            renderInput={({ inputProps, ...rest }) => (
                <TextField
                    label={FieldLabel({
                        label: 'ID',
                    })}
                    inputProps={{ ...inputProps, readOnly: readOnly }}
                    autoFocus
                    {...filledTextField}
                    {...rest}
                />
            )}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                <GridItem size={4}>{equipmentIdField}</GridItem>
            </Grid>
            <FormFiller lineHeight={fillerHeight}>
                {fillerMessageId && (!loading || !selectedValue) && (
                    <Box sx={styles.message}>
                        <FormattedMessage id={fillerMessageId} />
                    </Box>
                )}
                <CircularProgress
                    // We keep the circular progress rendered but hidden to prevent an incomplete
                    // rendering when we set the choosen ID in the parent component.
                    // TODO: Enhance the loader to support all modification forms,
                    // ensuring it accounts for the full details of the equipment, not just the ID
                    sx={!loading || !selectedValue ? styles.hidden : undefined}
                />
            </FormFiller>
        </>
    );
}
