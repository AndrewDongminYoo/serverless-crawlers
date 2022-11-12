'use strict'
import Axios, { AxiosError } from 'axios'
import { Params, Response } from './response.types';
import { JobDetail } from './rocket.types'
import fs from 'fs'
import { load, CheerioAPI, Element } from 'cheerio';
import { PageStats } from './notion.types';
import { writeNotion } from './notionhq';
import { multiSelect, richText, toSelect, toTitle, thumbnails } from './notion.utils';
import { URL } from 'url';
import { parseText, pickLongest, removeComma, removeWhitespace, saveAllJSON, } from './rocket.utils';

const baseURL = 'https://www.rocketpunch.com'

const headers = {
    'accept': '*/*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'referer': 'https://www.rocketpunch.com/jobs',
    'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'same-origin',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
}

const axios = Axios.create({
    baseURL,
    headers,
    timeout: 10000
})

const jobDetails: JobDetail[] = []
const emptyQuery = '조건에 맞는 결과가 없습니다. 키워드를 바꿔서 검색해 보세요.검색 조건을 저장하면 나중에 추가된 검색 결과를 이메일로 받아볼 수 있습니다.'

export const exploreRocketPunch = async () => {
    let page = 1
    while (true) {
        let start: Params = {
            // 검색 조건을  변경하려면 파라미터를 수정하세요.
            job: '1', // SW개발자
            hiring_types: '0', // 풀타임
            location: '서울특별시',
            page: String(page),
        }
        await shootRocketPunch(start)
        page++
    }
}

export const iterateJobJSON = async () => {
    const jobDetailJSON = JSON.parse(fs.readFileSync('./job-urls.json', { encoding: 'utf-8', flag: 'r' }))
    const jobs: JobDetail[] = jobDetailJSON as JobDetail[]
    for (let job of jobs) {
        for (let href of job.채용) {
            await getDetailOfJobs(href, job)
        }
    }
}

const shootRocketPunch = async (params: Params) => {
    const init = { baseURL, params, headers }
    await axios.get('/api/jobs/template', init).then(async (res: Response) => {
        const div = res.data.data.template
        const $: CheerioAPI = load(div)
        if ($('.ui.job.items.segment.company-list > div:nth-child(3)').text() == emptyQuery) {
            saveAllJSON(jobDetails);
        }
        $('.company-list > .company.item').each((i, el: Element) => {
            const title = $(el).find('.content > .company-name > a > h4').text().trim()
            const href = $(el).find(".logo.image > a").attr('href')?.replace('/jobs', '') ?? ''
            const likes = $(el).find(".content > .company-name > a.reference-count > span").text()
            const thumbnail = $(el).find(".logo.image > a > div > img").attr()?.src
            const jobDetail: JobDetail = {
                아이디: el.attribs['data-company_id'],
                사이트: href,
                회사명: removeWhitespace(title),
                채용: [],
                채용중: 0,
                좋아요: Number(likes),
                이미지: [],
                응답률: false,
            }
            jobDetail.응답률 = $(el).find(".content > div.company-name > span > div").first().text() == '응답률 우수'
            thumbnail && jobDetail.이미지.push(thumbnail.replace('?s=100x100&t=inside', ''))
            const jobs = $(el).find('.content > div.company-jobs-detail > .job-detail > div > a.job-title')
            jobs.each((i: number, e: Element) => {
                if (e.attribs.href) {
                    const href = decodeURIComponent(e.attribs.href)
                    jobDetail.채용.push(`${baseURL}${href}`)
                }
            })
            jobDetail.채용중 = jobDetail.채용.length
            jobDetails.push(jobDetail)
        })
    }, (error) => {
        if (error instanceof AxiosError) {
            console.error(`there is no more data "${error.request?.path}"`)
        }
    })
}

async function getDetailOfJobs(href: string, job: JobDetail) {
    await axios.get(href).then((response) => {
        const html = response.data
        const $ = load(html)
        const 주요업무 = removeWhitespace($("div.duty.break > .full-text").text() ?? $("div.duty.break").text())
        let 스택 = $("a.ui.circular.basic.label").map((i, el) => $(el).text()).toArray()
        let 산업분야 = $(".job-company-areas > a").map((i, el) => $(el).text()).toArray()
        스택 = removeComma(스택)
        산업분야 = removeComma(산업분야)
        const 복지혜택 = $(".ui.divided.company.info.items > .item > .content").text()
        const 회사위치 = $(".office.item > .address").text()
        const 채용상세 = $(".content.break > .full-text").text() ?? $(".content.break").text()
        const { 우대사항, 담당업무, 자격요건 } = parseText(채용상세)
        const 아이디 = href.split('/').filter((value) => value && !isNaN(Number(value))).pop() ?? '아이디'
        const 포지션 = $("body > div.pusher > div.ui.vertical.center.aligned.detail.job-header.header.segment > div > div > h1").text()
        const newPage: PageStats = {
            "플랫폼": "로켓펀치",
            "URL": { url: href },
            "주요업무": { rich_text: richText(주요업무) },
            "회사타입": { multi_select: multiSelect(산업분야) },
            "포지션": { rich_text: richText(포지션) },
            "회사위치": { rich_text: richText(회사위치) },
            "우대사항": { rich_text: richText(우대사항) },
            "기술스택": { multi_select: multiSelect(스택) },
            "회사설명": { rich_text: richText(담당업무) },
            "혜택및복지": { rich_text: richText(복지혜택) },
            "자격요건": { rich_text: richText(자격요건) },
            "아이디": { title: toTitle(아이디, href) },
            "분야": { select: toSelect(pickLongest(산업분야)) },
            "응답률": { number: job.응답률 ? 90 : 69 },
            "회사명": { rich_text: toTitle(job.회사명, new URL(job.사이트, baseURL).href) },
            "썸네일": { files: thumbnails(job.이미지, job.회사명) },
            "좋아요": { number: job.좋아요 }
        }
        writeNotion(newPage)
    }, (error) => {
        if (error instanceof AxiosError) {
            console.error(`there is no data "${error.request?.path}"`)
        }
    })
}