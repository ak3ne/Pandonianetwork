#!/usr/bin/env python3
"""Builds data.js for the story site from pandonia_no2_comparison.json."""

from __future__ import annotations

import json
import math
from collections import defaultdict
from pathlib import Path
from statistics import median


ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "pandonia_analysis_output" / "pandonia_no2_comparison.json"
OUT = Path(__file__).resolve().parent / "data.js"

COORDS = {
    "Toronto": {"lat": 43.6532, "lon": -79.3832},
    "Dalanzadgad": {"lat": 43.5772, "lon": 104.4250},
    "Incheon": {"lat": 37.4563, "lon": 126.7052},
    "Busan": {"lat": 35.1796, "lon": 129.0756},
    "Fukuoka": {"lat": 33.5902, "lon": 130.4017},
    "Tokyo": {"lat": 35.6762, "lon": 139.6503},
}


def quantile(vals, q):
    if not vals:
        return None
    s = sorted(vals)
    if len(s) == 1:
        return s[0]
    i = (len(s) - 1) * q
    lo = math.floor(i)
    hi = math.ceil(i)
    if lo == hi:
        return s[lo]
    f = i - lo
    return s[lo] * (1 - f) + s[hi] * f


def mean(vals):
    return (sum(vals) / len(vals)) if vals else None


def build():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    output = {
        "generated_utc": data["generated_utc"],
        "source_root": data["source_root"],
        "common_window": data["common_window"],
        "order": list(data["locations"].keys()),
        "sites": {},
    }

    min_dates = []
    max_dates = []
    raw_total = 0
    kept_total = 0

    for site_name in output["order"]:
        loc = data["locations"][site_name]
        common = data["common"][site_name]
        dvals = [r["mean_du"] for r in common["daily"]]
        p99 = quantile(dvals, 0.99)
        trimmed = [v for v in dvals if p99 is None or v <= p99]

        by_month_raw = defaultdict(list)
        by_month_trim = defaultdict(list)
        for rec in common["daily"]:
            month = rec["date"][:7] + "-01"
            value = rec["mean_du"]
            by_month_raw[month].append(value)
            if p99 is None or value <= p99:
                by_month_trim[month].append(value)

        months = sorted(by_month_raw)
        monthly_raw = [
            {"month": month, "median": median(by_month_raw[month]), "mean": mean(by_month_raw[month])}
            for month in months
        ]
        monthly_trim = [
            {
                "month": month,
                "median": median(by_month_trim[month]) if by_month_trim[month] else None,
                "mean": mean(by_month_trim[month]),
                "n": len(by_month_trim[month]),
            }
            for month in months
        ]

        outlier_days = []
        if p99 is not None:
            for rec in common["daily"]:
                if rec["mean_du"] > p99:
                    outlier_days.append({"date": rec["date"], "mean_du": rec["mean_du"]})
        outlier_days.sort(key=lambda x: x["mean_du"], reverse=True)

        min_dates.append(loc["min_utc"])
        max_dates.append(loc["max_utc"])
        raw_total += loc["raw_rows"]
        kept_total += loc["kept_rows"]

        output["sites"][site_name] = {
            "folder": loc["folder"],
            "long_name": loc["long_name"],
            "coordinates": COORDS.get(site_name),
            "raw_rows": loc["raw_rows"],
            "kept_rows": loc["kept_rows"],
            "keep_ratio": loc["kept_ratio"],
            "min_utc": loc["min_utc"],
            "max_utc": loc["max_utc"],
            "monthly_full": [{"month": r["month"], "value": r["median_du"]} for r in loc["monthly"]],
            "monthly_common": [{"month": r["month"], "value": r["median_du"]} for r in common["monthly"]],
            "diurnal": [{"hour": r["hour"], "value": r["mean_du"]} for r in loc["diurnal"]],
            "seasonal": [{"month": r["month"], "value": r["mean_daily_du"]} for r in loc["seasonal"]],
            "daily_common": [{"date": r["date"], "value": r["mean_du"]} for r in common["daily"]],
            "daily_stats_raw": {
                "mean": mean(dvals),
                "p10": quantile(dvals, 0.10),
                "p50": quantile(dvals, 0.50),
                "p90": quantile(dvals, 0.90),
                "p99": p99,
                "max": max(dvals) if dvals else None,
                "n": len(dvals),
            },
            "daily_stats_trimmed": {
                "mean": mean(trimmed),
                "p10": quantile(trimmed, 0.10),
                "p50": quantile(trimmed, 0.50),
                "p90": quantile(trimmed, 0.90),
                "max": max(trimmed) if trimmed else None,
                "n": len(trimmed),
                "removed": len(dvals) - len(trimmed),
            },
            "outlier_days_common": outlier_days[:25],
            "common_monthly_raw_mean": monthly_raw,
            "common_monthly_trimmed_mean": monthly_trim,
        }

    output["network_totals"] = {
        "raw_rows": raw_total,
        "kept_rows": kept_total,
        "keep_ratio": (kept_total / raw_total) if raw_total else None,
        "min_utc": min(date for date in min_dates if date),
        "max_utc": max(date for date in max_dates if date),
    }

    OUT.write_text("window.PANDONIA_DATA = " + json.dumps(output, ensure_ascii=False) + ";\n", encoding="utf-8")
    print(f"Wrote: {OUT}")


if __name__ == "__main__":
    build()
