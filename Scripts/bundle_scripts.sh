#!/bin/bash

# Compile Scripts into one script.js file by replacing the <<insert="file">> statements
target="bundled_script.js"
cp main.js $target
inserts=$(cat main.js | grep -o "<<insert=.*>>")
for insert in $inserts
do 
    filepath=$(echo $insert | sed -e 's/.*<<insert="\(.*\)">>/\1/')
    echo "Inserting contents of ${filepath}"
    if [ ! -f ${filepath} ]; then
        echo "File ${filepath} does not exist!"
        rm $target
        exit 1
    fi

    # find the <<insert=*>> statement and add the file contents
    replace="sed -e '/$insert/ r $filepath' -e 's/$insert/\/\/ Contents Inserted from $filepath/' $target"
    new=$(eval $replace)
    echo "$new" > $target
    # remove line endings before the insert
    # eval "sed '/\.*=$/{N;s/\n/\t/}' $target"
    # sed '/foo$/{N;s/\n/\t/}' $target
    # sed '/^$insert/{N;s/\n//;}' $target
done
# rm $target'-e'
mv $target ../
