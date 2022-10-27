from datetime import datetime, timedelta


def set_queries(queries: dict):
    result = "?"
    for key, value in queries.items():
        if key and value:
            result += f"{key}={value}&"
    return result[:-1]


def date_to_string(dts: datetime, fmt: str):
    if fmt == 'day':
        return dts.strftime('%Y%m%d')
    elif fmt == 'month':
        return dts.strftime('%Y%m')
    elif fmt == 'year':
        return str(dts.year)
    elif fmt == 'M':
        return str(dts.month)


def object_to_list(data: dict):
    if all(isinstance(int(key), int) for key in data.keys()):
        return [x for x in data.values()]


def roll(today: datetime, func, chart_type: str, term: int, month: str, count: int):
    for n in range(count, 0, -1):
        n_month = timedelta(days=term * n)
        n_month_ago = today - n_month
        func(month, chart_type, n_month_ago)


def nth(tag: str, order: int): return f"{tag}:nth-child({order})"
def css(selectors: list): return " > ".join(selectors)

