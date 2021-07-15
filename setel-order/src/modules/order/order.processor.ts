import { OnQueueWaiting, Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { DoneCallback, Job } from "bull";
import { Model } from "mongoose";
import { EOrderStatus } from "src/config/constants";
import { PaymentWebhookService } from "../webhook/payment-webhook.service";
import { OrderDocument, ORDER_DB } from "./entities/order.entity";

export const CONFIRMED_EVENT_NAME = "Confirmed";

@Processor("ORDER_QUEUE")
export class OrderProcessor {
  constructor(
    @InjectModel(ORDER_DB)
    private readonly orderModel: Model<OrderDocument>,
    private readonly paymentWebhookService: PaymentWebhookService,
  ) {}

  private readonly logger: Logger = new Logger(OrderProcessor.name);

  @Process({
    name: CONFIRMED_EVENT_NAME,
    concurrency: 1,
  })
  async handleConfirmedEvent(job: Job<string>, done: DoneCallback) {
    const id: string = job.data;
    const order = await this.orderModel.findById(id).exec();
    this.logger.verbose("Processing: " + job.id);
    if (order === null || order === undefined) {
      done(null, "Has been deleted");
      return;
    }
    if (order.status == EOrderStatus.CANCELLED) {
      this.paymentWebhookService
        .makeRefundOrder(order)
        .then(() => {
          done(null, "Has been cancelled");
        })
        .catch((e) => {
          done(e);
        });
      return;
    }
    this.orderModel
      .findByIdAndUpdate(id, {
        status: EOrderStatus.DELIVERED,
      })
      .exec()
      .then(() => {
        done(null, "Success");
      })
      .catch((e) => {
        done(e);
        return;
      });
    done(null, "Suceess");
  }

  @OnQueueWaiting()
  async onOrderQueueWating(job: Job) {
    this.logger.verbose("wating " + JSON.stringify(job));
  }
}
