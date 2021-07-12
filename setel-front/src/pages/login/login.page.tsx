import { Button, Form, Input, message } from "antd";
import { useEffect } from "react";
import { useHistory } from "react-router";
import { useSetRecoilState } from "recoil";
import client from "../../api/client";
import { REFRESH_TOKEN_LOCAL } from "../../common/const/local-storage.const";
import { useLocalStorage } from "../../common/ultils/local-storage";
import { userState } from "../../states/userState";
import classes from "./login.module.css";

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};

interface LoginForm {
    usenrame: string;
    password: string;
}

const LoginPage = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [token, setToken] = useLocalStorage(REFRESH_TOKEN_LOCAL, null);
    const setUser = useSetRecoilState(userState);

    const getUser = () => {
        client.get("http://localhost:3025/users/my/profile").then((res) => {
            return res.data
        }).then((response) => {
            const user = response.data;
            setUser(user);
        }).catch((e) => {
            console.log(JSON.stringify(e.response));
            if (e.response && e.response.status === 401) {
                localStorage.clear();
            }
            history.push("/login");
        });
    }

    useEffect(() => {
        if (token) {
            getUser();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])

    const history = useHistory();

    const handleLoginForm = async (loginInfo: LoginForm) => {
        console.log("debug");
        await client.post(
            "http://localhost:3025/auth/login", loginInfo
        )
            .then((res) => {
                return res.data;
            }).then((response) => {
                message.success("Login ok !");
                const refreshToken = response.refreshToken
                setToken(refreshToken);
                history.push("/order-list");
            }).catch((e) => {
                message.error("Wrong username of password");
            });
    }

    return (
        <div className={classes.root}>
            <Form
                {...layout}
                name="basic"
                onFinish={handleLoginForm}
                className={classes.form}
            >
                <h2 className={classes.title}>Login</h2>
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[
                        {
                            required: true,
                            message: "Please input your username",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: "Please input your password!",
                        },
                    ]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default LoginPage;