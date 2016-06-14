# create *.json files with translations from *.po for jed
for item in $(ls translations/*.po); do
    ./node_modules/.bin/po2json $item ${item/.po/.json} -p -f jed1.x
done
