#!/usr/bin/env python3
import argparse
import json
import sys
from urllib import parse, request


def build_bark_url(
    server: str,
    device_key: str,
    title: str | None,
    body: str,
    sound: str | None,
    continuous: bool,
) -> str:
    server = server.rstrip("/")
    if title:
        path = f"/{parse.quote(device_key)}/{parse.quote(title)}/{parse.quote(body)}"
    else:
        path = f"/{parse.quote(device_key)}/{parse.quote(body)}"

    query_params: dict[str, str] = {}
    if sound:
        query_params["sound"] = sound
    if continuous:
        query_params["level"] = "critical"

    query = parse.urlencode(query_params, doseq=True)
    return f"{server}{path}" if not query else f"{server}{path}?{query}"


def send_bark_notification(url: str) -> dict[str, object]:
    req = request.Request(url, method="GET")
    with request.urlopen(req, timeout=10) as resp:
        data = resp.read().decode("utf-8")
        try:
            return json.loads(data)
        except json.JSONDecodeError:
            return {"raw": data}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Send a Bark push notification.")
    parser.add_argument(
        "--server",
        default="https://api.day.app",
        help="Bark server URL (default: https://api.day.app)",
    )
    parser.add_argument("--key", required=True, help="Bark device key")
    parser.add_argument("--body", required=True, help="Push content/body")
    parser.add_argument("--title", help="Push title")
    parser.add_argument("--sound", help="Bark sound name (e.g. bell, alarm)")
    parser.add_argument(
        "--continuous",
        action="store_true",
        help="Enable continuous ringing (maps to Bark level=critical)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    url = build_bark_url(
        server=args.server,
        device_key=args.key,
        title=args.title,
        body=args.body,
        sound=args.sound,
        continuous=args.continuous,
    )
    try:
        response = send_bark_notification(url)
    except Exception as exc:  # noqa: BLE001 - surface network errors
        print(f"Failed to send Bark push: {exc}", file=sys.stderr)
        return 1

    print(json.dumps(response, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
