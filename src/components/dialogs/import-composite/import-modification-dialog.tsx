/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage, useIntl } from 'react-intl';
import {
    CheckboxInput,
    CustomFormProvider,
    DirectoryItemSelector,
    DndColumn,
    DndColumnType,
    DndTable,
    ElementType,
    snackWithFallback,
    TreeViewFinderNodeProps,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { type CompositesToBeInserted, insertCompositeModifications } from '../../../services/study';
import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer.type';
import { CompositeModificationAction } from '../../graph/menus/network-modifications/network-modification-menu.type';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Step,
    StepLabel,
    Stepper,
    Typography,
} from '@mui/material';
import { useController, useFieldArray, UseFieldArrayReturn, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ACTION, IS_SHARED, SELECTED_MODIFICATIONS } from '../../utils/field-constants';
import * as yup from 'yup';
import { UUID } from 'node:crypto';
import InsertNameCell from './insert-name-cell';

/**
 * Dialog to select composite network modifications and append them to the current node.
 * Organised as a two-step stepper:
 *
 * - Step 1 — Selection: inline tree view to browse and pick one or more composites.
 * - Step 2 — Organisation: reorder selected items and choose insertion mode
 *   (SPLIT to expand individual modifications, INSERT to keep composites as-is with a required name).
 *
 * @param open    Whether the dialog is open.
 * @param onClose Callback invoked when the dialog is closed or cancelled.
 */
interface ImportModificationDialogProps {
    open: boolean;
    onClose: () => void;
}

interface SelectedComposite {
    id: UUID;
    name: string;
    originalName: string;
    isShared: boolean;
}

interface FormData {
    [ACTION]: CompositeModificationAction;
    [SELECTED_MODIFICATIONS]: SelectedComposite[];
}

const emptyFormData: FormData = {
    [ACTION]: CompositeModificationAction.SPLIT,
    [SELECTED_MODIFICATIONS]: [],
};

interface SharedCellProps {
    rowIndex: number;
}

function SharedCell({ rowIndex }: Readonly<SharedCellProps>) {
    return (
        <CheckboxInput name={`${SELECTED_MODIFICATIONS}.${rowIndex}.${IS_SHARED}`} label={'importComposites.shared'} />
    );
}

const formSchema = yup
    .object()
    .shape({
        [ACTION]: yup.mixed<CompositeModificationAction>().oneOf(Object.values(CompositeModificationAction)).required(),
        [SELECTED_MODIFICATIONS]: yup
            .array()
            .min(1)
            .when(ACTION, ([action], schema) => {
                if (action === CompositeModificationAction.INSERT) {
                    return schema.test('all-names-filled', 'FieldIsRequired', function (rows) {
                        for (const row of rows ?? []) {
                            if (!row.name?.trim()) {
                                return this.createError({
                                    path: `${SELECTED_MODIFICATIONS}`,
                                    message: 'FieldIsRequired',
                                });
                            }
                        }
                        return true;
                    });
                }
                return schema;
            })
            .required(),
    })
    .required() as yup.ObjectSchema<FormData>;

type FormSchemaType = yup.InferType<typeof formSchema>;

const STEP_SELECTION = 0;
const STEP_ORGANIZATION = 1;

const ImportModificationDialog = ({ open, onClose }: Readonly<ImportModificationDialogProps>): JSX.Element => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    const [activeStep, setActiveStep] = useState(STEP_SELECTION);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    // true = Next button disabled; starts disabled until TreeViewFinder signals a valid selection
    const [isNextDisabled, setIsNextDisabled] = useState(true);

    const formMethods = useForm<FormSchemaType>({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const {
        control,
        reset,
        watch,
        setValue,
        formState: { isValid },
    } = formMethods;

    const { field: actionField } = useController({ name: ACTION, control });

    const action: CompositeModificationAction = watch(ACTION);
    const selectedModifications: SelectedComposite[] = watch(SELECTED_MODIFICATIONS);
    const isInsertMode = action === CompositeModificationAction.INSERT;

    // useFieldArray — consumed by DndTable
    const useFieldArrayOutput = useFieldArray({
        control,
        name: SELECTED_MODIFICATIONS,
    }) as unknown as UseFieldArrayReturn;

    // Column definitions
    const sharedColumn: DndColumn = useMemo(
        () => ({
            label: '',
            dataKey: IS_SHARED,
            initialValue: false,
            editable: true,
            width: '25%',
            type: DndColumnType.CUSTOM,
            component: (rowIndex: number) => <SharedCell rowIndex={rowIndex} />,
        }),
        []
    );

    // SPLIT mode — name is read-only, drag-and-drop only, cannot be shared
    const splitColumnsDefinition: DndColumn[] = useMemo(
        () => [
            {
                label: '',
                dataKey: 'name',
                initialValue: '',
                editable: false,
                width: '75%',
                type: DndColumnType.TEXT,
            },
        ],
        []
    );

    // INSERT mode — name is editable with original name shown below
    const insertColumnsDefinition: DndColumn[] = useMemo(
        () => [
            {
                label: '',
                dataKey: 'name',
                initialValue: '',
                editable: true,
                width: '75%',
                type: DndColumnType.CUSTOM,
                component: (rowIndex: number) => <InsertNameCell rowIndex={rowIndex} />,
            },
            sharedColumn,
        ],
        [sharedColumn]
    );

    const columnsDefinition = isInsertMode ? insertColumnsDefinition : splitColumnsDefinition;

    useEffect(() => {
        if (open) {
            setActiveStep(STEP_SELECTION);
            setIsSelectorOpen(true);
            setIsNextDisabled(true); // reset on each open
        } else {
            setIsSelectorOpen(false);
            reset(emptyFormData);
        }
    }, [open, reset]);

    const handleInlineSelectionChange = useCallback(
        (selectedElements: TreeViewFinderNodeProps[]) => {
            const newRows: SelectedComposite[] = selectedElements.map((e) => ({
                id: e.id as UUID,
                name: e.name,
                originalName: e.name,
                [IS_SHARED]: false,
            }));
            setValue(SELECTED_MODIFICATIONS, newRows, {
                shouldValidate: true,
                shouldDirty: true,
            });
            setIsNextDisabled(selectedElements.length === 0);
        },
        [setValue]
    );

    const handleNext = useCallback(() => {
        if (isNextDisabled) return;
        setActiveStep(STEP_ORGANIZATION);
    }, [isNextDisabled]);

    const handlePrevious = useCallback(() => {
        setActiveStep(STEP_SELECTION);
        setIsSelectorOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        reset(emptyFormData);
        setActiveStep(STEP_SELECTION);
        setIsSelectorOpen(false);
        onClose();
    }, [reset, onClose]);

    const handleSave = useCallback(() => {
        if (!studyUuid || !currentNode || !isValid) return;

        const modificationsToInsert: CompositesToBeInserted[] = selectedModifications.map((m: SelectedComposite) => ({
            id: m.id,
            // only INSERTed non shared composites may be renamed
            name: action === CompositeModificationAction.SPLIT || m.isShared ? m.originalName : m.name,
            // SPLIT modifications are never shared
            isShared: action === CompositeModificationAction.INSERT ? m.isShared : false,
        }));

        insertCompositeModifications(studyUuid, currentNode.id, modificationsToInsert, action).catch((error) =>
            snackWithFallback(snackError, error, { headerId: 'importComposites.error' })
        );

        handleClose();
    }, [studyUuid, currentNode, isValid, formMethods, snackError, handleClose, selectedModifications, action]);

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    <FormattedMessage id="importComposites.title" />
                </DialogTitle>

                <DialogContent sx={{ display: 'flex', flexDirection: 'column', minHeight: 380 }}>
                    {/* ---- Stepper ---- */}
                    <Stepper
                        activeStep={activeStep}
                        alternativeLabel
                        sx={{
                            justifyContent: 'center',
                            '& .MuiStepConnector-root': { flex: '0 1 150px', minWidth: 0 },
                            '& .MuiStepConnector-line': { minWidth: 0 },
                        }}
                    >
                        <Step completed={activeStep > STEP_SELECTION}>
                            <StepLabel>
                                <FormattedMessage id="importComposites.step.selection" />
                            </StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>
                                <FormattedMessage id="importComposites.step.organization" />
                            </StepLabel>
                        </Step>
                    </Stepper>

                    <Divider sx={{ mt: 2 }} />

                    {/* ======================================================
                        STEP 1 — SELECTION
                        ====================================================== */}
                    {activeStep === STEP_SELECTION && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <DirectoryItemSelector
                                open={isSelectorOpen}
                                onClose={() => setIsSelectorOpen(false)}
                                types={[ElementType.MODIFICATION]}
                                multiSelect
                                inline
                                onSelectionChange={handleInlineSelectionChange}
                                title={intl.formatMessage({ id: 'ModificationsSelection' })}
                            />
                        </Box>
                    )}

                    {/* ======================================================
                        STEP 2 — ORGANIZATION & SHARING
                        ====================================================== */}
                    {activeStep === STEP_ORGANIZATION && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            {/* Radio group */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2">
                                    <FormattedMessage id="importComposites.organizationLabel" />
                                </Typography>
                                <FormControl>
                                    <RadioGroup row value={actionField.value} onChange={actionField.onChange}>
                                        <FormControlLabel
                                            value={CompositeModificationAction.SPLIT}
                                            control={<Radio />}
                                            label={<FormattedMessage id="importComposites.action.split" />}
                                        />
                                        <FormControlLabel
                                            value={CompositeModificationAction.INSERT}
                                            control={<Radio />}
                                            label={<FormattedMessage id="importComposites.action.insert" />}
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </Box>

                            <Typography variant="body2">
                                <FormattedMessage id="importComposites.selected" />
                            </Typography>

                            {/* DnD table — thead hidden, no column headers needed */}
                            <Box sx={{ '& thead': { display: 'none' } }}>
                                <DndTable
                                    name={SELECTED_MODIFICATIONS}
                                    useFieldArrayOutput={useFieldArrayOutput}
                                    columnsDefinition={columnsDefinition}
                                    tableHeight={270}
                                    withAddRowsDialog={false}
                                    disableAddingRows
                                    disabledDeletion
                                    showMoveArrow={false}
                                />
                            </Box>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                        {activeStep === STEP_ORGANIZATION && (
                            <Button onClick={handlePrevious}>
                                <FormattedMessage id="button.previous" />
                            </Button>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={handleClose}>
                            <FormattedMessage id="cancel" />
                        </Button>
                        {activeStep === STEP_SELECTION ? (
                            <Button variant="contained" onClick={handleNext} disabled={isNextDisabled}>
                                <FormattedMessage id="button.next" />
                            </Button>
                        ) : (
                            <Button variant="contained" onClick={handleSave} disabled={!isValid}>
                                <FormattedMessage id="validate" />
                            </Button>
                        )}
                    </Box>
                </DialogActions>
            </Dialog>
        </CustomFormProvider>
    );
};

export default ImportModificationDialog;
