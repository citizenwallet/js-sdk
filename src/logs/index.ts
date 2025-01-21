import type { CommunityConfig } from "../index";
import { keccak256, toUtf8Bytes } from "ethers";
import { ERC20TransferLogData } from "./transfer";
import { MessageExtraData } from "./extra";

export interface Log<D = LogData, E = unknown> {
  hash: string;
  tx_hash: string;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  nonce: number;
  sender: string;
  to: string;
  value: string; // BigInt as string
  data: D | null; // Assuming this could be any JSON object or null
  extra_data: E | null; // Assuming this could be any JSON object or null
  status: LogStatus;
}

export type ERC20TransferLog = Log<
  ERC20TransferLogData,
  MessageExtraData | null
>;

// Enum for LogStatus
export enum LogStatus {
  Unknown = "",
  Sending = "sending",
  Pending = "pending",
  Success = "success",
  Fail = "fail",
}

export interface ResponsePaginationMetadata {
  limit: number;
  offset: number;
  total: number;
}

export interface ObjectResponse<T, M> {
  object: T;
  meta: M;
}

export interface ArrayResponse<T, M> {
  array: T[];
  meta: M;
}

export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface LogData {
  [key: string]: string;
}

export interface LogQueryParams {
  maxDate: string;
  data?: LogData;
  orData?: LogData;
}

export interface NewLogQueryParams {
  fromDate: string;
  data?: LogData;
  orData?: LogData;
}

export function logDataToQueryString(
  data: LogData,
  prefix: string = "data"
): string {
  return Object.entries(data)
    .map(([key, value]) => `&${prefix}.${key}=${encodeURIComponent(value)}`)
    .join("");
}

export class LogsService<D = LogData, E = unknown> {
  private url: string;

  constructor(config: CommunityConfig) {
    const network = config.primaryNetwork;

    this.url = `${network.node.url}/v1/logs`;
  }

  async getLog(
    tokenAddress: string,
    hash: string
  ): Promise<ObjectResponse<Log<D, E>, undefined>> {
    const url = `${this.url}/${tokenAddress}/tx/${hash}`;

    const resp = await fetch(url);
    return resp.json();
  }

  async getLogs(
    tokenAddress: string,
    topic: string,
    params?: PaginationParams & LogQueryParams
  ): Promise<ArrayResponse<Log<D, E>, ResponsePaginationMetadata>> {
    let url = `${this.url}/${tokenAddress}/${topic}`;

    if (params) {
      url += `?limit=${params.limit}&offset=${params.offset}`;

      if (params.maxDate) {
        url += `&maxDate=${params.maxDate}`;
      }

      if (params.data) {
        url += logDataToQueryString(params.data);
      }

      if (params.orData) {
        url += logDataToQueryString(params.orData, "data2");
      }
    }

    const resp = await fetch(url);
    return resp.json();
  }

  async getAllLogs(
    tokenAddress: string,
    topic: string,
    params?: PaginationParams & LogQueryParams
  ): Promise<ArrayResponse<Log<D, E>, ResponsePaginationMetadata>> {
    let url = `${this.url}/${tokenAddress}/${topic}/all`;

    if (params) {
      url += `?limit=${params.limit}&offset=${params.offset}`;

      if (params.maxDate) {
        url += `&maxDate=${params.maxDate}`;
      }
    }

    const resp = await fetch(url);
    return resp.json();
  }

  async getNewLogs(
    tokenAddress: string,
    topic: string,
    params?: PaginationParams & NewLogQueryParams
  ): Promise<ArrayResponse<Log<D, E>, ResponsePaginationMetadata>> {
    let url = `${this.url}/${tokenAddress}/${topic}/new`;

    if (params) {
      url += `?limit=${params.limit}&offset=${params.offset}`;

      if (params.fromDate) {
        url += `&fromDate=${params.fromDate}`;
      }

      if (params.data) {
        url += logDataToQueryString(params.data);
      }

      if (params.orData) {
        url += logDataToQueryString(params.orData, "data2");
      }
    }

    const resp = await fetch(url);
    return resp.json();
  }

  async getAllNewLogs(
    tokenAddress: string,
    topic: string,
    params?: PaginationParams & NewLogQueryParams
  ): Promise<ArrayResponse<Log<D, E>, ResponsePaginationMetadata>> {
    let url = `${this.url}/${tokenAddress}/${topic}/new/all`;

    if (params) {
      url += `?limit=${params.limit}&offset=${params.offset}`;

      if (params.fromDate) {
        url += `&fromDate=${params.fromDate}`;
      }
    }

    const resp = await fetch(url);
    return resp.json();
  }
}
