import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET_FILES = ["index.html", "style.css", "script.js"]


def read_file(path: Path) -> str:
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def call_openai(api_key: str, model: str, system_prompt: str, user_prompt: str) -> str:
    url = "https://api.openai.com/v1/chat/completions"
    payload = {
        "model": model,
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url=url,
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            raw = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"OpenAI HTTPError {exc.code}: {body}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"OpenAI URLError: {exc}") from exc

    parsed = json.loads(raw)
    return parsed["choices"][0]["message"]["content"]


def parse_json_content(text: str) -> dict:
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Fallback if model wraps JSON in extra text.
    match = re.search(r"\{.*\}", text, flags=re.DOTALL)
    if not match:
        raise RuntimeError("Model response does not contain JSON object.")
    return json.loads(match.group(0))


def validate_output(obj: dict) -> None:
    missing = [name for name in TARGET_FILES if name not in obj or not isinstance(obj[name], str)]
    if missing:
        raise RuntimeError(f"Missing or invalid keys in model output: {', '.join(missing)}")


def main() -> int:
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        print("OPENAI_API_KEY is missing.", file=sys.stderr)
        return 1

    model = os.getenv("OPENAI_MODEL", "gpt-5.2").strip()
    issue_number = os.getenv("ISSUE_NUMBER", "").strip()
    issue_title = os.getenv("ISSUE_TITLE", "").strip()
    issue_body = os.getenv("ISSUE_BODY", "").strip()

    current_files = {
        name: read_file(ROOT / name)
        for name in TARGET_FILES
    }

    system_prompt = (
        "You are Codex, a precise software engineer.\n"
        "Task: Implement GitHub issue requirements by editing a static website project.\n"
        "Allowed files: index.html, style.css, script.js only.\n"
        "Return strict JSON object with exactly these keys:\n"
        "{\"index.html\":\"...\",\"style.css\":\"...\",\"script.js\":\"...\"}\n"
        "Each value must be full file content, not diffs.\n"
        "Do not add markdown, explanations, code fences, or extra keys.\n"
        "Do not include binary data.\n"
        "Keep output valid UTF-8 text.\n"
    )

    user_prompt = (
        f"Issue #{issue_number}\n"
        f"Title: {issue_title}\n\n"
        f"Description:\n{issue_body}\n\n"
        "Current project files:\n"
        f"--- index.html ---\n{current_files['index.html']}\n\n"
        f"--- style.css ---\n{current_files['style.css']}\n\n"
        f"--- script.js ---\n{current_files['script.js']}\n"
    )

    content = call_openai(api_key, model, system_prompt, user_prompt)
    parsed = parse_json_content(content)
    validate_output(parsed)

    for filename in TARGET_FILES:
        (ROOT / filename).write_text(parsed[filename], encoding="utf-8")

    print("Updated files:", ", ".join(TARGET_FILES))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
