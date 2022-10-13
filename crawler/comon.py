import csv
from abc import ABC


global_file = open("../data/gaon_chart_all.csv", mode="w", newline="")
global_writer = csv.writer(global_file, dialect="excel")
album_file = open("../data/producer_all.csv", mode="w", newline="")
album_writer = csv.writer(album_file, dialect="excel")
gaon_header = [
    'selector',
    'selector-href',
    'image',
    'album',
    'artist',
    'distributor',
    'production',
    'ranking',
    'rank_status',
    'sales_volume',
    'title',
]
prod_header = [
    'link',
    'link-href',
    'image',
    'album',
    'artist',
    'distributor',
    'producer',
    'ranking',
    'rank_status',
    'sales_volume',
    'title',
]
global_writer.writerow(gaon_header)
album_writer.writerow(prod_header)


class Chart(ABC):
    month = ''
    link = ''
    image = 'https://circlechart.kr/assets/img/no_img.png'
    album = ''
    artist = ''
    distributor = ''
    producer = ''
    ranking = "101"
    rank_status = '-'
    sales_volume = "0 / 0"
    title = ''

    def to_csv(self):
        if self.__class__ is GlobalChart:
            writer = global_writer
        elif self.__class__ is AlbumChart:
            writer = album_writer
        writer.writerow([
            self.month,
            self.link,
            self.image,
            self.album,
            self.artist,
            self.distributor,
            self.producer,
            self.ranking,
            self.rank_status,
            self.sales_volume,
            self.title,
        ])
        return self.__dict__


class GlobalChart(Chart):
    month = ''  # 'selector'
    link = ''  # 'selector-href'
    image = 'https://circlechart.kr/assets/img/no_img.png'
    album = ''
    artist = ''
    distributor = ''
    producer = ''  # 'production'
    ranking = "101"
    rank_status = '-'
    sales_volume = "0 / 0"
    title = ''

    def __init__(self, data: dict, month, url):
        self.month = month[2:]
        self.link = url
        self.image = "https://circlechart.kr/uploadDir/" + data['ALBUMIMG']
        self.album = data['Album']
        self.artist = data['Artist']
        self.distributor = data['CompanyDist']
        self.producer = set_producer(data['CompanyMake'], data['Album'])
        self.ranking = data['Rank']  # 랭킹
        self.rank_status = str(data['RankStatus'])  # 전월대비 (+1)
        # self.sales_volume = data[""]
        self.title = data['Title']  # 곡명


class AlbumChart(Chart):
    month = ''  # 'link'
    link = ''  # 'link-href'
    image = ''
    album = ''
    artist = ''
    distributor = ''
    producer = ''
    ranking = "101"
    rank_status = '-'
    sales_volume = "0 / 0"
    title = ''

    def __init__(self, data: dict, month, url):
        self.month = month[2:]
        self.link = url
        self.image = "https://circlechart.kr" + data['FILE_NAME']
        self.album = data['ALBUM_NAME']
        self.artist = data['ARTIST_NAME']
        self.distributor = data['de_nm']
        self.producer = get_producer(data['ALBUM_NAME'])
        self.ranking = data['SERVICE_RANKING']  # 랭킹
        self.rank_status = rank_status(data['RankStatus'], data['RankChange'])  # 전월대비 (1up)
        # self.sales_volume = data["Total_CNT"]  # 앨범 판매량
        self.sales_volume = data["Album_CNT"] + " / " + data["Total_CNT"]  # 앨범 판매량 / 전체 판매량
        # self.title = data['']


def as_chart(data: dict, ts: str, url: str):
    if "Total_CNT" in data.keys():
        return AlbumChart(data, ts, url)
    elif "Title" in data.keys():
        return GlobalChart(data, ts, url)


def as_chart_array(array: list, ts: str, url: str):
    return [as_chart(x, ts, url).to_csv() for x in array]


def rank_status(status: str, change: str):
    if status == "new":
        return status
    elif change == "0":
        return ""
    else:
        if status == "down":
            return "-" + change
        else:
            return "+" + change


global_producers = dict()
global_total_counts = dict()


def set_producer(producer: str, album_name: str):
    if album_name not in global_producers.keys():
        global_producers[album_name] = producer
    else:
        global_producers[album_name] = ""
    return producer


def get_producer(album_name: str):
    if album_name in global_producers.keys():
        return global_producers[album_name]
    else:
        return ""
