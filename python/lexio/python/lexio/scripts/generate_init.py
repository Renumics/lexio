import sys
from datetime import datetime, timedelta, timezone

# Bedingter Import von UTC
if sys.version_info >= (3, 11):
    from datetime import UTC
else:
    UTC = timezone.utc

# Rest Ihres Codes
# Beispiel:
now = datetime.now(UTC) 