import { CompanyFilter, Countries, Filters, JobSort, Language, Position, Tags, Year } from "./wanted.types"

const job_sort: Record<string, JobSort> = {
    "응답률순": "company.response_rate_order",
    "최신순": "job.latest_order",
    "보상금순": "job.compensation_order",
    "인기순": "job.popularity_order"
}

const company_tags: CompanyFilter[] = [
    {
        "key": 10158,
        "display": "업계연봉수준",
        "sub_tags": [
            {
                "display": "연봉업계평균이상",
                "key": 10021
            },
            {
                "display": "연봉상위1%",
                "key": 10022
            },
            {
                "display": "연봉상위2~5%",
                "key": 10023
            },
            {
                "display": "연봉상위6~10%",
                "key": 10024
            },
            {
                "display": "연봉상위11~20%",
                "key": 10025
            }
        ]
    },
    {
        "key": 10159,
        "display": "투자",
        "sub_tags": [
            {
                "display": "누적투자100억이상",
                "key": 10052
            }
        ]
    },
    {
        "key": 10160,
        "display": "인원성장률",
        "sub_tags": [
            {
                "display": "인원성장",
                "key": 10026
            },
            {
                "display": "인원급성장",
                "key": 10027
            }
        ]
    },
    {
        "key": 10161,
        "display": "퇴사율",
        "sub_tags": [
            {
                "display": "퇴사율5%이하",
                "key": 10036
            },
            {
                "display": "퇴사율 6~10%",
                "key": 10037
            }
        ]
    },
    {
        "key": 10162,
        "display": "인원수",
        "sub_tags": [
            {
                "display": "50명이하",
                "key": 10028
            },
            {
                "display": "51~300명",
                "key": 10029
            },
            {
                "display": "301~1,000명",
                "key": 10030
            },
            {
                "display": "1,001~10,000명",
                "key": 10031
            },
            {
                "display": "10,001명이상",
                "key": 10032
            }
        ]
    },
    {
        "key": 10163,
        "display": "업력",
        "sub_tags": [
            {
                "display": "설립3년이하",
                "key": 10033
            },
            {
                "display": "설립4~9년",
                "key": 10034
            },
            {
                "display": "설립10년이상",
                "key": 10035
            }
        ]
    },
    {
        "key": 10164,
        "display": "근무·휴가",
        "sub_tags": [
            {
                "display": "야근없음",
                "key": 9984
            },
            {
                "display": "유연근무",
                "key": 9986
            },
            {
                "display": "주35시간",
                "key": 10041
            },
            {
                "display": "주4일근무",
                "key": 10047
            },
            {
                "display": "육아휴직",
                "key": 10044
            },
            {
                "display": "출산휴가",
                "key": 10045
            },
            {
                "display": "리프레시휴가",
                "key": 10019
            }
        ]
    },
    {
        "key": 9948,
        "display": "보상",
        "sub_tags": [
            {
                "display": "성과급",
                "key": 9992
            },
            {
                "display": "상여금",
                "key": 9994
            },
            {
                "display": "연말보너스",
                "key": 10048
            },
            {
                "display": "스톡옵션",
                "key": 9993
            }
        ]
    },
    {
        "key": 9947,
        "display": "기업문화",
        "sub_tags": [
            {
                "display": "수평적조직",
                "key": 9987
            },
            {
                "display": "스타트업",
                "key": 9989
            },
            {
                "display": "자율복장",
                "key": 10043
            },
            {
                "display": "워크샵",
                "key": 10049
            },
            {
                "display": "반려동물",
                "key": 9988
            }
        ]
    },
    {
        "key": 10165,
        "display": "식사·간식",
        "sub_tags": [
            {
                "display": "조식제공",
                "key": 9997
            },
            {
                "display": "중식제공",
                "key": 10039
            },
            {
                "display": "석식제공",
                "key": 9996
            },
            {
                "display": "시리얼",
                "key": 9998
            },
            {
                "display": "식비",
                "key": 9999
            },
            {
                "display": "음료",
                "key": 9964
            },
            {
                "display": "맥주",
                "key": 9962
            },
            {
                "display": "커피",
                "key": 9963
            },
            {
                "display": "와인",
                "key": 9965
            },
            {
                "display": "샐러드",
                "key": 9966
            },
            {
                "display": "과일",
                "key": 9967
            },
            {
                "display": "간식",
                "key": 9968
            }
        ]
    },
    {
        "key": 9954,
        "display": "편의시설",
        "sub_tags": [
            {
                "display": "사내카페",
                "key": 9961
            },
            {
                "display": "사내식당",
                "key": 9995
            },
            {
                "display": "주차",
                "key": 10050
            },
            {
                "display": "수면실",
                "key": 10014
            },
            {
                "display": "휴게실",
                "key": 10015
            },
            {
                "display": "헬스장",
                "key": 10016
            },
            {
                "display": "위워크",
                "key": 10013
            },
            {
                "display": "수유실",
                "key": 10018
            },
            {
                "display": "안마의자",
                "key": 10017
            }
        ]
    },
    {
        "key": 9941,
        "display": "가족",
        "sub_tags": [
            {
                "display": "어린이집",
                "key": 9959
            },
            {
                "display": "보육시설",
                "key": 9960
            },
            {
                "display": "생일선물",
                "key": 9957
            },
            {
                "display": "결혼기념일",
                "key": 9958
            },
            {
                "display": "대출지원",
                "key": 10038
            }
        ]
    },
    {
        "key": 9945,
        "display": "출퇴근",
        "sub_tags": [
            {
                "display": "택시비",
                "key": 9980
            },
            {
                "display": "차량지원",
                "key": 9981
            },
            {
                "display": "원격근무",
                "key": 9983
            },
            {
                "display": "셔틀버스",
                "key": 10040
            },
            {
                "display": "기숙사",
                "key": 10008
            },
            {
                "display": "사택",
                "key": 10046
            },
            {
                "display": "재택근무",
                "key": 9982
            }
        ]
    },
    {
        "key": 10166,
        "display": "건강·여가",
        "sub_tags": [
            {
                "display": "건강검진",
                "key": 9969
            },
            {
                "display": "단체보험",
                "key": 9971
            },
            {
                "display": "의료비",
                "key": 9970
            },
            {
                "display": "운동비",
                "key": 10002
            },
            {
                "display": "문화비",
                "key": 10003
            },
            {
                "display": "동호회",
                "key": 10000
            },
            {
                "display": "복지포인트",
                "key": 10001
            }
        ]
    },
    {
        "key": 9944,
        "display": "교육",
        "sub_tags": [
            {
                "display": "교육비",
                "key": 9975
            },
            {
                "display": "직무교육",
                "key": 9979
            },
            {
                "display": "세미나참가비",
                "key": 9976
            },
            {
                "display": "컨퍼런스참가비",
                "key": 9977
            },
            {
                "display": "자기계발",
                "key": 9973
            },
            {
                "display": "도서구매비",
                "key": 9972
            },
            {
                "display": "스터디지원",
                "key": 9978
            },
            {
                "display": "어학교육",
                "key": 9974
            },
            {
                "display": "해외연수",
                "key": 10051
            }
        ]
    },
    {
        "key": 9956,
        "display": "기타",
        "sub_tags": [
            {
                "display": "산업기능요원",
                "key": 9990
            },
            {
                "display": "전문연구요원",
                "key": 9991
            },
            {
                "display": "인공지능",
                "key": 10011
            },
            {
                "display": "IoT",
                "key": 10012
            },
            {
                "display": "핀테크",
                "key": 10009
            },
            {
                "display": "푸드테크",
                "key": 10010
            },
            {
                "display": "Macbook",
                "key": 10004
            },
            {
                "display": "iMac",
                "key": 10005
            },
            {
                "display": "노트북",
                "key": 10006
            },
            {
                "display": "통신비",
                "key": 10007
            }
        ]
    }
]

const employee_count: Tags[] = [
    {
        "display": "전체",
        "key": "all"
    },
    {
        "display": "1~4명",
        "key": "1~4"
    },
    {
        "display": "5~10명",
        "key": "5~10"
    },
    {
        "display": "11~50명",
        "key": "11~50"
    },
    {
        "display": "51~200명",
        "key": "51~200"
    },
    {
        "display": "201~500명",
        "key": "201~500"
    },
    {
        "display": "501~1000명",
        "key": "501~1000"
    },
    {
        "display": "1001~5000명",
        "key": "1001~5000"
    },
    {
        "display": "5001~10000명",
        "key": "5001~10000"
    },
    {
        "display": "10001명 이상",
        "key": "10001~"
    }
]

const years: Record<string, Year> = {
    "전체": -1 ,
    "신입": 0 ,
    "1년": 1 ,
    "2년": 2 ,
    "3년": 3 ,
    "4년": 4 ,
    "5년": 5 ,
    "6년": 6 ,
    "7년": 7 ,
    "8년": 8 ,
    "9년": 9 ,
    "10년 이상": 10 ,
}

const countries: Countries[] = [
    {
        "display": "전세계",
        "key": "all",
        "locations": []
    },
    {
        "display": "대만",
        "key": "tw",
        "locations": [
            {
                "districts": [],
                "display": "All",
                "key": "all"
            },
            {
                "districts": [],
                "display": "Taipei City ",
                "key": "taipei-city"
            },
            {
                "districts": [],
                "display": "New Taipei City ",
                "key": "new-taipei-city"
            },
            {
                "districts": [],
                "display": "Taoyuan City ",
                "key": "taoyuan-city"
            },
            {
                "districts": [],
                "display": "Taichung City ",
                "key": "taichung-city"
            },
            {
                "districts": [],
                "display": "Tainan City ",
                "key": "tainan-city"
            },
            {
                "districts": [],
                "display": "Kaohsiung City ",
                "key": "kaohsiung-city"
            },
            {
                "districts": [],
                "display": "Keelung City ",
                "key": "keelung-city"
            },
            {
                "districts": [],
                "display": "Hsin-chu City ",
                "key": "hsin-chu-city"
            },
            {
                "districts": [],
                "display": "Hsin-chu County ",
                "key": "hsin-chu-country"
            },
            {
                "districts": [],
                "display": "Miaoli County ",
                "key": "miaoli-country"
            },
            {
                "districts": [],
                "display": "Chaiyi City ",
                "key": "chaiyi-city"
            },
            {
                "districts": [],
                "display": "Changhua County ",
                "key": "changhua-country"
            },
            {
                "districts": [],
                "display": "Nantou County ",
                "key": "nantou-country"
            },
            {
                "districts": [],
                "display": "Yunlin County ",
                "key": "yunlin-country"
            },
            {
                "districts": [],
                "display": "Chaiyi County ",
                "key": "chaiyi-country"
            },
            {
                "districts": [],
                "display": "Pingtung County ",
                "key": "pingtung-country"
            },
            {
                "districts": [],
                "display": "Yalin County ",
                "key": "yalin-country"
            },
            {
                "districts": [],
                "display": "Hualien County ",
                "key": "hualien-country"
            },
            {
                "districts": [],
                "display": "Taitung County ",
                "key": "taitung-country"
            },
            {
                "districts": [],
                "display": "Wuhu County ",
                "key": "wuhu-country"
            },
            {
                "districts": [],
                "display": "Jinmen County ",
                "key": "jinmen-country"
            },
            {
                "districts": [],
                "display": "Matsu ",
                "key": "matsu"
            }
        ]
    },
    {
        "display": "싱가폴",
        "key": "sg",
        "locations": [
            {
                "districts": [],
                "display": "All",
                "key": "all"
            }
        ]
    },
    {
        "display": "일본",
        "key": "jp",
        "locations": [
            {
                "districts": [],
                "display": "All",
                "key": "all"
            },
            {
                "districts": [],
                "display": "Tokyo",
                "key": "tokyo"
            },
            {
                "districts": [],
                "display": "Kanagawa",
                "key": "kanagawa"
            },
            {
                "districts": [],
                "display": "Chiba",
                "key": "chiba"
            },
            {
                "districts": [],
                "display": "Aichi",
                "key": "aichi"
            },
            {
                "districts": [],
                "display": "Osaka",
                "key": "osaka"
            },
            {
                "districts": [],
                "display": "Hyogo",
                "key": "hyogo"
            },
            {
                "districts": [],
                "display": "Kyoto",
                "key": "kyoto"
            },
            {
                "districts": [],
                "display": "Fukuoka",
                "key": "hukuoka"
            },
            {
                "districts": [],
                "display": "Okinawa",
                "key": "okinawa"
            },
            {
                "districts": [],
                "display": "Hokkaido",
                "key": "hokkaido"
            },
            {
                "districts": [],
                "display": "Saitama",
                "key": "saitama"
            },
            {
                "districts": [],
                "display": "Hioshima",
                "key": "hioshima"
            },
            {
                "districts": [],
                "display": "Miyagi",
                "key": "miyagi"
            },
            {
                "districts": [],
                "display": "Etc",
                "key": "etc"
            }
        ]
    },
    {
        "display": "한국",
        "key": "kr",
        "locations": [
            {
                "districts": [],
                "display": "전국",
                "key": "all"
            },
            {
                "districts": [
                    {
                        "display": "전체",
                        "key": "seoul.all"
                    },
                    {
                        "display": "강남구",
                        "key": "seoul.gangnam-gu"
                    },
                    {
                        "display": "강동구",
                        "key": "seoul.gangdong-gu"
                    },
                    {
                        "display": "강북구",
                        "key": "seoul.gangbuk-gu"
                    },
                    {
                        "display": "강서구",
                        "key": "seoul.gangseo-gu"
                    },
                    {
                        "display": "관악구",
                        "key": "seoul.gwanak-gu"
                    },
                    {
                        "display": "광진구",
                        "key": "seoul.gwangjin-gu"
                    },
                    {
                        "display": "구로구",
                        "key": "seoul.guro-gu"
                    },
                    {
                        "display": "금천구",
                        "key": "seoul.geumcheon-gu"
                    },
                    {
                        "display": "노원구",
                        "key": "seoul.nowon-gu"
                    },
                    {
                        "display": "도봉구",
                        "key": "seoul.dobong-gu"
                    },
                    {
                        "display": "동대문구",
                        "key": "seoul.dongdaemun-gu"
                    },
                    {
                        "display": "동작구",
                        "key": "seoul.dongjak-gu"
                    },
                    {
                        "display": "마포구",
                        "key": "seoul.mapo-gu"
                    },
                    {
                        "display": "서대문구",
                        "key": "seoul.seodaemun-gu"
                    },
                    {
                        "display": "서초구",
                        "key": "seoul.seocho-gu"
                    },
                    {
                        "display": "성동구",
                        "key": "seoul.seongdong-gu"
                    },
                    {
                        "display": "성북구",
                        "key": "seoul.seongbuk-gu"
                    },
                    {
                        "display": "송파구",
                        "key": "seoul.songpa-gu"
                    },
                    {
                        "display": "양천구",
                        "key": "seoul.yangcheon-gu"
                    },
                    {
                        "display": "영등포구",
                        "key": "seoul.yeongdeungpo-gu"
                    },
                    {
                        "display": "용산구",
                        "key": "seoul.yongsan-gu"
                    },
                    {
                        "display": "은평구",
                        "key": "seoul.eunpyeong-gu"
                    },
                    {
                        "display": "종로구",
                        "key": "seoul.jongno-gu"
                    },
                    {
                        "display": "중구",
                        "key": "seoul.jung-gu"
                    },
                    {
                        "display": "중랑구",
                        "key": "seoul.jungnang-gu"
                    }
                ],
                "display": "서울",
                "key": "seoul"
            },
            {
                "districts": [
                    {
                        "display": "전체",
                        "key": "busan.all"
                    },
                    {
                        "display": "강서구",
                        "key": "busan.gangseo-gu"
                    },
                    {
                        "display": "금정구",
                        "key": "busan.gumjung-gu"
                    },
                    {
                        "display": "남구",
                        "key": "busan.nam-gu"
                    },
                    {
                        "display": "동구",
                        "key": "busan.dong-gu"
                    },
                    {
                        "display": "동래구",
                        "key": "busan.dongnae-gu"
                    },
                    {
                        "display": "부산진구",
                        "key": "busan.busanjin-gu"
                    },
                    {
                        "display": "북구",
                        "key": "busan.buk-gu"
                    },
                    {
                        "display": "사상구",
                        "key": "busan.sasang-gu"
                    },
                    {
                        "display": "사하구",
                        "key": "busan.saha-gu"
                    },
                    {
                        "display": "서구",
                        "key": "busan.seo-gu"
                    },
                    {
                        "display": "수영구",
                        "key": "busan.suyeong-gu"
                    },
                    {
                        "display": "연제구",
                        "key": "busan.yeonje-gu"
                    },
                    {
                        "display": "영도구",
                        "key": "busan.yeongdo-gu"
                    },
                    {
                        "display": "중구",
                        "key": "busan.jung-gu"
                    },
                    {
                        "display": "해운대구",
                        "key": "busan.haeundae-gu"
                    },
                    {
                        "display": "기장군",
                        "key": "busan.gijang-gun"
                    }
                ],
                "display": "부산",
                "key": "busan"
            },
            {
                "districts": [
                    {
                        "display": "전체",
                        "key": "daegu.all"
                    },
                    {
                        "display": "남구",
                        "key": "daegu.nam-gu"
                    },
                    {
                        "display": "달서구",
                        "key": "daegu.dalseo-gu"
                    },
                    {
                        "display": "동구",
                        "key": "daegu.dong-gu"
                    },
                    {
                        "display": "북구",
                        "key": "daegu.buk-gu"
                    },
                    {
                        "display": "서구",
                        "key": "daegu.seo-gu"
                    },
                    {
                        "display": "수성구",
                        "key": "daegu.suseong-gu"
                    },
                    {
                        "display": "중구",
                        "key": "daegu.jung-gu"
                    },
                    {
                        "display": "달성군",
                        "key": "daegu.dalseong-gun"
                    }
                ],
                "display": "대구",
                "key": "daegu"
            },
            {
                "districts": [
                    {
                        "display": "전체",
                        "key": "incheon.all"
                    },
                    {
                        "display": "계양구",
                        "key": "incheon.gyeyang-gu"
                    },
                    {
                        "display": "미추홀구",
                        "key": "incheon.michuhol-gu"
                    },
                    {
                        "display": "남동구",
                        "key": "incheon.namdong-gu"
                    },
                    {
                        "display": "동구",
                        "key": "incheon.dong-gu"
                    },
                    {
                        "display": "부평구",
                        "key": "incheon.bupyeong-gu"
                    },
                    {
                        "display": "서구",
                        "key": "incheon.seo-gu"
                    },
                    {
                        "display": "연수구",
                        "key": "incheon.yeonsu-gu"
                    },
                    {
                        "display": "중구",
                        "key": "incheon.jung-gu"
                    },
                    {
                        "display": "강화군",
                        "key": "incheon.ganghwa-gun"
                    },
                    {
                        "display": "옹진군",
                        "key": "incheon.ongjin-gun"
                    }
                ],
                "display": "인천",
                "key": "incheon"
            },
            {
                "districts": [
                    {
                        "display": "전체",
                        "key": "gwangju.all"
                    },
                    {
                        "display": "광산구",
                        "key": "gwangju.gwangsan-gu"
                    },
                    {
                        "display": "남구",
                        "key": "gwangju.nam-gu"
                    },
                    {
                        "display": "동구",
                        "key": "gwangju.dong-gu"
                    },
                    {
                        "display": "북구",
                        "key": "gwangju.buk-gu"
                    },
                    {
                        "display": "서구",
                        "key": "gwangju.seo-gu"
                    }
                ],
                "display": "광주",
                "key": "gwangju"
            },
            {
                "districts": [
                    {
                        "display": "전체",
                        "key": "daejeon.all"
                    },
                    {
                        "display": "대덕구",
                        "key": "daejeon.daedeok-gu"
                    },
                    {
                        "display": "동구",
                        "key": "daejeon.dong-gu"
                    },
                    {
                        "display": "서구",
                        "key": "daejeon.seo-gu"
                    },
                    {
                        "display": "유성구",
                        "key": "daejeon.yuseong-gu"
                    },
                    {
                        "display": "중구",
                        "key": "daejeon.jung-gu"
                    }
                ],
                "display": "대전",
                "key": "daejeon"
            },
            {
                "districts": [
                    {
                        "display": "전체",
                        "key": "ulsan.all"
                    },
                    {
                        "display": "남구",
                        "key": "ulsan.nam-gu"
                    },
                    {
                        "display": "동구",
                        "key": "ulsan.dong-gu"
                    },
                    {
                        "display": "북구",
                        "key": "ulsan.buk-gu"
                    },
                    {
                        "display": "중구",
                        "key": "ulsan.jung-gu"
                    },
                    {
                        "display": "울주군",
                        "key": "ulsan.ulju-gun"
                    }
                ],
                "display": "울산",
                "key": "ulsan"
            },
            {
                "districts": [
                    {
                        "display": "전체",
                        "key": "sejong.all"
                    }
                ],
                "display": "세종",
                "key": "sejong"
            },
            {
                "districts": [
                    {
                        "display": "전체",
                        "key": "gyeonggi.all"
                    },
                    {
                        "display": "수원시",
                        "key": "gyeonggi.suwon-si"
                    },
                    {
                        "display": "고양시",
                        "key": "gyeonggi.goyang-si"
                    },
                    {
                        "display": "성남시",
                        "key": "gyeonggi.seongnam-si"
                    },
                    {
                        "display": "용인시",
                        "key": "gyeonggi.yongin-si"
                    },
                    {
                        "display": "부천시",
                        "key": "gyeonggi.bucheon-si"
                    },
                    {
                        "display": "안산시",
                        "key": "gyeonggi.ansan-si"
                    },
                    {
                        "display": "남양주시",
                        "key": "gyeonggi.namyangju-si"
                    },
                    {
                        "display": "안양시",
                        "key": "gyeonggi.anyang-si"
                    },
                    {
                        "display": "화성시",
                        "key": "gyeonggi.hwaseong-si"
                    },
                    {
                        "display": "평택시",
                        "key": "gyeonggi.pyeongtaek-si"
                    },
                    {
                        "display": "의정부시",
                        "key": "gyeonggi.uijeongbu-si"
                    },
                    {
                        "display": "시흥시",
                        "key": "gyeonggi.siheung-si"
                    },
                    {
                        "display": "파주시",
                        "key": "gyeonggi.paju-si"
                    },
                    {
                        "display": "김포시",
                        "key": "gyeonggi.gimpo-si"
                    },
                    {
                        "display": "광명시",
                        "key": "gyeonggi.gwangmyeong-si"
                    },
                    {
                        "display": "광주시",
                        "key": "gyeonggi.gwangju-si"
                    },
                    {
                        "display": "군포시",
                        "key": "gyeonggi.gunpo-si"
                    },
                    {
                        "display": "오산시",
                        "key": "gyeonggi.osan-si"
                    },
                    {
                        "display": "이천시",
                        "key": "gyeonggi.icheon-si"
                    },
                    {
                        "display": "양주시",
                        "key": "gyeonggi.yangju-si"
                    },
                    {
                        "display": "안성시",
                        "key": "gyeonggi.anseong-si"
                    },
                    {
                        "display": "구리시",
                        "key": "gyeonggi.guri-si"
                    },
                    {
                        "display": "포천시",
                        "key": "gyeonggi.pocheon-si"
                    },
                    {
                        "display": "의왕시",
                        "key": "gyeonggi.uiwang-si"
                    },
                    {
                        "display": "하남시",
                        "key": "gyeonggi.hanam-si"
                    },
                    {
                        "display": "여주시",
                        "key": "gyeonggi.yeoju-si"
                    },
                    {
                        "display": "양평군",
                        "key": "gyeonggi.yangpyeong-gun"
                    },
                    {
                        "display": "동두천시",
                        "key": "gyeonggi.dongducheon-si"
                    },
                    {
                        "display": "과천시",
                        "key": "gyeonggi.gwacheon-si"
                    },
                    {
                        "display": "가평군",
                        "key": "gyeonggi.gapyeong-gun"
                    },
                    {
                        "display": "연천군",
                        "key": "gyeonggi.yeoncheon-gun"
                    }
                ],
                "display": "경기",
                "key": "gyeonggi"
            },
            {
                "districts": [
                    {
                        "display": "전체",
                        "key": "gangwon.all"
                    },
                    {
                        "display": "강릉시",
                        "key": "gangwon.gangneung-si"
                    },
                    {
                        "display": "동해시",
                        "key": "gangwon.donghae-si"
                    },
                    {
                        "display": "삼척시",
                        "key": "gangwon.samcheok-si"
                    },
                    {
                        "display": "속초시",
                        "key": "gangwon.sokcho-si"
                    },
                    {
                        "display": "원주시",
                        "key": "gangwon.wonju-si"
                    },
                    {
                        "display": "춘천시",
                        "key": "gangwon.chuncheon-si"
                    },
                    {
                        "display": "태백시",
                        "key": "gangwon.taebaek-si"
                    },
                    {
                        "display": "고성군",
                        "key": "gangwon.goseong-gun"
                    },
                    {
                        "display": "양구군",
                        "key": "gangwon.yanggu-gun"
                    },
                    {
                        "display": "양양군",
                        "key": "gangwon.yangyang-gun"
                    },
                    {
                        "display": "영월군",
                        "key": "gangwon.yeongwol-gun"
                    },
                    {
                        "display": "인제군",
                        "key": "gangwon.inje-gun"
                    },
                    {
                        "display": "정선군",
                        "key": "gangwon.jeongseon-gun"
                    },
                    {
                        "display": "철원군",
                        "key": "gangwon.cheorwon-gun"
                    },
                    {
                        "display": "평창군",
                        "key": "gangwon.pyeongchang-gun"
                    },
                    {
                        "display": "홍천군",
                        "key": "gangwon.hongcheon-gun"
                    },
                    {
                        "display": "화천군",
                        "key": "gangwon.hwacheon-gun"
                    },
                    {
                        "display": "횡성군",
                        "key": "gangwon.hoengseong-gun"
                    }
                ],
                "display": "강원",
                "key": "gangwon"
            },
            {
                "districts": [
                    {
                        "display": "전체",
                        "key": "n-chungcheong.all"
                    },
                    {
                        "display": "제천시",
                        "key": "n-chungcheong.jecheon-si"
                    },
                    {
                        "display": "청주시",
                        "key": "n-chungcheong.cheongju-si"
                    },
                    {
                        "display": "충주시",
                        "key": "n-chungcheong.chungju-si"
                    },
                    {
                        "display": "괴산군",
                        "key": "n-chungcheong.goesan-gun"
                    },
                    {
                        "display": "단양군",
                        "key": "n-chungcheong.danyang-gun"
                    },
                    {
                        "display": "보은군",
                        "key": "n-chungcheong.boeun-gun"
                    },
                    {
                        "display": "영동군",
                        "key": "n-chungcheong.yeongdong-gun"
                    },
                    {
                        "display": "옥천군",
                        "key": "n-chungcheong.okcheon-gun"
                    },
                    {
                        "display": "음성군",
                        "key": "n-chungcheong.eumseong-gun"
                    },
                    {
                        "display": "진천군",
                        "key": "n-chungcheong.jincheon-gun"
                    },
                    {
                        "display": "증평군",
                        "key": "n-chungcheong.jeungpyeong-gun"
                    },
                    {
                        "display": "청원군",
                        "key": "n-chungcheong.cheongwon-gun"
                    }
                ],
                "display": "충북",
                "key": "n-chungcheong"
            },
            {
                "districts": [
                    {
                        "display": "전체",
                        "key": "s-chungcheong.all"
                    },
                    {
                        "display": "공주시",
                        "key": "s-chungcheong.gongju-si"
                    },
                    {
                        "display": "논산시",
                        "key": "s-chungcheong.nonsan-si"
                    },
                    {
                        "display": "보령시",
                        "key": "s-chungcheong.boryeong-si"
                    },
                    {
                        "display": "서산시",
                        "key": "s-chungcheong.seosan-si"
                    },
                    {
                        "display": "아산시",
                        "key": "s-chungcheong.asan-si"
                    },
                    {
                        "display": "천안시",
                        "key": "s-chungcheong.cheonan-si"
                    },
                    {
                        "display": "금산군",
                        "key": "s-chungcheong.geumsan-gun"
                    },
                    {
                        "display": "당진시",
                        "key": "s-chungcheong.dangjin-si"
                    },
                    {
                        "display": "부여군",
                        "key": "s-chungcheong.buyeo-gun"
                    },
                    {
                        "display": "서천군",
                        "key": "s-chungcheong.seocheon-gun"
                    },
                    {
                        "display": "연기군",
                        "key": "s-chungcheong.yeongi-gun"
                    },
                    {
                        "display": "예산군",
                        "key": "s-chungcheong.yesan-gun"
                    },
                    {
                        "display": "청양군",
                        "key": "s-chungcheong.cheongyang-gun"
                    },
                    {
                        "display": "태안군",
                        "key": "s-chungcheong.taean-gun"
                    },
                    {
                        "display": "홍성군",
                        "key": "s-chungcheong.hongseong-gun"
                    }
                ],
                "display": "충남",
                "key": "s-chungcheong"
            },
            {
                "districts": [
                    {
                        "display": "전체",
                        "key": "n-jeolla.all"
                    },
                    {
                        "display": "군산시",
                        "key": "n-jeolla.gunsan-si"
                    },
                    {
                        "display": "김제시",
                        "key": "n-jeolla.gimje-si"
                    },
                    {
                        "display": "남원시",
                        "key": "n-jeolla.namwon-si"
                    },
                    {
                        "display": "익산시",
                        "key": "n-jeolla.iksan-si"
                    },
                    {
                        "display": "전주시",
                        "key": "n-jeolla.jeonju-si"
                    },
                    {
                        "display": "정읍시",
                        "key": "n-jeolla.jeongeup-si"
                    },
                    {
                        "display": "고창군",
                        "key": "n-jeolla.gochang-gun"
                    },
                    {
                        "display": "무주군",
                        "key": "n-jeolla.muju-gun"
                    },
                    {
                        "display": "부안군",
                        "key": "n-jeolla.buan-gun"
                    },
                    {
                        "display": "순창군",
                        "key": "n-jeolla.sunchang-gun"
                    },
                    {
                        "display": "완주군",
                        "key": "n-jeolla.wanju-gun"
                    },
                    {
                        "display": "임실군",
                        "key": "n-jeolla.imsil-gun"
                    },
                    {
                        "display": "장수군",
                        "key": "n-jeolla.jangsu-gun"
                    },
                    {
                        "display": "진안군",
                        "key": "n-jeolla.jinan-gun"
                    }
                ],
                "display": "전북",
                "key": "n-jeolla"
            },
            {
                "districts": [
                    {
                        "display": "전체",
                        "key": "s-jeolla.all"
                    },
                    {
                        "display": "광양시",
                        "key": "s-jeolla.gwangyang-si"
                    },
                    {
                        "display": "나주시",
                        "key": "s-jeolla.naju-si"
                    },
                    {
                        "display": "목포시",
                        "key": "s-jeolla.mokpo-si"
                    },
                    {
                        "display": "순천시",
                        "key": "s-jeolla.suncheon-si"
                    },
                    {
                        "display": "여수시",
                        "key": "s-jeolla.yeosu-si"
                    },
                    {
                        "display": "강진군",
                        "key": "s-jeolla.gangjin-gun"
                    },
                    {
                        "display": "고흥군",
                        "key": "s-jeolla.goheung-gun"
                    },
                    {
                        "display": "곡성군",
                        "key": "s-jeolla.gokseong-gun"
                    },
                    {
                        "display": "구례군",
                        "key": "s-jeolla.gurye-gun"
                    },
                    {
                        "display": "담양군",
                        "key": "s-jeolla.damyang-gun"
                    },
                    {
                        "display": "무안군",
                        "key": "s-jeolla.muan-gun"
                    },
                    {
                        "display": "보성군",
                        "key": "s-jeolla.boseong-gun"
                    },
                    {
                        "display": "신안군",
                        "key": "s-jeolla.sinan-gun"
                    },
                    {
                        "display": "영광군",
                        "key": "s-jeolla.yeonggwang-gun"
                    },
                    {
                        "display": "영암군",
                        "key": "s-jeolla.yeongam-gun"
                    },
                    {
                        "display": "완도군",
                        "key": "s-jeolla.wando-gun"
                    },
                    {
                        "display": "장성군",
                        "key": "s-jeolla.jangseong-gun"
                    },
                    {
                        "display": "장흥군",
                        "key": "s-jeolla.jangheung-gun"
                    },
                    {
                        "display": "진도군",
                        "key": "s-jeolla.jindo-gun"
                    },
                    {
                        "display": "함평군",
                        "key": "s-jeolla.hampyeong-gun"
                    },
                    {
                        "display": "해남군",
                        "key": "s-jeolla.haenam-gun"
                    },
                    {
                        "display": "화순군",
                        "key": "s-jeolla.hwasun-gun"
                    }
                ],
                "display": "전남",
                "key": "s-jeolla"
            },
            {
                "districts": [
                    {
                        "display": "전체",
                        "key": "n-gyeongsang.all"
                    },
                    {
                        "display": "경산시",
                        "key": "n-gyeongsang.gyeongsan-si"
                    },
                    {
                        "display": "경주시",
                        "key": "n-gyeongsang.gyeongju-si"
                    },
                    {
                        "display": "구미시",
                        "key": "n-gyeongsang.gumi-si"
                    },
                    {
                        "display": "김천시",
                        "key": "n-gyeongsang.gimcheon-si"
                    },
                    {
                        "display": "문경시",
                        "key": "n-gyeongsang.mungyeong-si"
                    },
                    {
                        "display": "상주시",
                        "key": "n-gyeongsang.sangju-si"
                    },
                    {
                        "display": "안동시",
                        "key": "n-gyeongsang.andong-si"
                    },
                    {
                        "display": "영주시",
                        "key": "n-gyeongsang.yeongju-si"
                    },
                    {
                        "display": "영천시",
                        "key": "n-gyeongsang.yeongcheon-si"
                    },
                    {
                        "display": "포항시",
                        "key": "n-gyeongsang.pohang-si"
                    },
                    {
                        "display": "고령군",
                        "key": "n-gyeongsang.goryeong-gun"
                    },
                    {
                        "display": "군위군",
                        "key": "n-gyeongsang.gunwi-gun"
                    },
                    {
                        "display": "봉화군",
                        "key": "n-gyeongsang.bonghwa-gun"
                    },
                    {
                        "display": "성주군",
                        "key": "n-gyeongsang.seongju-gun"
                    },
                    {
                        "display": "영덕군",
                        "key": "n-gyeongsang.yeongdeok-gun"
                    },
                    {
                        "display": "영양군",
                        "key": "n-gyeongsang.yeongyang-gun"
                    },
                    {
                        "display": "예천군",
                        "key": "n-gyeongsang.yecheon-gun"
                    },
                    {
                        "display": "울릉군",
                        "key": "n-gyeongsang.ulleung-gun"
                    },
                    {
                        "display": "울진군",
                        "key": "n-gyeongsang.uljin-gun"
                    },
                    {
                        "display": "의성군",
                        "key": "n-gyeongsang.uiseong-gun"
                    },
                    {
                        "display": "청도군",
                        "key": "n-gyeongsang.cheongdo-gun"
                    },
                    {
                        "display": "청송군",
                        "key": "n-gyeongsang.cheongsong-gun"
                    },
                    {
                        "display": "칠곡군",
                        "key": "n-gyeongsang.chilgok-gun"
                    }
                ],
                "display": "경북",
                "key": "n-gyeongsang"
            },
            {
                "districts": [
                    {
                        "display": "전체",
                        "key": "s-gyeongsang.all"
                    },
                    {
                        "display": "거제시",
                        "key": "s-gyeongsang.geoje-si"
                    },
                    {
                        "display": "김해시",
                        "key": "s-gyeongsang.gimhae-si"
                    },
                    {
                        "display": "밀양시",
                        "key": "s-gyeongsang.miryang-si"
                    },
                    {
                        "display": "사천시",
                        "key": "s-gyeongsang.sacheon-si"
                    },
                    {
                        "display": "양산시",
                        "key": "s-gyeongsang.yangsan-si"
                    },
                    {
                        "display": "진주시",
                        "key": "s-gyeongsang.jinju-si"
                    },
                    {
                        "display": "창원시",
                        "key": "s-gyeongsang.changwon-si"
                    },
                    {
                        "display": "통영시",
                        "key": "s-gyeongsang.tongyeong-si"
                    },
                    {
                        "display": "거창군",
                        "key": "s-gyeongsang.geochang-gun"
                    },
                    {
                        "display": "고성군",
                        "key": "s-gyeongsang.goseong-gun"
                    },
                    {
                        "display": "남해군",
                        "key": "s-gyeongsang.namhae-gun"
                    },
                    {
                        "display": "산청군",
                        "key": "s-gyeongsang.sancheong-gun"
                    },
                    {
                        "display": "의령군",
                        "key": "s-gyeongsang.uiryeong-gun"
                    },
                    {
                        "display": "창녕군",
                        "key": "s-gyeongsang.changnyeong-gun"
                    },
                    {
                        "display": "하동군",
                        "key": "s-gyeongsang.hadong-gun"
                    },
                    {
                        "display": "함안군",
                        "key": "s-gyeongsang.haman-gun"
                    },
                    {
                        "display": "함양군",
                        "key": "s-gyeongsang.hamyang-gun"
                    },
                    {
                        "display": "합천군",
                        "key": "s-gyeongsang.hapcheon-gun"
                    }
                ],
                "display": "경남",
                "key": "s-gyeongsang"
            },
            {
                "districts": [
                    {
                        "display": "전체",
                        "key": "jeju.all"
                    },
                    {
                        "display": "서귀포시",
                        "key": "jeju.seogwipo-si"
                    },
                    {
                        "display": "제주시",
                        "key": "jeju.jeju-si"
                    }
                ],
                "display": "제주",
                "key": "jeju"
            }
        ]
    },
    {
        "display": "기타",
        "key": "others",
        "locations": []
    }
]

const positions: Record<Position, number> = {
    "개발 전체": 518,
    "데이터 엔지니어": 655,
    "임베디드 개발자": 658,
    "자바 개발자": 660,
    ".NET 개발자": 661,
    "시스템,네트워크 관리자": 665,
    "프론트엔드 개발자": 669,
    "보안 엔지니어": 671,
    "하드웨어 엔지니어": 672,
    "DevOps / 시스템 관리자": 674,
    "QA,테스트 엔지니어": 676,
    "안드로이드 개발자": 677,
    "iOS 개발자": 678,
    "CIO,Chief Information Officer": 793,
    "CTO,Chief Technology Officer": 795,
    "서버 개발자": 872,
    "웹 개발자": 873,
    "프로덕트 매니저": 876,
    "개발 매니저": 877,
    "PHP 개발자": 893,
    "루비온레일즈 개발자": 894,
    "Node.js 개발자": 895,
    "영상,음성 엔지니어": 896,
    "그래픽스 엔지니어": 898,
    "파이썬 개발자": 899,
    "C,C++ 개발자": 900,
    "웹 퍼블리셔": 939,
    "데이터 사이언티스트": 1024,
    "빅데이터 엔지니어": 1025,
    "기술지원": 1026,
    "블록체인 플랫폼 엔지니어": 1027,
    "머신러닝 엔지니어": 1634,
    "소프트웨어 엔지니어": 10110,
    "크로스플랫폼 앱 개발자": 10111,
    "VR 엔지니어": 10112,
    "BI 엔지니어": 1022,
    "ERP전문가": 10230,
    "DBA": 10231,
}

const languages: Record<Language, number> = {
    "Git":                  1411,
    "Github":               1412,
    "Android":              1438,
    "iOS":                  1457,
    "Linux":                1459,
    "MySQL":                1464,
    "React":                1469,
    "C / C++":              1530,
    "HTML":                 1539,
    "JavaScript":           1541,
    "Kotlin":               1544,
    "PHP":                  1552,
    "Python":               1554,
    "SQL":                  1562,
    "Swift":                1563,
    "AWS":                  1698,
    "C++":                  1786,
    "Docker":               2217,
    "Spring Framework":     3078,
    "JPA":                  3451
}

const filters: Filters = {
    job_sort,
    company_tags,
    employee_count,
    years,
    countries,
    languages,
    positions
}

export default filters;