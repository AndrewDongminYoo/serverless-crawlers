import Axios, { AxiosError } from 'axios';
import { CheerioAPI, Element, load } from 'cheerio';
import { CustomHeader, Params, Response } from './response.types';
import { PageStats, Platform } from './notion.types';
import { downloadImage, isEmpty, multiSelect, removeComma, richText, thumbnails, toNumber, toSelect, toTitle, toURL } from './notion.utils';
import { parseText, pickLongest, removeWhitespace, saveAllJSON } from './rocket.utils';
import { JobDetail } from './rocket.types';
import { URL } from 'url';
import fs from 'fs';
import { isNotionClientError } from '@notionhq/client';
import { removeOldJobs } from './notionhq';
import { stringify } from 'querystring'
import writeNotion from './notionhq';

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
    timeout: 20000,
    withCredentials: true,
})

let jobDetails: JobDetail[] = []

const exploreRocketPunch = async () => {
    await collectInput()
    await iterateJobJSON()
    await removeOldJobs(platform)
}

const collectInput = async () => {
    console.debug("ROCKET PUNCH MAIN PAGE CRAWLING STARTED")
    let page = 1
    let stop = false
    while (!stop) {
        const start: Params = {
            // 검색 조건을  변경하려면 파라미터를 수정하세요.
            job: '1', // SW개발자
            hiring_types: '0', // 풀타임
            location: '서울특별시',
            page: String(page),
        }
        stop = await shootRocketPunch(start) as boolean
        page++
    }
    console.debug("ROCKET PUNCH MAIN PAGE CRAWLING FINISHED")
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
            if (isEmpty(companyItems)) return
            companyItems.forEach(async (el: Element) => {
                const title = $(el).find('.content > .company-name > a > h4').text().trim()
                const company_name = removeWhitespace(title)
                const href = $(el).find(".logo.image > a").attr('href')?.replace('/jobs', '') ?? ''
                const likes = $(el).find(".content > .company-name > a.reference-count > span").text()
                const thumbnail = $(el).find(".logo.image > a > div > img").attr("src")
                const jobDetail: JobDetail = {
                    아이디: el.attribs['data-company_id'],
                    사이트: href,
                    회사명: company_name,
                    채용: [],
                    채용중: 0,
                    좋아요: Number(likes),
                    이미지: [],
                    응답률: false,
                }
                jobDetail.응답률 = $(el).find(".content > div.company-name > span > div").first().text() == '응답률 우수'
                thumbnail && jobDetail.이미지.push(thumbnail)
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
                        if (isEmpty(imageBox)) return
                        imageBox.forEach(async (img: Element, i: number) => {
                            const src = $(img).attr("data-lazy-src") ?? $(img).attr("data-src")
                            if (src) {
                                const imgUrl = await downloadImage(axios, src, company_name, i)
                                imgUrl && jobDetail.이미지.push(imgUrl)
                            }
                        })
                    },
                    (error: AxiosError) => {
                        if (error.code?.startsWith('ECONN')) {
                            console.error(`⌦ can't fetch ${company_name} company page "${error.message}"`)
                        }
                    }
                )
                const jobs = $(el).find('.content > div.company-jobs-detail > .job-detail > div > a.job-title').toArray()
                if (isEmpty(jobs)) return
                jobs.forEach((e: Element, _i: number) => {
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
        }, (error: AxiosError) => {
            console.error(`Rocket Punch Error:\n ${JSON.stringify(error, null, 2)}`)
            const u = new URL('/api/jobs/template')
            u.search = stringify({...params})
            console.debug(u)
        })
}

const iterateJobJSON = async () => {
    console.debug("ROCKET PUNCH DETAIL PAGE CRAWLING STARTED")
    if (jobDetails.length === 0) {
        const jobDetailJSON = JSON.parse(fs.readFileSync('./job-urls.json', { encoding: 'utf-8', flag: 'r' }))
        jobDetails = jobDetailJSON as JobDetail[]
    }
    for (const job of jobDetails) {
        for (const href of job.채용) {
            await getDetailOfJobs(href, job)
        }
    }
    console.debug("ROCKET PUNCH DETAIL PAGE CRAWLING FINISHED")
}

async function getDetailOfJobs(url: string, job: JobDetail) {
    await axios.get(url)
        .then(async (response) => {
            const html = response.data
            const $ = load(html)
            const 주요업무 = removeWhitespace($("div.duty.break > .full-text").text() ?? $("div.duty.break").text())
            const 스택 = removeComma($("a.ui.circular.basic.label").map((_i, el) => $(el).text()).toArray())
            const 산업분야 = removeComma($(".job-company-areas > a").map((_i, el) => $(el).text()).toArray())
            const 복지혜택 = $(".ui.divided.company.info.items > .item > .content").text()
            const 회사위치 = $(".office.item > .address").text()
            const 채용상세 = $(".content.break > .full-text").text() ?? $(".content.break").text()
            const { 우대사항, 담당업무, 자격요건 } = parseText(채용상세)
            const 아이디 = url.split('/').filter((value) => value && !isNaN(Number(value))).pop() ?? '아이디'
            const 포지션 = $("body > div.pusher > div.ui.vertical.center.aligned.detail.job-header.header.segment > div > div > h1").text()
            const newPage: PageStats = {
                "URL": toURL(url),
                "주요업무": richText(주요업무),
                "회사타입": multiSelect(산업분야),
                "포지션": richText(포지션),
                "회사위치": richText(회사위치),
                "우대사항": richText(우대사항),
                "기술스택": multiSelect(스택),
                "회사설명": richText(담당업무),
                "혜택및복지": richText(복지혜택),
                "자격요건": richText(자격요건),
                "아이디": toTitle(아이디, url),
                "분야": toSelect(pickLongest(산업분야)),
                "응답률": toNumber(job.응답률 ? 90 : 69),
                "회사명": richText(job.회사명, url),
                "썸네일": thumbnails(job.이미지, job.회사명),
                "좋아요": toNumber(job.좋아요)
            }
            await writeNotion(newPage, platform)
        }, (error) => {
            if (isNotionClientError(error)) {
                console.error(`Notion API Failed: "${error.message}"`)
            } else if (error instanceof AxiosError) {
                console.error(`there is no data "${url}"`)
            }
        })
}

export default exploreRocketPunch;