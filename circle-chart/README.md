# Serverless Framework Python Scheduled Cron on AWS

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

*매달 둘째주 목요일 오전 10:10*에 해당 달에 새로 공개된 데이터에 한해 크롤링이 실행될 수 있도록 반복 설정
- 내용: 데이터 수집과 정제 기능을 AWS Lambda에 배포하고 주기적 설정 진행
  - python을 활용 데이터 수집 및 정제 진행
  - AWS Lambda로 배포하고 수집한 데이터와 정제된 데이터 모두 CSV 형태로 EFS에 저장 (S3와 다르게 append 가능)
  - 매달 둘째주 목요일 오전 10:10에 해당 달에 새로 공개된 데이터에 한해 크롤링이 실행될 수 있도록 반복 설정
  - 저장된 CSV는 매달 업데이트 되며, album chart 중 수집 가능한 모든 데이터가 수집되어 월별로 정리되어야 한다.

```yml
functions:
  worker:
    handler: handler.run
    events:
      - eventBridge:
          schedule: cron(10 1 ? * 2#4 *)
          # (10분 1시 ?일 매월 둘째주목요일 매년)
```

AWS CRON 레퍼런스 : [AWS docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html#CronExpressions).

## Usage

### Deployment

배포 순서
```shell
touch .env
```

```text
# crawler/.env

EFS_PATH=../data/
TMP_PATH=../data/
```

```shell
serverless login
```

```shell
serverless deploy --verbose
```

배포 시 다음과 같은 스크립트를 출력합니다.

```shell
  Deploying get-chart to stage dev (ap-northeast-2)

  ✔ Service deployed to stack get-chart (105s)

  functions:
    worker: get-chart-dev-worker (7.9 kB)
  layers:
    pythonRequirements: arn:aws:lambda:ap-northeast-2:784579398270:layer:requirements:19

  Stack Outputs:
    PythonRequirementsLambdaLayerS3Key: serverless/get-chart/dev/1666708312896-2022-10-25T14:31:52.896Z/pythonRequirements.zip
    WorkerLambdaFunctionQualifiedArn: arn:aws:lambda:ap-northeast-2:784579398270:function:get-chart-dev-worker:4
    PythonRequirementsLambdaLayerQualifiedArn: arn:aws:lambda:ap-northeast-2:784579398270:layer:requirements:19
    PythonRequirementsLambdaLayerHash: 967ca84335e6f03a1c7740d20801520720bd88cb
    ServerlessDeploymentBucketName: get-chart-serverlessdeploymentbucket-47r5f59t4gsl
```
이후 단계는 필수적이지 않습니다. 정의된 스케줄은 배포 후 즉시 활성화됩니다.

### Local invocation

기능을 테스트하려면 다음 명령을 사용하여 기능을 호출할 수 있습니다.

```shell
serverless invoke --verbose --function worker --path ./event.json 
```

오프라인 실행을 위해 `serverless-offline` 플러그인을 설치했습니다. 
[serverless docs.](https://www.serverless.com/plugins/serverless-offline)

```shell
serverless offline start --verbose
```

로컬에서 함수 컨테이너가 동작합니다. 다음의 명령어를 통해 실행할 수 있습니다.

```shell
aws lambda invoke /dev/log/ \     
  --endpoint-url http://localhost:3002 \
  --function get-chart-dev-worker --payload fileb://event.json
```

```shell
invoke                          배포된 함수를 호출합니다.
invoke local                    로컬 호출 함수를 로컬로 호출합니다.
--function / -f (required)      필수 입력. 함수 이름입니다.
--qualifier / -q                호출할 버전 번호 또는 별칭입니다.
--data / -d                     입력 데이터를 입력합니다.
--path / -p                     입력 데이터를 포함하는 JSON 또는 YAML 파일의 경로입니다.
--context                       서비스의 컨텍스트입니다.
--contextPath                   컨텍스트 데이터를 포함하는 JSON 또는 YAML 파일의 경로입니다.
--type / -t                     호출 유형입니다.
--log / -l                      로깅 데이터 출력을 트리거합니다.
--region / -r                   서비스의 지역입니다.
--aws-profile                   AWS 프로파일을 명령과 함께 사용합니다.
--use-local-credentials         대시보드 공급자 설정에서 로드하는 대신 로컬로 확인된 AWS 자격 증명을 사용합니다(대시보드와 통합된 서비스에만 적용).
--config / -c                   서버리스 구성 파일의 경로입니다.
--stage / -s                    서비스의 Stage입니다.
--param                         변수 소스에 대한 사용자 지정 매개 변수 값을 전달합니다(예: --param="key=value")
--version / -v                  버전 정보를 표시합니다.
--verbose                       상세 로그를 표시합니다.
--debug                         노출할 디버그 로그의 네임스페이스입니다(모두 표시하려면 "*"를 사용하십시오).
```

호출 시 다음과 유사한 출력이 표시됩니다.

```bash
[INFO]  2022-10-26T03:46:27.876Z  requests module version: 2.28.1
[INFO]	2022-10-26T03:46:30.181Z  EFS PATH: .	..	global_kpop_chart_cleanup.xlsx
[INFO]	2022-10-26T03:46:30.181Z  TMP PATH: .	..	album_chart.csv	global_kpop_chart.csv
[INFO]	2022-10-26T03:46:30.194Z  TARGET URL IS = https://circlechart.kr/data/api/chart/global?termGbn=month&yyyymmdd=202112
```

### Bundling dependencies

Serverless Plugin 중 하나인 `serverless-python-requirements`를 사용했습니다. 
다음과 같은 명령어로 설치 가능합니다.

```bash
serverless plugin install -n serverless-python-requirements
```

requirements.txt에 포함된 패키지들을 zip 파일 혹은 layer 형태로 배포하고, 함수에 연결합니다.

[official documentation](https://github.com/UnitedIncome/serverless-python-requirements).
