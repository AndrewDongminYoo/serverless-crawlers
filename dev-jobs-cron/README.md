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
- 노션 API 사용은 다소 복잡합니다.  
  
## What to do after duplicating  
  
[노션 API 사이트](https://developers.notion.com/docs/getting-started)에서 API KEY를 발급받습니다.  
OAuth를 사용한 범용 API를 발급받아야 프라이빗한 노션 페이지를 조작할 수 있습니다.  
dotenv파일을 생성합니다. `touch .env`  
`echo "NOTION_TOKEN=[your token here]" > .env`.  
`echo "WANTED_NOTION_DB=YOUR_DATABASE_URL" >> .env`  
`echo "ROCKET_NOTION_DB=YOUR_DATABASE_URL" >> .env`  
노션 토큰과 데이터베이스 아이디를 셋팅합니다.  
  
## NPM Scripts  
`yarn install`  
`npm run tsc -w`  
타입스크립트 정의 중 중복되거나 잘못된 정의를 확인합니다.  
`npm run tslint '*.ts'`  
TS Lint를 작동합니다.  
`npm run ts-node handler.ts`  
TS NodeJS 명령어로 handler 파일을 실행합니다. 글로벌로 설치되어 있을 경우 `ts-node handler`로도 실행가능합니다.  
`npm run prettier --write *.ts`  
프리티어를 사용해 문서를 포맷합니다.  
  
## Wanted Crawler  
  
Wanted/Rocket-Punch의 채용정보 리스트 API와 상세정보 API를 사용했습니다.  
axios가 익숙해서 사용했습니다.  
노션 페이지의 데이터베이스 형태는 다음과 같습니다. rich_text가 일반 텍스트 컬럼, multi_select가 다중 선택 컬럼입니다.  
  
```typescript  
export interface PageStats {
    플랫폼: '원티드'|'로켓펀치'
    URL: { url: null | string }
    주요업무: { rich_text: RichText[] }
    회사타입: { multi_select: Select[] }
    회사위치: { rich_text: RichText[] }
    포지션: { rich_text: RichText[] }
    우대사항: { rich_text: RichText[] }
    좋아요: { number?: number }
    기술스택: { multi_select: Select[] }
    회사설명: { rich_text: RichText[] }
    썸네일: { files: File[] };
    혜택및복지: { rich_text: RichText[] }
    자격요건: { rich_text: RichText[] }
    회사명: { rich_text: RichText[] }
    분야: { select?: Select }
    응답률: { number?: number }
    아이디: { title: RichText[] }
} 
```  
  
<img src="../doc/Screenshot%202022-11-05%20at%2010.21.32%20PM.png" />  

[결과물 노션 페이지](https://donminzzi.notion.site/771c884efa8e404dbd193364a5172a2b?v=4272ea0005b74ebb8dcc38f14180c57f). 