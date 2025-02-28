import React from "react";
import * as Sentry from "@sentry/nextjs";
import Error from "next/error";

// eslint-disable-next-line react/prop-types
const CustomErrorComponent = (props) => <Error statusCode={props.statusCode}/>;

CustomErrorComponent.getInitialProps = async (contextData) => {
    // In case this is running in a serverless function, await this in order to give Sentry
    // Time to send the error before the lambda exits
    await Sentry.captureUnderscoreErrorException(contextData);

    // This will contain the status code of the response
    return Error.getInitialProps(contextData);
};

export default CustomErrorComponent;
