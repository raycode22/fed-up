from .runner import run_command


STATES = ("pending", "running", "retrying", "succeeded", "skipped", "failed", "cancelled")


def classify_failure(result):
    if result.cancelled:
        return "cancelled", False
    if result.timed_out:
        return "timeout", True
    if result.returncode != 0:
        # Heuristic: permission/config errors are non-retryable
        err = (result.stderr or "").lower()
        if "permission denied" in err or "not found" in err or "invalid" in err:
            return "non_retryable", False
        return "retryable", True
    return "unknown", False


class Installer:
    def __init__(self, items, verbose=False, max_attempts=3):
        self.items = items
        self.verbose = verbose
        self.max_attempts = max_attempts
        self.states = {it["id"]: "pending" for it in items}
        self.attempts = {it["id"]: 0 for it in items}
        self.results = {}

    def run_item(self, item, command, cancel_event=None):
        iid = item["id"]
        self.states[iid] = "running"
        last_result = None
        for attempt in range(1, self.max_attempts + 1):
            self.attempts[iid] = attempt
            if attempt > 1:
                self.states[iid] = "retrying"
            result = run_command(command, timeout=300, cancel_event=cancel_event)
            last_result = result
            if result.ok:
                self.states[iid] = "succeeded"
                self.results[iid] = result
                return result
            reason, retryable = classify_failure(result)
            if not retryable or attempt >= self.max_attempts:
                self.states[iid] = "cancelled" if reason == "cancelled" else "failed"
                self.results[iid] = result
                return result
        self.states[iid] = "failed"
        self.results[iid] = last_result
        return last_result

    def skip_item(self, item_id):
        self.states[item_id] = "skipped"

    def cancel_item(self, item_id):
        self.states[item_id] = "cancelled"

    def summary(self):
        counts = {s: 0 for s in STATES}
        for st in self.states.values():
            counts[st] = counts.get(st, 0) + 1
        return counts
"""