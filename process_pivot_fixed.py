#!/usr/bin/env python3
"""
Utility script to parse multiple tab-delimited tables from standard input,
normalize them and produce a pivot-like summary in an Excel workbook.

The expected input consists of five distinct tables concatenated one after
another. Each table has a header row that begins with a known field name,
allowing the script to determine which table it is currently parsing. The
tables correspond to new installations, previous installations (KPI), new
internet activations, previous internet activations and AS requests. A
simplified pivot table is produced that counts how many records occur per
branch (지사 or 관할지사), per center (유통망) and per technician (기사명) for
each date. The resulting Excel workbook will contain two worksheets: one
containing the detailed aggregated rows and another containing a pivot-like
matrix where rows represent the hierarchy of branch -> center -> technician
and columns represent distinct dates. Each cell contains the count of
records for the corresponding combination.

Usage:
    cat input_data.tsv | python3 process_pivot.py
The script writes `pivot_output.xlsx` into the current working directory.
"""

import sys
from typing import Dict, List, Tuple

try:
    import pandas as pd  # type: ignore
except ImportError:
    pd = None


def detect_dataset(header: List[str]) -> int:
    if not header:
        return 0
    if header[0] == "생년":
        return 5
    if header[0] == "접수번호":
        if len(header) > 2:
            if header[1] == "가계번호" and header[2] == "고객번호":
                return 1
            elif header[1] == "가계번호" and header[2] == "인터넷가계번호":
                return 2
            elif header[1] == "가입계약번호" and header[2] == "이벤트번호":
                return 3
            elif header[1] == "가입계약번호" and header[2] == "상품명":
                return 4
    return 0


def parse_input() -> List[Tuple[str, str, str, str]]:
    aggregated: List[Tuple[str, str, str, str]] = []
    current_dataset = 0
    header_indices: Dict[str, int] = {}

    for raw_line in sys.stdin:
        line = raw_line.rstrip("\n")
        if not line.strip():
            continue
        parts = line.split("\t")
        if current_dataset == 0 or (parts and parts[0] in {"생년", "접수번호"}):
            ds = detect_dataset(parts)
            if ds:
                current_dataset = ds
                header_indices = {col: idx for idx, col in enumerate(parts)}
                continue
        if current_dataset == 0:
            continue
        try:
            if current_dataset == 1:
                branch = parts[header_indices.get("설치관할지사", -1)]
                center = parts[header_indices.get("설치유통망", -1)]
                tech = parts[header_indices.get("기사명", -1)]
                date = parts[header_indices.get("날짜", -1)]
            elif current_dataset == 2:
                branch = parts[header_indices.get("설치관할지사", -1)]
                center = parts[header_indices.get("설치유통망", -1)]
                tech = parts[header_indices.get("기사명", -1)]
                date = parts[header_indices.get("완료일", -1)]
            elif current_dataset == 3:
                branch = parts[header_indices.get("지사", -1)]
                center = parts[header_indices.get("완료유통망", -1)]
                tech = parts[header_indices.get("기사명", -1)]
                date = parts[header_indices.get("날짜", -1)]
            elif current_dataset == 4:
                branch = parts[header_indices.get("지사", -1)]
                center = parts[header_indices.get("완료유통망", -1)]
                tech = parts[header_indices.get("기사명", -1)]
                date = parts[header_indices.get("날짜", -1)]
            elif current_dataset == 5:
                branch = parts[header_indices.get("관할지사", -1)]
                center = parts[header_indices.get("유통망", -1)]
                tech = parts[header_indices.get("기사명", -1)]
                date = parts[header_indices.get("날짜", -1)]
            else:
                continue
        except IndexError:
            continue
        if not date:
            continue
        aggregated.append((branch.strip(), center.strip(), tech.strip(), date.strip()))
    return aggregated


def main() -> None:
    if pd is None:
        sys.stderr.write("The pandas library is required to run this script.\n")
        sys.exit(1)
    records = parse_input()
    df = pd.DataFrame(records, columns=["지사", "센터", "기사", "날짜"])
    agg_df = df.groupby(["지사", "센터", "기사", "날짜"]).size().reset_index(name="건수")
    pivot = agg_df.pivot_table(
        index=["지사", "센터", "기사"],
        columns="날짜",
        values="건수",
        aggfunc="sum",
        fill_value=0,
    )
    pivot = pivot.reindex(sorted(pivot.columns), axis=1)
    output_file = "pivot_output.xlsx"
    with pd.ExcelWriter(output_file, engine="xlsxwriter") as writer:
        agg_df.to_excel(writer, sheet_name="Data", index=False)
        # 🛠 index name 변경 후 reset_index
        pivot.index.set_names(["지사_idx", "센터_idx", "기사_idx"], inplace=True)
        pivot_reset = pivot.reset_index()
        pivot_reset.rename(columns={
            "지사_idx": "지사",
            "센터_idx": "센터",
            "기사_idx": "기사"
        }, inplace=True)
        pivot_reset.to_excel(writer, sheet_name="Pivot", index=False)
    print(f"Successfully wrote {output_file}")


if __name__ == "__main__":
    main()