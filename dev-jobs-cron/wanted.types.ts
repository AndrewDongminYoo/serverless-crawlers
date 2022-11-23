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

interface Job {
    status:          "active";
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

export interface WantedJobDetail {
    job:        DescribeJob;
}

interface DescribeJob {
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

export type Position =
    "개발 전체" |
    ".NET 개발자" | "BI 엔지니어" | "C,C++ 개발자" |
    "CIO,Chief Information Officer" |
    "CTO,Chief Technology Officer" |
    "DBA" | "DevOps / 시스템 관리자" | "ERP전문가" |
    "Node.js 개발자" | "PHP 개발자" |
    "QA,테스트 엔지니어" | "VR 엔지니어" |
    "iOS 개발자" |
    "개발 매니저" |
    "그래픽스 엔지니어" |
    "기술지원" |
    "데이터 사이언티스트" |
    "데이터 엔지니어" |
    "루비온레일즈 개발자" |
    "머신러닝 엔지니어" |
    "보안 엔지니어" |
    "블록체인 플랫폼 엔지니어" |
    "빅데이터 엔지니어" |
    "서버 개발자" |
    "소프트웨어 엔지니어" |
    "시스템,네트워크 관리자" |
    "안드로이드 개발자" |
    "영상,음성 엔지니어" |
    "웹 개발자" |
    "웹 퍼블리셔" |
    "임베디드 개발자" |
    "자바 개발자" |
    "크로스플랫폼 앱 개발자" |
    "파이썬 개발자" |
    "프로덕트 매니저" |
    "프론트엔드 개발자" |
    "하드웨어 엔지니어";

export type Language =
    "AWS" | "Android" |
    "C / C++" | "C++" |
    "Docker" | "Git" |
    "Github" | "HTML" |
    "JPA" | "JavaScript" |
    "Kotlin" | "Linux" |
    "MySQL" | "PHP" |
    "Python" | "React" |
    "SQL" | "Spring Framework" |
    "Swift" | "iOS";

export interface Filters {
    job_sort: Record<string, JobSort>;
    company_tags: CompanyTag[];
    employee_count: Tags[];
    years: Record<Year, string>
    countries: Countries[];
    sub_tags?: Tags[];
    languages: Record<Language, number>;
    positions: Record<Position, number>;
}

export interface Tags {
    key: string;
    display: string;
}

export type CompanyTag = Tags & {
    sub_tags: Tags[];
}

export type Location = Tags & {
    districts?: Location[];
}

export type Countries = {
    key: "all" | "kr" | "tw" | "sg" | "jp" | "others"
    display: "전세계" | "한국" | "대만" | "싱가폴" | "일본" | "기타"
    locations: Location[];
}

export type JobSort = "company.response_rate_order" | "job.latest_order" | "job.compensation_order" | "job.popularity_order";

const TEN = ['-1', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const

export type Year = typeof TEN[number]
