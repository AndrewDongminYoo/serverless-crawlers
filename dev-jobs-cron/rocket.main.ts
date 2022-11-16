'use strict'
import Axios, { AxiosError } from 'axios';
import { Params, Response, CustomHeader } from './response.types';
import { JobDetail } from './rocket.types';
import fs from 'fs';
import { load, CheerioAPI, Element } from 'cheerio';
import { PageStats, Platform } from './notion.types';
import writeNotion, { removeOldJobs } from './notionhq';
import { multiSelect, richText, toSelect, toTitle, thumbnails, removeComma, removeQuery, downloadImage } from './notion.utils';
import { URL } from 'url';
import { parseText, pickLongest, removeWhitespace, saveAllJSON, } from './rocket.utils';
import { isNotionClientError } from '@notionhq/client';

const baseURL = 'https://www.rocketpunch.com'
const platform: Platform = "로켓펀치"

const headers: CustomHeader = {
    Accept: '*/*',
    Referer: `${baseURL}/jobs`,
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Sec-Ch-Ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'same-origin',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
}

const emptyQuery = '조건에 맞는 결과가 없습니다. 키워드를 바꿔서 검색해 보세요.검색 조건을 저장하면 나중에 추가된 검색 결과를 이메일로 받아볼 수 있습니다.'

const axios = Axios.create({
    baseURL,
    headers,
    timeout: 10000,
    withCredentials: true,
})

const jobDetails: JobDetail[] = []

const exploreRocketPunch = async () => {
    await collectInput()
    await iterateJobJSON()
    await removeOldJobs(platform)
}

const collectInput = async () => {
    console.debug("ROCKET PUNCH MAIN PAGE CRAWLING STARTED")
    let page = 1
    while (true) {
        let start: Params = {
            // 검색 조건을  변경하려면 파라미터를 수정하세요.
            job: '1', // SW개발자
            hiring_types: '0', // 풀타임
            location: '서울특별시',
            page: String(page),
        }
        const stop = await shootRocketPunch(start)
        page++
        if (stop) break
    }
}

const shootRocketPunch = async (params: Params): Promise<true | void> => {
    return await axios.get('/api/jobs/template', { params })
        .then(async (res: Response) => {
            const div = res.data.data.template
            const $: CheerioAPI = load(div)
            if ($('.ui.job.items.segment.company-list > div:nth-child(3)').text() == emptyQuery) {
                saveAllJSON(jobDetails)
                return true
            }
            const companyItems = $('.company-list > .company.item').toArray()
            companyItems.forEach(async (el: Element, i) => {
                const title = $(el).find('.content > .company-name > a > h4').text().trim()
                const href = $(el).find(".logo.image > a").attr('href')?.replace('/jobs', '') ?? ''
                const likes = $(el).find(".content > .company-name > a.reference-count > span").text()
                const thumbnail = $(el).find(".logo.image > a > div > img").attr("src")
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
                thumbnail && jobDetail.이미지.push(removeQuery(thumbnail))
                headers.Accept = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
                headers["Cache-Control"] = "max-age=0"
                headers["Sec-Fetch-Dest"] = "document"
                headers["Sec-Fetch-Mode"] = "navigate"
                headers["Sec-Fetch-Site"] = "none"
                headers["Sec-Fetch-User"] = "?1"
                headers["upgrade-insecure-requests"] = "1"
                await axios.get(href, { headers }).then(
                    (response: Response) => {
                        const div = response.data
                        const $: CheerioAPI = load(div)
                        const imageBox = $("#company-images > div > div > div > div.company-image-box.image").toArray()
                        imageBox.forEach(async (img: Element, i: number) => {
                            const src = ($(img).attr("data-lazy-src") && $(img).attr("data-src")) ?? ''
                            const imgUrl = await downloadImage(axios, src, removeWhitespace(title), i)
                            imgUrl && jobDetail.이미지.push(imgUrl)
                        })
                    },
                    (error: AxiosError) => {
                        console.error(`can't fetch company page "${error.code}"`)
                    }
                )
                const jobs = $(el).find('.content > div.company-jobs-detail > .job-detail > div > a.job-title').toArray()
                jobs.forEach((e: Element, i: number) => {
                    if (e.attribs['href']) {
                        const link = new URL(e.attribs['href'], baseURL)
                        const href = decodeURIComponent(link.href)
                        jobDetail.채용.push(href)
                    }
                })
                jobDetail.채용중 = jobDetail.채용.length
                jobDetails.push(jobDetail)
            })
            return
        }, (error) => {
            if (error instanceof AxiosError) {
                console.error("ROCKET PUNCH MAIN PAGE CRAWLING FINISHED")
            }
        }
        )
}

const iterateJobJSON = async () => {
    console.debug("ROCKET PUNCH DETAIL PAGE CRAWLING STARTED")
    const jobDetailJSON = JSON.parse(fs.readFileSync('./job-urls.json', { encoding: 'utf-8', flag: 'r' }))
    const jobs: JobDetail[] = jobDetailJSON as JobDetail[]
    for (let job of jobs) {
        for (let href of job.채용) {
            await getDetailOfJobs(href, job)
        }
    }
}

async function getDetailOfJobs(href: string, job: JobDetail) {
    await axios.get(href)
        .then(async (response) => {
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
            await writeNotion(newPage, platform)
        }, (error) => {
            if (isNotionClientError(error)) {
                console.error(`Notion API Failed: "${error.message}"`)
            } else if (error instanceof AxiosError) {
                console.error(`there is no data "${error.request?.path}"`)
            }
        })
}

const isURL = (urlString: string) => {
    try {
        const url = new URL(urlString)
        return url.href === urlString
    } catch (e) {
        return false
    }
}

export default exploreRocketPunch