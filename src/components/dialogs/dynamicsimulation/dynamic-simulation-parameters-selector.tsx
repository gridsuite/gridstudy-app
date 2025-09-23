/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../utils/yup-config';
import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { AutocompleteInput, CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import {
    fetchDynamicSimulationParameters,
    updateDynamicSimulationParameters,
} from '../../../services/study/dynamic-simulation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { getIdOrSelf } from '../dialog-utils';
import GridItem from '../commons/grid-item';
import type { UUID } from 'node:crypto';
import { DynamicSimulationParametersInfos } from '../../../services/study/dynamic-simulation.type';

const MAPPING_SELECTION_LABEL = 'DynamicSimulationMappingSelection';
const MAPPING = 'mapping';

const formSchema = yup.object().shape({
    [MAPPING]: yup.string().required(),
});

type MappingFormData = yup.InferType<typeof formSchema>;

const emptyFormData: MappingFormData = {
    [MAPPING]: '',
};

interface DynamicSimulationParametersSelectorProps {
    open: boolean;
    onClose: () => void;
    onStart: (params: any) => void;
    studyUuid: UUID;
}

export function DynamicSimulationParametersSelector({
    open,
    onClose,
    onStart,
    studyUuid,
}: Readonly<DynamicSimulationParametersSelectorProps>) {
    const [mappingNames, setMappingNames] = useState<string[]>([]);
    const [dynamicSimulationParams, setDynamicSimulationParams] = useState<DynamicSimulationParametersInfos | null>(
        null
    );

    const { snackError } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const {
        handleSubmit,
        reset,
        formState: { isDirty },
    } = formMethods;

    const mappingNameField = (
        <AutocompleteInput
            name={MAPPING}
            options={mappingNames}
            label={MAPPING_SELECTION_LABEL}
            fullWidth
            size={'small'}
            getOptionLabel={getIdOrSelf}
        />
    );

    useEffect(() => {
        fetchDynamicSimulationParameters(studyUuid)
            .then((paramsPlusMappings) => {
                // save all params to state
                setDynamicSimulationParams(paramsPlusMappings);
                // extract mappings configuration
                const mappings = paramsPlusMappings.mappings?.map((elem) => elem.name);
                setMappingNames(mappings ?? []);
                reset({ ...emptyFormData, [MAPPING]: paramsPlusMappings.mapping });
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'DynamicSimulationGetMappingError',
                });
            });
    }, [snackError, studyUuid, reset]);

    const handleClose = () => {
        onClose();
    };

    const handleStart = useCallback(
        (formData: MappingFormData) => {
            if (dynamicSimulationParams) {
                // save parameters before start computation
                const newDynamicSimulationParams: DynamicSimulationParametersInfos = {
                    ...dynamicSimulationParams,
                    mapping: formData[MAPPING],
                };
                updateDynamicSimulationParameters(studyUuid, newDynamicSimulationParams)
                    .then(() => {
                        // start computation
                        onStart(newDynamicSimulationParams);
                    })
                    .catch((error) => {
                        snackError({
                            messageTxt: error.message,
                            headerId: 'DynamicSimulationParametersChangeError',
                        });
                    });
            }
        },
        [studyUuid, onStart, snackError, dynamicSimulationParams]
    );

    const makeButton = (onClick: () => void, message: string, disabled: boolean) => {
        return (
            <Grid item>
                <Button onClick={onClick} variant="contained" disabled={disabled}>
                    <FormattedMessage id={message} />
                </Button>
            </Grid>
        );
    };

    const renderButtons = () => {
        return (
            <Grid container spacing={1} item justifyContent={'right'}>
                {makeButton(handleClose, 'close', false)}
                {makeButton(handleSubmit(handleStart), 'Execute', !isDirty)}
            </Grid>
        );
    };

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <Dialog open={open} onClose={handleClose} maxWidth={'sm'} fullWidth={true}>
                <DialogTitle>
                    <Typography component="span" variant="h5">
                        <FormattedMessage id="DynamicSimulationParametersSelection" />
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} direction="column" item xs={12} justifyContent={'center'} padding={1}>
                        <Grid container item>
                            <GridItem>{mappingNameField}</GridItem>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>{renderButtons()}</DialogActions>
            </Dialog>
        </CustomFormProvider>
    );
}
