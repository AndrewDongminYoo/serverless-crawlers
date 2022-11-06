import * as Notion from './notion.types'

export const list = (txt: string, separate: string|undefined) => {
    if (separate) {
        return String(txt).split(separate).map(t => t.trim())
    } else {
        return String(txt).split(/\n+/).map(t=>t.trim())
    }
}
export const toRichText = (content: string, href: string | null | undefined, color: string | null | undefined): Notion.RichText => {
    return {
        text: toText(content, href),
        annotations: toAnnotations(color),
        plain_text: content,
        href: href ?? null,
    }
}
export const richTextArray = (contents: string) => {
    return {
        rich_text: list(contents, undefined).map((txt)=>toRichText(txt, null, null))
    }
}
export const multiSelectArray = (contents: string[]) => {
    return {
        multi_select: contents.map((txt) => toSelect(txt))
    }
}
export const toSelect = (name: string): Notion.Select => {
    return { name: name.replace(/,+/, '') }
}
export const toAnnotations = (color: string | null | undefined): Notion.Annotations => {
    return {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: color ?? 'default',
    }
}
export const toText = (content: string, href: string | null | undefined): Notion.Text => {
    return {
        content,
        link: href ?? null,
    }
}
export const toTitle = (content: string): { title: Notion.RichText[] } => {
    return {
        title: [content].map((cnt)=>toRichText(cnt, null, null))
    }
}