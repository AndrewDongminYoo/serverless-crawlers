import { AnyNode } from 'domhandler';

export interface RocketResponse {
    meta:           Meta;
    data:           Template;
}

interface Meta {
    code: number;
}

interface Template {
    template:   HTMLString;
    title:      string;
    seo_url:    string;
}

export type HTMLString = string | Buffer | AnyNode | AnyNode[];

type ElementNode = HTMLElement | AnyNode;

type Name = 'a' | 'abbr' | 'address' | 'area' | 'article' | 'aside' | 'audio' | 'b' | 'base' | 'bdi' | 'bdo' | 'blockquote' | 'body' | 'br' | 'button' | 'canvas' | 'caption' | 'cite' | 'code' | 'col' | 'colgroup' | 'data' | 'datalist' | 'dd' | 'del' | 'details' | 'dfn' | 'dialog' | 'div' | 'dl' | 'dt' | 'em' | 'embed' | 'fieldset' | 'figcaption' | 'figure' | 'footer' | 'form' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'head' | 'header' | 'hgroup' | 'hr' | 'html' | 'i' | 'iframe' | 'img' | 'input' | 'ins' | 'kbd' | 'label' | 'legend' | 'li' | 'link' | 'main' | 'map' | 'mark' | 'menu' | 'meta' | 'meter' | 'nav' | 'noscript' | 'object' | 'ol' | 'optgroup' | 'option' | 'output' | 'p' | 'picture' | 'pre' | 'progress' | 'q' | 'rp' | 'rt' | 'ruby' | 's' | 'samp' | 'script' | 'section' | 'select' | 'slot' | 'small' | 'source' | 'span' | 'strong' | 'style' | 'sub' | 'summary' | 'sup' | 'table' | 'tbody' | 'td' | 'template' | 'textarea' | 'tfoot' | 'th' | 'thead' | 'time' | 'title' | 'tr' | 'track' | 'u' | 'ul' | 'var' | 'video' | 'wbr';

type ElType = 'root' | 'text' | 'directive' | 'comment' | 'script' | 'style' | 'tag' | 'cdata' | 'doctype';

interface HTMLElement {
    parent:             ElementNode;
    prev:               ElementNode;
    next:               ElementNode;
    firstChild:         ElementNode;
    children?:          ElementNode[];
    startIndex?:        null | number;
    endIndex?:          null | number;
    name:               Name;
    attribs:            Attribute;
    type:               ElType;
    namespace:          string;
    data?:              string;
}

type Attribute = {
    class:              string;
    [name: string]:     string | object;
};

export interface RocketJobDetail {
    아이디: string;
    사이트: string;
    회사명: string;
    채용중: number;
    좋아요: number;
    응답률: boolean;
    이미지: string[];
    채용: string[];
}
