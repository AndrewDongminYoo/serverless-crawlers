# 크롤링/스크래핑/자동화테스트

<aside>
💡 서버리스 프레임워크를 사용하여 AWS Lambda에서 실행되는 간단한 cron 서비스를 개발하고 배포하는 크롤링 프로젝트입니다.

</aside>

> `python`, `crawler`, `serverless framework`, `Selenium`, `Pandas`, `BeautifulSoup4` > `Node.js`, `TypeScript`, `Notion API`, `Chart Scraper`, `Axios`

[완료된 크롤링 프로젝트](https://github.com/AndrewDongminYoo/Serverless-Framework-Crawlers/blob/main/docs/크롤링%20스크래핑%20자동화테스트/완료된%20크롤링%20프로젝트.csv)

## Schedule event type

이 예에서는 rateHandler와 cronHandler라는 두 가지 함수를 정의하는데, 둘 다 특정 시간 또는 특정 간격으로 실행되도록 기능을 구성하는 데 사용되는 스케줄 유형의 이벤트에 의해 트리거됩니다. 스케줄 이벤트에 대한 자세한 내용은 서버리스 문서의 해당 섹션을 참조하십시오. [docs](https://serverless.com/framework/docs/providers/aws/events/schedule/).

### Cron expressions syntax

`cron(Minutes Hours Day-of-month Month Day-of-week Year)`

모든 필드는 필수적이며 표준 시간대는 UTC를 기준으로 합니다. (KST+09:00)

| 필드         | 허용된 값       | 와일드카드     |
| ------------ | --------------- | -------------- |
| Minutes      | 0-59            | , - \* /       |
| Hours        | 0-23            | , - \* /       |
| Day-of-month | 1-31            | , - \* ? / L W |
| Month        | 1-12 or JAN-DEC | , - \* /       |
| Day-of-week  | 1-7 or SUN-SAT  | , - \* ? / L # |
| Year         | 192199          | , - \* /       |

```yaml
functions:
  job-collector:
    handler: handler.run
    events:
      # Invoke Lambda function every 2nd minute from Mon-Fri
      - schedule: cron(0 * ? * MON-FRI *)
    timeout: 180
    memorySize: 1024
    ephemeralStorageSize: 1024
```

AWS CRON 레퍼런스 : [AWS docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html#CronExpressions).

## notion-sdk-typescript-starter

[Notion SDK](https://github.com/makenotion/notion-sdk-js)를 [TypeScript](https://www.typescriptlang.org/)로 랩핑한 notionhq를 사용했습니다.

[https://github.com/makenotion/notion-sdk-js](https://github.com/makenotion/notion-sdk-js)

## Features

- [Prettier](https://prettier.io/) 프리티어 코드 포맷터를 사용했습니다.
- 간단한 타입체크 워크플로우를 작성했습니다.
- [Dotenv](https://www.npmjs.com/package/dotenv) 노션의 토큰과 데이터베이스 주소를 환경변수로 설정합니다.
- [Dependabot](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuring-dependabot-version-updates) 디펜다봇을 설정했습니다.
- 데이터베이스나 디스플레이 측면에서 Notion API를 사용해 불필요한 개발 리소스를 줄였습니다.

## What to do after clone/fork

[노션 API 사이트](https://developers.notion.com/docs/getting-started)에서 API KEY를 발급받습니다. OAuth를 사용한 범용 API를 발급받아야 프라이빗한 노션 페이지를 조작할 수 있습니다. dotenv파일을 생성합니다. `touch .env`

```bash
NOTION_TOKEN=https://www.notion.so/my-integrations
ROCKET_NOTION_DB=YOUR_DATABASE_URL
WANTED_NOTION_DB=YOUR_DATABASE_URL
NODE_ENV=
S3_IMAGE_BUCKET=
```

노션 토큰과 데이터베이스 아이디를 셋팅합니다.

## NPM Scripts

`npm test` TS Jest를 작동합니다.

`npm run tslint` - TS Lint를 작동합니다.

`npm run lint` - ESLint를 작동합니다. 콘솔 출력은 없습니다.

`npm start` - TS NodeJS 명령어로 handler 파일의 run을 실행합니다.

`npm run rocket-punch` - TS NodeJS 명령어로 rocket.main 파일을 실행합니다.

`npm run wanted-crawl` - TS NodeJS 명령어로 wanted.main 파일을 실행합니다.

`npm run typecheck` - 타입 정의 중 중복되거나 잘못된 정의를 확인합니다. 1회성입니다.

`npm run watch` - 타입 정의 중 중복되거나 잘못된 정의를 확인합니다. 실시간으로 파일 변화를 감지합니다.

`npm run build` - 타입 정의 중 중복되거나 잘못된 정의를 확인, ES스크립트로 컴파일합니다.

`npm run format` - 프리티어 코드 포매터를 실행합니다.

---

[원티드](https://github.com/AndrewDongminYoo/Serverless-Framework-Crawlers/blob/main/docs/크롤링%20스크래핑%20자동화테스트/완료된%20크롤링%20프로젝트/원티드%20구인공고%20크롤링.md)

[로켓펀치](https://github.com/AndrewDongminYoo/Serverless-Framework-Crawlers/blob/main/docs/크롤링%20스크래핑%20자동화테스트/완료된%20크롤링%20프로젝트/로켓펀치%20구인공고%20크롤링.md)
