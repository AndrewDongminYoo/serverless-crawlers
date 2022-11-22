import { Countries, Location } from "./wanted.filters";

export interface WantedResponse {
    links:                      Links;
    data:                       Job[];
    is_callable_external_job:   boolean;
    is_score:                   boolean;
}

interface Links {
    prev:       string;
    next:       string;
}

export interface Job {
    status:          Status;
    company:         Company;
    title_img:       Img;
    logo_img:        Img;
    compare_country: boolean;
    due_time:        string;
    like_count:      number;
    id:              number;
    address:         AddressSimple;
    category_tags:   CategoryTag[];
}

interface AddressSimple {
    country:        Countries["display"];
    location:       Location["display"];
}

interface CategoryTag {
    parent_id:      number;
    id:             number;
}

interface Company {
    id:                         number;
    industry_name:              string;
    application_response_stats: ApplicationResponseStats;
    name:                       string;
}

interface ApplicationResponseStats {
    avg_rate:       number;
    level:          "very_high";
    delayed_count:  number;
    avg_day?:       number;
    remained_count: number;
    type:           "applied_reply_done";
}

interface Img {
    origin:         string;
    thumb:          string;
}

export enum Status {
    Active = "active",
}

export interface WantedJob {
    job:        DescribeJob;
}

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
}

interface Address {
    country:            string;
    full_location:      string;
    geo_location:       GeoLocation;
    location:           string;
    country_code:       string;
}

interface GeoLocation {
    n_location:         NLocation;
    location:           AddressDetail;
    location_type:      string;
    bounds:             null;
}

interface AddressDetail {
    lat:            number;
    lng:            number;
}

interface NLocation {
    lat:            number;
    lng:            number;
    address:        string;
}

interface CompanyImage {
    url:            string;
    id:             number;
}

interface Tag {
    title:          string;
    id:             number;
    kind_title:     string;
}

interface Detail {
    requirements:           string;
    main_tasks:             string;
    intro:                  string;
    benefits:               string;
    preferred_points:       string;
}