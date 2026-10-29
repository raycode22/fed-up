import subprocess
import threading
import time


class RunResult:
    def __init__(self, returncode, stdout, stderr, timed_out=False, cancelled=False):
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr
        self.timed_out = timed_out
        self.cancelled = cancelled

    @property
    def ok(self):
        return self.returncode == 0 and not self.timed_out and not self.cancelled


def run_command(args, timeout=None, cancel_event=None, cwd=None, env=None):
    if not isinstance(args, (list, tuple)):
        raise ValueError("args must be a list/tuple")
    proc = subprocess.Popen(
        list(args),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        cwd=cwd,
        env=env,
    )
    stdout_chunks = []
    stderr_chunks = []

    def reader(pipe, sink):
        try:
            for line in pipe:
                sink.append(line)
        except Exception:
            pass

    t_out = threading.Thread(target=reader, args=(proc.stdout, stdout_chunks), daemon=True)
    t_err = threading.Thread(target=reader, args=(proc.stderr, stderr_chunks), daemon=True)
    t_out.start()
    t_err.start()

    start = time.monotonic()
    cancelled = False
    timed_out = False
    while proc.poll() is None:
        if cancel_event is not None and cancel_event.is_set():
            cancelled = True
            proc.terminate()
            break
        if timeout is not None and (time.monotonic() - start) > timeout:
            timed_out = True
            proc.terminate()
            break
        time.sleep(0.1)

    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()
        proc.wait()

    t_out.join(timeout=2)
    t_err.join(timeout=2)

    stdout = "".join(stdout_chunks)
    stderr = "".join(stderr_chunks)
    if cancelled or timed_out:
        rc = proc.returncode if proc.returncode is not None else -1
    else:
        rc = proc.returncode
    return RunResult(rc, stdout, stderr, timed_out=timed_out, cancelled=cancelled)
"""