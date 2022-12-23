이 템플릿은 기존의 서버리스 프레임워크를 사용하여 AWS Lambda에서 실행되는 간단한 cron 서비스를 개발하고 배포하는 방법을 보여줍니다.  
  
## Schedule event type  
  
이 예에서는 rateHandler와 cronHandler라는 두 가지 함수를 정의하는데,  
둘 다 특정 시간 또는 특정 간격으로 실행되도록 기능을 구성하는 데 사용되는 스케줄 유형의  
이벤트에 의해 트리거됩니다.  
스케줄 이벤트에 대한 자세한 내용은 서버리스 문서의 해당 섹션을 참조하십시오.  
[docs](https://serverless.com/framework/docs/providers/aws/events/schedule/).  
  
### Cron expressions syntax  
  
```pseudo  
cron(Minutes Hours Day-of-month Month Day-of-week Year)  
```  
  
모든 필드는 필수적이며 표준 시간대는 UTC를 기준으로 합니다. (KST+09:00)  
  
| 필드           |      허용된 값      |     와일드카드     |  
|--------------|:---------------:|:-------------:|  
| Minutes      |      0-59       |    , - * /    |  
| Hours        |      0-23       |    , - * /    |  
| Day-of-month |      1-31       | , - * ? / L W |  
| Month        | 1-12 or JAN-DEC |    , - * /    |  
| Day-of-week  | 1-7 or SUN-SAT  | , - * ? / L # |  
| Year         |     192199      |    , - * /    |  
  
```yml  
functions:  
  job-collector:  
    handler: handler.run  
    events:  
      # Invoke Lambda function every 2nd minute from Mon-Fri  
      - schedule: cron(0 * ? * MON-FRI *)  
```  
  
AWS CRON 레퍼런스 : [AWS docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html#CronExpressions).  
# notion-sdk-typescript-starter  
  
[Notion SDK](https://github.com/makenotion/notion-sdk-js)를 [TypeScript](https://www.typescriptlang.org/)로 작성했습니다.  
  
## Features  
  
- [Prettier](https://prettier.io/) 프리티어 코드 포맷터를 사용했습니다.  
- 간단한 타입체크 워크플로우를 작성했습니다.  
- [Dotenv](https://www.npmjs.com/package/dotenv) 노션의 토큰과 데이터베이스 주소를 환경변수로 설정합니다.  
- [Dependabot](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuring-dependabot-version-updates)  
  디펜다봇을 설정했습니다.  
- 데이터베이스나 디스플레이 측면에서 Notion API를 사용해 번거로움을 줄였습니다.  
  
## What to do after duplicating  
  
[노션 API 사이트](https://developers.notion.com/docs/getting-started)에서 API KEY를 발급받습니다.  
OAuth를 사용한 범용 API를 발급받아야 프라이빗한 노션 페이지를 조작할 수 있습니다.  
dotenv파일을 생성합니다. `touch .env`  

```dotenv
NOTION_TOKEN=https://www.notion.so/my-integrations
ROCKET_NOTION_DB=YOUR_DATABASE_URL
WANTED_NOTION_DB=YOUR_DATABASE_URL
NODE_ENV=
S3_IMAGE_BUCKET=
``` 
노션 토큰과 데이터베이스 아이디를 셋팅합니다.  
  
## NPM Scripts  
`npm test`
TS Jest를 작동합니다.  
`npm run tslint`
TS Lint를 작동합니다.  
`>>> Tried to lint handler.ts but found no valid, enabled rules for this file type and file path in the resolved configuration.`
`npm run lint`
ESLint를 작동합니다. 콘솔 출력은 없습니다.  
`npm start`
TS NodeJS 명령어로 handler 파일의 run을 실행합니다.  
`npm run rocket-punch`
TS NodeJS 명령어로 rocket.main 파일을 실행합니다.  
`npm run wanted-crawl`
TS NodeJS 명령어로 wanted.main 파일을 실행합니다.  
`npm run typecheck`
타입 정의 중 중복되거나 잘못된 정의를 확인합니다. 1회성입니다.
`npm run watch`
타입 정의 중 중복되거나 잘못된 정의를 확인합니다. 실시간으로 파일 변화를 감지합니다.  
`npm run build`
타입 정의 중 중복되거나 잘못된 정의를 확인, ES스크립트로 컴파일합니다.  
`npm run format`
프리티어 코드 포매터를 실행합니다.
  
## Wanted Crawler  
  
Wanted/Rocket-Punch의 채용정보 리스트 API와 상세정보 API를 사용했습니다.  
axios가 익숙해서 사용했습니다.  
노션 페이지의 데이터베이스 형태는 다음과 같습니다. rich_text가 일반 텍스트 컬럼, multi_select가 다중 선택 컬럼입니다.  
  
```typescript 
type PageProperties = {
    type?:          "title";
    title:          TextRichTextItem[];
} | {
    type?:          "rich_text";
    rich_text:      TextRichTextItem[];
} | {
    type?:          "number";
    number:         number | null;
} | {
    type?:          "url";
    url:            string | null;
} | {
    type?:          "select";
    select:         SelectRequest;
} | {
    type?:          "multi_select";
    multi_select:   SelectRequest[];
} | {
    type?:          "email";
    email:          string | null;
} | {
    type?:          "phone_number";
    phone_number:   string | null;
} | {
    type?:          "checkbox";
    checkbox:       boolean;
} | {
    type?:                  "files";
    files:                  ({
        type?:              "file";
        file: {
            url:            string;
            expiry_time?:   string;
        };
        name:               string;
                            } | {
        type?:              "external";
        external: {
            url:            string;
        };
        name:               string;
                            })[];
} | {
    type?:          "text";
    content:        string;
    link:           { url: string; } | null;
};
```  
  
<img src="../doc/Screenshot%202022-11-05%20at%2010.21.32%20PM.png" />  

[원티드 스크랩 노션 페이지](https://donminzzi.notion.site/771c884efa8e404dbd193364a5172a2b?v=4272ea0005b74ebb8dcc38f14180c57f). 
[로켓펀치 스크랩 노션 페이지](https://donminzzi.notion.site/e76272fe72fb41bbbc998fc377ad0046?v=c071410b1dc14b0ba4fa7188ed527514). 