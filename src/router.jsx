import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import React from 'react';
import path from 'path';
import routes from '@/routerConfig';


const RouteItem = (props) => {
  const { redirect, path: routePath, component, key } = props;
  if (redirect) {
    return (
      <Redirect
        exact
        key={key}
        from={routePath}
        to={redirect}
      />
    );
  }
  return (
    <Route
      key={key}
      component={component}
      path={routePath}
    />
  );
};


const router = (isAuthed, authPath) => {
  return (
    <Router>
      <Switch>
        {routes.map((route, id) => {
          const { component: RouteComponent, children, ...others } = route;
          return (
            <Route
              key={id}
              {...others}
              component={(props) => {
                if (!children && !isAuthed && route.path !== authPath) {
                  return (
                    <Redirect key={id} from={route.path} to={authPath} />
                  );
                }

                if (!children) {
                  return (
                    <div>{RouteItem({ key: id, ...props, })}</div>
                  )
                }

                return (
                  <RouteComponent key={id} {...props}>
                    <Switch>
                      {children.map((routeChild, idx) => {
                        const { redirect, path: childPath, component } = routeChild;
                        const fullPath = path.join(route.path, childPath);
                        if (!isAuthed && fullPath !== authPath) {
                          return (
                            <Redirect key={id} from={fullPath} to={authPath} />
                          );
                        }
                        return RouteItem({
                          key: `${id}-${idx}`,
                          redirect,
                          path: childPath && path.join(route.path, childPath),
                          component,
                        });
                      })}
                    </Switch>
                  </RouteComponent>
                );
              }}
            />
          );
        })}
      </Switch>
    </Router>
  );
};

export default router;
