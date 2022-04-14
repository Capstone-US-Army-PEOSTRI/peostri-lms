import { useState } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

import {
    Box,
    Button,
    Card,
    CardActions,
    CircularProgress
} from '@mui/material';
import { Notification, useTranslate, useLogin, useNotify, Form, TextInput, required } from 'react-admin';
import { lightTheme } from 'src/config/themes';


const PREFIX = 'LoginPage';

const classes = {
    main: `${PREFIX}-main`,
    card: `${PREFIX}-card`,
    logo: `${PREFIX}-logo`,
    form: `${PREFIX}-form`,
    input: `${PREFIX}-input`,
    actions: `${PREFIX}-actions`
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.main}`]: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'flex-start',
        background: 'url(/login-bg.jpg)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
    },

    [`& .${classes.card}`]: {
        minWidth: 300,
    },

    [`& .${classes.logo}`]: {
        display: "flex",
        maxWidth: "300px",
        margin: "1em .5em",
        justifyContent: "center",
        "& img": {
            maxWidth: "70%",
            display: "block"
        }
    },

    [`& .${classes.form}`]: {
        padding: '0 1em 1em 1em',
    },

    [`& .${classes.input}`]: {
        marginTop: '.5em'
    },

    [`& .${classes.actions}`]: {
        padding: '0 1em 1em 1em',
    }
}));

interface FormValues {
    username?: string;
    password?: string;
}

const Login = () => {
    const [loading, setLoading] = useState(false);
    const translate = useTranslate();

    const notify = useNotify();
    const login = useLogin();
    const location = useLocation();

    const handleSubmit = (auth: FormValues) => {
        setLoading(true);
        login(
            auth,
            location.state ? (location.state as any).nextPathname : '/'
        ).catch((error: Error) => {
            setLoading(false);
            notify(
                typeof error === 'string'
                    ? error
                    : typeof error === 'undefined' || !error.message
                    ? 'ra.auth.sign_in_error'
                    : error.message,
                {
                    type: 'warning',
                    messageArgs: {
                        _:
                            typeof error === 'string'
                                ? error
                                : error && error.message
                                ? error.message
                                : undefined,
                    },
                }
            );
        });
    };

    const validate = (values: FormValues) => {
        const errors: FormValues = {};
        if (!values.username) {
            errors.username = translate('ra.validation.required');
        }
        if (!values.password) {
            errors.password = translate('ra.validation.required');
        }
        return errors;
    };

    return (
        <Root>
            <Form onSubmit={handleSubmit} validate={validate}>
                <div className={classes.main}>
                    <Box display="flex" flexDirection="column" position="absolute" top="50%" style={{
                        transform: "translateY(-50%)",
                        gap: '1em'
                    }} >
                        <Card className={classes.card}>
                            <div className={classes.logo}>
                                <img src="/logo.png" alt="PEO STRI" />
                            </div>
                            <div className={classes.form}>
                                <div className={classes.input}>
                                    <TextInput
                                        autoFocus
                                        source="username"
                                        label={translate('ra.auth.username')}
                                        disabled={loading}
                                        validate={required()}
                                        fullWidth
                                    />  
                                </div>
                                <div className={classes.input}>
                                    <TextInput
                                        source="password"
                                        label={translate('ra.auth.password')}
                                        type="password"
                                        disabled={loading}
                                        validate={required()}
                                        fullWidth
                                    />
                                </div>
                            </div>
                            <CardActions className={classes.actions}>
                                <Button
                                    variant="contained"
                                    type="submit"
                                    color="primary"
                                    disabled={loading}
                                    fullWidth
                                >
                                    {loading && (
                                        <CircularProgress
                                            size={25}
                                            thickness={2}
                                        />
                                    )}
                                    {translate('ra.auth.sign_in')}
                                </Button>
                            </CardActions>
                        </Card>
                    </Box>
                    <Notification />
                </div>
            </Form>
        </Root>
    );
};

Login.propTypes = {
    authProvider: PropTypes.func,
    previousRoute: PropTypes.string,
};

export default Login;