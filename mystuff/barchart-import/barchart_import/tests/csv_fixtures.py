import rootpath


def _csv_fixture_full_path(source_filename) -> str:
    root_path = rootpath.detect()
    if root_path:
        return f"{root_path}/{source_filename}"
    else:
        return source_filename


file1_fullpath = _csv_fixture_full_path(
    "fixtures/unusual-stocks-options-activity-07-05-2020.csv"
)

file2_fullpath = _csv_fixture_full_path(
    "fixtures/unusual-stocks-options-activity-08-29-2020.csv"
)

cleaned_fixture_fullpath = _csv_fixture_full_path(
    "fixtures/cleaned-unusual-stocks-options-activity-07-05-2020.csv"
)
