import { Modal, Table, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { Edit3, XCircle } from "react-feather";
import { CallService } from "../../api/call-service";
import { IOrder } from "../../common/interface/order.interface";
import { OrderForm } from "../order-form/order-form";
import defaultClasses from "./order-list.module.css";

export interface Props {
  classes?: any;
}

export const OrderList = ({ classes: propsClasses }: Props) => {
  const classes = Object.assign(defaultClasses, propsClasses);

  const [data, setData] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [orderSampleData, setOrderSampleData] = useState({} as IOrder | null);
  const columns = [
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Product",
      dataIndex: "product",
    },
    {
      title: "Card Id",
      dataIndex: "cardId",
    },
    {
      title: "Price",
      dataIndex: "price",
    },
    {
      title: "Action",
      render: (text: any, record: any) => {
        return (
          <div>
            <button
              className={classes.btn}
              onClick={() => showEditOrder(record)}
            >
              <Tooltip placement="top" title="Edit">
                <Edit3 />
              </Tooltip>
            </button>

            <button className={classes.btn} onClick={() => cancelOrder(record)}>
              <Tooltip placement="top" title="Cancel">
                <XCircle />
              </Tooltip>
            </button>
          </div>
        );
      },
    },
  ];
  const fetchData = async () => {
    await CallService.getMyOrder({
      params: {
        sort: "createdAt",
      },
    })
      .then((res) => {
        return res.data;
      })
      .then((orderList) => {
        setData(orderList.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const showNewOrder = () => {
    setOrderSampleData(null);
    setShowNew(true);
  };

  const onNewOrderSubmit = () => {
    fetchData();
    setShowNew(false);
  };

  const showEditOrder = (order: IOrder) => {
    setOrderSampleData(order);
    setShowEdit(true);
  };

  const onEditOrderSubmit = () => {
    fetchData();
    setShowEdit(false);
  };

  const cancelOrder = (order: IOrder) => {
    CallService.cancelOrder(order._id).then(() => {
      fetchData();
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {showEdit && (
        <Modal
          title="Edit order"
          visible={showEdit}
          footer={null}
          onCancel={() => {
            setShowEdit(false);
          }}
        >
          <OrderForm
            key={Math.random()}
            onSubmit={onEditOrderSubmit}
            orderSampleData={orderSampleData as any}
          />
        </Modal>
      )}
      {showNew && (
        <Modal
          title="Add Order"
          visible={showNew}
          footer={null}
          onCancel={() => {
            setShowNew(false);
          }}
        >
          <OrderForm onSubmit={onNewOrderSubmit} />
        </Modal>
      )}
      <header className={classes.header}>
        <button onClick={showNewOrder}>Add new</button>
        <button onClick={fetchData}>Refresh Item</button>
      </header>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};
