import json
from typing import Any
from pydantic import BaseModel, Field

SKIP_TEXT = ["", " ", "\n", "\t", ", ", ". ", ".", ",", "et al.", "et al. ", "₂", "₁", "₃"]


class Rect(BaseModel):
    top: float = Field(ge=0)
    left: float = Field(ge=0)
    width: float = Field(ge=0)
    height: float = Field(ge=0)


class Highlight(BaseModel):
    page: int = Field(ge=0)
    rect: Rect
    comment: str = None


class PositionalMetadata(BaseModel):
    text: str
    origin: tuple[float, float]
    bbox: tuple[float, float, float, float]
    width: float
    height: float


def convert_bboxes_to_highlights(page: int, hits: list[dict[str, Any]]) -> list[Highlight]:
    """
    Convert a list of hit dictionaries to a list of Highlight objects.

    Args:
        page (int): The page number where the hits are located.
        hits (list[dict[str, Any]]): A list of dictionaries containing hit information.

    Returns:
        list[Highlight]: A list of Highlight objects representing the hits.
    """
    highlights = []
    if isinstance(hits, str):
        parsed = json.loads(hits)
        hits = [PositionalMetadata(**hit).model_dump() for hit in parsed]

    for hit in hits:
        if hit.get("text", "") in SKIP_TEXT:
            continue

        print(hit)
        highlight = Highlight(
            page=page,
            rect=Rect(
                left=hit["bbox"][0] / hit["width"],
                top=hit["bbox"][1] / hit["height"],
                width=(hit["bbox"][2] - hit["bbox"][0]) / hit["width"],
                height=(hit["bbox"][3] - hit["bbox"][1]) / hit["height"],
            )
        )
        highlights.append(highlight)

    return highlights