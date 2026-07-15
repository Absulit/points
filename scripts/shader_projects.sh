#!/usr/bin/env bash

json_items=""
comma=""

# create list with examples forlders to parse each and get the data
dirlist=(`ls -d -1 examples/**/`)

# echo ${dirlist[@]}

for path in ${dirlist[@]}; do
    path=".${path/examples/""}index.js"

    # the check is to discard index_files directory, where the shader_projects.js is at
    if [ -e "./examples/$path" ]; then
        printf -v item '{\n    "path": "%s",\n    "status": "active"\n  }' "$path"
        json_items+="${comma}${item}"
        comma=",\n  "
    fi

done

printf -v json_output '[\n  %s\n]' "$json_items"

echo -e "$json_output" > "test.json"
