import logging
import os
import re

SENSITIVE_PATTERNS = [
    re.compile(r"(?i)(password|token|secret|api[_-]?key)\s*=\s*\S+"),
]


class RedactingFilter(logging.Filter):
    def filter(self, record):
        msg = record.getMessage()
        for pat in SENSITIVE_PATTERNS:
            msg = pat.sub(r"\1=[REDACTED]", msg)
        record.msg = msg
        record.args = ()
        return True


def setup_logging(verbose=False, log_dir=None):
    if log_dir is None:
        log_dir = os.path.join(os.path.expanduser("~"), ".local", "state", "fed-up")
    os.makedirs(log_dir, exist_ok=True)
    log_path = os.path.join(log_dir, "fed-up.log")
    logger = logging.getLogger("fedup")
    logger.setLevel(logging.DEBUG if verbose else logging.INFO)
    if not logger.handlers:
        handler = logging.FileHandler(log_path)
        handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
        handler.addFilter(RedactingFilter())
        logger.addHandler(handler)
        if verbose:
            console = logging.StreamHandler()
            console.setFormatter(logging.Formatter("%(levelname)s: %(message)s"))
            console.addFilter(RedactingFilter())
            logger.addHandler(console)
    logger.info("log file: %s", log_path)
    return logger
