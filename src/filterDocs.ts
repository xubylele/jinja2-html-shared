// Pure data + lookup for built-in Jinja2 filter documentation.
// Consumers (free / Pro extensions) resolve `descriptionKey` via their own i18n layer.

export interface FilterDoc {
  name: string;
  signature: string;
  /** i18n key, e.g. `filter.abs.description`. Resolved by the consumer. */
  descriptionKey: string;
  example: string;
}

const ENTRIES: ReadonlyArray<Omit<FilterDoc, "descriptionKey">> = [
  { name: "abs", signature: "abs(number)", example: "{{ -42|abs }}" },
  { name: "attr", signature: "attr(obj, name)", example: '{{ user|attr("name") }}' },
  {
    name: "batch",
    signature: "batch(value, linecount, fill_with=None)",
    example: "{{ items|batch(3) }}",
  },
  { name: "capitalize", signature: "capitalize(s)", example: '{{ "hello"|capitalize }}' },
  { name: "center", signature: "center(value, width=80)", example: '{{ "hello"|center(20) }}' },
  {
    name: "default",
    signature: 'default(value, default_value="", boolean=False)',
    example: '{{ undefined_var|default("N/A") }}',
  },
  {
    name: "dictsort",
    signature: 'dictsort(value, case_sensitive=False, by="key", reverse=False)',
    example: "{{ my_dict|dictsort }}",
  },
  { name: "escape", signature: "escape(s)", example: "{{ user_input|escape }}" },
  {
    name: "filesizeformat",
    signature: "filesizeformat(value, binary=False)",
    example: "{{ 1000000|filesizeformat }}",
  },
  { name: "first", signature: "first(seq)", example: "{{ [1, 2, 3]|first }}" },
  { name: "float", signature: "float(value, default=0.0)", example: '{{ "42.5"|float }}' },
  { name: "forceescape", signature: "forceescape(value)", example: '{{ "<script>"|forceescape }}' },
  {
    name: "format",
    signature: "format(value, *args, **kwargs)",
    example: '{{ "Hello %s!"|format(name) }}',
  },
  {
    name: "groupby",
    signature: "groupby(value, attribute, default=None, case_sensitive=False)",
    example: '{{ users|groupby("age") }}',
  },
  {
    name: "indent",
    signature: "indent(s, width=4, indentfirst=False)",
    example: "{{ text|indent(2) }}",
  },
  { name: "int", signature: "int(value, default=0, base=10)", example: '{{ "42"|int }}' },
  {
    name: "join",
    signature: 'join(value, d="", attribute=None)',
    example: '{{ ["a", "b", "c"]|join(", ") }}',
  },
  { name: "last", signature: "last(seq)", example: "{{ [1, 2, 3]|last }}" },
  { name: "length", signature: "length(object)", example: "{{ my_list|length }}" },
  { name: "list", signature: "list(value)", example: '{{ "abc"|list }}' },
  { name: "lower", signature: "lower(s)", example: '{{ "HELLO"|lower }}' },
  {
    name: "map",
    signature: "map(value, *args, **kwargs)",
    example: '{{ users|map(attribute="name")|join(", ") }}',
  },
  {
    name: "max",
    signature: "max(value, case_sensitive=False, attribute=None)",
    example: "{{ [3, 1, 2]|max }}",
  },
  {
    name: "min",
    signature: "min(value, case_sensitive=False, attribute=None)",
    example: "{{ [3, 1, 2]|min }}",
  },
  { name: "pprint", signature: "pprint(value, verbose=False)", example: "{{ my_object|pprint }}" },
  { name: "random", signature: "random(seq)", example: "{{ [1, 2, 3]|random }}" },
  {
    name: "reject",
    signature: "reject(value, *args, **kwargs)",
    example: '{{ numbers|reject("odd")|list }}',
  },
  {
    name: "rejectattr",
    signature: "rejectattr(value, *args, **kwargs)",
    example: '{{ users|rejectattr("is_active")|list }}',
  },
  {
    name: "replace",
    signature: "replace(s, old, new, count=None)",
    example: '{{ "hello world"|replace("world", "jinja") }}',
  },
  { name: "reverse", signature: "reverse(value)", example: "{{ [1, 2, 3]|reverse|list }}" },
  {
    name: "round",
    signature: 'round(value, precision=0, method="common")',
    example: "{{ 2.7|round }}",
  },
  { name: "safe", signature: "safe(value)", example: "{{ html_content|safe }}" },
  {
    name: "select",
    signature: "select(value, *args, **kwargs)",
    example: '{{ numbers|select("odd")|list }}',
  },
  {
    name: "selectattr",
    signature: "selectattr(value, *args, **kwargs)",
    example: '{{ users|selectattr("is_active")|list }}',
  },
  {
    name: "slice",
    signature: "slice(value, slices, fill_with=None)",
    example: "{{ [1, 2, 3, 4, 5]|slice(2)|list }}",
  },
  {
    name: "sort",
    signature: "sort(value, reverse=False, case_sensitive=False, attribute=None)",
    example: "{{ [3, 1, 2]|sort|list }}",
  },
  { name: "string", signature: "string(object)", example: "{{ 42|string }}" },
  { name: "striptags", signature: "striptags(value)", example: '{{ "<b>Hello</b>"|striptags }}' },
  {
    name: "sum",
    signature: "sum(iterable, attribute=None, start=0)",
    example: "{{ [1, 2, 3]|sum }}",
  },
  { name: "title", signature: "title(s)", example: '{{ "hello world"|title }}' },
  { name: "trim", signature: "trim(value)", example: '{{ "  hello  "|trim }}' },
  {
    name: "truncate",
    signature: 'truncate(s, length=255, killwords=False, end="...")',
    example: "{{ long_text|truncate(100) }}",
  },
  {
    name: "unique",
    signature: "unique(value, case_sensitive=False, attribute=None)",
    example: '{{ ["a", "b", "a"]|unique|list }}',
  },
  { name: "upper", signature: "upper(s)", example: '{{ "hello"|upper }}' },
  { name: "urlencode", signature: "urlencode(value)", example: '{{ "hello world"|urlencode }}' },
  {
    name: "urlize",
    signature: "urlize(value, trim_url_limit=None, nofollow=False, target=None)",
    example: '{{ "Visit http://example.com"|urlize }}',
  },
  { name: "wordcount", signature: "wordcount(s)", example: '{{ "hello world"|wordcount }}' },
  {
    name: "wordwrap",
    signature: "wordwrap(s, width=79, break_long_words=True, wrapstring=None)",
    example: "{{ long_text|wordwrap(80) }}",
  },
  {
    name: "xmlattr",
    signature: "xmlattr(d, autospace=True)",
    example: '{{ {"class": "header"}|xmlattr }}',
  },
  { name: "tojson", signature: "tojson(value)", example: "{{ my_data|tojson }}" },
  { name: "items", signature: "items(value)", example: "{{ my_dict|items|list }}" },
];

export const FILTER_DOCS: Readonly<Record<string, FilterDoc>> = Object.freeze(
  ENTRIES.reduce<Record<string, FilterDoc>>((acc, e) => {
    acc[e.name] = { ...e, descriptionKey: `filter.${e.name}.description` };
    return acc;
  }, {})
);

export function getFilterDoc(name: string): FilterDoc | undefined {
  return FILTER_DOCS[name];
}

export function listFilterNames(): string[] {
  return Object.keys(FILTER_DOCS);
}
