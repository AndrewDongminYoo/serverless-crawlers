class GlobalChart(object):
    month = ''
    link = ''
    image = ''
    album = ''
    artist = ''
    distributor = ''
    producer = ''
    ranking = "101"
    rank_status = '-'
    # sales_volume = "0"
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
        self.rank_status = data['RankStatus']  # 전월대비 (+1)
        # self.sales_volume = data[""]
        self.title = data['Title']  # 곡명


class AlbumChart(object):
    month = ''
    link = ''
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
        self.sales_volume = data["Album_CNT"] + " / " + data["Total_CNT"]  # 앨범 판매량
        # self.title = data['']


def as_chart(data: dict, ts: str, url: str):
    if "Total_CNT" in data.keys():
        return AlbumChart(data, ts, url)
    elif "Title" in data.keys():
        return GlobalChart(data, ts, url)


def as_chart_array(array: list, ts: str, url: str):
    return [as_chart(x, ts, url).__dict__ for x in array]


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
