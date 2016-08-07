# OSM Streets
OSM streets and wikidata integration

## Example
http://opendataby.github.io/osm-streets/

## Similar projects
- http://vulica.by/
- http://news.tut.by/society/398404.html
- http://minsk.gov.by/ru/streets
- [http://publib.by/userfiles/file/Их именами.pdf](http://publib.by/userfiles/file/%D0%98%D1%85%20%D0%B8%D0%BC%D0%B5%D0%BD%D0%B0%D0%BC%D0%B8.pdf)
- http://szlachta.io.ua/s215414/bylyya_i_novyya_nazvy_vulic_i_plyaca_menska
- http://labadzenka.by/?p=22871
- http://minsk-old-new.com/minsk-2791-ru.htm

## Build
    npm install
    ./node_modules/.bin/webpack

## Update translations
    bash translations_extract.sh
    # update *.po files in `translations` folder
    bash translations_po2json.sh

## License
Sources - [MIT](https://raw.githubusercontent.com/opendataby/osm_streets/gh-pages/LICENSE.txt), OSM data - [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright), Wikidata - [CC BY-SA](https://creativecommons.org/licenses/by-sa/3.0/) [Wikidata](https://www.wikidata.org/)
