import { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { Countries, JobSort, Year } from "./wanted.filters";
import { WantedResponse } from "./wanted.types";

export type Response = AxiosResponse | AxiosResponse & {
    headers:            Headers;
    config:             Config;
    data:               WantedResponse;
};

export interface Config {
    timeout:                    number;
    headers:                    Record<string, string>;
    baseURL:                    string;
    url:                        string;
    params:                     Params;
    method:                     string;
}

export interface Params {
    country?:            Countries["key"]; // 국가
    tag_type_ids?:       number; // 태그 타입
    job_sort?:           JobSort // 정렬 순서
    locations?:          string; // 위치
    years?:              Year; // 경력
    limit?:              string; // 페이지네이션 리밋
    offset?:             string; // 페이지네이션 오프셋
    q?:                  string;
    job?:                string;
    hiring_types?:       string;
    location?:           string;
    page?:               string;
}

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