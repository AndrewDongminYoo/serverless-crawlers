from pandas import DataFrame as dF, read_csv, ExcelWriter, merge, pivot_table
import numpy as np

# Get sales data from raw gaon chart data

CHART_PATH = '../data/gaon_chart_all.csv'
PRODUCER_PATH = '../data/producer_all.csv'
OUTPUT_PATH = '../data/gaon_chart_all_cleanup.xlsx'


def sales_clean_up():
    sales = read_csv(CHART_PATH, usecols=['selector', 'production', 'title', 'artist', 'sales_volume'])
    sales.rename(columns={'selector': 'month'}, inplace=True)
    sales = sales.astype({'month': 'int32'}, errors='raise')
    sales[['monthly_sales', 'annual_sales']]\
        = sales['sales_volume'].str.split(pat='/', n=1, expand=True)
    sales = sales.astype({'monthly_sales': 'int32', 'annual_sales': 'int32'}, errors='raise')
    sales = sales.drop(columns=['sales_volume']).drop_duplicates(
        ['title', 'artist', 'month'])
    sales = sales.reindex(
        columns=['month', 'title', 'artist', 'production', 'monthly_sales', 'annual_sales'])
    sales = sales.sort_values(by=['month', 'monthly_sales'])
    return sales


def producer_clean_up():
    # Get producer data from raw gaon chart data
    producer = read_csv(PRODUCER_PATH, usecols=['link', 'artist', 'producer'])
    producer.rename(columns={"link": "month"}, inplace=True)
    producer = producer.astype({'month': 'int32'}, errors='raise')
    producer['artist'] = producer['artist'].str.split(pat='|', n=1).str[0]
    producer = producer.drop_duplicates(
        subset=['artist', 'producer'], keep='first')
    # Caution: Some artists has multiple agencies that has changed
    producer = producer.reindex(columns=['artist', 'month', 'producer'])
    producer = producer.sort_values(by=['artist', 'month'])
    return producer


def merge_sales_with_producer(sales: dF, producer: dF):
    # Search producer from producer dataframe and insert into new_sales
    new_sales = merge(left=sales, right=producer, how='left', on='artist')  # merge two dataframe
    # clean up the data
    new_sales['month_y'] = new_sales['month_y'].fillna(1800)
    new_sales['producer'] = new_sales['producer'].fillna('미상')
    new_sales = new_sales.astype({'month_y': 'int32'}, errors='raise')
    # find the producer artist belonged to before the release of the album
    new_sales = new_sales.sort_values('month_y', ascending=True).drop_duplicates(['title', 'artist', 'month_x'])
    new_sales.rename(columns={'month_x': 'month'}, inplace=True)
    new_sales = new_sales.drop(columns=['month_y'])
    new_sales = new_sales.reindex(
        columns=['month', 'title', 'artist', 'producer', 'production', 'monthly_sales', 'annual_sales'])
    new_sales = new_sales.sort_values(by=['month', 'monthly_sales'])
    return new_sales


def pivot_data(new_sales: dF):
    return pivot_table(
        new_sales,
        values="monthly_sales",
        index=['producer', 'artist', 'title'],
        columns="month",
        aggfunc=np.sum
    ).fillna(0)


def save_to_excel(sales_table: dF, new_sales: dF, sales: dF, producer: dF):
    data_frames = {
        'cleanup': sales_table,
        'sales_with_producer': new_sales,
        'raw_sales': sales,
        'raw_producer': producer,
    }
    # Create a Pandas Excel writer using XlsxWriter as the engine.
    with ExcelWriter(OUTPUT_PATH, engine='xlsxwriter') as writer:
        for sheet_name, datar_frame in data_frames.items():
            datar_frame.to_excel(writer, sheet_name=sheet_name)


def main():
    _sales = sales_clean_up()
    _producer = producer_clean_up()
    _new_sales = merge_sales_with_producer(_sales, _producer)
    _sales_table = pivot_data(_new_sales)
    save_to_excel(_sales_table, _new_sales, _sales, _producer)


if __name__ == '__main__':
    main()
