export interface Job {
    status:          string;
    reward:          Reward;
    is_like:         boolean;
    is_bookmark:     boolean;
    company:         Company;
    title_img:       Img;
    compare_country: boolean;
    due_time:        string;
    like_count:      number;
    id:              number;
    logo_img:        Img;
    address:         Address;
    matching_score:  null;
    position:        string;
    score:           null;
    category_tags:   CategoryTag[];
}

export interface Address {
    country:  string;
    location: string;
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
    level:          string;
    delayed_count:  number;
    avg_day:        number;
    remained_count: number;
    type:           string;
}

export interface Img {
    origin: string;
    thumb:  string;
}

export interface Reward {
    formatted_total:       string;
    formatted_recommender: string;
    formatted_recommendee: string;
}

