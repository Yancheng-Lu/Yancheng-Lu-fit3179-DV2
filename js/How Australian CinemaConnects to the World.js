{
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "width": 860,
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
      "name": "hoverPartner",
      "value": null,
      "on": [
        {
          "events": "@partnerNodes:mouseover",
          "update": "datum.partner"
        },
        {
          "events": "@partnerNodes:mouseout",
          "update": "null"
        },
        {
          "events": "@baseFlows:mouseover",
          "update": "datum.partner"
        },
        {
          "events": "@baseFlows:mouseout",
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
          "score": "number",
          "is_australian": "number"
        }
      },
      "transform": [
        {
          "type": "filter",
          "expr": "isValid(datum.year) && datum.year >= 1980 && datum.year <= 2025 && isValid(datum.score) && isFinite(datum.score) && datum.score > 0 && datum.production_countries != null && trim(datum.production_countries) !== ''"
        }
      ]
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
      "name": "partnerLocations",
      "values": [
        {
          "partner": "United States of America",
          "lon": -98.58,
          "lat": 39.83
        },
        {
          "partner": "United Kingdom",
          "lon": -3.44,
          "lat": 55.38
        },
        {
          "partner": "Canada",
          "lon": -106.35,
          "lat": 56.13
        },
        {
          "partner": "Germany",
          "lon": 10.45,
          "lat": 51.17
        },
        {
          "partner": "France",
          "lon": 2.21,
          "lat": 46.23
        },
        {
          "partner": "India",
          "lon": 78.96,
          "lat": 20.59
        },
        {
          "partner": "New Zealand",
          "lon": 174.89,
          "lat": -40.9
        },
        {
          "partner": "Japan",
          "lon": 138.25,
          "lat": 36.2
        },
        {
          "partner": "Italy",
          "lon": 12.57,
          "lat": 41.87
        },
        {
          "partner": "Spain",
          "lon": -3.75,
          "lat": 40.46
        },
        {
          "partner": "China",
          "lon": 104.2,
          "lat": 35.86
        },
        {
          "partner": "South Africa",
          "lon": 22.94,
          "lat": -30.56
        },
        {
          "partner": "Ireland",
          "lon": -8.24,
          "lat": 53.41
        },
        {
          "partner": "Belgium",
          "lon": 4.47,
          "lat": 50.5
        },
        {
          "partner": "Netherlands",
          "lon": 5.29,
          "lat": 52.13
        },
        {
          "partner": "Russia",
          "lon": 105.3,
          "lat": 61.5
        }
      ]
    },
    {
      "name": "partners",
      "transform": [
        {
          "type": "filter",
          "expr": "datum.year >= yearStart && datum.year <= yearEnd && (selectedGenre === 'All genres' || indexof(split(datum.genre || '', '|'), selectedGenre) >= 0)"
        },
        {
          "type": "filter",
          "expr": "datum.is_australian === 1 && datum.year >= 1980 && datum.year <= 2025 && datum.production_countries != null && datum.production_countries !== ''"
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
            "partner_raw"
          ]
        },
        {
          "type": "formula",
          "as": "partner_raw",
          "expr": "trim(datum.partner_raw)"
        },
        {
          "type": "formula",
          "as": "partner",
          "expr": "datum.partner_raw === 'United States' || datum.partner_raw === 'United States of America' ? 'United States of America' : datum.partner_raw === 'UK' ? 'United Kingdom' : (datum.partner_raw === 'Russia' || datum.partner_raw === 'Russian Federation') ? 'Russia' : datum.partner_raw"
        },
        {
          "type": "filter",
          "expr": "datum.partner !== 'Australia' && datum.partner !== ''"
        },
        {
          "type": "lookup",
          "from": "partnerLocations",
          "key": "partner",
          "fields": [
            "partner"
          ],
          "values": [
            "lon",
            "lat"
          ],
          "as": [
            "partner_lon",
            "partner_lat"
          ]
        },
        {
          "type": "filter",
          "expr": "datum.partner_lon != null && datum.partner_lat != null"
        },
        {
          "type": "aggregate",
          "groupby": [
            "film_id",
            "partner",
            "partner_lon",
            "partner_lat"
          ],
          "ops": [
            "count"
          ],
          "fields": [
            null
          ],
          "as": [
            "duplicate_count"
          ]
        },
        {
          "type": "aggregate",
          "groupby": [
            "partner",
            "partner_lon",
            "partner_lat"
          ],
          "ops": [
            "count"
          ],
          "fields": [
            null
          ],
          "as": [
            "coproduction_count"
          ]
        },
        {
          "type": "window",
          "sort": {
            "field": [
              "coproduction_count"
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
          "type": "formula",
          "as": "australia_lon",
          "expr": "133.7751"
        },
        {
          "type": "formula",
          "as": "australia_lat",
          "expr": "-25.2744"
        },
        {
          "type": "geopoint",
          "projection": "worldProjection",
          "fields": [
            "australia_lon",
            "australia_lat"
          ],
          "as": [
            "source_x",
            "source_y"
          ]
        },
        {
          "type": "geopoint",
          "projection": "worldProjection",
          "fields": [
            "partner_lon",
            "partner_lat"
          ],
          "as": [
            "target_x",
            "target_y"
          ]
        },
        {
          "type": "formula",
          "as": "dx",
          "expr": "datum.target_x - datum.source_x"
        },
        {
          "type": "formula",
          "as": "dy",
          "expr": "datum.target_y - datum.source_y"
        },
        {
          "type": "formula",
          "as": "distance",
          "expr": "max(1, sqrt(datum.dx * datum.dx + datum.dy * datum.dy))"
        },
        {
          "type": "formula",
          "as": "perp_x",
          "expr": "-datum.dy / datum.distance"
        },
        {
          "type": "formula",
          "as": "perp_y",
          "expr": "datum.dx / datum.distance"
        },
        {
          "type": "formula",
          "as": "curve_direction",
          "expr": "datum.rank % 2 === 0 ? -1 : 1"
        },
        {
          "type": "formula",
          "as": "curve_amount",
          "expr": "datum.curve_direction * (24 + floor((datum.rank - 1) / 2) * 10)"
        },
        {
          "type": "formula",
          "as": "c1x",
          "expr": "datum.source_x + datum.dx * 0.30 + datum.perp_x * datum.curve_amount"
        },
        {
          "type": "formula",
          "as": "c1y",
          "expr": "datum.source_y + datum.dy * 0.30 + datum.perp_y * datum.curve_amount"
        },
        {
          "type": "formula",
          "as": "c2x",
          "expr": "datum.source_x + datum.dx * 0.70 + datum.perp_x * datum.curve_amount"
        },
        {
          "type": "formula",
          "as": "c2y",
          "expr": "datum.source_y + datum.dy * 0.70 + datum.perp_y * datum.curve_amount"
        },
        {
          "type": "formula",
          "as": "flow_path",
          "expr": "'M' + datum.source_x + ',' + datum.source_y + ' C' + datum.c1x + ',' + datum.c1y + ' ' + datum.c2x + ',' + datum.c2y + ' ' + datum.target_x + ',' + datum.target_y"
        }
      ],
      "source": "movies"
    },
    {
      "name": "topPartners",
      "source": "partners",
      "transform": [
        {
          "type": "filter",
          "expr": "indexof(['United States of America', 'Canada', 'United Kingdom'], datum.partner) >= 0"
        }
      ]
    },
    {
      "name": "australia",
      "values": [
        {
          "country": "Australia",
          "longitude": 133.7751,
          "latitude": -25.2744
        }
      ],
      "transform": [
        {
          "type": "geopoint",
          "projection": "worldProjection",
          "fields": [
            "longitude",
            "latitude"
          ],
          "as": [
            "x",
            "y"
          ]
        }
      ]
    }
  ],
  "scales": [
    {
      "name": "flowWidth",
      "type": "sqrt",
      "domain": {
        "data": "partners",
        "field": "coproduction_count"
      },
      "range": [
        1,
        8
      ],
      "zero": true,
      "nice": true
    },
    {
      "name": "nodeSize",
      "type": "sqrt",
      "domain": {
        "data": "partners",
        "field": "coproduction_count"
      },
      "range": [
        45,
        300
      ],
      "zero": true,
      "nice": true
    }
  ],
  "legends": [
    {
      "strokeWidth": "flowWidth",
      "title": "Co-produced Films",
      "orient": "right",
      "titleFont": "Arial",
      "titleFontSize": 11,
      "labelFont": "Arial",
      "labelFontSize": 10,
      "titleColor": "#44515C",
      "labelColor": "#687684",
      "offset": 18
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
      "name": "baseFlows",
      "type": "path",
      "from": {
        "data": "partners"
      },
      "encode": {
        "update": {
          "path": {
            "field": "flow_path"
          },
          "fill": {
            "value": "transparent"
          },
          "stroke": {
            "value": "#D46A4C"
          },
          "strokeWidth": {
            "scale": "flowWidth",
            "field": "coproduction_count"
          },
          "strokeOpacity": {
            "signal": "hoverPartner === null || hoverPartner === datum.partner ? 0.38 : 0.07"
          },
          "cursor": {
            "value": "pointer"
          },
          "tooltip": {
            "signal": "{'Partner Country': datum.partner, 'Co-produced Films': datum.coproduction_count, 'Partner Rank': datum.rank}"
          }
        },
        "hover": {
          "strokeOpacity": {
            "value": 0.95
          }
        }
      }
    },
    {
      "type": "path",
      "from": {
        "data": "partners"
      },
      "encode": {
        "update": {
          "path": {
            "field": "flow_path"
          },
          "fill": {
            "value": "transparent"
          },
          "stroke": {
            "value": "#F4A582"
          },
          "strokeWidth": {
            "signal": "max(0.8, scale('flowWidth', datum.coproduction_count) * 0.32)"
          },
          "strokeOpacity": {
            "signal": "hoverPartner === null || hoverPartner === datum.partner ? 0.85 : 0.05"
          },
          "strokeDash": {
            "value": [
              6,
              9
            ]
          },
          "strokeDashOffset": {
            "signal": "-pulseTime / 28 + datum.rank * 4"
          }
        }
      }
    },
    {
      "name": "partnerNodes",
      "type": "symbol",
      "from": {
        "data": "partners"
      },
      "encode": {
        "update": {
          "x": {
            "field": "target_x"
          },
          "y": {
            "field": "target_y"
          },
          "shape": {
            "value": "circle"
          },
          "size": {
            "signal": "hoverPartner === datum.partner ? scale('nodeSize', datum.coproduction_count) * 1.5 : scale('nodeSize', datum.coproduction_count)"
          },
          "fill": {
            "value": "#D46A4C"
          },
          "fillOpacity": {
            "signal": "hoverPartner === null || hoverPartner === datum.partner ? 0.9 : 0.18"
          },
          "stroke": {
            "value": "white"
          },
          "strokeWidth": {
            "signal": "hoverPartner === datum.partner ? 2 : 1"
          },
          "cursor": {
            "value": "pointer"
          },
          "tooltip": {
            "signal": "{'Partner Country': datum.partner, 'Co-produced Films': datum.coproduction_count, 'Rank': datum.rank}"
          }
        }
      }
    },
    {
      "type": "text",
      "from": {
        "data": "topPartners"
      },
      "encode": {
        "update": {
          "x": {
            "field": "target_x"
          },
          "y": {
            "field": "target_y"
          },
          "dx": {
            "signal": "datum.target_x > datum.source_x ? 8 : -8"
          },
          "dy": {
            "value": -8
          },
          "text": {
            "signal": "datum.partner + ' · ' + datum.coproduction_count + ' films · Rank #' + datum.rank"
          },
          "align": {
            "signal": "datum.target_x > datum.source_x ? 'left' : 'right'"
          },
          "baseline": {
            "value": "bottom"
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
            "value": "#824B38"
          },
          "opacity": {
            "signal": "hoverPartner === null || hoverPartner === datum.partner ? 1 : 0.20"
          }
        }
      }
    },
    {
      "type": "symbol",
      "from": {
        "data": "australia"
      },
      "encode": {
        "update": {
          "x": {
            "field": "x"
          },
          "y": {
            "field": "y"
          },
          "shape": {
            "value": "circle"
          },
          "size": {
            "signal": "360 + 90 * (1 + sin(pulseTime / 320))"
          },
          "fill": {
            "value": "transparent"
          },
          "stroke": {
            "value": "#17365D"
          },
          "strokeWidth": {
            "value": 1.4
          },
          "strokeOpacity": {
            "signal": "0.18 + 0.08 * (1 + sin(pulseTime / 320))"
          }
        }
      }
    },
    {
      "type": "symbol",
      "from": {
        "data": "australia"
      },
      "encode": {
        "update": {
          "x": {
            "field": "x"
          },
          "y": {
            "field": "y"
          },
          "shape": {
            "value": "circle"
          },
          "size": {
            "value": 165
          },
          "fill": {
            "value": "#17365D"
          },
          "stroke": {
            "value": "white"
          },
          "strokeWidth": {
            "value": 1.5
          },
          "tooltip": {
            "signal": "{'Origin': 'Australia'}"
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
            "field": "x"
          },
          "y": {
            "field": "y"
          },
          "dx": {
            "value": 10
          },
          "dy": {
            "value": 14
          },
          "text": {
            "value": "Australia"
          },
          "align": {
            "value": "left"
          },
          "baseline": {
            "value": "top"
          },
          "font": {
            "value": "Arial"
          },
          "fontSize": {
            "value": 11
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
  ]
}
