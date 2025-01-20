import { Box, Button, Grid, Typography } from '@mui/material';
import { CASE_NAME } from 'components/utils/field-constants';
import ReadOnlyInput from 'components/utils/rhf-inputs/read-only/read-only-input';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ImportCaseDialog from '../import-case-dialog';
import { TreeViewFinderNodeProps } from '@gridsuite/commons-ui';
import { useWatch } from 'react-hook-form';

interface RootNetworkCaseSelectionProps {
    onSelectCase: (selectedCase: TreeViewFinderNodeProps) => void;
}

export const RootNetworkCaseSelection = ({ onSelectCase }: RootNetworkCaseSelectionProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const caseNameWatch = useWatch({ name: CASE_NAME });

    const handleSelectCase = (selectedCase: TreeViewFinderNodeProps) => {
        onSelectCase(selectedCase);
        setIsDialogOpen(false);
    };

    return (
        <>
            <Grid container item>
                <Grid item>
                    <Button onClick={() => setIsDialogOpen(true)} variant="contained" size={'small'}>
                        {caseNameWatch ? (
                            <FormattedMessage id={'ModifyFromMenu'} />
                        ) : (
                            <FormattedMessage id={'ChooseCase'} />
                        )}
                    </Button>
                </Grid>
                <Typography m={1} component="span">
                    <Box fontWeight={'fontWeightBold'}>
                        <ReadOnlyInput name={CASE_NAME} />
                    </Box>
                </Typography>
            </Grid>
            <ImportCaseDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSelectCase={handleSelectCase}
            />
        </>
    );
};
