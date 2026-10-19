{
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "Corrected Vega treemap with company-count slider and interactive year brush. Leaf node fields are used directly after nest/treemap.",
  "width": 960,
  "height": 645,
  "padding": {
    "top": 66,
    "left": 16,
    "right": 16,
    "bottom": 15
  },
  "background": "white",
  "title": {
    "text": "The Companies Behind Australian Film",
    "anchor": "start",
    "font": "Georgia",
    "fontSize": 23,
    "fontWeight": "bold",
    "color": "#1F2D3D",
    "subtitleFont": "Arial",
    "subtitleFontSize": 12,
    "subtitleColor": "#657586",
    "offset": 16
  },
  "signals": [
    {
      "name": "minFilms",
      "value": 4,
      "bind": {
        "input": "range",
        "min": 2,
        "max": 10,
        "step": 1,
        "name": "Minimum films per company: "
      }
    },
    {
      "name": "treeTop",
      "value": 53
    },
    {
      "name": "treeHeight",
      "value": 430
    },
    {
      "name": "overviewTop",
      "value": 529
    },
    {
      "name": "overviewBottom",
      "value": 595
    },
    {
      "name": "brush",
      "value": [
        18,
        942
      ],
      "on": [
        {
          "events": "@brushCapture:mousedown",
          "update": "[clamp(x(),18,942),clamp(x(),18,942)]"
        },
        {
          "events": "[@brushCapture:mousedown, window:mouseup] > window:mousemove!",
          "update": "[brush[0],clamp(x(),18,942)]"
        },
        {
          "events": "@brushCapture:dblclick",
          "update": "[18,942]"
        }
      ]
    },
    {
      "name": "startYear",
      "update": "clamp(floor(1980 + (min(brush[0],brush[1])-18)*46/924), 1980, 2025)"
    },
    {
      "name": "endYear",
      "update": "max(startYear, clamp(ceil(1980 + (max(brush[0],brush[1])-18)*46/924)-1, 1980, 2025))"
    },
    {
      "name": "hoverCompany",
      "value": null,
      "on": [
        {
          "events": "@companyTiles:mouseover",
          "update": "datum.company_name"
        },
        {
          "events": "@companyTiles:mouseout",
          "update": "null"
        }
      ]
    }
  ],
  "data": [
    {
      "name": "movies",
      "url": "https://raw.githubusercontent.com/Yancheng-Lu/fit3179-australian-movies/main/data/movies_combined_1980_2025.csv",
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
          "expr": "datum.is_australian === 1 && datum.year >= 1980 && datum.year <= 2025 && datum.company != null && trim(datum.company) !== '' && isValid(datum.score) && datum.score > 0"
        },
        {
          "type": "formula",
          "as": "company_clean",
          "expr": "trim(datum.company)"
        }
      ]
    },
    {
      "name": "yearCounts",
      "source": "movies",
      "transform": [
        {
          "type": "aggregate",
          "groupby": [
            "year"
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
          "type": "collect",
          "sort": {
            "field": "year",
            "order": "ascending"
          }
        }
      ]
    },
    {
      "name": "companySummary",
      "source": "movies",
      "transform": [
        {
          "type": "filter",
          "expr": "datum.year >= startYear && datum.year <= endYear"
        },
        {
          "type": "aggregate",
          "groupby": [
            "company_clean"
          ],
          "ops": [
            "count",
            "median"
          ],
          "fields": [
            "name",
            "score"
          ],
          "as": [
            "film_count",
            "median_score"
          ]
        },
        {
          "type": "filter",
          "expr": "datum.film_count >= minFilms"
        },
        {
          "type": "collect",
          "sort": {
            "field": [
              "film_count",
              "company_clean"
            ],
            "order": [
              "descending",
              "ascending"
            ]
          }
        }
      ]
    },
    {
      "name": "tree",
      "source": "companySummary",
      "transform": [
        {
          "type": "nest"
        },
        {
          "type": "treemap",
          "field": "film_count",
          "method": "squarify",
          "ratio": 1.35,
          "round": true,
          "paddingInner": 4,
          "paddingOuter": 2,
          "size": [
            {
              "signal": "width - 36"
            },
            {
              "signal": "treeHeight"
            }
          ]
        }
      ]
    },
    {
      "name": "leaves",
      "source": "tree",
      "transform": [
        {
          "type": "filter",
          "expr": "!datum.children"
        },
        {
          "type": "formula",
          "as": "company_name",
          "expr": "datum.company_clean"
        },
        {
          "type": "formula",
          "as": "short_name",
          "expr": "datum.company_clean === 'Australian Film Finance Corporation (AFFC)' ? 'Australian Film Finance Corp.' : datum.company_clean === 'Kennedy Miller Productions' ? 'Kennedy Miller' : datum.company_clean === 'Castle Rock Entertainment' ? 'Castle Rock' : datum.company_clean"
        }
      ]
    },
    {
      "name": "yearTicks",
      "values": [
        {
          "year": 1980
        },
        {
          "year": 1990
        },
        {
          "year": 2000
        },
        {
          "year": 2010
        },
        {
          "year": 2020
        },
        {
          "year": 2025
        }
      ]
    }
  ],
  "scales": [
    {
      "name": "scoreColor",
      "type": "linear",
      "domain": [
        4,
        6,
        8
      ],
      "range": [
        "#DCEAF3",
        "#77A6C6",
        "#123F6B"
      ],
      "clamp": true
    },
    {
      "name": "volumeScale",
      "type": "linear",
      "domain": {
        "data": "yearCounts",
        "field": "film_count"
      },
      "domainMin": 0,
      "nice": true,
      "zero": true,
      "range": [
        {
          "signal": "overviewBottom"
        },
        {
          "signal": "overviewTop"
        }
      ]
    }
  ],
  "legends": [
    {
      "fill": "scoreColor",
      "orient": "none",
      "legendX": 730,
      "legendY": 1,
      "direction": "horizontal",
      "title": "Median audience score",
      "gradientLength": 188,
      "gradientThickness": 9,
      "titleFont": "Arial",
      "titleFontSize": 10,
      "labelFont": "Arial",
      "labelFontSize": 9,
      "format": ".1f",
      "titleColor": "#64748B",
      "labelColor": "#64748B"
    }
  ],
  "marks": [
    {
      "type": "text",
      "encode": {
        "update": {
          "x": {
            "value": 20
          },
          "y": {
            "value": 24
          },
          "text": {
            "signal": "'COMPANIES WITH ≥ ' + minFilms + ' FILMS  ·  ' + startYear + '–' + endYear"
          },
          "font": {
            "value": "Arial"
          },
          "fontWeight": {
            "value": "bold"
          },
          "fontSize": {
            "value": 11
          },
          "fill": {
            "value": "#617488"
          }
        }
      }
    },
    {
      "type": "rect",
      "encode": {
        "update": {
          "x": {
            "value": 17
          },
          "y": {
            "signal": "treeTop"
          },
          "width": {
            "signal": "width - 34"
          },
          "height": {
            "signal": "treeHeight"
          },
          "fill": {
            "value": "#EDF3F7"
          },
          "cornerRadius": {
            "value": 6
          }
        }
      }
    },
    {
      "name": "companyTiles",
      "type": "rect",
      "from": {
        "data": "leaves"
      },
      "encode": {
        "enter": {
          "cursor": {
            "value": "pointer"
          }
        },
        "update": {
          "x": {
            "signal": "17 + datum.x0"
          },
          "y": {
            "signal": "treeTop + datum.y0"
          },
          "x2": {
            "signal": "17 + datum.x1"
          },
          "y2": {
            "signal": "treeTop + datum.y1"
          },
          "fill": {
            "scale": "scoreColor",
            "field": "median_score"
          },
          "stroke": {
            "signal": "hoverCompany === datum.company_name ? '#D46A4C' : '#FFFFFF'"
          },
          "strokeWidth": {
            "signal": "hoverCompany === datum.company_name ? 3 : 1.6"
          },
          "fillOpacity": {
            "signal": "hoverCompany === null || hoverCompany === datum.company_name ? 1 : 0.78"
          },
          "tooltip": {
            "signal": "{'Company':datum.company_name,'Number of Films':datum.film_count,'Median Audience Score':format(datum.median_score,'.2f')}"
          }
        }
      }
    },
    {
      "type": "text",
      "interactive": false,
      "from": {
        "data": "leaves"
      },
      "encode": {
        "update": {
          "x": {
            "signal": "17 + (datum.x0 + datum.x1)/2"
          },
          "y": {
            "signal": "treeTop + (datum.y0+datum.y1)/2 - 9"
          },
          "text": {
            "signal": "datum.x1 - datum.x0 >= 99 && datum.y1 - datum.y0 >= 46 ? datum.short_name : ''"
          },
          "limit": {
            "signal": "max(0,datum.x1-datum.x0-12)"
          },
          "ellipsis": {
            "value": "…"
          },
          "align": {
            "value": "center"
          },
          "baseline": {
            "value": "middle"
          },
          "font": {
            "value": "Arial"
          },
          "fontSize": {
            "signal": "datum.x1-datum.x0 >= 180 ? 13 : 11"
          },
          "fontWeight": {
            "value": "bold"
          },
          "fill": {
            "signal": "datum.median_score >= 6.3 ? '#FFFFFF' : '#173A53'"
          }
        }
      }
    },
    {
      "type": "text",
      "interactive": false,
      "from": {
        "data": "leaves"
      },
      "encode": {
        "update": {
          "x": {
            "signal": "17 + (datum.x0+datum.x1)/2"
          },
          "y": {
            "signal": "treeTop + (datum.y0+datum.y1)/2 + 12"
          },
          "text": {
            "signal": "datum.x1-datum.x0 >= 67 && datum.y1-datum.y0 >= 35 ? datum.film_count + ' films' : ''"
          },
          "align": {
            "value": "center"
          },
          "baseline": {
            "value": "middle"
          },
          "font": {
            "value": "Arial"
          },
          "fontSize": {
            "value": 11
          },
          "fill": {
            "signal": "datum.median_score >= 6.3 ? '#FFFFFF' : '#173A53'"
          }
        }
      }
    },
    {
      "type": "text",
      "encode": {
        "update": {
          "x": {
            "signal": "width/2"
          },
          "y": {
            "signal": "treeTop + treeHeight/2"
          },
          "text": {
            "signal": "length(data('companySummary')) === 0 ? 'No companies meet this minimum in the selected years' : ''"
          },
          "align": {
            "value": "center"
          },
          "font": {
            "value": "Arial"
          },
          "fontSize": {
            "value": 15
          },
          "fill": {
            "value": "#687B8E"
          }
        }
      }
    },
    {
      "type": "text",
      "encode": {
        "update": {
          "x": {
            "value": 18
          },
          "y": {
            "value": 511
          },
          "text": {
            "value": "RELEASE YEARS  ·  DRAG TO BRUSH  ·  DOUBLE-CLICK TO RESET"
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
            "value": "#64748B"
          }
        }
      }
    },
    {
      "type": "rect",
      "encode": {
        "update": {
          "x": {
            "value": 18
          },
          "x2": {
            "value": 942
          },
          "y": {
            "signal": "overviewTop"
          },
          "y2": {
            "signal": "overviewBottom"
          },
          "fill": {
            "value": "#EFF4F8"
          }
        }
      }
    },
    {
      "type": "rect",
      "from": {
        "data": "yearCounts"
      },
      "encode": {
        "update": {
          "x": {
            "signal": "18 + (datum.year - 1980) * 924 / 46 + 1"
          },
          "x2": {
            "signal": "18 + (datum.year - 1979) * 924 / 46 - 1"
          },
          "y": {
            "scale": "volumeScale",
            "field": "film_count"
          },
          "y2": {
            "signal": "overviewBottom"
          },
          "fill": {
            "value": "#7199B8"
          },
          "fillOpacity": {
            "value": 0.9
          },
          "tooltip": {
            "signal": "{'Year':datum.year,'Films with company and score':datum.film_count}"
          }
        }
      }
    },
    {
      "type": "rect",
      "interactive": false,
      "encode": {
        "update": {
          "x": {
            "signal": "min(brush[0],brush[1])"
          },
          "x2": {
            "signal": "max(brush[0],brush[1])"
          },
          "y": {
            "signal": "overviewTop"
          },
          "y2": {
            "signal": "overviewBottom"
          },
          "fill": {
            "value": "#DCECF9"
          },
          "fillOpacity": {
            "value": 0.16
          },
          "stroke": {
            "value": "#326A9C"
          },
          "strokeWidth": {
            "value": 1.5
          }
        }
      }
    },
    {
      "type": "rule",
      "interactive": false,
      "encode": {
        "update": {
          "x": {
            "signal": "brush[0]"
          },
          "y": {
            "signal": "overviewTop"
          },
          "y2": {
            "signal": "overviewBottom"
          },
          "stroke": {
            "value": "#245988"
          },
          "strokeWidth": {
            "value": 2
          }
        }
      }
    },
    {
      "type": "rule",
      "interactive": false,
      "encode": {
        "update": {
          "x": {
            "signal": "brush[1]"
          },
          "y": {
            "signal": "overviewTop"
          },
          "y2": {
            "signal": "overviewBottom"
          },
          "stroke": {
            "value": "#245988"
          },
          "strokeWidth": {
            "value": 2
          }
        }
      }
    },
    {
      "type": "rect",
      "name": "brushCapture",
      "encode": {
        "update": {
          "x": {
            "value": 18
          },
          "x2": {
            "value": 942
          },
          "y": {
            "signal": "overviewTop"
          },
          "y2": {
            "signal": "overviewBottom"
          },
          "fill": {
            "value": "#FFFFFF"
          },
          "fillOpacity": {
            "value": 0.001
          },
          "cursor": {
            "value": "crosshair"
          }
        }
      }
    },
    {
      "type": "text",
      "from": {
        "data": "yearTicks"
      },
      "encode": {
        "update": {
          "x": {
            "signal": "18 + (datum.year - 1980) * 924 / 46"
          },
          "y": {
            "value": 614
          },
          "text": {
            "field": "year"
          },
          "align": {
            "value": "center"
          },
          "font": {
            "value": "Arial"
          },
          "fontSize": {
            "value": 10
          },
          "fill": {
            "value": "#687B8E"
          }
        }
      }
    }

  ]
}