'use strict';
// Generated by https://quicktype.io

export interface Pages {
    parent: Parent;
    properties: PageStats;
};

export type Parent = {
    database_id: string;
} | {
    page_id: string;
} | {
    block_id: string;
} | {
    workspace: true;
};

export type Platform = '원티드' | '로켓펀치';

export interface PageStats {
    URL: { url: string | null };
    주요업무: { rich_text: RichText[] };
    회사타입: { multi_select: Select[] };
    회사위치: { rich_text: RichText[] };
    포지션: { rich_text: RichText[] };
    우대사항: { rich_text: RichText[] };
    좋아요: { number?: number };
    기술스택: { multi_select: Select[] };
    회사설명: { rich_text: RichText[] };
    썸네일: { files: File[] };
    혜택및복지: { rich_text: RichText[] };
    자격요건: { rich_text: RichText[] };
    회사명: { rich_text: RichText[] };
    분야: { select?: Select };
    응답률: { number?: number };
    아이디: { title: RichText[] };
};

export type File = ({
    name: string;
}) & ({
    file: {
        url: string;
        expiry_time: string;
    };
    type: "file";
} | {
    external: {
        url: string;
    };
    type: "external";
});

export interface Select {
    name: string;
};

export interface RichText {
    text: Text;
    annotations: Annotations;
    plain_text: string;
    href?: string;
};

export interface Annotations {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
};

export interface Text {
    content: string;
    link?: { url: string };
};

export interface 회사명 {
    type: "title";
    title: {
        type: "text";
        text: {
            content: string;
            link: {
                url: string;
            } | null;
        };
        annotations: Annotations;
        plain_text: string;
        href: string | null;
    }[];
    id: string;
};