{
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "width": 840,
  "height": 450,
  "padding": {
    "top": 16,
    "left": 12,
    "right": 16,
    "bottom": 0
  },
  "background": "white",
  "signals": [
    {
      "name": "selectedGenre",
      "value": "All genres"
    },
    {
      "name": "yearStart",
      "value": 1980
    },
    {
      "name": "yearEnd",
      "value": 2025
    },
    {
      "name": "pulseTime",
      "value": 0,
      "on": [
        {
          "events": {
            "type": "timer",
            "throttle": 40
          },
          "update": "now()"
        }
      ]
    },
    {
      "name": "hoverCountry",
      "value": null,
      "on": [
        {
          "events": "@scoreShapes:mouseover",
          "update": "datum.country"
        },
        {
          "events": "@scoreShapes:mouseout",
          "update": "null"
        }
      ]
    }
  ],
  "projections": [
    {
      "name": "worldProjection",
      "type": "equalEarth",
      "scale": 160,
      "translate": [
        {
          "signal": "width / 2"
        },
        {
          "signal": "height / 2 + 15"
        }
      ]
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
          "score": "number"
        }
      }
    },
    {
      "name": "world",
      "url": "https://raw.githubusercontent.com/FIT3179/Vega-Lite/main/3_choropleth_map/js/ne_110m_admin_0_countries.topojson",
      "format": {
        "type": "topojson",
        "feature": "ne_110m_admin_0_countries"
      }
    },
    {
      "name": "countryScores",
      "transform": [
        {
          "type": "filter",
          "expr": "datum.year >= yearStart && datum.year <= yearEnd && (selectedGenre === 'All genres' || indexof(split(datum.genre || '', '|'), selectedGenre) >= 0)"
        },
        {
          "type": "filter",
          "expr": "datum.year >= 1980 && datum.year <= 2025 && isValid(datum.score) && isFinite(datum.score) && datum.score > 0 && datum.production_countries != null && datum.production_countries !== ''"
        },
        {
          "type": "formula",
          "as": "film_id",
          "expr": "isValid(datum.tmdb_id) && trim(toString(datum.tmdb_id)) !== '' && isFinite(toNumber(datum.tmdb_id)) && toNumber(datum.tmdb_id) > 0 ? 'tmdb:' + toString(toNumber(datum.tmdb_id)) : 'legacy:' + lower(trim(datum.name || '')) + '|' + toString(datum.year) + '|' + lower(trim(datum.director || ''))"
        },
        {
          "type": "formula",
          "as": "country_list",
          "expr": "split(datum.production_countries, '|')"
        },
        {
          "type": "flatten",
          "fields": [
            "country_list"
          ],
          "as": [
            "country"
          ]
        },
        {
          "type": "formula",
          "as": "country",
          "expr": "trim(datum.country) === 'United States' || trim(datum.country) === 'United States of America' ? 'United States of America' : trim(datum.country) === 'UK' ? 'United Kingdom' : trim(datum.country) === 'Russia' ? 'Russian Federation' : trim(datum.country)"
        },
        {
          "type": "filter",
          "expr": "datum.country != null && datum.country !== ''"
        },
        {
          "type": "formula",
          "as": "map_country",
          "expr": "datum.country === 'United States' ? 'United States of America' : datum.country === 'UK' ? 'United Kingdom' : datum.country === 'Russia' ? 'Russian Federation' : datum.country"
        },
        {
          "type": "aggregate",
          "groupby": [
            "film_id",
            "country",
            "map_country"
          ],
          "ops": [
            "mean"
          ],
          "fields": [
            "score"
          ],
          "as": [
            "film_score"
          ]
        },
        {
          "type": "aggregate",
          "groupby": [
            "country",
            "map_country"
          ],
          "ops": [
            "mean",
            "count"
          ],
          "fields": [
            "film_score",
            null
          ],
          "as": [
            "average_score",
            "film_count"
          ]
        },
        {
          "type": "lookup",
          "from": "world",
          "key": "properties.NAME",
          "fields": [
            "map_country"
          ],
          "as": [
            "geo"
          ]
        },
        {
          "type": "filter",
          "expr": "datum.geo != null"
        },
        {
          "type": "formula",
          "as": "centroid",
          "expr": "geoCentroid('worldProjection', datum.geo)"
        }
      ],
      "source": "movies"
    },
    {
      "name": "rankedScores",
      "source": "countryScores",
      "transform": [
        {
          "type": "window",
          "sort": {
            "field": [
              "average_score"
            ],
            "order": [
              "descending"
            ]
          },
          "ops": [
            "row_number"
          ],
          "as": [
            "score_rank"
          ]
        }
      ]
    },
    {
      "name": "australia",
      "source": "rankedScores",
      "transform": [
        {
          "type": "filter",
          "expr": "datum.country === 'Australia'"
        }
      ]
    },
    {
      "name": "scoreExtent",
      "source": "countryScores",
      "transform": [
        {
          "type": "aggregate",
          "fields": [
            "average_score",
            "average_score"
          ],
          "ops": [
            "min",
            "max"
          ],
          "as": [
            "min_score",
            "max_score"
          ]
        }
      ]
    }
  ],
  "scales": [
    {
      "name": "scoreColor",
      "type": "linear",
      "domain": {
        "data": "countryScores",
        "field": "average_score"
      },
      "range": {
        "scheme": "blues"
      },
      "zero": false,
      "nice": false,
      "clamp": true
    }
  ],
  "legends": [
    {
      "fill": "scoreColor",
      "title": "Average Score (min–max)",
      "orient": "right",
      "gradientLength": 160,
      "gradientThickness": 12,
      "titleFont": "Arial",
      "titleFontSize": 11,
      "titleColor": "#44515C",
      "labelFont": "Arial",
      "labelFontSize": 10,
      "labelColor": "#66717A",
      "format": ".2f",
      "offset": 18,
      "values": {
        "signal": "length(data('scoreExtent')) && isValid(data('scoreExtent')[0].min_score) && isValid(data('scoreExtent')[0].max_score) ? (data('scoreExtent')[0].min_score === data('scoreExtent')[0].max_score ? [data('scoreExtent')[0].min_score] : [data('scoreExtent')[0].min_score, (data('scoreExtent')[0].min_score + data('scoreExtent')[0].max_score) / 2, data('scoreExtent')[0].max_score]) : []"
      }
    }
  ],
  "marks": [
    {
      "type": "shape",
      "from": {
        "data": "world"
      },
      "transform": [
        {
          "type": "geoshape",
          "projection": "worldProjection"
        }
      ],
      "encode": {
        "update": {
          "fill": {
            "value": "#E9EDF0"
          },
          "stroke": {
            "value": "white"
          },
          "strokeWidth": {
            "value": 0.7
          }
        }
      }
    },
    {
      "name": "scoreShapes",
      "type": "shape",
      "from": {
        "data": "rankedScores"
      },
      "transform": [
        {
          "type": "geoshape",
          "projection": "worldProjection",
          "field": "datum.geo"
        }
      ],
      "encode": {
        "update": {
          "fill": {
            "scale": "scoreColor",
            "field": "average_score"
          },
          "fillOpacity": {
            "signal": "hoverCountry === null || hoverCountry === datum.country ? 0.92 : 0.38"
          },
          "stroke": {
            "signal": "hoverCountry === datum.country ? '#17365D' : 'white'"
          },
          "strokeWidth": {
            "signal": "hoverCountry === datum.country ? 2.4 : 0.65"
          },
          "cursor": {
            "value": "pointer"
          },
          "tooltip": {
            "signal": "{'Country': datum.country, 'Average Score': format(datum.average_score, '.2f'), 'Number of Films': datum.film_count, 'Rank': datum.score_rank}"
          }
        }
      }
    },
    {
      "type": "shape",
      "from": {
        "data": "australia"
      },
      "transform": [
        {
          "type": "geoshape",
          "projection": "worldProjection",
          "field": "datum.geo"
        }
      ],
      "encode": {
        "update": {
          "fill": {
            "value": "transparent"
          },
          "stroke": {
            "value": "#17365D"
          },
          "strokeWidth": {
            "signal": "2.2 + 1.1 * (1 + sin(pulseTime / 320))"
          },
          "strokeOpacity": {
            "signal": "0.55 + 0.25 * (1 + sin(pulseTime / 320))"
          }
        }
      }
    },
    {
      "name": "australiaAnnotationLeader",
      "type": "rule",
      "from": {
        "data": "australia"
      },
      "interactive": false,
      "encode": {
        "update": {
          "x": {
            "signal": "datum.centroid[0] - 24"
          },
          "y": {
            "signal": "datum.centroid[1] + 20"
          },
          "x2": {
            "signal": "datum.centroid[0] - 80"
          },
          "y2": {
            "signal": "datum.centroid[1] + 55"
          },
          "stroke": {
            "value": "#17365D"
          },
          "strokeWidth": {
            "value": 1
          },
          "strokeOpacity": {
            "value": 0.65
          }
        }
      }
    },
    {
      "type": "text",
      "from": {
        "data": "australia"
      },
      "encode": {
        "update": {
          "x": {
            "signal": "datum.centroid[0] - 85"
          },
          "y": {
            "signal": "datum.centroid[1] + 55"
          },
          "text": {
            "signal": "'Australia · Avg ' + format(datum.average_score, '.2f') + ' · Rank #' + datum.score_rank + ' · ' + datum.film_count + ' films'"
          },
          "align": {
            "value": "right"
          },
          "baseline": {
            "value": "middle"
          },
          "font": {
            "value": "Arial"
          },
          "fontSize": {
            "value": 10
          },
          "fontWeight": {
            "value": "bold"
          },
          "fill": {
            "value": "#17365D"
          }
        }
      }
    }
  ],
  "description": "Normalize country aliases and deduplicate film_id + country before country averages. Duplicate scores are averaged per film-country; each film then contributes once. Missing TMDB IDs use normalized title, year and director. Shapes use rankedScores so hover tooltips include score_rank."
}
