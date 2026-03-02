#!/usr/bin/env python3
"""
AI Pulse - Data Fetcher
Calls Grok API (Responses API) with X Search to fetch and analyze tweets from AI influencers.
Outputs JSON data files for the static frontend.
Runs every 12 hours via GitHub Actions.
"""

import json
import os
import sys
import time
import hashlib
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests

# Configuration
XAI_API_KEY = os.environ.get("XAI_API_KEY", "")
API_URL = "https://api.x.ai/v1/responses"
MODEL = "grok-4-1-fast-non-reasoning"
OUTPUT_DIR = Path(__file__).parent.parent / "client" / "public" / "data"
SCRIPT_DIR = Path(__file__).parent

# Load influencers config
with open(SCRIPT_DIR / "influencers.json", "r", encoding="utf-8") as f:
    CONFIG = json.load(f)

INFLUENCERS = CONFIG["influencers"]
CATEGORIES = CONFIG["categories"]


def call_grok(prompt: str, x_handles: list[str] | None = None, max_retries: int = 3) -> str:
    """Call Grok Responses API with X Search tool."""
    headers = {
        "Authorization": f"Bearer {XAI_API_KEY}",
        "Content-Type": "application/json",
    }

    tools = []
    if x_handles:
        tools = [{
            "type": "x_search",
            "x_search": {
                "allowed_x_handles": x_handles[:10]  # max 10 handles
            }
        }]
    else:
        tools = [{"type": "x_search"}]

    payload = {
        "model": MODEL,
        "input": [
            {
                "role": "system",
                "content": "你是一个AI领域资讯分析师。你需要搜索并分析AI领域关键人物的最新推文动态，提供深度解读。请始终用中文回复。"
            },
            {"role": "user", "content": prompt}
        ],
        "tools": tools,
        "temperature": 0.3,
    }

    for attempt in range(max_retries):
        try:
            resp = requests.post(API_URL, headers=headers, json=payload, timeout=180)
            resp.raise_for_status()
            data = resp.json()

            # Extract text from Responses API output
            for item in data.get("output", []):
                if item.get("type") == "message":
                    for c in item.get("content", []):
                        if c.get("type") == "output_text":
                            return c["text"]
            return ""
        except Exception as e:
            print(f"  Attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(5 * (attempt + 1))
            else:
                return ""


def call_grok_basic(prompt: str, max_retries: int = 3) -> str:
    """Call Grok Chat Completions API (no search, cheaper)."""
    headers = {
        "Authorization": f"Bearer {XAI_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "grok-3-mini",
        "messages": [
            {
                "role": "system",
                "content": "你是一个AI领域资讯分析师。请始终用中文回复。直接返回JSON格式，不要加markdown代码块标记。"
            },
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
    }

    for attempt in range(max_retries):
        try:
            resp = requests.post("https://api.x.ai/v1/chat/completions", headers=headers, json=payload, timeout=120)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"  Basic call attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(5 * (attempt + 1))
            else:
                return ""


def parse_json_response(text: str) -> dict | list | None:
    """Try to parse JSON from a response that may contain markdown code blocks."""
    if not text:
        return None
    try:
        json_str = text
        if "```json" in json_str:
            json_str = json_str.split("```json")[1].split("```")[0]
        elif "```" in json_str:
            parts = json_str.split("```")
            if len(parts) >= 3:
                json_str = parts[1]
        return json.loads(json_str.strip())
    except json.JSONDecodeError:
        # Try to find JSON object or array in the text
        for start_char, end_char in [("{", "}"), ("[", "]")]:
            start = text.find(start_char)
            if start >= 0:
                depth = 0
                for i in range(start, len(text)):
                    if text[i] == start_char:
                        depth += 1
                    elif text[i] == end_char:
                        depth -= 1
                        if depth == 0:
                            try:
                                return json.loads(text[start:i+1])
                            except json.JSONDecodeError:
                                break
        return None


def fetch_batch_tweets(batch: list[dict]) -> dict:
    """Fetch tweets for a batch of influencers (up to 10) in one API call."""
    handles = [inf["handle"] for inf in batch]
    names_info = ", ".join([f"@{inf['handle']} ({inf['name']}, {inf['role']})" for inf in batch])

    print(f"  Fetching batch: {', '.join(handles)}...")

    prompt = f"""请搜索以下AI领域关键人物在X/Twitter上的最新推文动态：
{names_info}

请按以下JSON格式返回结果（直接返回JSON，不要加markdown代码块标记）：
{{
  "people": {{
    "<handle>": {{
      "person_summary": "该人物近期动态的整体概述（2-3句话）",
      "tweets": [
        {{
          "content_summary": "推文核心内容的简要概述（1-2句话）",
          "ai_analysis": "对该推文的深度解读（3-5句话，包含技术背景、行业影响等）",
          "topics": ["相关话题标签1", "话题标签2"],
          "tweet_url": "推文链接",
          "posted_at": "发布时间描述",
          "engagement": "互动情况（高/中/低）"
        }}
      ]
    }}
  }}
}}

请为每个人获取最近5-8条最重要的推文（尽量多获取）。如果某人没有近期推文，也请包含该handle并标注"暂无最新动态"。"""

    result = call_grok(prompt, x_handles=handles)

    if not result:
        return {}

    # Try to parse structured JSON first
    parsed = parse_json_response(result)
    if parsed and isinstance(parsed, dict) and "people" in parsed:
        people = parsed["people"]
        # Normalize handles - API may return @handle or handle
        normalized = {}
        for key, data in people.items():
            clean_key = key.lstrip("@")
            for i, tweet in enumerate(data.get("tweets", [])):
                if not tweet.get("id"):
                    tweet["id"] = hashlib.md5(
                        f"{clean_key}_{tweet.get('content_summary', '')}_{i}".encode()
                    ).hexdigest()[:12]
            normalized[clean_key] = data
        return normalized

    # If structured parse fails, try to use grok-3-mini to structure the raw text
    print("  Attempting to structure raw response...")
    structure_prompt = f"""请将以下关于AI领域人物推文动态的文本信息，整理成JSON格式。
涉及的人物handles: {', '.join(handles)}

原始信息：
{result[:3000]}

请按以下JSON格式返回（直接返回JSON，不要加markdown代码块标记）：
{{
  "people": {{
    "<handle>": {{
      "person_summary": "该人物近期动态概述",
      "tweets": [
        {{
          "content_summary": "推文内容概述",
          "ai_analysis": "深度解读",
          "topics": ["话题1"],
          "tweet_url": "链接",
          "posted_at": "时间",
          "engagement": "高/中/低"
        }}
      ]
    }}
  }}
}}"""

    structured = call_grok_basic(structure_prompt)
    parsed2 = parse_json_response(structured)
    if parsed2 and isinstance(parsed2, dict) and "people" in parsed2:
        people = parsed2["people"]
        for handle, data in people.items():
            for i, tweet in enumerate(data.get("tweets", [])):
                if not tweet.get("id"):
                    tweet["id"] = hashlib.md5(
                        f"{handle}_{tweet.get('content_summary', '')}_{i}".encode()
                    ).hexdigest()[:12]
        return people

    # Last resort: create basic entries from raw text
    result_dict = {}
    for inf in batch:
        handle = inf["handle"]
        result_dict[handle] = {
            "person_summary": "数据解析中，请稍后刷新",
            "tweets": []
        }
    return result_dict


def fetch_academic_projects() -> list:
    """Fetch latest academic AI projects from academic Twitter accounts."""
    academic_handles = ["_akhaliq", "paperswithcode", "ykilcher", "rasbt", "arxiv_sanity"]

    print("Fetching academic projects...")

    prompt = """请搜索AI学术领域最新的重要论文、开源项目和技术突破。重点关注以下推特账号的分享：@_akhaliq, @paperswithcode, @ykilcher, @rasbt

请按以下JSON格式返回结果（直接返回JSON，不要加markdown代码块标记）：
{
  "projects": [
    {
      "title": "项目/论文标题",
      "summary": "项目简要描述（1-2句话）",
      "ai_analysis": "深度解读（3-5句话，解决什么问题、核心创新点、应用场景）",
      "category": "分类（从以下选择：LLM与NLP, 计算机视觉, 图像生成, 视频生成, 音频与语音, 3D视觉, 多模态学习, AI Agent, 具身智能, AI基础设施, AI for Science, 其他）",
      "source_url": "论文/项目链接",
      "arxiv_url": "arXiv链接（如有）",
      "github_url": "GitHub链接（如有）",
      "shared_by": "分享者推特handle（不含@）",
      "published_at": "发布日期",
      "impact_level": "影响力（高/中/低）"
    }
  ]
}

请尽量获取20-30个最新的重要项目，覆盖尽可能多的分类领域。"""

    result = call_grok(prompt, x_handles=academic_handles)

    if not result:
        return []

    parsed = parse_json_response(result)
    if parsed:
        projects = parsed.get("projects", []) if isinstance(parsed, dict) else parsed
        for i, proj in enumerate(projects):
            if not proj.get("id"):
                proj["id"] = hashlib.md5(
                    f"academic_{proj.get('title', '')}_{i}".encode()
                ).hexdigest()[:12]
        return projects

    return []


def fetch_trending_summary() -> dict:
    """Fetch a trending summary of AI news."""
    print("Fetching trending AI summary...")

    prompt = """请搜索过去24小时内AI领域最重要的新闻和趋势动态。

请按以下JSON格式返回结果（直接返回JSON，不要加markdown代码块标记）：
{
  "headline": "今日AI领域最重要的一条新闻标题",
  "summary": "今日AI领域整体动态概述（3-5句话）",
  "hot_topics": [
    {
      "topic": "热门话题名称",
      "description": "话题简述",
      "related_people": ["相关人物handle"]
    }
  ],
  "key_developments": [
    {
      "title": "重要进展标题",
      "description": "进展描述（2-3句话）",
      "source_url": "来源链接（如有）"
    }
  ]
}"""

    result = call_grok(prompt)

    if not result:
        return {
            "headline": "AI领域持续快速发展",
            "summary": "暂无最新动态摘要",
            "hot_topics": [],
            "key_developments": []
        }

    parsed = parse_json_response(result)
    if parsed and isinstance(parsed, dict):
        return parsed

    return {
        "headline": "AI领域持续快速发展",
        "summary": result[:500] if result else "暂无最新动态摘要",
        "hot_topics": [],
        "key_developments": []
    }


def main():
    """Main entry point."""
    if not XAI_API_KEY:
        print("ERROR: XAI_API_KEY environment variable not set")
        sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone.utc)
    timestamp = now.isoformat()

    print(f"=== AI Pulse Data Fetch - {timestamp} ===\n")

    # 1. Fetch trending summary
    trending = fetch_trending_summary()
    trending["fetched_at"] = timestamp

    # Save trending immediately
    with open(OUTPUT_DIR / "trending.json", "w", encoding="utf-8") as f:
        json.dump(trending, f, ensure_ascii=False, indent=2)
    print("Wrote trending.json\n")

    # 2. Fetch tweets for influencers in batches of up to 10 handles
    all_tweets = {}

    # Deduplicate influencers by handle
    seen_handles = set()
    unique_influencers = []
    for inf in INFLUENCERS:
        if inf["handle"] not in seen_handles:
            seen_handles.add(inf["handle"])
            unique_influencers.append(inf)

    # Group influencers into batches (max 10 per API call due to handle limit)
    batches = []
    current_batch = []
    for inf in unique_influencers:
        current_batch.append(inf)
        if len(current_batch) >= 3:  # Use 3 for better JSON parsing reliability
            batches.append(current_batch)
            current_batch = []
    if current_batch:
        batches.append(current_batch)

    for i, batch in enumerate(batches):
        print(f"\nBatch {i+1}/{len(batches)}:")
        try:
            batch_results = fetch_batch_tweets(batch)
            for inf in batch:
                handle = inf["handle"]
                if handle in batch_results:
                    all_tweets[handle] = {
                        **inf,
                        **batch_results[handle],
                        "fetched_at": timestamp
                    }
                else:
                    all_tweets[handle] = {
                        **inf,
                        "tweets": [],
                        "person_summary": "暂无最新动态",
                        "fetched_at": timestamp
                    }
        except Exception as e:
            print(f"  ERROR in batch: {e}")
            for inf in batch:
                all_tweets[inf["handle"]] = {
                    **inf,
                    "tweets": [],
                    "person_summary": "数据获取失败，将在下次刷新时重试",
                    "fetched_at": timestamp
                }

        # Save progress after each batch
        tweets_output = {
            "meta": {
                "fetched_at": timestamp,
                "next_update": (now + timedelta(hours=12)).isoformat(),
                "total_influencers": len(unique_influencers),
                "version": "2.0"
            },
            "categories": CATEGORIES,
            "influencers": all_tweets
        }
        with open(OUTPUT_DIR / "tweets.json", "w", encoding="utf-8") as f:
            json.dump(tweets_output, f, ensure_ascii=False, indent=2)
        print(f"  Saved progress ({len(all_tweets)} influencers so far)")

        # Rate limiting between batches
        if i < len(batches) - 1:
            time.sleep(3)

    print(f"\nWrote tweets.json ({len(all_tweets)} influencers)")

    # 3. Fetch academic projects
    academic = fetch_academic_projects()

    academic_output = {
        "meta": {
            "fetched_at": timestamp,
            "total_projects": len(academic)
        },
        "projects": academic
    }

    with open(OUTPUT_DIR / "academic.json", "w", encoding="utf-8") as f:
        json.dump(academic_output, f, ensure_ascii=False, indent=2)
    print(f"Wrote academic.json ({len(academic)} projects)")

    print(f"\n=== Fetch complete at {datetime.now(timezone.utc).isoformat()} ===")


if __name__ == "__main__":
    main()
