'use strict'
import { NotionText, NotionFile, NotionSelect, NotionTitle, RichText, MultiSelect, SelectRequest, Numeric, NotionURL } from './notion.types'
import { Annotations, ArrayElement, SelectColor, AnnotationColor, TextRichTextItem } from './notion.types'
import { AxiosError, AxiosInstance, AxiosResponse, ResponseType } from 'axios';
import S3 from 'aws-sdk/clients/s3';
import fs from 'fs';
import { Stream } from 'node:stream';
import dotenv from "dotenv";

dotenv.config()

export const removeCom = (str: string): string => str.replace(',', ' ').replace('/', ' ').replace(/\s{2,}/, ' ').trim()

export const removeComma = (str: string[]): string[] => {
    const newArray: string[] = []
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

export const delay = (ms: number): Promise<never> => new Promise(resolve => setTimeout(resolve, ms))

export const isEmpty = (thing?: any[]): boolean => !thing || (thing &&!thing.length)

const urlRegExp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig

const list = (txt: string, separate?: string) => {
    if (separate) {
        return txt.split(separate).map(t => t && t.trim())
    } else {
        const result: RegExpMatchArray | string[] = txt.match(/([^\n\t\r]){1,100}/g) ?? []
        if (result.length) return result
        for (let i = 0; i < txt.length; i += 100) result.push(txt.slice(i, i + 100))
        return result
    }
}

export const toNumber = (number: number): Numeric => {
    return { number };
}

export const toURL = (urlString: string): NotionURL => {
    const url = new URL(urlString).href;
    return { url }
}

const toRichText = (content: string, href?: string | null, color?: AnnotationColor): TextRichTextItem => {
    const rich_text: TextRichTextItem = {
        text: toText(content, href ?? null),
        annotations: toAnnotations(color),
        plain_text: content,
        href: href ?? content.match(urlRegExp)?.[0] ?? null,
    }
    return rich_text
}

export const richText = (contents: string, href?: string | null): RichText => {
    const rich_text = list(contents, undefined).map((txt) => {
        if (!href) href = txt.match(urlRegExp)?.[0] ?? null
        return toRichText(txt, href)
    })
    return { rich_text }
}

export const multiSelect = (contents: string[]): MultiSelect => {
    const multi_select: SelectRequest[] = []
    contents.forEach((txt) => {
        const select = toSelect(txt)
        multi_select.push(select.select)
    })
    return { multi_select }
}

export const toTitle = (content: string, href?: string): NotionTitle => {
    const title: TextRichTextItem[] = [content].map((cnt) => toRichText(cnt, href ?? ''))
    return { title: title }
}

export const toSelect = (name: string, color?: SelectColor): NotionSelect => {
    const select = { name: name.replace(/,+/, ''), color }
    return { select }
}

export const toAnnotations = (color?: AnnotationColor): Annotations => {
    return {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: color ?? 'default',
    }
}

export const toText = (content: string, href: string | null): NotionText => {
    return {
        content,
        link: href !== null ? { url: href } : href
    }
}

export const toImage = (src: string, index: number, company_name: string): ArrayElement<NotionFile["files"]> => {
    const name = `${company_name}_${index}`
    const now = new Date()
    now.setDate(now.getDate() + 7)
    const type = src.startsWith("http") ? "external" : "file"
    if (type == 'external') {
        return {
            name, type,
            external: {
                url: src
            }
        }
    } else {
        return {
            name, type,
            file: {
                url: src,
                expiry_time: now.toISOString()
            }
        }
    }
}

export const thumbnails = (company_images: (string | { url: string })[], com: string): NotionFile => {
    const files = company_images.map((img, i: number) => {
        if (typeof img == 'string') {
            return toImage(img, i, com)
        } else {
            return toImage(img.url, i, com)
        }
    })
    return { files }
}

export async function downloadImage(axios: AxiosInstance, url: string, company_name?: string, index?: number) {
    const getFilename = (url: string) => {
        let filename = removeQuery(url).split('/').pop() as string
        let ext = filename.split('.').pop() as string
        if (index) company_name = `${company_name}_${index}`
        if (company_name) filename = `${company_name}.${ext}`
        return filename
    }
    const responseType: ResponseType = 'stream'
    return await axios.get<Stream, AxiosResponse<Stream>>(url, { responseType })
        .then<string, void>(async (response: AxiosResponse<Stream>) => {
            const contentType = response.headers["content-type"]
            if (contentType && contentType.startsWith("image")) {
                console.log(`IMAGE URL: "${url}"`)
                return url
            }
            if (process.env["NODE_ENV"] === 'dev') {
                const filename = `./images/${getFilename(url) }`
                const fileWriter = fs.createWriteStream(filename)
                response.data.pipe(fileWriter)
                console.log(`IMAGE URL: "${filename}"`)
                return filename
            } else if (process.env["NODE_ENV"] === 'prod') {
                const Key = getFilename(url)
                let Bucket = process.env["S3_IMAGE_BUCKET"] ?? ''
                const s3: S3 = new S3()
                const uploaded = s3.upload({ Key, Bucket, Body: response.data })
                const newLocation = (await uploaded.promise()).Location
                console.log(`IMAGE URL: "${newLocation}"`)
                return decodeURIComponent(newLocation)
            }
            return url
        }, (reason: AxiosError) => {
            console.error(`reason.message: "${reason.message}"`)
        })
}

