import { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { Countries, JobSort, Location, WantedJobDetail, WantedResponse, Year } from "./wanted.types";
import { HTMLString, RocketResponse } from './rocket.types';

type Method =
    | 'get' | 'GET'
    | 'delete' | 'DELETE'
    | 'head' | 'HEAD'
    | 'options' | 'OPTIONS'
    | 'post' | 'POST'
    | 'put' | 'PUT'
    | 'patch' | 'PATCH'
    | 'purge' | 'PURGE'
    | 'link' | 'LINK'
    | 'unlink' | 'UNLINK';

export type Params = {
    country?:            Countries["key"];  // 국가
    tag_type_ids?:       number;            // 태그 타입
    job_sort?:           JobSort            // 정렬 순서
    locations?:          Location["key"];   // 위치
    years?:              Year;              // 경력
    limit?:              string;            // 페이지네이션 리밋
    offset?:             string;            // 페이지네이션 오프셋
} | {
    q?:                  string;
    job?:                string;
    hiring_types?:       string;
    location?:           string;
    page?:               string;
}

interface Config {
    timeout:            number;
    headers:            Record<string, string>;
    baseURL:            string;
    url:                string;
    params:             Params;
    method:             Method;
}

export type Response<T extends string> =
    T extends "Wanted" ? AxiosResponse<WantedResponse, Config>
    : T extends "Rocket" ? AxiosResponse<RocketResponse, Config>
    : T extends "Detail" ? AxiosResponse<WantedJobDetail, Config>
    : T extends "HTML" ? AxiosResponse<HTMLString, Config>
    : AxiosResponse<unknown, Config>


export type CustomHeader = Partial<AxiosRequestHeaders> & {
    Accept:                         string;
    Referer:                        string;
    'Accept-Encoding':              string;
    'Accept-Language':              string;
    'Sec-Fetch-Dest':               string;
    'Sec-Fetch-Mode':               string;
    'Sec-Fetch-Site':               string;
    'Sec-Fetch-User'?:              string;
    'Sec-Ch-Ua':                    string;
    'Sec-Ch-Ua-Mobile':             string;
    'Sec-Ch-Ua-Platform':           string;
    'Cache-Control'?:               string;
    'Upgrade-Insecure-Requests'?:   string;
    'User-Agent':                   string;
    'Wanted-User-Agent'?:           string;
    'Wanted-User-Country'?:         string;
    'Wanted-User-Language'?:        string;
};