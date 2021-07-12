
import { AxiosRequestConfig } from "axios";
import { CANCEL_ORDER_ENDPOINT, CREATE_ORDER_ENDPOINT, GET_MY_ORDER_ENDPOINT, GET_PROFILE_ENDPOINT, UPDATE_ORDER_ENDPOINT } from "../common/const/end-point.const";
import { IOrder } from "../common/interface/order.interface";
import client from "./client"

export class CallService {
    static getProfile(): Promise<any> {
        return  client.get(GET_PROFILE_ENDPOINT).then((res) => {
            return res.data
        });
    }

    static createOrder(order: IOrder): Promise<any> {
        return client.post(CREATE_ORDER_ENDPOINT, order);
    }

    static updateOrder(orderId: string, update: IOrder): Promise<any> {
        return client.put(`${UPDATE_ORDER_ENDPOINT}/${orderId}`, update);
    }

    static getMyOrder(options: AxiosRequestConfig): Promise<any> {
        return  client.get(GET_MY_ORDER_ENDPOINT, options);
    }

    static cancelOrder(orderId: string): Promise<any> {
        return  client.put(`${CANCEL_ORDER_ENDPOINT}/${orderId}`);
    }
}