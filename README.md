# Bside Lays

`python`, `crawler`, `serverless`

## Circle chart

현재 크롤링은 크롬 익스텐션, 데이터 취합은 로컬 파이썬 스크립트로 진행하고 있습니다. 추후 lambda에 올려 자동화하고 TS로 변경해야 합니다.

써클차트는 국내 및 글로벌 음악 서비스 플랫폼의 K-pop 데이터를 정식 공급받는 국내 음악차트이며, 써클차트의 월간 음반 판매량은 연예기획사들의 매달 실적을 추정할 수 있는 좋은 지표입니다.

[써클차트]((https://circlechart.kr/))의 데이터는 매주 둘째주 목요일 오전 10시에 업데이트되며, 해당 데이터를 크롤링해야 합니다. 크롤링한 이후 해당 데이터를 `producer`와 `artist`별로 구분하여 저장해야 합니다. 결과 양식은 `merge_circle_chart_data.ipynb` 파일 참고.
