#!/bin/sh
set -e

/app/bin/migrate
/app/bin/supavisor eval "$(cat /etc/pooler/pooler.exs)"
/app/bin/server
