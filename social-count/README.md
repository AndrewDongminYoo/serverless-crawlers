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

- 내용: 데이터 수집과 정제 기능을 AWS Lambda에 배포하고 주기적 동작 설정
    - python을 활용 데이터 수집 및 정제 진행
    - AWS Lambda로 배포하고, S3에서 직접 편집 가능한 entertainment.csv에서 주요 엔터사의 아티스트 리스트를 불러와 크롤링 (양식에 맞춰 추가 가능)
    - 매달 월요일 오전 9시에 리스트 내의 아티스트들의 채널을 대상으로 유튜브 조회수 및 트위터 팔로워 수를 API fetching
    - 가공된 데이터는 각각 S3버킷의 output 디렉토리 내에 youtube-yymmdd.xlsx, twitter-yymmdd.xlsx로 저장된다.

```yml
functions:
  cronHandler:
    handler: handler.run
    events:
      - eventBridge:
          schedule: cron(10 1 ? * 2#4 *)
          # (10분 1시 ?일 매월 둘째주목요일 매년)`
```

AWS CRON 레퍼런스 : [AWS docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html#CronExpressions).

## Usage

### Deployment

배포 순서

```shell
python3 -m pip install virtualenv
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
pip install boto3
```

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
  Deploying cron-artist to stage dev \(ap-northeast-2\)

  ✔ Service deployed to stack cron-artist \(105s\)

  functions:
    cronHandler: cron-artist-dev-cronHandler (4.3 kB)
  layers:
    pythonRequirements: arn:aws:lambda:ap-northeast-2:554974515599:layer:requirements:3

  Stack Outputs:
    PythonRequirementsLambdaLayerS3Key: serverless/cron-artist/dev/1666938272692-2022-10-28T06:24:32.692Z/pythonRequirements.zip
    PythonRequirementsLambdaLayerQualifiedArn: arn:aws:lambda:ap-northeast-2:554974515599:layer:requirements:3
    CronHandlerLambdaFunctionQualifiedArn: arn:aws:lambda:ap-northeast-2:554974515599:function:cron-artist-dev-cronHandler:4
    PythonRequirementsLambdaLayerHash: 3cfda4ae692ab70a693a486ccd043a8fe574126a
    ServerlessDeploymentBucketName: crawl-ytb-twt-serverlessdeploymentbucket-16wfzm7k4oqtv

```
이후 단계는 필수적이지 않습니다. 정의된 스케줄은 배포 후 즉시 활성화됩니다.

### Local invocation

기능을 테스트하려면 다음 명령을 사용하여 기능을 호출할 수 있습니다.

```shell
serverless invoke --verbose --function cronHandler
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
--use-local-credentials         대시보드 공급자 설정에서 로드하는 대신 로컬로 확인된 AWS 자격 증명을 사용합니다\(대시보드와 통합된 서비스에만 적용\).
--config / -c                   서버리스 구성 파일의 경로입니다.
--stage / -s                    서비스의 Stage입니다.
--param                         변수 소스에 대한 사용자 지정 매개 변수 값을 전달합니다\(예: --param="key=value"\)
--version / -v                  버전 정보를 표시합니다.
--verbose                       상세 로그를 표시합니다.
--debug                         노출할 디버그 로그의 네임스페이스입니다\(모두 표시하려면 "*"를 사용하십시오\).
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
