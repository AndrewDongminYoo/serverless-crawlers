'use strict';
export interface WantedResponse {
    links:                      Links;
    data:                       Job[];
    is_callable_external_job:   boolean;
    is_score:                   boolean;
};

export interface Links {
    prev:       string;
    next:       string;
};

export interface Job {
    status:          string;
    company:         Company;
    title_img:       Img;
    compare_country: boolean;
    due_time:        string;
    like_count:      number;
    id:              number;
    logo_img:        Img;
    address:         AddressSimple;
    matching_score:  null;
    position:        string;
    score:           null;
    category_tags:   CategoryTag[];
};

export interface AddressSimple {
    country:        Country;
    location:       Location;
};

export enum Country {
    한국 = "한국",
};

export enum Location {
    서울 = "서울",
};

export interface CategoryTag {
    parent_id:  number;
    id:         number;
};

export interface Company {
    id:                         number;
    industry_name:              string;
    application_response_stats: ApplicationResponseStats;
    name:                       string;
};

export interface ApplicationResponseStats {
    avg_rate:       number;
    level:          Level;
    delayed_count:  number;
    avg_day?:       number;
    remained_count: number;
    type:           Type;
};

export enum Level {
    VeryHigh = "very_high",
};

export enum Type {
    AppliedReplyDone = "applied_reply_done",
};

export interface Img {
    origin:         string;
    thumb:          string;
};

export enum Status {
    Active = "active",
};

export interface Links {
    prev:       string;
    next:       string;
};

export interface JobDetail {
    job:        DescribeJob;
};

export interface DescribeJob {
    address:                Address;
    like_count:             number;
    id:                     number;
    detail:                 Detail;
    company_images:         CompanyImage[];
    skill_tags:             Tag[];
    status:                 string;
    company:                Company;
    logo_img:               Img;
    company_tags:           Tag[];
    title_img:              Img;
    position:               string;
    category_tags:          CategoryTag[];
};

export interface Address {
    country:            string;
    full_location:      string;
    geo_location:       GeoLocation;
    location:           string;
    country_code:       string;
};

export interface GeoLocation {
    n_location:         NLocation;
    location:           AddressDetail;
    location_type:      string;
    bounds:             null;
};

export interface AddressDetail {
    lat:            number;
    lng:            number;
};

export interface NLocation {
    lat:            number;
    lng:            number;
    address:        string;
};

export interface CompanyImage {
    url:            string;
    id:             number;
};

export interface Tag {
    title:          string;
    id:             number;
    kind_title:     string;
};

export interface Detail {
    requirements:           string;
    main_tasks:             string;
    intro:                  string;
    benefits:               string;
    preferred_points:       string;
};