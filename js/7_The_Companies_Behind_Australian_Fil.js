{
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "Room-filling packed bubble chart of companies associated with Australian-linked films. Bubble area encodes film count, colour encodes median audience score. Responsive extent-based positioning, a minimum-film slider, and time brushing.",
  "width": 960,
  "height": 400,
  "padding": {
    "top": 16,
    "left": 8,
    "right": 8,
    "bottom": 12
  },
  "background": "white",
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
      "name": "bubbleTop",
      "value": 53
    },
    {
      "name": "bubbleHeight",
      "value": 500
    },
    {
      "name": "bubbleCenterX",
      "update": "length(data('bubbleExtents')) ? (data('bubbleExtents')[0].min_x + data('bubbleExtents')[0].max_x)/2 : (width-36)/2"
    },
    {
      "name": "bubbleCenterY",
      "update": "length(data('bubbleExtents')) ? (data('bubbleExtents')[0].min_y + data('bubbleExtents')[0].max_y)/2 : bubbleHeight/2"
    },
    {
      "name": "bubbleStretchY",
      "update": "length(data('bubbleExtents')) ? min(1.12, (bubbleHeight - 24) / max(1, data('bubbleExtents')[0].max_y - data('bubbleExtents')[0].min_y)) : 1"
    },
    {
      "name": "bubbleStretchX",
      "update": "length(data('bubbleExtents')) ? max(bubbleStretchY, min(2.6, (width - 100) / max(1, data('bubbleExtents')[0].max_x - data('bubbleExtents')[0].min_x))) : 1"
    },
    {
      "name": "overviewTop",
      "value": 574
    },
    {
      "name": "overviewBottom",
      "value": 640
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
          "events": "@companyBubbles:mouseover",
          "update": "datum.company_name"
        },
        {
          "events": "@companyBubbles:mouseout",
          "update": "null"
        }
      ]
    },
    {
      "name": "bubbleRadiusGrowth",
      "update": "max(1,min(1.7,length(data('bubblePairLimits')) && isValid(data('bubblePairLimits')[0].limit) ? data('bubblePairLimits')[0].limit : 1.7,length(data('bubbleEdgeLimits')) && isValid(data('bubbleEdgeLimits')[0].limit) ? data('bubbleEdgeLimits')[0].limit : 1.7))"
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
      "name": "packed",
      "source": "companySummary",
      "transform": [
        {
          "type": "nest"
        },
        {
          "type": "pack",
          "field": "film_count",
          "padding": 6,
          "size": [
            {
              "signal": "width - 36"
            },
            {
              "signal": "bubbleHeight"
            }
          ]
        }
      ]
    },
    {
      "name": "leaves",
      "source": "packed",
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
      "name": "bubbleExtents",
      "source": "leaves",
      "transform": [
        {
          "type": "formula",
          "as": "edge_left",
          "expr": "datum.x - datum.r"
        },
        {
          "type": "formula",
          "as": "edge_right",
          "expr": "datum.x + datum.r"
        },
        {
          "type": "formula",
          "as": "edge_top",
          "expr": "datum.y - datum.r"
        },
        {
          "type": "formula",
          "as": "edge_bottom",
          "expr": "datum.y + datum.r"
        },
        {
          "type": "aggregate",
          "fields": [
            "edge_left",
            "edge_right",
            "edge_top",
            "edge_bottom"
          ],
          "ops": [
            "min",
            "max",
            "min",
            "max"
          ],
          "as": [
            "min_x",
            "max_x",
            "min_y",
            "max_y"
          ]
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
    },
    {
      "name": "bubblePairLimits",
      "source": "leaves",
      "transform": [
        {
          "type": "cross",
          "with": "leaves",
          "as": [
            "a",
            "b"
          ]
        },
        {
          "type": "filter",
          "expr": "datum.a.company_clean < datum.b.company_clean"
        },
        {
          "type": "formula",
          "as": "limit",
          "expr": "(sqrt(pow((datum.a.x-datum.b.x)*bubbleStretchX,2)+pow((datum.a.y-datum.b.y)*bubbleStretchY,2))-2)/max(1,(datum.a.r+datum.b.r)*bubbleStretchY)"
        },
        {
          "type": "aggregate",
          "fields": [
            "limit"
          ],
          "ops": [
            "min"
          ],
          "as": [
            "limit"
          ]
        }
      ]
    },
    {
      "name": "bubbleEdgeLimits",
      "source": "leaves",
      "transform": [
        {
          "type": "formula",
          "as": "limit",
          "expr": "min((width/2+(datum.x-bubbleCenterX)*bubbleStretchX-18)/max(1,datum.r*bubbleStretchY),(width-18-width/2-(datum.x-bubbleCenterX)*bubbleStretchX)/max(1,datum.r*bubbleStretchY),(bubbleHeight/2+(datum.y-bubbleCenterY)*bubbleStretchY-4)/max(1,datum.r*bubbleStretchY),(bubbleHeight-20-bubbleHeight/2-(datum.y-bubbleCenterY)*bubbleStretchY)/max(1,datum.r*bubbleStretchY))"
        },
        {
          "type": "aggregate",
          "fields": [
            "limit"
          ],
          "ops": [
            "min"
          ],
          "as": [
            "limit"
          ]
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
            "signal": "bubbleTop"
          },
          "width": {
            "signal": "width - 34"
          },
          "height": {
            "signal": "bubbleHeight"
          },
          "fill": {
            "value": "#F5F8FA"
          },
          "cornerRadius": {
            "value": 6
          }
        }
      }
    },
    {
      "name": "companyBubbles",
      "type": "symbol",
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
            "signal": "width/2 + (datum.x - bubbleCenterX) * bubbleStretchX"
          },
          "y": {
            "signal": "bubbleTop + bubbleHeight/2 + (datum.y - bubbleCenterY) * bubbleStretchY"
          },
          "shape": {
            "value": "circle"
          },
          "size": {
            "signal": "PI * pow(datum.r * bubbleStretchY * bubbleRadiusGrowth, 2)"
          },
          "fill": {
            "scale": "scoreColor",
            "field": "median_score"
          },
          "stroke": {
            "signal": "hoverCompany === datum.company_name ? '#D46A4C' : '#FFFFFF'"
          },
          "strokeWidth": {
            "signal": "hoverCompany === datum.company_name ? 3.5 : 2"
          },
          "fillOpacity": {
            "signal": "hoverCompany === null || hoverCompany === datum.company_name ? 1 : 0.55"
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
            "signal": "width/2 + (datum.x - bubbleCenterX) * bubbleStretchX"
          },
          "y": {
            "signal": "bubbleTop + bubbleHeight/2 + (datum.y - bubbleCenterY) * bubbleStretchY - (datum.r * bubbleStretchY * bubbleRadiusGrowth >= 34 ? 10 : 7)"
          },
          "text": {
            "signal": "datum.r * bubbleStretchY * bubbleRadiusGrowth >= 23 ? datum.short_name : ''"
          },
          "limit": {
            "signal": "max(0, 2 * datum.r * bubbleStretchY * bubbleRadiusGrowth - 16)"
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
            "signal": "datum.r * bubbleStretchY * bubbleRadiusGrowth >= 73 ? 14 : datum.r * bubbleStretchY * bubbleRadiusGrowth >= 43 ? 12 : 10"
          },
          "fontWeight": {
            "value": "bold"
          },
          "fill": {
            "signal": "datum.median_score >= 6.3 ? '#FFFFFF' : '#173A53'"
          },
          "opacity": {
            "signal": "hoverCompany === null || hoverCompany === datum.company_name ? 1 : 0.6"
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
            "signal": "width/2 + (datum.x - bubbleCenterX) * bubbleStretchX"
          },
          "y": {
            "signal": "bubbleTop + bubbleHeight/2 + (datum.y - bubbleCenterY) * bubbleStretchY + (datum.r * bubbleStretchY * bubbleRadiusGrowth >= 34 ? 14 : 10)"
          },
          "text": {
            "signal": "datum.r * bubbleStretchY * bubbleRadiusGrowth >= 20 ? datum.film_count + ' films' : ''"
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
          },
          "opacity": {
            "signal": "hoverCompany === null || hoverCompany === datum.company_name ? 1 : 0.6"
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
            "signal": "bubbleTop + bubbleHeight/2"
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
      "interactive": false,
      "encode": {
        "update": {
          "x": {
            "signal": "width-22"
          },
          "y": {
            "signal": "bubbleTop+bubbleHeight-12"
          },
          "text": {
            "value": "Bubble area = film count  ·  Colour = median audience score"
          },
          "align": {
            "value": "right"
          },
          "font": {
            "value": "Arial"
          },
          "fontSize": {
            "value": 10
          },
          "fontStyle": {
            "value": "italic"
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
            "value": 659
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
