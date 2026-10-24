{
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "width": 840,
  "height": 440,
  "padding": {
    "top": 16,
    "left": 12,
    "right": 16,
    "bottom": 0
  },
  "background": "white",
  "signals": [
    {
      "name": "mapZoom",
      "value": 1
    },
    {
      "name": "mapPanX",
      "value": 0
    },
    {
      "name": "mapPanY",
      "value": 0
    },
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
      "name": "hoverCountry",
      "value": null,
      "on": [
        {
          "events": "@countryBars:mouseover",
          "update": "datum.country"
        },
        {
          "events": "@countryBars:mouseout",
          "update": "null"
        }
      ]
    }
  ],
  "projections": [
    {
      "name": "worldProjection",
      "type": "equalEarth",
      "scale": {
        "signal": "160 * mapZoom"
      },
      "translate": [
        {
          "signal": "width / 2 + mapPanX"
        },
        {
          "signal": "height / 2 + 15 + mapPanY"
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
          "year": "number"
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
      "name": "countryCounts",
      "transform": [
        {
          "type": "filter",
          "expr": "datum.year >= yearStart && datum.year <= yearEnd && (selectedGenre === 'All genres' || indexof(split(datum.genre || '', '|'), selectedGenre) >= 0)"
        },
        {
          "type": "filter",
          "expr": "datum.year >= 1980 && datum.year <= 2025 && datum.production_countries != null && datum.production_countries !== ''"
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
          "expr": "trim(datum.country) === 'United States' || trim(datum.country) === 'United States of America' ? 'United States of America' : trim(datum.country)"
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
            "country",
            "map_country"
          ],
          "ops": [
            "count"
          ],
          "fields": [
            "name"
          ],
          "as": [
            "film_count"
          ]
        },
        {
          "type": "window",
          "sort": {
            "field": [
              "film_count"
            ],
            "order": [
              "descending"
            ]
          },
          "ops": [
            "row_number"
          ],
          "as": [
            "rank"
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
      "name": "focusCountries",
      "source": "countryCounts",
      "transform": [
        {
          "type": "filter",
          "expr": "datum.rank <= 3 || datum.country === 'Australia'"
        },
        {
          "type": "formula",
          "as": "label_text",
          "expr": "datum.country + ' · ' + format(datum.film_count, ',') + ' films · Rank #' + datum.rank"
        },
        {
          "type": "formula",
          "as": "label_right_x",
          "expr": "datum.country === 'United States of America' ? datum.centroid[0] - 10 : datum.country === 'United Kingdom' ? datum.centroid[0] - 22 : datum.country === 'India' ? datum.centroid[0] - 22 : datum.country === 'Australia' ? datum.centroid[0] - 16 : datum.centroid[0] - 18"
        },
        {
          "type": "formula",
          "as": "label_y",
          "expr": "datum.country === 'United States of America' ? datum.centroid[1] - scale('barHeight', datum.film_count) - 18 : datum.country === 'United Kingdom' ? datum.centroid[1] - scale('barHeight', datum.film_count) - 44 : datum.country === 'India' ? datum.centroid[1] - scale('barHeight', datum.film_count) + 12 : datum.country === 'Australia' ? datum.centroid[1] - scale('barHeight', datum.film_count) - 16 : datum.centroid[1] - scale('barHeight', datum.film_count) - 18"
        },
        {
          "type": "formula",
          "as": "line_x2",
          "expr": "datum.label_right_x + 6"
        },
        {
          "type": "formula",
          "as": "line_y2",
          "expr": "datum.label_y"
        }
      ]
    }
  ],
  "scales": [
    {
      "name": "barHeight",
      "type": "sqrt",
      "domain": {
        "data": "countryCounts",
        "field": "film_count"
      },
      "range": { "signal": "[3 * mapZoom, 75 * mapZoom]" },
      "zero": true,
      "nice": true
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
            "value": "#EEF1F3"
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
      "name": "countryBars",
      "type": "rect",
      "from": {
        "data": "countryCounts"
      },
      "encode": {
        "update": {
          "x": {
            "signal": "datum.centroid[0] - 2.5"
          },
          "x2": {
            "signal": "datum.centroid[0] + 2.5"
          },
          "y": {
            "signal": "datum.centroid[1] - scale('barHeight', datum.film_count)"
          },
          "y2": {
            "signal": "datum.centroid[1]"
          },
          "fill": {
            "signal": "datum.country === 'Australia' ? '#17365D' : '#D46A4C'"
          },
          "fillOpacity": {
            "signal": "hoverCountry === null || hoverCountry === datum.country ? 0.88 : 0.20"
          },
          "stroke": {
            "value": "white"
          },
          "strokeWidth": {
            "signal": "hoverCountry === datum.country ? 1.5 : 0.6"
          },
          "cornerRadiusTopLeft": {
            "value": 2
          },
          "cornerRadiusTopRight": {
            "value": 2
          },
          "cursor": {
            "value": "pointer"
          },
          "tooltip": {
            "signal": "{'Country': datum.country, 'Number of Films': datum.film_count, 'Rank': datum.rank}"
          }
        }
      }
    },
    {
      "type": "symbol",
      "from": {
        "data": "countryCounts"
      },
      "encode": {
        "update": {
          "x": {
            "signal": "datum.centroid[0]"
          },
          "y": {
            "signal": "datum.centroid[1]"
          },
          "size": {
            "value": 18
          },
          "shape": {
            "value": "circle"
          },
          "fill": {
            "signal": "datum.country === 'Australia' ? '#17365D' : '#D46A4C'"
          },
          "stroke": {
            "value": "white"
          },
          "strokeWidth": {
            "value": 0.7
          },
          "fillOpacity": {
            "signal": "hoverCountry === null || hoverCountry === datum.country ? 1 : 0.25"
          }
        }
      }
    },
    {
      "type": "rule",
      "from": {
        "data": "focusCountries"
      },
      "encode": {
        "update": {
          "x": {
            "signal": "datum.centroid[0]"
          },
          "y": {
            "signal": "datum.centroid[1] - scale('barHeight', datum.film_count)"
          },
          "x2": {
            "field": "line_x2"
          },
          "y2": {
            "field": "line_y2"
          },
          "stroke": {
            "signal": "datum.country === 'Australia' ? '#17365D' : '#B25C3C'"
          },
          "strokeWidth": {
            "value": 0.8
          },
          "opacity": {
            "value": 0.8
          }
        }
      }
    },
    {
      "type": "text",
      "from": {
        "data": "focusCountries"
      },
      "encode": {
        "update": {
          "x": {
            "field": "label_right_x"
          },
          "y": {
            "field": "label_y"
          },
          "text": {
            "field": "label_text"
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
            "signal": "datum.country === 'Australia' ? '#17365D' : '#7A4738'"
          },
          "opacity": {
            "signal": "hoverCountry === null || hoverCountry === datum.country ? 1 : 0.25"
          }
        }
      }
    },

    {
      "type": "rect",
      "encode": {
        "update": {
          "x": {
            "signal": "width - 112"
          },
          "x2": {
            "signal": "width - 106"
          },
          "y": {
            "value": 16
          },
          "y2": {
            "value": 39
          },
          "fill": {
            "value": "#17365D"
          },
          "cornerRadiusTopLeft": {
            "value": 2
          },
          "cornerRadiusTopRight": {
            "value": 2
          }
        }
      }
    },
    {
      "type": "text",
      "encode": {
        "update": {
          "x": {
            "signal": "width - 98"
          },
          "y": {
            "value": 28
          },
          "text": {
            "value": "Australia"
          },
          "align": {
            "value": "left"
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
          "fill": {
            "value": "#53606B"
          }
        }
      }
    },
    {
      "type": "rect",
      "encode": {
        "update": {
          "x": {
            "signal": "width - 112"
          },
          "x2": {
            "signal": "width - 106"
          },
          "y": {
            "value": 48
          },
          "y2": {
            "value": 71
          },
          "fill": {
            "value": "#D46A4C"
          },
          "cornerRadiusTopLeft": {
            "value": 2
          },
          "cornerRadiusTopRight": {
            "value": 2
          }
        }
      }
    },
    {
      "type": "text",
      "encode": {
        "update": {
          "x": {
            "signal": "width - 98"
          },
          "y": {
            "value": 60
          },
          "text": {
            "value": "Other countries"
          },
          "align": {
            "value": "left"
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
          "fill": {
            "value": "#53606B"
          }
        }
      }
    },
    {
      "type": "text",
      "encode": {
        "update": {
          "x": {
            "signal": "width - 112"
          },
          "y": {
            "value": 97
          },
          "text": {
            "value": "Taller bar"
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
            "value": "#44515C"
          }
        }
      }
    },
    {
      "type": "text",
      "encode": {
        "update": {
          "x": {
            "signal": "width - 112"
          },
          "y": {
            "value": 112
          },
          "text": {
            "value": "= more films"
          },
          "font": {
            "value": "Arial"
          },
          "fontSize": {
            "value": 10
          },
          "fill": {
            "value": "#687684"
          }
        }
      }
    }
  ]
}
