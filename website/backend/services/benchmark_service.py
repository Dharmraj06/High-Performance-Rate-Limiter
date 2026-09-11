import json
from pathlib import Path
from typing import Any, Dict, List, Optional


DATA_DIR = Path(__file__).resolve().parent.parent / "data"
BASELINE_FILE = DATA_DIR / "baseline.json"
FINAL_FILE = DATA_DIR / "final.json"

# Mapping between Final Benchmark names and Baseline Google Benchmark prefixes
NAME_TO_BASELINE_KEY = {
    "Fixed Window Limiter": "FixedWindow",
    "Sliding Window Log": "SlidingWindowLog",
    "Sliding Window Counter": "SlidingWindowCounter",
    "In-Memory Token Bucket": "TokenBucket",
}


def load_json_file(filepath: Path) -> Dict[str, Any]:
    """
    Safely load and parse a JSON file from disk.
    Raises FileNotFoundError if file is missing,
    or ValueError if JSON is invalid.
    """
    if not filepath.exists():
        raise FileNotFoundError(f"Benchmark data file not found at: {filepath}")
    
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON syntax in {filepath.name}: {exc}") from exc
    except Exception as exc:
        raise RuntimeError(f"Error reading {filepath.name}: {exc}") from exc


def get_baseline_data() -> Dict[str, Any]:
    """Returns the raw baseline benchmark data."""
    return load_json_file(BASELINE_FILE)


def get_final_data() -> Dict[str, Any]:
    """Returns the raw final benchmark data."""
    return load_json_file(FINAL_FILE)


def _build_baseline_index(baseline_data: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    """
    Index baseline benchmark records by their name.
    Prefers mean aggregate results when available.
    """
    benchmarks = baseline_data.get("benchmarks", [])
    index: Dict[str, Dict[str, Any]] = {}
    for entry in benchmarks:
        name = entry.get("name")
        if name:
            index[name] = entry
    return index


def _resolve_baseline_entry(
    limiter_name: str,
    scenario: str,
    baseline_index: Dict[str, Dict[str, Any]],
    multi_thread_count: int = 8,
) -> Optional[Dict[str, Any]]:
    """
    Locates corresponding aggregate baseline entry for a given limiter and scenario.
    """
    base_prefix = NAME_TO_BASELINE_KEY.get(limiter_name)
    if not base_prefix:
        return None

    candidate_keys = []
    if scenario == "Single Thread":
        candidate_keys = [
            f"BM_{base_prefix}_Single_mean",
            f"BM_{base_prefix}_Single_median",
            f"BM_{base_prefix}_Single",
        ]
    elif scenario == "Same Client":
        candidate_keys = [
            f"BM_{base_prefix}_SameClient/real_time/threads:{multi_thread_count}_mean",
            f"BM_{base_prefix}_SameClient/real_time/threads:{multi_thread_count}_median",
            f"BM_{base_prefix}_SameClient/real_time/threads:{multi_thread_count}",
        ]
    elif scenario == "Multiple Clients":
        candidate_keys = [
            f"BM_{base_prefix}_MultiClient/real_time/threads:{multi_thread_count}_mean",
            f"BM_{base_prefix}_MultiClient/real_time/threads:{multi_thread_count}_median",
            f"BM_{base_prefix}_MultiClient/real_time/threads:{multi_thread_count}",
        ]

    for key in candidate_keys:
        if key in baseline_index:
            return baseline_index[key]

    return None


def get_comparison_data() -> Dict[str, Any]:
    """
    Generates comparison data between baseline and final benchmark results.
    - Preserves all original values.
    - Calculates throughput and latency percentage changes only where baseline
      and final data correspond.
    - Gracefully handles non-comparable benchmarks such as distributed Redis Token Bucket.
    """
    baseline_data = get_baseline_data()
    final_data = get_final_data()

    baseline_index = _build_baseline_index(baseline_data)
    final_config = final_data.get("benchmark", {})
    multi_thread_count = final_config.get("threads", 8)
    final_results: List[Dict[str, Any]] = final_data.get("results", [])

    comparisons: List[Dict[str, Any]] = []
    comparable_count = 0
    non_comparable_count = 0

    for final_item in final_results:
        name = final_item.get("name", "")
        scenario = final_item.get("scenario", "")
        limiter_type = final_item.get("type", "In-Memory")

        # Redis Token Bucket is distributed; direct comparison against in-memory baseline is not applicable
        if limiter_type.lower() == "distributed" or "redis" in name.lower() or scenario.lower() == "redis":
            non_comparable_count += 1
            comparisons.append({
                "name": name,
                "scenario": scenario,
                "type": limiter_type,
                "comparable": False,
                "reason": (
                    "Redis Token Bucket is an out-of-process distributed rate limiter "
                    "operating over IPC/network with Redis server-side Lua scripts. "
                    "Baseline benchmarks only measured in-memory limiters, so no direct "
                    "in-memory baseline comparison is applicable."
                ),
                "baseline": None,
                "final": {
                    "total_ops": final_item.get("total_ops"),
                    "allowed_ops": final_item.get("allowed_ops"),
                    "denied_ops": final_item.get("denied_ops"),
                    "duration_ms": final_item.get("duration_ms"),
                    "throughput_ops_sec": final_item.get("throughput_ops_sec"),
                    "avg_latency_ns": final_item.get("avg_latency_ns"),
                },
                "comparison": None,
            })
            continue

        baseline_entry = _resolve_baseline_entry(
            name, scenario, baseline_index, multi_thread_count
        )

        if not baseline_entry:
            non_comparable_count += 1
            comparisons.append({
                "name": name,
                "scenario": scenario,
                "type": limiter_type,
                "comparable": False,
                "reason": f"No corresponding baseline benchmark found for scenario '{scenario}'.",
                "baseline": None,
                "final": {
                    "total_ops": final_item.get("total_ops"),
                    "allowed_ops": final_item.get("allowed_ops"),
                    "denied_ops": final_item.get("denied_ops"),
                    "duration_ms": final_item.get("duration_ms"),
                    "throughput_ops_sec": final_item.get("throughput_ops_sec"),
                    "avg_latency_ns": final_item.get("avg_latency_ns"),
                },
                "comparison": None,
            })
            continue

        # Baseline metrics
        base_latency_ns = float(baseline_entry.get("real_time", 0.0))
        # In Google Benchmark: throughput = 1 second (1e9 ns) / real_time_ns
        base_throughput = (1e9 / base_latency_ns) if base_latency_ns > 0 else 0.0

        # Final metrics
        final_latency_ns = float(final_item.get("avg_latency_ns", 0.0))
        final_throughput = float(final_item.get("throughput_ops_sec", 0.0))

        # Percentage changes:
        # positive throughput_change_pct = improved throughput
        # negative latency_change_pct = reduced latency (improved speed)
        throughput_change_pct = (
            ((final_throughput - base_throughput) / base_throughput) * 100.0
            if base_throughput > 0
            else 0.0
        )
        latency_change_pct = (
            ((final_latency_ns - base_latency_ns) / base_latency_ns) * 100.0
            if base_latency_ns > 0
            else 0.0
        )
        speedup_factor = (
            (final_throughput / base_throughput) if base_throughput > 0 else 0.0
        )

        comparable_count += 1
        comparisons.append({
            "name": name,
            "scenario": scenario,
            "type": limiter_type,
            "comparable": True,
            "reason": None,
            "baseline": {
                "benchmark_name": baseline_entry.get("name"),
                "run_name": baseline_entry.get("run_name"),
                "threads": baseline_entry.get("threads", 1),
                "aggregate_name": baseline_entry.get("aggregate_name", "iteration"),
                "avg_latency_ns": round(base_latency_ns, 2),
                "throughput_ops_sec": round(base_throughput, 2),
                "cpu_time_ns": round(float(baseline_entry.get("cpu_time", 0.0)), 2),
                "time_unit": baseline_entry.get("time_unit", "ns"),
            },
            "final": {
                "threads": 1 if scenario == "Single Thread" else multi_thread_count,
                "total_ops": final_item.get("total_ops"),
                "allowed_ops": final_item.get("allowed_ops"),
                "denied_ops": final_item.get("denied_ops"),
                "duration_ms": final_item.get("duration_ms"),
                "avg_latency_ns": round(final_latency_ns, 2),
                "throughput_ops_sec": round(final_throughput, 2),
            },
            "comparison": {
                "throughput_change_pct": round(throughput_change_pct, 2),
                "latency_change_pct": round(latency_change_pct, 2),
                "speedup_factor": round(speedup_factor, 2),
                "is_throughput_improved": throughput_change_pct > 0,
                "is_latency_improved": latency_change_pct < 0,
            },
        })

    return {
        "summary": {
            "total_benchmarks": len(final_results),
            "comparable_count": comparable_count,
            "non_comparable_count": non_comparable_count,
            "scenarios": ["Single Thread", "Same Client", "Multiple Clients", "Redis"],
            "baseline_environment": baseline_data.get("context", {}),
            "final_config": final_config,
        },
        "comparisons": comparisons,
    }
