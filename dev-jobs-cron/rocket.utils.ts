'use strict'
import { JobDetail, ParsedText } from './rocket.types';
import fs from 'fs';

export const removeWhitespace = (str: string) => str.replace('\n', '').replace(/\s{2,}/, ' ').trim()

export const pickLongest = (str: string[]) => str.reduce((p, c) => p.length > c.length ? p : c, 'IT 컨텐츠')

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

export function parseText(longDocument: string): ParsedText {
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
    const 담당업무 = longDocument.slice(a + i, data[data.lastIndexOf(a) + 1]).replace(/^[^가-힣\w]+/g, '')
    const 자격요건 = longDocument.slice(b + j, data[data.lastIndexOf(b) + 1]).replace(/^[^가-힣\w]+/g, '')
    const 우대사항 = longDocument.slice(c + k, data[data.lastIndexOf(c) + 1]).replace(/^[^가-힣\w]+/g, '')
    return {
        담당업무,
        자격요건,
        우대사항,
    }
}

export function saveAllJSON(jobDetails: JobDetail[]) {
    fs.writeFileSync('./job-urls.json', JSON.stringify(jobDetails, null, 2))
    console.debug("ROCKET PUNCH URLS SAVED.")
}