import { Button, Form, Input, InputNumber, message } from "antd";
import { CallService } from "../../api/call-service";
import { IOrder } from "../../common/interface/order.interface";

export interface Props {
  onSubmit: () => void;
  orderSampleData?: IOrder;
}

export const OrderForm = ({
  onSubmit: fatherOnSubmit,
  orderSampleData,
}: Props) => {
  const onFinish = async (value: IOrder) => {
    if (orderSampleData == null || orderSampleData === undefined) {
      await CallService.createOrder(value).catch((e) => {
        const messageText = e.response?.data?.error?.message || "";
        console.log(messageText);
        message.error(messageText);
      });
    } else {
      await CallService.updateOrder(orderSampleData._id, value).catch((e) => {
        const messageText = e.response?.data?.error?.message || "";
        console.log(messageText);
        message.error(messageText);
      });
    }
    fatherOnSubmit();
  };

  return (
    <Form
      id="orderForm"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      initialValues={orderSampleData}
      onFinish={onFinish}
    >
      <Form.Item label="Product" name="product" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Card Id" name="cardId" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Price" name="price" rules={[{ required: true }]}>
        <InputNumber />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};
