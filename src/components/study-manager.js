/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";

import {FormattedMessage} from "react-intl";

import Grid from '@material-ui/core/Grid';
import {makeStyles} from "@material-ui/core/styles";
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import {ReactComponent as PowsyblLogo} from '../images/powsybl_logo.svg';
import {ReactComponent as EntsoeLogo} from '../images/entsoe_logo.svg';
import {ReactComponent as UcteLogo} from '../images/ucte_logo.svg';
import {ReactComponent as IeeeLogo} from '../images/ieee_logo.svg';

import {loadStudiesSuccess} from '../redux/actions';
import {deleteStudy, fetchStudies} from '../utils/rest-api';
import CreateStudyForm from "./create-study-form";

import {CardHeader} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Collapse from "@material-ui/core/Collapse";
import CardActions from "@material-ui/core/CardActions";
import clsx from "clsx";
import withStyles from "@material-ui/core/styles/withStyles";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import DeleteIcon from '@material-ui/icons/Delete';
import Box from "@material-ui/core/Box";

const useStyles = makeStyles((theme) => ({
    card: {
        display: 'flex',
    },
    grid: {
        flexGrow: 1,
        paddingLeft: theme.spacing(2)
    },
    logo: {
        width: 64,
        height: 64,
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    actions: {
        padding: theme.spacing(0.5),
    },
    cardContainer: {
        marginTop:"48px",
    },
    addButtonBox: {
        borderStyle: 'dashed',
        borderRadius: 1,
        opacity:"0.3",
    },
    cardTitle: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        width: '11rem',
    },
}));

const StudyCard = ({study, onClick}) => {
    const [open, setOpen] = React.useState(false);
    const dispatch = useDispatch();
    const classes = useStyles();

    function logo(caseFormat) {
        switch (caseFormat) {
            case 'XIIDM':
                return <PowsyblLogo className={classes.logo}/>;
            case 'CGMES':
                return <EntsoeLogo className={classes.logo}/>;
            case 'UCTE':
                return <UcteLogo className={classes.logo}/>;
            case 'IEEE-CDF':
            case 'IEEE CDF': // for powsybl <= 3.1 compatibility
                return <IeeeLogo className={classes.logo}/>;
            default:
                break;
        }
    }

    const StyledMenu = withStyles({
        paper: {
            border: '1px solid #d3d4d5',
        },
    })(props => (
        <Menu
            elevation={0}
            getContentAnchorEl={null}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            {...props}
        />
    ));

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDeleteStudy = () => {
        setAnchorEl(null);
        setOpen(true);
    };

    const handleDeleteStudyConfirmed = () => {
        deleteStudy(study.studyName).then(() => {
            fetchStudies().then(studies => {
                dispatch(loadStudiesSuccess(studies));
            });
        });
    };

    const handleCloseDialog = () => {
        setOpen(false);
    };

    const handleCancelDelete = () => {
        setOpen(false);
    };

    const [expanded, setExpanded] = React.useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <div>
            <Card className={classes.root}>
                <CardActionArea onClick={() => onClick()} className={classes.card}>
                    <CardHeader
                        avatar={
                                logo(study.caseFormat)
                        }
                        title={
                            <div className={classes.cardTitle}>
                                <Typography noWrap variant="h4">
                                    {study.studyName}
                                </Typography>
                            </div>
                        }
                        subheader={
                            study.caseDate
                        }
                    />
                </CardActionArea>
                <CardActions className={classes.actions}>
                    <IconButton
                        className={clsx(classes.expand, {
                            [classes.expandOpen]: expanded,
                        })}
                        onClick={handleExpandClick}
                        aria-expanded={expanded}
                        aria-label="show more"
                    >
                        <ExpandMoreIcon />
                    </IconButton>
                    <IconButton aria-label="settings"
                                aria-controls="case-menu"
                                aria-haspopup="true"
                                variant="contained"
                                onClick={handleClick}
                    >
                        <MoreVertIcon />
                    </IconButton>
                    <StyledMenu
                        id="case-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={handleDeleteStudy}>
                            <ListItemIcon>
                                <DeleteIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={<FormattedMessage id="delete"/>} />
                        </MenuItem>
                    </StyledMenu>
                </CardActions>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent>
                        <Typography variant="button" >
                            <FormattedMessage id="studyName" />
                        </Typography>
                        <Typography variant="body2" paragraph>
                            {study.studyName}
                        </Typography>
                        <Typography variant="button">
                            <FormattedMessage id="studyDescription" />
                        </Typography>
                        <Typography variant="body2" paragraph>
                            {study.description?study.description:"—"}
                        </Typography>
                    </CardContent>
                </Collapse>
            </Card>
            <Dialog open={open} onClose={handleCloseDialog} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title"><FormattedMessage id="deleteStudy"/></DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <FormattedMessage id="deleteStudyMsg"/>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="primary">
                        <FormattedMessage id="cancel"/>
                    </Button>
                    <Button onClick={handleDeleteStudyConfirmed} color="primary">
                        <FormattedMessage id="delete"/>
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

const StudyManager = ({onStudyClick}) => {
    const dispatch = useDispatch();

    useEffect(() => {
        fetchStudies()
            .then(studies => {
                dispatch(loadStudiesSuccess(studies));
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const studies = useSelector(state => state.studies);

    const classes = useStyles();

    return (
        <Container maxWidth="lg" className={classes.cardContainer}>
            <Grid container spacing={2} className={classes.grid}>
                <Grid item xs={12} sm={6} md={3} align="center" justify="center">
                    <Box className={classes.addButtonBox}>
                        <CreateStudyForm />
                    </Box>
                </Grid>
                {
                    studies.map(study =>
                        <Grid item xs={12} sm={6} md={3} key={study.studyName}>
                            <StudyCard study={study} onClick={() => onStudyClick(study.studyName)} />
                        </Grid>
                    )
                }
            </Grid>
        </Container>
    );
};

export default StudyManager;
