from pathlib import Path
import shutil
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "lambdas" / "job_worker"
OUTPUT = ROOT / "build" / "job_worker"


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SOURCE / "handler.py", OUTPUT / "handler.py")

    subprocess.run(
        [
            sys.executable,
            "-m",
            "pip",
            "install",
            "--platform",
            "manylinux2014_x86_64",
            "--only-binary",
            ":all:",
            "--implementation",
            "cp",
            "--python-version",
            "3.12",
            "--target",
            str(OUTPUT),
            "reportlab",
        ],
        check=True,
    )


if __name__ == "__main__":
    main()
