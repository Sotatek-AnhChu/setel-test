import { Logger } from "@nestjs/common";
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    private server: Server = null;
    private readonly logger: Logger = new Logger("AppGateway");
    // Join client vào room có id = idUser của client theo key = "join" do client gửi lên
    @SubscribeMessage("join")
    async joinRoom(client: Socket, room: string): Promise<void> {
        this.logger.verbose(`Connected client UserId: ${room}`);
        client.join(room);
    }

    afterInit(server: Server) {
        this.logger.log("Initialized");
    }

    handleDisconnect(client: Socket) {
        this.logger.verbose(`Client disconnected: ${client.id}`);
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.verbose(`Client connected: ${client.id}`);
    }

    getServer() {
        return this.server;
    }
}
