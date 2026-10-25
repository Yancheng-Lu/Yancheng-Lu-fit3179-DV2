{
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "Six-metric radar profiles of Australian-linked films grouped into 1980–1989, 1990–1999, 2000–2009, 2010–2019 and 2020–2025. Each metric is normalized as 100 × decade value / maximum across these five decades, retaining a meaningful zero. Missing values are omitted. Financial metrics use valid positive records; genre diversity counts distinct genre tags.",
  "width": 820,
  "height": 380,
  "padding": 12,
  "background": "white",
  "signals": [
    {
      "name": "focusDecade",
      "value": "All five decades",
      "bind": {
        "input": "select",
        "name": "Emphasise decade: ",
        "options": [
          "All five decades",
          "1980s",
          "1990s",
          "2000s",
          "2010s",
          "2020s"
        ]
      }
    },
    {
      "name": "centerX",
      "value": 410
    },
    {
      "name": "centerY",
      "value": 215
    },
    {
      "name": "radius",
      "value": 175
    }
  ],
  "data": [
    {
      "name": "movies",
      "url": "https://raw.githubusercontent.com/Yancheng-Lu/fit3179-australian-movies/refs/heads/main/data/movies_combined_1980_2025.csv",
      "format": {
        "type": "csv",
        "parse": {
          "year": "number",
          "score": "number",
          "gross": "number",
          "is_australian": "number",
          "budget": "number"
        }
      },
      "transform": [
        {
          "type": "filter",
          "expr": "datum.is_australian === 1 && datum.year >= 1980 && datum.year <= 2025"
        },
        {
          "type": "formula",
          "as": "film_id",
          "expr": "isValid(datum.tmdb_id) && trim(toString(datum.tmdb_id)) !== '' && toNumber(datum.tmdb_id) > 0 ? 'tmdb:' + toString(toNumber(datum.tmdb_id)) : 'legacy:' + lower(trim(datum.name || '')) + '|' + toString(datum.year) + '|' + lower(trim(datum.director || ''))"
        },
        {
          "type": "aggregate",
          "groupby": [
            "film_id"
          ],
          "ops": [
            "argmax"
          ],
          "fields": [
            "year"
          ],
          "as": [
            "film"
          ]
        },
        {
          "type": "formula",
          "as": "name",
          "expr": "datum.film.name"
        },
        {
          "type": "formula",
          "as": "year",
          "expr": "datum.film.year"
        },
        {
          "type": "formula",
          "as": "score",
          "expr": "datum.film.score"
        },
        {
          "type": "formula",
          "as": "gross",
          "expr": "datum.film.gross"
        },
        {
          "type": "formula",
          "as": "budget",
          "expr": "datum.film.budget"
        },
        {
          "type": "formula",
          "as": "production_countries",
          "expr": "datum.film.production_countries"
        },
        {
          "type": "formula",
          "as": "profile_decade",
          "expr": "toString(floor(datum.year/10)*10)+'s'"
        },
        {
          "type": "formula",
          "as": "genres",
          "expr": "datum.film.genres || datum.film.genre || ''"
        }
      ]
    },
    {
      "name": "metricDefinitions",
      "values": [
        {
          "metric": "film_count",
          "label": [
            "Film count"
          ],
          "unit": "films",
          "order": 0
        },
        {
          "metric": "median_gross",
          "label": [
            "Median worldwide",
            "gross"
          ],
          "unit": "USD",
          "order": 1
        },
        {
          "metric": "median_budget",
          "label": [
            "Median production",
            "budget"
          ],
          "unit": "USD",
          "order": 2
        },
        {
          "metric": "median_score",
          "label": [
            "Median audience",
            "score"
          ],
          "unit": "score",
          "order": 3
        },
        {
          "metric": "genre_diversity",
          "label": [
            "Genre diversity",
            "distinct tags"
          ],
          "unit": "genres",
          "order": 4
        },
        {
          "metric": "collaboration_rate",
          "label": [
            "International",
            "collaboration rate"
          ],
          "unit": "percent",
          "order": 5
        }
      ]
    },
    {
      "name": "decadeCounts",
      "source": "movies",
      "transform": [
        {
          "type": "aggregate",
          "groupby": [
            "profile_decade"
          ],
          "ops": [
            "count"
          ],
          "fields": [
            null
          ],
          "as": [
            "film_count"
          ]
        }
      ]
    },
    {
      "name": "scores",
      "source": "movies",
      "transform": [
        {
          "type": "filter",
          "expr": "isValid(datum.score) && isFinite(datum.score) && datum.score > 0"
        },
        {
          "type": "aggregate",
          "groupby": [
            "profile_decade"
          ],
          "ops": [
            "median",
            "count"
          ],
          "fields": [
            "score",
            null
          ],
          "as": [
            "median_score",
            "score_n"
          ]
        }
      ]
    },
    {
      "name": "grosses",
      "source": "movies",
      "transform": [
        {
          "type": "filter",
          "expr": "isValid(datum.gross) && isFinite(datum.gross) && datum.gross > 0"
        },
        {
          "type": "aggregate",
          "groupby": [
            "profile_decade"
          ],
          "ops": [
            "median",
            "count"
          ],
          "fields": [
            "gross",
            null
          ],
          "as": [
            "median_gross",
            "gross_n"
          ]
        }
      ]
    },
    {
      "name": "budgets",
      "source": "movies",
      "transform": [
        {
          "type": "filter",
          "expr": "isValid(datum.budget) && isFinite(datum.budget) && datum.budget > 0"
        },
        {
          "type": "aggregate",
          "groupby": [
            "profile_decade"
          ],
          "ops": [
            "median",
            "count"
          ],
          "fields": [
            "budget",
            null
          ],
          "as": [
            "median_budget",
            "budget_n"
          ]
        }
      ]
    },
    {
      "name": "filmCountries",
      "source": "movies",
      "transform": [
        {
          "type": "filter",
          "expr": "isValid(datum.production_countries) && trim(datum.production_countries) !== ''"
        },
        {
          "type": "formula",
          "as": "countries",
          "expr": "split(datum.production_countries,'|')"
        },
        {
          "type": "flatten",
          "fields": [
            "countries"
          ],
          "as": [
            "country"
          ]
        },
        {
          "type": "formula",
          "as": "country",
          "expr": "trim(datum.country) === 'United States' || trim(datum.country) === 'United States of America' ? 'United States of America' : trim(datum.country) === 'UK' ? 'United Kingdom' : trim(datum.country) === 'Russian Federation' ? 'Russia' : trim(datum.country)"
        },
        {
          "type": "filter",
          "expr": "datum.country !== ''"
        },
        {
          "type": "aggregate",
          "groupby": [
            "film_id",
            "profile_decade",
            "country"
          ]
        },
        {
          "type": "aggregate",
          "groupby": [
            "film_id",
            "profile_decade"
          ],
          "ops": [
            "count"
          ],
          "fields": [
            null
          ],
          "as": [
            "country_count"
          ]
        },
        {
          "type": "formula",
          "as": "international",
          "expr": "datum.country_count > 1 ? 1 : 0"
        }
      ]
    },
    {
      "name": "collaborations",
      "source": "filmCountries",
      "transform": [
        {
          "type": "aggregate",
          "groupby": [
            "profile_decade"
          ],
          "ops": [
            "mean",
            "count"
          ],
          "fields": [
            "international",
            null
          ],
          "as": [
            "collaboration_rate",
            "collaboration_n"
          ]
        }
      ]
    },
    {
      "name": "genreTags",
      "source": "movies",
      "transform": [
        {
          "type": "formula",
          "as": "tags",
          "expr": "split(datum.genres,'|')"
        },
        {
          "type": "flatten",
          "fields": [
            "tags"
          ],
          "as": [
            "tag"
          ]
        },
        {
          "type": "formula",
          "as": "tag",
          "expr": "trim(datum.tag) === 'Sci-Fi' ? 'Science Fiction' : trim(datum.tag)"
        },
        {
          "type": "filter",
          "expr": "datum.tag !== ''"
        },
        {
          "type": "aggregate",
          "groupby": [
            "profile_decade",
            "film_id",
            "tag"
          ]
        }
      ]
    },
    {
      "name": "genreDiversity",
      "source": "genreTags",
      "transform": [
        {
          "type": "aggregate",
          "groupby": [
            "profile_decade"
          ],
          "ops": [
            "distinct",
            "distinct"
          ],
          "fields": [
            "tag",
            "film_id"
          ],
          "as": [
            "genre_diversity",
            "diversity_n"
          ]
        }
      ]
    },
    {
      "name": "profiles",
      "source": "decadeCounts",
      "transform": [
        {
          "type": "lookup",
          "from": "scores",
          "key": "profile_decade",
          "fields": [
            "profile_decade"
          ],
          "values": [
            "median_score",
            "score_n"
          ],
          "as": [
            "median_score",
            "score_n"
          ]
        },
        {
          "type": "lookup",
          "from": "grosses",
          "key": "profile_decade",
          "fields": [
            "profile_decade"
          ],
          "values": [
            "median_gross",
            "gross_n"
          ],
          "as": [
            "median_gross",
            "gross_n"
          ]
        },
        {
          "type": "lookup",
          "from": "budgets",
          "key": "profile_decade",
          "fields": [
            "profile_decade"
          ],
          "values": [
            "median_budget",
            "budget_n"
          ],
          "as": [
            "median_budget",
            "budget_n"
          ]
        },
        {
          "type": "lookup",
          "from": "collaborations",
          "key": "profile_decade",
          "fields": [
            "profile_decade"
          ],
          "values": [
            "collaboration_rate",
            "collaboration_n"
          ],
          "as": [
            "collaboration_rate",
            "collaboration_n"
          ]
        },
        {
          "type": "lookup",
          "from": "genreDiversity",
          "key": "profile_decade",
          "fields": [
            "profile_decade"
          ],
          "values": [
            "genre_diversity",
            "diversity_n"
          ],
          "as": [
            "genre_diversity",
            "diversity_n"
          ]
        }
      ]
    },
    {
      "name": "points",
      "source": "profiles",
      "transform": [
        {
          "type": "fold",
          "fields": [
            "film_count",
            "median_gross",
            "median_budget",
            "median_score",
            "genre_diversity",
            "collaboration_rate"
          ],
          "as": [
            "metric",
            "raw_value"
          ]
        },
        {
          "type": "lookup",
          "from": "metricDefinitions",
          "key": "metric",
          "fields": [
            "metric"
          ],
          "values": [
            "order",
            "unit"
          ],
          "as": [
            "order",
            "unit"
          ]
        },
        {
          "type": "filter",
          "expr": "isValid(datum.raw_value) && isFinite(datum.raw_value)"
        },
        {
          "type": "joinaggregate",
          "groupby": [
            "metric"
          ],
          "ops": [
            "min",
            "max"
          ],
          "fields": [
            "raw_value",
            "raw_value"
          ],
          "as": [
            "min_value",
            "max_value"
          ]
        },
        {
          "type": "formula",
          "as": "normalized",
          "expr": "datum.max_value > 0 ? 100*datum.raw_value/datum.max_value : 0"
        },
        {
          "type": "formula",
          "as": "sample_n",
          "expr": "datum.metric === 'film_count' ? datum.film_count : datum.metric === 'median_score' ? datum.score_n : datum.metric === 'median_gross' ? datum.gross_n : datum.metric === 'median_budget' ? datum.budget_n : datum.metric === 'genre_diversity' ? datum.diversity_n : datum.collaboration_n"
        },
        {
          "type": "formula",
          "as": "angle",
          "expr": "-PI/2+datum.order*PI/3"
        },
        {
          "type": "formula",
          "as": "px",
          "expr": "centerX+radius*datum.normalized/100*cos(datum.angle)"
        },
        {
          "type": "formula",
          "as": "py",
          "expr": "centerY+radius*datum.normalized/100*sin(datum.angle)"
        },
        {
          "type": "formula",
          "as": "raw_label",
          "expr": "datum.unit === 'USD' ? format(datum.raw_value,'$,.0f') : datum.unit === 'percent' ? format(datum.raw_value,'.1%') : datum.unit === 'films' || datum.unit === 'genres' ? format(datum.raw_value,',.0f') : format(datum.raw_value,'.2f')"
        }
      ]
    },
    {
      "name": "rings",
      "values": [
        {
          "level": 25
        },
        {
          "level": 50
        },
        {
          "level": 75
        },
        {
          "level": 100
        }
      ],
      "transform": [
        {
          "type": "formula",
          "as": "path",
          "expr": "'M' + (centerX+radius*datum.level/100*cos(-PI/2+0*PI/3)) + ',' + (centerY+radius*datum.level/100*sin(-PI/2+0*PI/3)) + 'L' + (centerX+radius*datum.level/100*cos(-PI/2+1*PI/3)) + ',' + (centerY+radius*datum.level/100*sin(-PI/2+1*PI/3)) + 'L' + (centerX+radius*datum.level/100*cos(-PI/2+2*PI/3)) + ',' + (centerY+radius*datum.level/100*sin(-PI/2+2*PI/3)) + 'L' + (centerX+radius*datum.level/100*cos(-PI/2+3*PI/3)) + ',' + (centerY+radius*datum.level/100*sin(-PI/2+3*PI/3)) + 'L' + (centerX+radius*datum.level/100*cos(-PI/2+4*PI/3)) + ',' + (centerY+radius*datum.level/100*sin(-PI/2+4*PI/3)) + 'L' + (centerX+radius*datum.level/100*cos(-PI/2+5*PI/3)) + ',' + (centerY+radius*datum.level/100*sin(-PI/2+5*PI/3)) + 'Z'"
        }
      ]
    },
    {
      "name": "axes",
      "source": "metricDefinitions",
      "transform": [
        {
          "type": "formula",
          "as": "angle",
          "expr": "-PI/2+datum.order*PI/3"
        },
        {
          "type": "formula",
          "as": "x2",
          "expr": "centerX+radius*cos(datum.angle)"
        },
        {
          "type": "formula",
          "as": "y2",
          "expr": "centerY+radius*sin(datum.angle)"
        },
        {
          "type": "formula",
          "as": "labelX",
          "expr": "centerX+(radius+28)*cos(datum.angle)"
        },
        {
          "type": "formula",
          "as": "labelY",
          "expr": "centerY+(radius+28)*sin(datum.angle)"
        }
      ]
    },
    {
      "name": "completeProfiles",
      "source": "points",
      "transform": [
        {
          "type": "joinaggregate",
          "groupby": [
            "profile_decade"
          ],
          "ops": [
            "count"
          ],
          "fields": [
            null
          ],
          "as": [
            "metric_count"
          ]
        },
        {
          "type": "filter",
          "expr": "datum.metric_count === 6"
        }
      ]
    }
  ],
  "scales": [
    {
      "name": "decadeColor",
      "type": "ordinal",
      "domain": [
        "1980s",
        "1990s",
        "2000s",
        "2010s",
        "2020s"
      ],
      "range": [
        "#173f6b",
        "#619bc1",
        "#ce8058",
        "#6d668f",
        "#428c82"
      ]
    }
  ],
  "legends": [
    {
      "stroke": "decadeColor",
      "orient": "none",
      "direction": "vertical",
      "columns": 1,
      "title": null,
      "labelFont": "Arial",
      "labelFontSize": 12,
      "labelColor": "#243e52",
      "symbolType": "stroke",
      "symbolStrokeWidth": 3,
      "legendX": 748,
      "legendY": 0,
      "rowPadding": 8
    }
  ],
  "marks": [
    {
      "type": "path",
      "from": {
        "data": "rings"
      },
      "interactive": false,
      "encode": {
        "update": {
          "path": {
            "field": "path"
          },
          "fill": {
            "value": null
          },
          "stroke": {
            "value": "#d8e3ec"
          },
          "strokeWidth": {
            "value": 1
          }
        }
      }
    },
    {
      "type": "rule",
      "from": {
        "data": "axes"
      },
      "interactive": false,
      "encode": {
        "update": {
          "x": {
            "signal": "centerX"
          },
          "y": {
            "signal": "centerY"
          },
          "x2": {
            "field": "x2"
          },
          "y2": {
            "field": "y2"
          },
          "stroke": {
            "value": "#d8e3ec"
          }
        }
      }
    },
    {
      "type": "text",
      "from": {
        "data": "rings"
      },
      "interactive": false,
      "encode": {
        "update": {
          "x": {
            "signal": "centerX+5"
          },
          "y": {
            "signal": "centerY-radius*datum.level/100+4"
          },
          "text": {
            "field": "level"
          },
          "font": {
            "value": "Arial"
          },
          "fontSize": {
            "value": 10
          },
          "fill": {
            "value": "#7a8c99"
          }
        }
      }
    },
    {
      "type": "text",
      "from": {
        "data": "axes"
      },
      "interactive": false,
      "encode": {
        "update": {
          "x": {
            "field": "labelX"
          },
          "y": {
            "field": "labelY"
          },
          "text": {
            "field": "label"
          },
          "align": {
            "signal": "datum.order === 0 || datum.order === 3 ? 'center' : datum.order < 3 ? 'left' : 'right'"
          },
          "baseline": {
            "value": "middle"
          },
          "font": {
            "value": "Arial"
          },
          "fontSize": {
            "value": 12
          },
          "fontWeight": {
            "value": "bold"
          },
          "lineHeight": {
            "value": 15
          },
          "fill": {
            "value": "#243e52"
          }
        }
      }
    },
    {
      "type": "group",
      "from": {
        "facet": {
          "name": "series",
          "data": "completeProfiles",
          "groupby": [
            "profile_decade"
          ]
        }
      },
      "marks": [
        {
          "type": "line",
          "from": {
            "data": "series"
          },
          "sort": {
            "field": "datum.order"
          },
          "encode": {
            "update": {
              "x": {
                "field": "px"
              },
              "y": {
                "field": "py"
              },
              "interpolate": {
                "value": "linear-closed"
              },
              "stroke": {
                "scale": "decadeColor",
                "field": "profile_decade"
              },
              "strokeWidth": {
                "signal": "focusDecade === datum.profile_decade ? 3.5 : 2"
              },
              "strokeOpacity": {
                "signal": "focusDecade === 'All five decades' || focusDecade === datum.profile_decade ? 0.95 : 0.12"
              },
              "fill": {
                "scale": "decadeColor",
                "field": "profile_decade"
              },
              "fillOpacity": {
                "signal": "focusDecade === datum.profile_decade ? 0.12 : focusDecade === 'All five decades' ? 0.035 : 0.01"
              }
            }
          }
        }
      ]
    },
    {
      "name": "profilePoints",
      "type": "symbol",
      "from": {
        "data": "points"
      },
      "encode": {
        "update": {
          "x": {
            "field": "px"
          },
          "y": {
            "field": "py"
          },
          "size": {
            "signal": "focusDecade === datum.profile_decade ? 80 : 42"
          },
          "fill": {
            "scale": "decadeColor",
            "field": "profile_decade"
          },
          "fillOpacity": {
            "signal": "focusDecade === 'All five decades' || focusDecade === datum.profile_decade ? 1 : 0.15"
          },
          "stroke": {
            "value": "white"
          },
          "strokeWidth": {
            "value": 1
          },
          "cursor": {
            "value": "pointer"
          },
          "tooltip": {
            "signal": "{'Decade':datum.profile_decade,'Metric':replace(datum.metric, /_/g, ' '),'Actual value':datum.raw_label,'Normalized (0–100)':format(datum.normalized,'.1f'),'Valid films':datum.sample_n}"
          }
        }
      }
    }
  ]
}
