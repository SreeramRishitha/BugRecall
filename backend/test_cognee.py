from dotenv import load_dotenv
load_dotenv()

import asyncio
import os
from pathlib import Path

import cognee
from cognee import config
from cognee.modules.search.types import SearchType

BASE_DIR = Path(__file__).resolve().parent
SYSTEM_DIR = BASE_DIR / ".cognee_system"
DATA_DIR = BASE_DIR / ".cognee_data"

print("System dir:", SYSTEM_DIR)
print("Data dir:", DATA_DIR)

config.system_root_directory(str(SYSTEM_DIR))
config.data_root_directory(str(DATA_DIR))

# no set_llm_config() call — Cognee reads LLM_API_KEY / LLM_PROVIDER / LLM_MODEL
# directly from environment variables instead


async def main():
    print("\n--- add ---")
    await cognee.add("The login redirect bug happens because JWT is valid but AuthContext state never updates.", dataset_name="test_dataset")

    print("\n--- cognify ---")
    await cognee.cognify(datasets=["test_dataset"])

    print("\n--- search ---")
    results = await cognee.search(
        query_text="what causes the login redirect bug?",
        query_type=SearchType.GRAPH_COMPLETION,
        datasets=["test_dataset"],
    )
    print("\nRESULTS:")
    print(results)


if __name__ == "__main__":
    asyncio.run(main())