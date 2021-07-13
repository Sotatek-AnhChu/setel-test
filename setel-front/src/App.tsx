import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { CallService } from './api/call-service';
import './App.css';
import { REFRESH_TOKEN_COOKIES } from './common/const/cookies.const';
import { OrderList } from './components/order-list/order-list';
import { PrivateRoute } from './components/router/private.route';
import { PublicRoute } from './components/router/public.router';
import { LoginPage } from './pages/login/login.page';
import { NotFound } from './pages/not-found';
import { userState } from './states/userState';
require("./common/const/end-point.const")
const App = () => {
  const history = useHistory();
  const [user, setUser] = useRecoilState(userState);
  const [loading, setLoading]  = useState(true);
  useEffect(() => {
    const token =  Cookies.get(REFRESH_TOKEN_COOKIES);
    if (token === undefined || token == null) {
      history.push("/login");
    }
    CallService.getProfile()
      .then((response) => {
        const user = response.data;
        setUser(user);
        setLoading(false);
    }).catch((e) => {
      if (e.response && e.response.status === 401) {
        Cookies.remove(REFRESH_TOKEN_COOKIES)
      }
      setLoading(false);
      history.push("/login");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return <div> Loading </div>
  }

  if(user){
      return (
        <Switch>
            <PrivateRoute
                component={OrderList}
                path="/"
            />
            <Route component={NotFound} />
        </Switch>
    );
  }

  return (
    <Switch>
      <PublicRoute component={LoginPage} path="/login" />
      <Route component={NotFound} />
    </Switch>
  )
}

export default App;
