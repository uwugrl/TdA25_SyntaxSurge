#!/bin/bash

if [[ ! -f /app/prisma/data/data.db ]]; then
    pnpm prisma db push
fi

pnpm start