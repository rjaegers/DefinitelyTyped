/// <reference types="node" />

import * as events from "events";
import { ConsumeMessage, GetMessage, Message, Options, Replies, ServerProperties } from "./properties";
export * from "./properties";

export interface Connection extends events.EventEmitter {
    serverProperties: ServerProperties;
    /**
     * Set by library when the connection closing has been kicked off
     */
    expectSocketClose: boolean;
    sentSinceLastCheck: boolean;
    recvSinceLastCheck: boolean;
    sendMessage(...args: unknown[]): unknown;
}

export interface ChannelModel extends events.EventEmitter {
    close(): Promise<void>;
    createChannel(): Promise<Channel>;
    createConfirmChannel(): Promise<ConfirmChannel>;
    connection: Connection;
    updateSecret(newSecret: Buffer, reason: string): Promise<void>;
}

export interface Channel extends events.EventEmitter {
    connection: Connection;

    close(): Promise<void>;

    assertQueue(queue: string, options?: Options.AssertQueue): Promise<Replies.AssertQueue>;
    checkQueue(queue: string): Promise<Replies.AssertQueue>;

    deleteQueue(queue: string, options?: Options.DeleteQueue): Promise<Replies.DeleteQueue>;
    purgeQueue(queue: string): Promise<Replies.PurgeQueue>;

    bindQueue(queue: string, source: string, pattern: string, args?: any): Promise<Replies.Empty>;
    unbindQueue(queue: string, source: string, pattern: string, args?: any): Promise<Replies.Empty>;

    assertExchange(
        exchange: string,
        type: "direct" | "topic" | "headers" | "fanout" | "match" | string,
        options?: Options.AssertExchange,
    ): Promise<Replies.AssertExchange>;
    checkExchange(exchange: string): Promise<Replies.Empty>;

    deleteExchange(exchange: string, options?: Options.DeleteExchange): Promise<Replies.Empty>;

    bindExchange(destination: string, source: string, pattern: string, args?: any): Promise<Replies.Empty>;
    unbindExchange(destination: string, source: string, pattern: string, args?: any): Promise<Replies.Empty>;

    publish(exchange: string, routingKey: string, content: Buffer, options?: Options.Publish): boolean;
    sendToQueue(queue: string, content: Buffer, options?: Options.Publish): boolean;

    consume(
        queue: string,
        onMessage: (msg: ConsumeMessage | null) => void,
        options?: Options.Consume,
    ): Promise<Replies.Consume>;

    cancel(consumerTag: string): Promise<Replies.Empty>;
    get(queue: string, options?: Options.Get): Promise<GetMessage | false>;

    ack(message: Message, allUpTo?: boolean): void;
    ackAll(): void;

    nack(message: Message, allUpTo?: boolean, requeue?: boolean): void;
    nackAll(requeue?: boolean): void;
    reject(message: Message, requeue?: boolean): void;

    prefetch(count: number, global?: boolean): Promise<Replies.Empty>;
    recover(): Promise<Replies.Empty>;
}

export interface ConfirmChannel extends Channel {
    publish(
        exchange: string,
        routingKey: string,
        content: Buffer,
        options?: Options.Publish,
        callback?: (err: any, ok: Replies.Empty) => void,
    ): boolean;
    sendToQueue(
        queue: string,
        content: Buffer,
        options?: Options.Publish,
        callback?: (err: any, ok: Replies.Empty) => void,
    ): boolean;

    waitForConfirms(): Promise<void>;
}

export const credentials: {
    amqplain(username: string, password: string): {
        mechanism: string;
        response(): Buffer;
        username: string;
        password: string;
    };
    external(): {
        mechanism: string;
        response(): Buffer;
    };
    plain(username: string, password: string): {
        mechanism: string;
        response(): Buffer;
        username: string;
        password: string;
    };
};

export function connect(url: string | Options.Connect, socketOptions?: any): Promise<ChannelModel>;
