import { Button, Form, Input, InputNumber, message } from "antd";
import { CallService } from "../../api/call-service";
import { IOrder } from "../../common/interface/order.interface";


export interface Props {
    onSubmit: () => any,
    orderSampleData?: IOrder,
}

export const OrderForm = ({
    onSubmit: fatherOnSubmit,
    orderSampleData
}: Props) => {
    const onFinish = async (value: IOrder) => {
        if ((orderSampleData == null || orderSampleData === undefined)) {
            await CallService.createOrder(value)
                .catch((e) => {
                    console.log(e.response);
                    message.error(e?.response?.data?.error?.message);
                });
        } else {
            await CallService.updateOrder(orderSampleData._id, value)
            .catch((e) => {
                console.log(e.response);
                message.error(e.response?.data?.error?.message);
            })
        }
        fatherOnSubmit();
    }

    return (
        <Form
            id="orderForm"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={orderSampleData}
            onFinish={onFinish}
        >
            <Form.Item
                label="Product"
                name="product"
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Card Id"
                name="cardId">
                <Input />
            </Form.Item>
            <Form.Item
                label="Price"
                name="price">
                <InputNumber />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>
        </Form>
    )
}