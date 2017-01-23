import hashlib
import json
import os
import re
import string
import urllib.parse
from argparse import ArgumentParser
from collections import defaultdict
from contextlib import contextmanager

import psycopg2
import requests
from lacinizatar.lacinizatar import lacin


WIKIDATA_API_URL = 'https://www.wikidata.org/w/api.php'
WIKIDATA_ARGS = {
    'action': 'wbgetentities',
    'format': 'json',
}
MAX_DEPTH = 2
LANGS = [
    'be-tarask',
    'en',
]
PLURAL_FORMS = {
    'en': 'nplurals=2; plural=(n != 1);',
    'be': 'nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);',
    'be-tarask': 'nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);',
    'ru': 'nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);',
}
INSTANCE_OF = 'P31'


INSTANCES = {
    5: {    # human
        INSTANCE_OF,
        'P21',
        'P569',
        'P570',
        'P19',
        'P20',
        'P27',
        'P106',
    },
    515: {  # city
        INSTANCE_OF,
        'P17',
        'P571',
        'P1082',
    },
}

IMAGE_INFO_API_URL = 'https://www.wikidata.org/w/api.php'
IMAGE_INFO_ARGS = {
    'action': 'query',
    'format': 'json',
    'formatversion': 2,
    'prop': 'imageinfo',
    'iiprop': 'url',
    'iilimit': 1,
    'iiurlwidth': 200,
}


class MultiLang(object):

    def __init__(self, values, strict=True, id=None):
        self.values = values
        self.strict = True
        self.id = id

    def to_lang_json(self, lang):
        if self.strict and lang not in self.values:
            print(self.id, lang, self.values)
        return self.values.get(lang)

    def __repr__(self):
        return str(self.values)


class MultiLangJSONEncoder(json.JSONEncoder):

    def default(self, o):
        if hasattr(o, 'to_lang_json'):
            return o.to_lang_json(self.lang)
        return super().default(o)


class BaseItem(object):

    classes = []
    all_props = set()
    props = set()
    type = None
    download_value = False

    def __init__(self, property, property_value, session=None):
        self.property = property
        self.property_value = property_value
        self.session = session

    def assert_value(self):
        l = 4
        if 'references' in self.property_value:
            l += 1
        if 'qualifiers' in self.property_value:
            l += 2
            assert 'qualifiers-order' in self.property_value
            self.assert_qualifiers()
        assert len(self.property_value) == l
        assert self.property_value['type'] == 'statement'
        assert self.property_value['rank'] in ('normal', 'deprecated', 'preferred')
        assert isinstance(self.property_value['id'], str)
        self.assert_mainsnak()

    def assert_qualifiers(self):
        for pid, property_values in self.property_value['qualifiers'].items():
            for property_value in property_values:
                for cls in BaseItem.classes:
                    instance = cls(pid,  {'mainsnak': property_value}, self.session)
                    if instance.check():
                        instance.assert_mainsnak()
                        break
                else:
                    raise TypeError

    def assert_mainsnak(self):
        assert False

    def assert_mainsnak_novalue(self):
        if 'hash' in self.property_value['mainsnak']:
            assert len(self.property_value['mainsnak']) == 4
        else:
            assert len(self.property_value['mainsnak']) == 3
        assert self.property_value['mainsnak']['property'] == self.property
        assert self.property_value['mainsnak']['datatype'] == self.type
        assert self.property_value['mainsnak']['snaktype'] in ('novalue', 'somevalue')

    def check(self):
        if self.property in self.props:
            return True
        if self.property in self.all_props:
            return False
        return self.property_value['mainsnak']['datatype'] == self.type

    def is_unknown(self):
        return self.property_value['mainsnak']['snaktype'] in ('novalue', 'somevalue')

    def to_json(self):
        return None

    @staticmethod
    def reg(cls):
        BaseItem.classes.append(cls)
        BaseItem.all_props.update(cls.props)
        return cls


@BaseItem.reg
class RefItem(BaseItem):

    type = 'wikibase-item'
    props = {
        'P17',   # country
        'P19',   # place of birth
        'P20',   # place of death
        'P21',   # sex
        'P27',   # citizenship
        'P106',  # occupation
    }
    download_value = True

    def assert_mainsnak(self):
        if self.is_unknown():
            self.assert_mainsnak_novalue()
        else:
            if 'hash' in self.property_value['mainsnak']:
                assert len(self.property_value['mainsnak']) == 5
            else:
                assert len(self.property_value['mainsnak']) == 4
            assert self.property_value['mainsnak']['property'] == self.property
            assert self.property_value['mainsnak']['datatype'] == self.type
            assert self.property_value['mainsnak']['snaktype'] == 'value'

            assert len(self.property_value['mainsnak']['datavalue']) == 2
            assert self.property_value['mainsnak']['datavalue']['type'] == 'wikibase-entityid'

            assert len(self.property_value['mainsnak']['datavalue']['value']) == 2
            assert self.property_value['mainsnak']['datavalue']['value']['entity-type'] == 'item'
            assert isinstance(self.property_value['mainsnak']['datavalue']['value']['numeric-id'], int)

    def to_json(self):
        if self.is_unknown():
            return None
        return 'Q{}'.format(self.property_value['mainsnak']['datavalue']['value']['numeric-id'])


@BaseItem.reg
class DateItem(BaseItem):

    type = 'time'
    props = {
        'P585',  # point of time
        'P569',  # birth date
        'P570',  # death date
        'P580',  # start date
        'P582',  # end date
        'P571',  # inception date
    }

    date_pattern = re.compile('\+(\d{4})-(\d{2})-(\d{2})T00:00:00Z')
    PRECISION_DAY = 11
    PRECISION_MONTH = 10
    PRECISION_YEAR = 9
    PRECISION_10_YEARS = 8
    PRECISION_100_YEARS = 7
    PROPERTY_CIRCUMSTANCES = 'P1480'
    PROPERTY_START = 'P580'
    PROPERTY_END = 'P582'

    def julian2gregorian(self, year, month, day):
        assert (-500, 3, 5) <= (year, month, day) < (2100, 2, 16)
        if (-500, 3, 5) <= (year, month, day) < (-300, 3, 4):
            delta = -5
        elif (-300, 3, 4) <= (year, month, day) < (-200, 3, 3):
            delta = -4
        elif (-200, 3, 3) <= (year, month, day) < (-100, 3, 2):
            delta = -3
        elif (-100, 3, 2) <= (year, month, day) < (100, 3, 1):
            delta = -2
        elif (100, 3, 1) <= (year, month, day) < (200, 2, 29):
            delta = -1
        elif (200, 2, 29) <= (year, month, day) < (300, 2, 29):
            delta = 0
        elif (300, 2, 29) <= (year, month, day) < (500, 2, 29):
            delta = 1
        elif (500, 2, 29) <= (year, month, day) < (600, 2, 29):
            delta = 2
        elif (600, 2, 29) <= (year, month, day) < (700, 2, 29):
            delta = 3
        elif (700, 2, 29) <= (year, month, day) < (900, 2, 29):
            delta = 4
        elif (900, 2, 29) <= (year, month, day) < (1000, 2, 29):
            delta = 5
        elif (1000, 2, 29) <= (year, month, day) < (1100, 2, 29):
            delta = 6
        elif (1100, 2, 29) <= (year, month, day) < (1300, 2, 29):
            delta = 7
        elif (1300, 2, 29) <= (year, month, day) < (1400, 2, 29):
            delta = 8
        elif (1400, 2, 29) <= (year, month, day) < (1500, 2, 29):
            delta = 9
        elif (1500, 2, 29) <= (year, month, day) < (1700, 2, 19):
            delta = 10
        elif (1700, 2, 19) <= (year, month, day) < (1800, 2, 18):
            delta = 11
        elif (1800, 2, 18) <= (year, month, day) < (1900, 2, 17):
            delta = 12
        elif (1900, 2, 17) <= (year, month, day) < (2100, 2, 16):
            delta = 13
        else:
            raise TypeError
        day = day + delta
        if day > 0:
            if month in (1, 3, 5, 7, 8, 10, 12) and day > 31:
                day -= 31
                month += 1
            if month in (4, 6, 9, 11) and day > 30:
                day -= 30
                month += 1
            if month > 12:
                month -= 12
                year += 1
        else:
            raise NotImplementedError
        return year, month, day

    def prettify_data(self, date, precision, calendarmodel, qualifiers):
        match = self.date_pattern.match(date)
        year, month, day = [int(g) for g in match.groups()]
        if precision == self.PRECISION_DAY:
            assert not qualifiers or not set(qualifiers) - {self.PROPERTY_CIRCUMSTANCES}
            if calendarmodel == 'http://www.wikidata.org/entity/Q1985786':
                year, month, day = self.julian2gregorian(year, month, day)
            return ['{:4d}-{:02d}-{:02d}'.format(year, month, day)]
        if precision == self.PRECISION_MONTH:
            assert not qualifiers or not set(qualifiers) - {self.PROPERTY_CIRCUMSTANCES}
            return ['{:4d}-{:02d}'.format(year, month)]
        if precision == self.PRECISION_YEAR:
            assert not qualifiers or not set(qualifiers) - {self.PROPERTY_CIRCUMSTANCES}
            return ['{:4d}'.format(year)]
        if precision == self.PRECISION_10_YEARS:
            assert year % 10 == 0
            assert not qualifiers or not set(qualifiers) - {self.PROPERTY_CIRCUMSTANCES,
                                                            self.PROPERTY_START,
                                                            self.PROPERTY_END}
            date_start = '{:4d}'.format(year)
            date_end = '{:4d}'.format(year + 9)
            if qualifiers and self.PROPERTY_START in qualifiers:
                props = qualifiers[self.PROPERTY_START]
                assert len(props) == 1
                dates = DateItem(self.PROPERTY_START, {'mainsnak': props[0]}).to_json()
                if len(dates):
                    print(dates)
                assert len(dates) == 1
                date_start = dates[0]
            if qualifiers and self.PROPERTY_END in qualifiers:
                props = qualifiers[self.PROPERTY_END]
                assert len(props) == 1
                dates = DateItem(self.PROPERTY_END, {'mainsnak': props[0]}).to_json()
                assert len(dates) == 1
                date_end = dates[0]
            return [date_start, date_end]
        if precision == self.PRECISION_100_YEARS:
            assert year % 100 == 0
            assert not qualifiers or not set(qualifiers) - {self.PROPERTY_CIRCUMSTANCES,
                                                            self.PROPERTY_START,
                                                            self.PROPERTY_END}
            date_start = '{:4d}'.format(year)
            date_end = '{:4d}'.format(year + 99)
            if qualifiers and self.PROPERTY_START in qualifiers:
                props = qualifiers[self.PROPERTY_START]
                assert len(props) == 1
                dates = DateItem(self.PROPERTY_START, {'mainsnak': props[0]}).to_json()
                assert len(dates) == 1
                date_start = dates[0]
            if qualifiers and self.PROPERTY_END in qualifiers:
                props = qualifiers[self.PROPERTY_END]
                assert len(props) == 1
                dates = DateItem(self.PROPERTY_END, {'mainsnak': props[0]}).to_json()
                assert len(dates) == 1
                date_end = dates[0]
            return [date_start, date_end]
        raise TypeError

    def assert_mainsnak(self):
        if self.is_unknown():
            return self.assert_mainsnak_novalue()
        else:
            if 'hash' in self.property_value['mainsnak']:
                assert len(self.property_value['mainsnak']) == 5
            else:
                assert len(self.property_value['mainsnak']) == 4
            assert self.property_value['mainsnak']['property'] == self.property
            assert self.property_value['mainsnak']['datatype'] == self.type
            assert self.property_value['mainsnak']['snaktype'] == 'value'

            assert len(self.property_value['mainsnak']['datavalue']) == 2
            assert self.property_value['mainsnak']['datavalue']['type'] == 'time'

            assert len(self.property_value['mainsnak']['datavalue']['value']) == 6
            assert self.property_value['mainsnak']['datavalue']['value']['timezone'] == 0
            assert self.property_value['mainsnak']['datavalue']['value']['after'] == 0
            assert self.property_value['mainsnak']['datavalue']['value']['before'] == 0
            assert self.property_value['mainsnak']['datavalue']['value']['precision'] in (7, 8, 9, 10, 11)  # century, XXs, year, mounth, day
            assert self.property_value['mainsnak']['datavalue']['value']['calendarmodel'] in (
                'http://www.wikidata.org/entity/Q1985727',
                'http://www.wikidata.org/entity/Q1985786',
            )
            assert isinstance(self.property_value['mainsnak']['datavalue']['value']['time'], str)

    def to_json(self):
        if self.is_unknown():
            return None
        return self.prettify_data(self.property_value['mainsnak']['datavalue']['value']['time'],
                                  self.property_value['mainsnak']['datavalue']['value']['precision'],
                                  self.property_value['mainsnak']['datavalue']['value']['calendarmodel'],
                                  self.property_value.get('qualifiers'))


@BaseItem.reg
class UrlItem(BaseItem):
    type = 'url'

    def assert_mainsnak(self):
        if 'hash' in self.property_value['mainsnak']:
            assert len(self.property_value['mainsnak']) == 5
        else:
            assert len(self.property_value['mainsnak']) == 4
        assert self.property_value['mainsnak']['property'] == self.property
        assert self.property_value['mainsnak']['datatype'] == self.type
        assert self.property_value['mainsnak']['snaktype'] == 'value'

        assert len(self.property_value['mainsnak']['datavalue']) == 2
        assert self.property_value['mainsnak']['datavalue']['type'] == 'string'
        assert isinstance(self.property_value['mainsnak']['datavalue']['value'], str)

    def to_json(self):
        return self.property_value['mainsnak']['datavalue']['value']


@BaseItem.reg
class StringItem(BaseItem):
    type = 'string'

    def assert_mainsnak(self):
        if 'hash' in self.property_value['mainsnak']:
            assert len(self.property_value['mainsnak']) == 5
        else:
            assert len(self.property_value['mainsnak']) == 4
        assert self.property_value['mainsnak']['property'] == self.property
        assert self.property_value['mainsnak']['datatype'] == self.type
        assert self.property_value['mainsnak']['snaktype'] == 'value'

        assert len(self.property_value['mainsnak']['datavalue']) == 2
        assert self.property_value['mainsnak']['datavalue']['type'] == 'string'
        assert isinstance(self.property_value['mainsnak']['datavalue']['value'], str)

    def to_json(self):
        return self.property_value['mainsnak']['datavalue']['value']


@BaseItem.reg
class MonolingualTextItem(BaseItem):
    type = 'monolingualtext'

    def assert_mainsnak(self):
        if 'hash' in self.property_value['mainsnak']:
            assert len(self.property_value['mainsnak']) == 5
        else:
            assert len(self.property_value['mainsnak']) == 4
        assert self.property_value['mainsnak']['property'] == self.property
        assert self.property_value['mainsnak']['datatype'] == self.type
        assert self.property_value['mainsnak']['snaktype'] == 'value'

        assert len(self.property_value['mainsnak']['datavalue']) == 2
        assert self.property_value['mainsnak']['datavalue']['type'] in ('string', 'monolingualtext')

        assert len(self.property_value['mainsnak']['datavalue']['value']['language']) == 2
        assert isinstance(self.property_value['mainsnak']['datavalue']['value']['language'], str)
        assert isinstance(self.property_value['mainsnak']['datavalue']['value']['text'], str)

    def to_json(self):
        return self.property_value['mainsnak']['datavalue']['value']['text']


@BaseItem.reg
class CommonsMediaItem(BaseItem):
    type = 'commonsMedia'

    def get_image_info(self, value):
        url = WIKIDATA_API_URL + '?' + urllib.parse.urlencode(dict(IMAGE_INFO_ARGS, titles='File:{}'.format(value)))
        data = self.session.get(url).json()
        return data['query']['pages'][0]['imageinfo'][0]['thumburl']

    def assert_mainsnak(self):
        if 'hash' in self.property_value['mainsnak']:
            assert len(self.property_value['mainsnak']) == 5
        else:
            assert len(self.property_value['mainsnak']) == 4
        assert self.property_value['mainsnak']['property'] == self.property
        assert self.property_value['mainsnak']['datatype'] == self.type
        assert self.property_value['mainsnak']['snaktype'] == 'value'

        assert len(self.property_value['mainsnak']['datavalue']) == 2
        assert self.property_value['mainsnak']['datavalue']['type'] == 'string'
        assert isinstance(self.property_value['mainsnak']['datavalue']['value'], str)

    def to_json(self):
        return self.get_image_info(self.property_value['mainsnak']['datavalue']['value'])


@BaseItem.reg
class ExternalIdItem(BaseItem):
    type = 'external-id'

    def assert_mainsnak(self):
        if 'hash' in self.property_value['mainsnak']:
            assert len(self.property_value['mainsnak']) == 5
        else:
            assert len(self.property_value['mainsnak']) == 4
        assert self.property_value['mainsnak']['property'] == self.property
        assert self.property_value['mainsnak']['datatype'] == self.type
        assert self.property_value['mainsnak']['snaktype'] == 'value'

        assert len(self.property_value['mainsnak']['datavalue']) == 2
        assert self.property_value['mainsnak']['datavalue']['type'] == 'string'
        assert isinstance(self.property_value['mainsnak']['datavalue']['value'], str)

    def to_json(self):
        return self.property_value['mainsnak']['datavalue']['value']


@BaseItem.reg
class QuantityItem(BaseItem):
    type = 'quantity'

    def assert_mainsnak(self):
        if 'hash' in self.property_value['mainsnak']:
            assert len(self.property_value['mainsnak']) == 5
        else:
            assert len(self.property_value['mainsnak']) == 4
        assert self.property_value['mainsnak']['property'] == self.property
        assert self.property_value['mainsnak']['datatype'] == self.type
        assert self.property_value['mainsnak']['snaktype'] == 'value'

        assert len(self.property_value['mainsnak']['datavalue']) == 2
        assert self.property_value['mainsnak']['datavalue']['type'] == 'quantity'

        assert len(self.property_value['mainsnak']['datavalue']['value']) == 4
        int(self.property_value['mainsnak']['datavalue']['value']['amount'])
        int(self.property_value['mainsnak']['datavalue']['value']['lowerBound'])
        int(self.property_value['mainsnak']['datavalue']['value']['upperBound'])
        assert self.property_value['mainsnak']['datavalue']['value']['unit'] in {
            '1',
            'http://www.wikidata.org/entity/Q11573',
        }

    def to_json(self):
        return int(self.property_value['mainsnak']['datavalue']['value']['amount'])


@BaseItem.reg
class PopulationItem(QuantityItem):
    props = {
        'P1082',  # population
    }

    PROPERTY_TIME = 'P585'

    def get_date(self):
        props = self.property_value['qualifiers'][self.PROPERTY_TIME]
        dates = DateItem(self.PROPERTY_TIME, {'mainsnak': props[0]}).to_json()
        return dates[0]

    def to_json(self):
        return [super().to_json(), self.get_date()]


@BaseItem.reg
class GlobeCoordinateItem(BaseItem):
    type = 'globe-coordinate'

    def assert_mainsnak(self):
        if 'hash' in self.property_value['mainsnak']:
            assert len(self.property_value['mainsnak']) == 5
        else:
            assert len(self.property_value['mainsnak']) == 4
        assert self.property_value['mainsnak']['property'] == self.property
        assert self.property_value['mainsnak']['datatype'] == self.type
        assert self.property_value['mainsnak']['snaktype'] == 'value'

        assert len(self.property_value['mainsnak']['datavalue']) == 2
        assert self.property_value['mainsnak']['datavalue']['type'] == 'globecoordinate'

        assert len(self.property_value['mainsnak']['datavalue']['value']) == 5
        assert self.property_value['mainsnak']['datavalue']['value']['altitude'] is None
        assert isinstance(self.property_value['mainsnak']['datavalue']['value']['latitude'], float)
        assert isinstance(self.property_value['mainsnak']['datavalue']['value']['longitude'], float)
        assert isinstance(self.property_value['mainsnak']['datavalue']['value']['precision'], float)
        assert self.property_value['mainsnak']['datavalue']['value']['globe'] == 'http://www.wikidata.org/entity/Q2'

    def to_json(self):
        return (self.property_value['mainsnak']['datavalue']['value']['latitude'],
                self.property_value['mainsnak']['datavalue']['value']['longitude'])


class Cache(object):

    folder = 'cache'

    def __init__(self, url):
        query = urllib.parse.urlparse(url).query
        qs = urllib.parse.parse_qs(query)
        self.file_name = os.path.join(self.folder, '{}.json'.format(qs.get('ids', qs.get('titles'))[0]))

    def exists(self):
        return os.path.exists(self.file_name)

    def json(self):
        with open(self.file_name) as file:
            return json.load(file)

    def save(self, data):
        with open(self.file_name, 'w') as file:
            json.dump(data, file, ensure_ascii=False, indent=4, sort_keys=True)


class CachedSession(requests.sessions.Session):

    def __init__(self):
        super().__init__()
        os.makedirs(Cache.folder, exist_ok=True)

    def get(self, url):
        cache = Cache(url)
        if cache.exists():
            return cache
        response = super().get(url)
        cache.save(response.json())
        return response


def fetch_wikidata(qid, wikidatas, properties, depth=0, session=None):
    if qid in wikidatas and ('p' in wikidatas[qid] or depth > 0):
        return

    if depth >= MAX_DEPTH:
        return

    if not session:
        session = CachedSession()

    pid = None
    try:
        url = WIKIDATA_API_URL + '?' + urllib.parse.urlencode(dict(WIKIDATA_ARGS, ids=qid))
        data = session.get(url).json()

        wikidatas[qid] = {
            'n': MultiLang({
                lang: label['value']
                for lang, label in data['entities'][qid]['labels'].items()
                if lang in LANGS
            }, strict=False, id=qid),
            'l': MultiLang({
                lang.replace('wiki', '').replace('_', '-').replace('be-x-old', 'be-tarask'): sitelink['title']
                for lang, sitelink in data['entities'][qid]['sitelinks'].items()
                if lang.replace('wiki', '').replace('_', '-').replace('be-x-old', 'be-tarask') in LANGS
            }, strict=False, id=qid),
        }

        if depth == 0 and 'p' not in wikidatas[qid] and any(
                        p['mainsnak']['datavalue']['value']['numeric-id'] in INSTANCES
                        for p in data['entities'][qid]['claims'].get(INSTANCE_OF, [])):
            wikidatas[qid]['p'] = defaultdict(list)
            for pid, property_values in data['entities'][qid]['claims'].items():
                for instance in data['entities'][qid]['claims'][INSTANCE_OF]:
                    if pid in INSTANCES.get(instance['mainsnak']['datavalue']['value']['numeric-id'], []):
                        break
                else:
                    continue
                for property_value in property_values:
                    assert pid == property_value['mainsnak']['property']
                    if pid not in properties:
                        url = WIKIDATA_API_URL + '?' + urllib.parse.urlencode(dict(WIKIDATA_ARGS, ids=pid))
                        properties[pid] = MultiLang({
                            value['language']: value['value']
                            for value in session.get(url).json()['entities'][pid]['labels'].values()
                            if value['language'] in LANGS
                        }, strict=False, id=pid)

                    for cls in BaseItem.classes:
                        instance = cls(pid, property_value, session)
                        try:
                            if instance.check():
                                instance.assert_value()
                                value_data = instance.to_json()
                                if value_data and instance.download_value:
                                    fetch_wikidata(value_data, wikidatas, properties, depth + 1, session)
                                break
                        except:
                            print(qid, pid,
                                  json.dumps(property_value, ensure_ascii=False, indent=4, sort_keys=True))
                            raise
                    else:
                        print(qid, pid,
                              json.dumps(property_value, ensure_ascii=False, indent=4, sort_keys=True))
                        raise TypeError

                    if not value_data:
                        continue

                    if instance.type != RefItem.type and isinstance(value_data, str) and value_data.startswith('Q'):
                        print(qid, pid, wikidatas[qid]['p'][pid][0], instance.type,
                              json.dumps(property_value['mainsnak'], ensure_ascii=False, indent=4, sort_keys=True))

                    if instance.type == DateItem.type:
                        wikidatas[qid]['p'][pid].extend(value_data)
                        dates = sorted(set(wikidatas[qid]['p'][pid]))
                        if len(dates) > 2:
                            wikidatas[qid]['p'][pid] = [dates[0], dates[-1]]
                        else:
                            wikidatas[qid]['p'][pid] = dates
                    else:
                        wikidatas[qid]['p'][pid].append(value_data)
    except Exception:
        print(qid, pid)
        raise


def base62_hash(val):
    alphabet = string.ascii_letters + string.digits

    hash = hashlib.md5(val.encode('utf8')).hexdigest()

    num = int(hash, 16)
    if num == 0:
        return alphabet[0]
    arr = []
    base = len(alphabet)
    while num:
        rem = num % base
        num = num // base
        arr.append(alphabet[rem])
    arr.reverse()
    return ''.join(arr)


def get_relation_streets():
    import overpy

    api = overpy.Overpass()

    request = api.query('''
        [out:json][timeout:60];
        (
          area["admin_level"="2"]["name"="Беларусь"]->.b;
          relation["type"="street"]["name:etymology:wikidata"](area.b);
          relation["type"="associatedStreet"]["name:etymology:wikidata"](area.b);
        );
        out;
        ''')

    result = {}
    for rel in request.relations:
        if rel.tags.get('type') not in ['street', 'associatedStreet']:
            continue
        for way in rel.members:
            if way.role not in ['street']:
                continue
            assert way._type_value == 'way'
            result[way.ref] = rel.tags
    return result


def main(cursor):
    sql = """
        SELECT name, name_t, name_b, name_r, city, city_t, city_b, city_r, wikidata,
               ST_AsGeoJSON(ST_Simplify(geom, 0.0001, TRUE)),
               ST_AsGeoJSON(ST_Simplify(ngeom, 0.0001, TRUE)),
               ST_Length(geom::geography),
               ST_Length(ngeom::geography)
        FROM (
            SELECT w.tags->'name' AS name, MAX(w.tags->'name:be-tarask') AS name_t,
                   MAX(w.tags->'name:be') AS name_b, MAX(w.tags->'name:ru') AS name_r,
                   w.ptags->'name' AS city, MAX(w.ptags->'name:be-tarask') AS city_t,
                   MAX(w.ptags->'name:be') AS city_b, MAX(w.ptags->'name:ru') AS city_r,
                   MAX(w.tags->'name:etymology:wikidata') AS wikidata,
                   ST_LineMerge(ST_Union(w.way)) AS geom,
                   CASE WHEN COUNT(*) = 1 THEN ST_Union(w.way)
                        ELSE ST_LineMerge(ST_ApproximateMedialAxis(ST_SimplifyPreserveTopology(ST_Union(w.buff), 0.00035)))
                   END AS ngeom
            FROM (
                SELECT w.osm_id AS osm_id, w.tags AS tags, w.way AS way, p.osm_id AS posm_id, p.tags AS ptags,
                       ST_Buffer(w.way, 0.001, 'endcap=square join=mitre') AS buff
                FROM osm_polygon c
                LEFT JOIN osm_polygon p ON ST_Intersects(c.way, p.way)
                LEFT JOIN (
                  SELECT osm_id, tags, way FROM osm_line WHERE tags ? 'highway'
                  {}
                ) w ON ST_Intersects(p.way, w.way)
                WHERE c.osm_id = -59065
                AND p.tags ?& ARRAY['place', 'name']
                AND p.tags->'place' IN ('city', 'town', 'village', 'hamlet')
                AND w.tags ? 'name'
                AND (w.tags ? 'highway' OR w.tags->'type' IN ('street', 'associatedStreet'))
            ) w
            GROUP BY w.ptags->'name', w.tags->'name'
        ) g
        WHERE wikidata IS NOT NULL
    """

    results = get_relation_streets()
    cursor.execute(sql.format(''.join(
        """\n UNION SELECT osm_id, '{}'::hstore || tags, way FROM osm_line WHERE osm_id = {}""".format(
            ','.join('"{}"=>"{}"'.format(k, v.replace("'", "''"))
                     for k, v in tags.items()), osm_id) for osm_id, tags in results.items())))
    data = list(cursor.fetchall())
    print(len(data))
    i = 0
    result, wd_items, wd_properties = {}, {}, {}
    err = defaultdict(set)

    for (name, name_be_tarask, name_be, name_ru,
         city, city_be_tarask, city_be, city_ru,
         wikidata, geom, ngeom, geom_length, ngeom_length) in data:

        assert name_be_tarask and city_be_tarask, '{} + {}'.format(name, city)
        uid = base62_hash('{}_{}'.format(city_be_tarask, name_be_tarask))[:4]
        assert uid not in result, '{} + {}'.format(name, city)
        result[uid] = {
            'n': MultiLang({
                'be-tarask': name_be_tarask,
                'be': name_be,
                'ru': name_ru,
                'en': lacin(name_be_tarask),
            }),
            'c': MultiLang({
                'be-tarask': city_be_tarask,
                'be': city_be,
                'ru': city_ru,
                'en': lacin(city_be_tarask),
            }),
            'w': wikidata,
            'l': int(ngeom_length),
            'g': json.loads(ngeom),
        }
        for qid in wikidata.split(';'):
            fetch_wikidata(qid, wd_items, wd_properties)
        i += 1
        print(i, wikidata, len(wd_items), len(wd_properties))

    for x in sorted(set(str(x) for x in err.items())):
        print(x)
    for lang in LANGS:
        os.makedirs('data', exist_ok=True)
        with open(os.path.join('data', '{}.json'.format(lang)), 'w') as file:
            json.dump({
                'results': result,
                'wd_items': wd_items,
                'wd_properties': wd_properties,
                'translations': json.load(open('translations/{}.json'.format(lang))),
                'language': lang,
            }, file, ensure_ascii=False, sort_keys=True, separators=(',', ':'),
                cls=type('XXMultiLangJSONEncoder', (MultiLangJSONEncoder,), {'lang': lang}))


@contextmanager
def _cursor_context(dbname, host, port, user, password):
    conn = psycopg2.connect(dbname=dbname, host=host, port=port, user=user, password=password)
    cursor = conn.cursor()
    psycopg2.extensions.register_type(psycopg2.extensions.UNICODE, cursor)
    yield cursor
    cursor.close()
    conn.close()


if __name__ == '__main__':
    parser = ArgumentParser(description='Generate osm-streets data file.', add_help=False)
    parser.add_argument('DBNAME', type=str, help='database server host')
    parser.add_argument('-h', '--host', type=str, help='database server host')
    parser.add_argument('-p', '--port', type=str, default='5432', help='database server port')
    parser.add_argument('-U', '--username', type=str, help='database user name')
    parser.add_argument('-W', '--password', type=str, help='database user password')
    args = parser.parse_args()
    with _cursor_context(args.DBNAME, args.host, args.port, args.username, args.password) as cursor:
        main(cursor)
