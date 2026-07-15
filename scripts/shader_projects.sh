#!/bin/bash

json_items=""
comma=""

# create list with examples forlders to parse each and get the data
dirlist=(`ls -d -1 examples/**/`)

# echo ${dirlist[@]}

for path in ${dirlist[@]}; do
    info="${path}info"
    path=".${path/examples/""}index.js"


    # the check is to discard index_files directory, where the shader_projects.js is at
    if [[ -e "./examples/$path" && -e $info ]]; then
        source $info
        echo $desc

        printf -v item '{
            "name":"%s",
            "path":"%s",
            "uri":"%s",
            "desc":"%s",
            "author":"%s",
            "authlink":"%s",
            "fitwindow":"%s",
            "enabled":"%s",
            "tax":"%s"
        }' "$name" "$path" "$uri" "$desc" "$author" "$authlink" "$fitwindow" "$enabled" "$tax"

        # remove end of lines and extra spaces
        item="${item//$'\n'/}"
        item="${item//  /}"

        json_items+="${comma}${item}"
        comma=",  "
    fi

done

printf -v json_output '[\n  %s\n]' "$json_items"

echo -e "$json_output" > "shader_projects.json"
