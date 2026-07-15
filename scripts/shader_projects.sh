#!/usr/bin/env bash

json_items=""
comma=""

for name in "item1" "item2" "item2"; do
    printf -v item '{\n    "name": "%s",\n    "status": "active"\n  }' "$name"
    json_items+="${comma}${item}"
    comma=",\n  "
done

printf -v json_output '[\n  %s\n]' "$json_items"

echo -e "$json_output"
