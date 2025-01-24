"""Version information."""

try:
    from importlib.metadata import version  # works with hatch-vcs
    __version__ = version("lexio")
except Exception:
    __version__ = "0.0.0"  # Fallback version 