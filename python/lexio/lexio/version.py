"""Version information."""

try:
    from setuptools_scm import get_version
    __version__ = get_version(root='../..', relative_to=__file__)
except Exception:
    __version__ = "0.0.0"  # Fallback version when not in git repo 