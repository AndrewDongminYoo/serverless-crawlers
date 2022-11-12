'use strict'
import Axios, { AxiosError } from 'axios'
import { Context, APIGatewayProxyCallback, APIGatewayEvent } from 'aws-lambda';
import { Params, Response, JobDetail, ParsedText } from './response.types';
import fs from 'fs'
import { load, CheerioAPI, Element } from 'cheerio';
import { PageStats } from './notion.types';
import { writeNotion } from './notionhq';
import { multiSelect, richText, toSelect, toTitle, thumbnails } from './notion.utils';
import { URL } from 'url';

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
const removeWhitespace = (str: string) => str.replace('\n', '').replace(/\s{2,}/, ' ').trim()
const removeCom = (str: string) => str.replace(',', ' ').replace('/', ' ').replace(/\s{2,}/, ' ').trim()
const removeComma = (str: string[]) => {
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
const pickLongest = (str: string[]) => str.reduce((p, c) => p.length > c.length ? p : c, 'IT 컨텐츠')
function findSubject(target: string, ...args: (string | RegExp)[]): [number, number] {
    let match: RegExpMatchArray | null = null
    for (let arg of args) {
        if (arg instanceof RegExp) {
            match = target.match(arg)
        } else {
            match = target.match(RegExp(arg))
        }
        if (match && match.index) {
            return [match.index, match[0].length]
        }
    }
    return [-1, 0]

}
function parseText(longDocument: string): ParsedText {
    longDocument = longDocument.replace(/[^가-힣\w\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@#$%&\\=\('" \n]+/g, ' ').replace(/\s{2,}/g, ' ')
    longDocument = longDocument.replace(/(([\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@#$%&\\=\('" ])\2{3,})/g, "$2").replace(/( -|- )/g, ' - ')
    if (longDocument.length < 100) return { 담당업무: longDocument, 자격요건: longDocument, 우대사항: longDocument }
    const 자격조건_정규식 = "자격 ?요건|자격 ?조건|지원 ?자격|필수 ?요건|지원 ?조건|가진 분이면 좋겠습니다|찾고 ?있어요|찾습니다|원해요|함께 성장하고 싶습니다|이런 분을 찾아요|분을 환영합니다|능력\/경험이 요구됩니다|What you need|함께 ?하고 싶습니다|자격이 필요해요|분이 필요해요|모집해요|인재상|함께 하고 싶어요|필수 ?경험|원하는 fit|필요 ?조건|지원 ?요건|요구 ?사항|자격 ?사항|필수 ?사항|요구 ?기술|어떤 ?조건|분을 찾아요|조건이 필요해요|Qualifications|What we Like|더 잘 해드리고 싶을 것 같아요|필요한 기술|이런 분을 바라고 원합니다|분을 모십니다|모시고 싶어요|\(필수\) skillset|아래의 조건에|찾으려는 개발자는|이런 사람이라면|Requirements|What you'll need to succeed".split('|')
    const 담당업무_정규식 = "담당 ?업무|주요 ?업무|경험하실 업무|하는 일|Tech Stack|이렇게 일해요|기술 ?스택|What you will do|What You Will Do|이런 일을 해요|What you'll do".split('|')
    const 우대사항_정규식 = "우대 ?사항|우대|더욱 환영해요|있으시면 더 좋아요|분이라면 더 좋아요|더 좋아요|더욱 좋습니다|이런 관심\/경험을 가지고 계시다면|Preferred Skills|요구사항|팀이 원하는 fit|이런 역량이 있으면 더 좋아요|더욱 좋아요|이런 성향을 가진 분과 함께하고 싶어요|더욱 환영합니다|분이시?면 더 좋아요|분이라면 더 좋죠|이런 경험이 있다면 더 좋아요|이러한 경험이 있으면 더 좋습니다|이런 경험이 있으면 더 좋습니다|이런 경험이 있으면 더 좋아요".split('|')
    const 복지혜택_정규식 = "혜택 ?및 ?복지|복지 ?혜택|혜택|근무 ?환경|복지|이런 환경에서 일해요|복리후생|업무 지원|근무조건 및 환경|업무환경|대 +우|컬처 & 베네핏|Culture & Benefit|근무여건".split('|')
    const [a, i] = findSubject(longDocument, ...담당업무_정규식)
    const [b, j] = findSubject(longDocument, ...자격조건_정규식)
    const [c, k] = findSubject(longDocument, ...우대사항_정규식)
    const [d, l] = findSubject(longDocument, ...복지혜택_정규식)
    const data = [0, a, b, c, d, longDocument.length].sort()
    const 담당업무 = longDocument.slice(a+i, data[data.lastIndexOf(a) + 1]).replace(/^[^가-힣\w]+/g, '')
    const 자격요건 = longDocument.slice(b+j, data[data.lastIndexOf(b) + 1]).replace(/^[^가-힣\w]+/g, '')
    const 우대사항 = longDocument.slice(c+k, data[data.lastIndexOf(c) + 1]).replace(/^[^가-힣\w]+/g, '')
    return {
        담당업무,
        자격요건,
        우대사항,
    }
}
function saveAllJSON() {
    fs.writeFileSync('./job-urls.json', JSON.stringify(jobDetails, null, 2));
    console.debug('saved.')
    throw Error();
}

export async function run(
    event?: APIGatewayEvent, context?: Context, callback?: APIGatewayProxyCallback
) {
    const time = new Date()
    event && console.info("EVENT\n" + JSON.stringify(event, null, 2))
    context && console.info("CONTEXT\n" + JSON.stringify(context, null, 2))
    context && console.info(`Your cron function "${context.functionName}" ran at ${time}`)
    exploreRocketPunch()
        .catch(()=>iterateJobJSON())
}

const exploreRocketPunch = async () => {
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

const iterateJobJSON = async () => {
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
            saveAllJSON();
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
    await axios.get(href).then((response)=>{
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
            "분야": { select: toSelect(pickLongest(산업분야))},
            "응답률": { number: job.응답률 ? 90 : 69 },
            "회사명": { rich_text: toTitle(job.회사명, new URL(job.사이트, baseURL).href) },
            "썸네일": { files: thumbnails(job.이미지, job.회사명) },
            "좋아요": { number: job.좋아요 }
        }
        writeNotion(newPage)
    }, (error)=>{
        if (error instanceof AxiosError) {
            console.error(`there is no data "${error.request?.path}"`)
        }
    })
}

run()