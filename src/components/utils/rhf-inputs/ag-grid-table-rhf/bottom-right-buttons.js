import { Grid, Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { ArrowCircleDown, ArrowCircleUp, Upload } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/ControlPoint';
import DeleteIcon from '@mui/icons-material/Delete';
import CsvUploader from './csv-uploader/csv-uploader';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { styled } from '@mui/material/styles';
import ErrorInput from '../error-inputs/error-input';
import FieldErrorAlert from '../error-inputs/field-error-alert';

const InnerColoredButton = styled(IconButton)(({ theme, root }) => {
    return {
        color: theme.palette.primary.main,
        justifyContent: 'flex-end',
    };
});

const BottomRightButtons = ({
    name,
    disableUp,
    disableDown,
    disableDelete,
    handleAddRow,
    handleDeleteRows,
    handleMoveRowUp,
    handleMoveRowDown,
    useFieldArrayOutput,
    csvProps,
}) => {
    const [uploaderOpen, setUploaderOpen] = useState(false);
    const intl = useIntl();

    return (
        <>
            <Grid container item xs={12}>
                {csvProps && (
                    <InnerColoredButton onClick={() => setUploaderOpen(true)}>
                        <Tooltip
                            title={intl.formatMessage({
                                id: 'ImportCSV',
                            })}
                            placement="bottom"
                        >
                            <Upload />
                        </Tooltip>
                    </InnerColoredButton>
                )}
                <InnerColoredButton key={'addButton'} onClick={handleAddRow}>
                    <AddIcon />
                </InnerColoredButton>
                <InnerColoredButton
                    key={'DeleteButton'}
                    onClick={handleDeleteRows}
                    disabled={disableDelete}
                >
                    <DeleteIcon />
                </InnerColoredButton>
                <InnerColoredButton
                    key={'upButton'}
                    disabled={disableUp}
                    onClick={handleMoveRowUp}
                >
                    <ArrowCircleUp />
                </InnerColoredButton>
                <InnerColoredButton
                    key={'downButton'}
                    disabled={disableDown}
                    onClick={handleMoveRowDown}
                >
                    <ArrowCircleDown />
                </InnerColoredButton>
            </Grid>
            <Grid item xs={12}>
                <ErrorInput name={name} InputField={FieldErrorAlert} />
            </Grid>
            <CsvUploader
                open={uploaderOpen}
                onClose={() => setUploaderOpen(false)}
                name={name}
                useFieldArrayOutput={useFieldArrayOutput}
                {...csvProps}
            />
        </>
    );
};

export default BottomRightButtons;
