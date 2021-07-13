
import React from "react";
import { Route, RouteProps } from "react-router-dom";

interface PropTypes extends RouteProps {
    component: React.ComponentType<any>;
}

/**
 * Public route component
 *
 * @param Component
 *  Component to be displayed
 * @param rest
 *  Props passed ins
 */
export const PublicRoute = ({
    component: Component,
    ...rest
}: PropTypes) => {
    return <Route {...rest} render={(props) => <Component {...props} />} />;
};
