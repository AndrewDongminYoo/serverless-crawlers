import { AxiosRequestConfig, AxiosResponse } from "axios";
import {
  Countries,
  JobSort,
  LocationFilter,
  WantedJobDetail,
  WantedResponse,
  Year,
} from "./wanted.types";
import { HTMLString, RocketResponse } from "./rocket.types";

export interface RocketParams {
  q?: string;
  job?: string;
  hiring_types?: string;
  location?: string;
  page?: string;
}

export interface WantedParams {
  country?: Countries["key"]; // 국가
  tag_type_ids?: number; // 태그 타입
  job_sort?: JobSort; // 정렬 순서
  locations?: LocationFilter["key"]; // 위치
  years?: Year; // 경력
  limit?: string; // 페이지네이션 리밋
  offset?: string; // 페이지네이션 오프셋
}

type Config = AxiosRequestConfig & {
  params: RocketParams | WantedParams;
};

export type Response<T extends string> = T extends "Wanted"
  ? AxiosResponse<WantedResponse, Config>
  : T extends "Rocket"
  ? AxiosResponse<RocketResponse, Config>
  : T extends "Detail"
  ? AxiosResponse<WantedJobDetail, Config>
  : T extends "HTML"
  ? AxiosResponse<HTMLString, Config>
  : AxiosResponse<unknown, Config>;
