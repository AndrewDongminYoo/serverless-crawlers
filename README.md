# 크롤링/스크래핑/자동화테스트

`python`, `crawler`, `serverless framework`, `Node.js`, `TypeScript`, `Notion API`, `Chart Scraper`

[크롤링/스크래핑/자동화테스트](https://donminzzi.notion.site/ffbbc8f0c92841b885a939a65681a177)

서버리스 프레임워크를 사용하여 AWS Lambda에서 실행되는 간단한 cron 서비스를 개발하고 배포하는 크롤링 프로젝트입니다.

## Schedule event type

이 예에서는 rateHandler와 cronHandler라는 두 가지 함수를 정의하는데, 둘 다 특정 시간 또는 특정 간격으로 실행되도록 기능을 구성하는 데 사용되는 스케줄 유형의 이벤트에 의해 트리거됩니다. 스케줄 이벤트에 대한 자세한 내용은 서버리스 문서의 해당 섹션을 참조하십시오. [docs](https://serverless.com/framework/docs/providers/aws/events/schedule/).

### Cron expressions syntax

```
cron(Minutes Hours Day-of-month Month Day-of-week Year)
```

모든 필드는 필수적이며 표준 시간대는 UTC를 기준으로 합니다. (KST+09:00)

| 필드 | 허용된 값 | 와일드카드 |
| --- | --- | --- |
| Minutes | 0-59 | , - * / |
| Hours | 0-23 | , - * / |
| Day-of-month | 1-31 | , - * ? / L W |
| Month | 1-12 or JAN-DEC | , - * / |
| Day-of-week | 1-7 or SUN-SAT | , - * ? / L # |
| Year | 192199 | , - * / |

```
functions:    job-collector:        handler: handler.run        events:            # Invoke Lambda function every 2nd minute from Mon-Fri            - schedule: cron(0 * ? * MON-FRI *)
```

AWS CRON 레퍼런스 : [AWS docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html#CronExpressions).
