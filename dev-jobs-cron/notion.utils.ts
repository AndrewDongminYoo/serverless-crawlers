'use strict'
import * as Notion from './notion.types'
import { URL } from 'url'
import fs from 'fs'
import { axios } from './rocket.main'
import { AxiosError } from 'axios'

export const removeCom = (str: string) => str.replace(',', ' ').replace('/', ' ').replace(/\s{2,}/, ' ').trim()

export const removeComma = (str: string[]) => {
    const newArray: string[] = [];
    str.forEach((value: string) => {
        if (!value.includes('(') && !value.includes(')')) {
            if (value.includes(',')) {
                value.split(',').forEach((v) => v && newArray.push(v.trim()))
            } else if (value.includes('/')) {
                value.split('/').forEach((v) => v && newArray.push(v.trim()))
            } else {
                value && newArray.push(removeCom(value))
            }
        }
    })
    return newArray
}

export const removeQuery = (urlString: string): URL["href"] => {
    const preUrl = new URL(urlString)
    const curUrl = new URL(preUrl.pathname, preUrl.origin)
    return decodeURIComponent(curUrl.href)
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const urlRegExp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

export const list = (txt: string, separate?: string) => {
    if (separate) {
        return txt.split(separate).map(t => t && t.trim())
    } else {
        const result: RegExpMatchArray | string[] = txt.match(/([^\n\t\r]){1,100}/g) ?? []
        if (result.length) return result
        for (let i = 0; i < txt.length; i += 100) result.push(txt.slice(i, i + 100));
        return result;
    }
}

export const toRichText = (content: string, href?: string, color?: string): Notion.RichText => {
    return {
        text: toText(content, href),
        annotations: toAnnotations(color),
        plain_text: content,
        href: href ?? content.match(urlRegExp)?.[0],
    }
}

export const richText = (contents: string): Notion.RichText[] => {
    return list(contents, undefined).map((txt) => toRichText(txt))
}

export const multiSelect = (contents: string[]): Notion.Select[] => {
    return contents.map((txt) => toSelect(txt))
}

export const toTitle = (content: string, href?: string): Notion.RichText[] => {
    return [content].map((cnt) => toRichText(cnt, href))
}

export const toSelect = (name: string): Notion.Select => {
    return { name: name.replace(/,+/, '') }
}

export const toAnnotations = (color?: string): Notion.Annotations => {
    return {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: color ?? 'default',
    }
}

export const toText = (content: string, href?: string): Notion.Text => {
    return {
        content,
        link: typeof href == 'string' ? { url: href } : href
    }
}

export const toImage = (src: string, index: number, company_name: string): Notion.File => {
    const type = src.startsWith("http") ? "external" : "file"
    const name = `${company_name}_${index}`
    const now = new Date()
    now.setDate(now.getDate()+7)
    if (type == 'external') {
        return { type, name,
            external: {
                url: src
            }
        }
    } else {
        return { type, name,
            file: {
                url: src,
                expiry_time: now.toISOString()
            }
        }
    }
}

export const thumbnails = (company_images: string[] | { url: string }[], com: string): Notion.File[] => {
    return company_images.map((img: string | { url: string }, i: number) => {
        if (typeof img == 'string') {
            return toImage(img, i, com)
        } else {
            return toImage(img.url, i, com)
        }
    });
}

export async function downloadImage(url: string, company_name?: string, index?: number) {
    let filename = removeQuery(url).split('/').pop() as string
    let ext = filename.split('.').pop() as string
    if (index) company_name = `${company_name}_${index}`
    if (company_name) filename = `${company_name}.${ext}`
    const responseType = 'stream'
    return await axios.get(url, { responseType })
        .then((response) => {
            const contentType = response.headers["content-type"]
            if (contentType && contentType.startsWith("image")) {
                console.log(`IMAGE URL: "${url}"`)
                return url
            }
            filename = `./images/${filename}`
            const fileWriter = fs.createWriteStream(filename)
            response.data.pipe(fileWriter)
            console.log(`IMAGE URL: "${filename}"`)
            return filename
        }, (reason: AxiosError)=>{
            console.error(reason.message)
            return url
        })
}