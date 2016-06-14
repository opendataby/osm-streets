# build old style js file
./node_modules/.bin/webpack

# extract from old style js
pybabel extract -F pybabel.cfg -o translations/app.pot dist/bundle.js

# update po files
for item in $(ls translations/*.po); do
    pybabel update -i translations/app.pot -o $item -l $(echo ${item/be-tarask/be_tarask} | awk -F [/.] '{print $2}')
done

# fix be-tarask po file
sed -i -e 's/Language: be/Language: be-tarask/g' translations/be-tarask.po
