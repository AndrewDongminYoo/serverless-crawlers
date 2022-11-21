declare type noColor = "default";

export interface Pages {
    parent:         Parent;
    properties:     PageStats;
}

export type Parent = {
    database_id:    string;
} | {
    page_id:        string;
} | {
    block_id:       string;
} | {
    workspace:      true;
};

export type Platform = '원티드' | '로켓펀치';

export type SelectRequest = {
    id:         string;
    name?:      string;
    color?:     noColor | SelectColor;
} | null | {
    name:       string;
    id?:        string;
    color?:     noColor | SelectColor;
};

export type Annotations = {
    bold:           boolean;
    italic:         boolean;
    strikethrough:  boolean;
    underline:      boolean;
    code:           boolean;
    color:          noColor | AnnotationColor;
};


type PageProperties = {
    type?:          "title";
    title:          TextRichTextItem[];
} | {
    type?:          "rich_text";
    rich_text:      TextRichTextItem[];
} | {
    type?:          "number";
    number:         number | null;
} | {
    type?:          "url";
    url:            string | null;
} | {
    type?:          "select";
    select:         SelectRequest;
} | {
    type?:          "multi_select";
    multi_select:   SelectRequest[];
} | {
    type?:          "email";
    email:          string | null;
} | {
    type?:          "phone_number";
    phone_number:   string | null;
} | {
    type?:          "checkbox";
    checkbox:       boolean;
} | {
    type?:                  "files";
    files:                  ({
        type?:              "file";
        file: {
            url:            string;
            expiry_time?:   string;
        };
        name:               string;
                            } | {
        type?:              "external";
        external: {
            url:            string;
        };
        name:               string;
                            })[];
} | {
    type?:          "text";
    content:        string;
    link:           { url: string; } | null;
};

export declare type TextRichTextItem = {
    type?: "text";
    text: {
        content: string;
        link: {
            url: string;
        } | null;
    };
    annotations: Annotations;
    plain_text: string;
    href: string | null;
};

/** TypeScript Type Def Utils */

type Request<T> = Extract<PageProperties, { type?: T }>;

export type Removed<T, Drop = "remove"> = T extends object ? {
    [K in Exclude<keyof T, Drop>]: Removed<T[K], Drop>;
} : T;


export type ArrayElement<ArrayType extends readonly unknown[]> =
    ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

type Background<Color extends string> = `${Color}_background`;

/** TypeScript Type Def Utils */

export interface PageStats {
    분야:              NotionSelect;
    URL:              NotionURL;
    주요업무:           RichText;
    회사타입:           MultiSelect;
    회사위치:           RichText;
    우대사항:           RichText;
    기술스택:           MultiSelect;
    회사설명:           RichText;
    자격요건:           RichText;
    포지션:             RichText;
    좋아요:             Numeric;
    썸네일:             NotionFile;
    회사명:             RichText;
    응답률:             Numeric;
    아이디:             NotionTitle;
    혜택및복지:          RichText;
}

export type Prop =          keyof PageStats;

export type NotionURL =     Request<"url">;

export type RichText =      Request<"rich_text">;

export type MultiSelect =   Request<"multi_select">;

export type NotionSelect =  Request<"select">;

export type Numeric =       Request<"number">;

export type NotionTitle =   Request<"title">;

export type NotionFile =    Request<"files">;

export type NotionText =    Request<"text">;

export declare type SelectColor = "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";

export declare type AnnotationColor = noColor | SelectColor | Background<SelectColor>;