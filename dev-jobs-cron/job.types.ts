export interface Job {
    status:          string;
    reward:          Reward;
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
}

export interface AddressSimple {
    country:  Country;
    location: Location;
}

export enum Country {
    한국 = "한국",
}

export enum Location {
    서울 = "서울",
}

export interface CategoryTag {
    parent_id: number;
    id:        number;
}

export interface Company {
    id:                         number;
    industry_name:              string;
    application_response_stats: ApplicationResponseStats;
    name:                       string;
}

export interface ApplicationResponseStats {
    avg_rate:       number;
    level:          Level;
    delayed_count:  number;
    avg_day:        number | null;
    remained_count: number;
    type:           Type;
}

export enum Level {
    VeryHigh = "very_high",
}

export enum Type {
    AppliedReplyDone = "applied_reply_done",
}

export interface Img {
    origin: string;
    thumb:  string;
}

export interface Reward {
    formatted_total:       FormattedTotal;
    formatted_recommender: FormattedRecommend;
    formatted_recommendee: FormattedRecommend;
}

export enum FormattedRecommend {
    The500000원 = "500,000원",
}

export enum FormattedTotal {
    The1000000원 = "1,000,000원",
}

export enum Status {
    Active = "active",
}

export interface Links {
    prev: string;
    next: string;
}
