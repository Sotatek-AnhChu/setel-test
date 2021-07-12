import React, { useEffect } from "react";


// Libs
import { Route, Switch } from "react-router-dom";
import OrderList from "../components/order-list/order-list";
import PrivateRoute from "../components/router/private.route";
import NotFound from "../pages/not-found";

// pages


// Route types


const PrivateRoutesController = () => {

    useEffect(() => {
        // mockData();
    }, []);


    return (
        <Switch>
            <PrivateRoute
                component={OrderList}
                path="/"
            />
            <Route component={NotFound} />
        </Switch>
    );
};

export default (PrivateRoutesController);
