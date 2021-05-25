import React from "react";
import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";

export default function RouteFactory(routes) {
  const parentPath = useRouteMatch().path;
  return (
    <Switch>
      <Route exact={true} path={parentPath}>
        <Redirect to={parentPath + routes[0].path} />
      </Route>
      {routes.map(({ path, component: Component, exact }) => {
        const to = parentPath + path;
        return (
          <Route exact={exact} path={to} key={path}>
            <Component />
          </Route>
        );
      })}
      <Route path={parentPath + "*"} render={() => <h1>Invailed URL</h1>} />
    </Switch>
  );
}
