"""
Cognee integration — the persistent memory layer.
Each BugSession gets its own Cognee dataset so memory never bleeds
across unrelated bugs.
"""
from pathlib import Path
import cognee
from cognee.modules.search.types import SearchType
from cognee import config

BASE_DIR = Path(__file__).resolve().parent.parent.parent
SYSTEM_DIR = BASE_DIR / ".cognee_system"
DATA_DIR = BASE_DIR / ".cognee_data"
SYSTEM_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

config.system_root_directory(str(SYSTEM_DIR))
config.data_root_directory(str(DATA_DIR))

# LLM_PROVIDER / LLM_API_KEY / LLM_MODEL / EMBEDDING_* are read directly
# from environment variables (backend/.env) — no manual config call needed.


def _dataset_name(session_id: int) -> str:
    return f"session_{session_id}"


async def ingest_text(session_id: int, text: str) -> None:
    dataset = _dataset_name(session_id)
    await cognee.add(text, dataset_name=dataset)
    await cognee.cognify(datasets=[dataset])


async def recall(session_id: int, query: str, search_type: SearchType = SearchType.GRAPH_COMPLETION):
    dataset = _dataset_name(session_id)
    return await cognee.search(
        query_text=query,
        query_type=search_type,
        datasets=[dataset],
    )