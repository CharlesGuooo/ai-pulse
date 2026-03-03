#!/usr/bin/env python3
"""
Retry fetching data for influencers that failed with 403 errors.
Runs after a delay to avoid rate limiting.
"""
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

# Import functions from fetch_data
from fetch_data import call_grok, parse_json_response, make_tweet_id, fetch_batch_tweets

XAI_API_KEY = os.environ.get("XAI_API_KEY", "")
OUTPUT_DIR = Path(__file__).parent.parent / "client" / "public" / "data"
SCRIPT_DIR = Path(__file__).parent

def main():
    if not XAI_API_KEY:
        print("ERROR: XAI_API_KEY not set")
        sys.exit(1)

    # Load current data
    tweets_path = OUTPUT_DIR / "tweets.json"
    with open(tweets_path, encoding="utf-8") as f:
        data = json.load(f)

    # Find empty influencers
    empty_influencers = []
    for handle, inf in data["influencers"].items():
        if not inf.get("recent_posts") and not inf.get("top_posts"):
            empty_influencers.append(inf)

    print(f"Found {len(empty_influencers)} influencers with no data")
    if not empty_influencers:
        print("All influencers have data, nothing to retry")
        return

    now = datetime.now(timezone.utc)
    timestamp = now.isoformat()

    # Process in batches of 2 (smaller batches to avoid rate limits)
    batches = []
    for i in range(0, len(empty_influencers), 2):
        batches.append(empty_influencers[i:i+2])

    for i, batch in enumerate(batches):
        print(f"\nRetry Batch {i+1}/{len(batches)}: {[b['handle'] for b in batch]}")
        # Wait between batches to avoid rate limiting
        if i > 0:
            print("  Waiting 60s to avoid rate limits...")
            time.sleep(60)
        
        try:
            batch_results = fetch_batch_tweets(batch)
            for inf in batch:
                handle = inf["handle"]
                if handle in batch_results and (
                    batch_results[handle].get("recent_posts") or 
                    batch_results[handle].get("top_posts")
                ):
                    data["influencers"][handle].update({
                        **batch_results[handle],
                        "fetched_at": timestamp
                    })
                    print(f"  ✓ Got data for @{handle}")
                else:
                    print(f"  ✗ Still no data for @{handle}")
        except Exception as e:
            print(f"  ERROR: {e}")

        # Save progress after each batch
        with open(tweets_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  Saved progress")

    # Count final results
    has_data = sum(1 for inf in data["influencers"].values() 
                   if inf.get("recent_posts") or inf.get("top_posts"))
    print(f"\nFinal: {has_data}/{len(data['influencers'])} influencers have data")

if __name__ == "__main__":
    main()
