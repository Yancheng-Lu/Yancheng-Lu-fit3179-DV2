{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",

  "width": 720,
  "height": 520,

  "background": "white",

  "title": {
    "text": "Blockbusters and Expensive Misses",

    "anchor": "start",
    "font": "Georgia",
    "fontSize": 22,
    "fontWeight": "bold",
    "color": "#1F2D3D",
    "subtitleFont": "Arial",
    "subtitleFontSize": 11,
    "subtitleColor": "#687684",
    "offset": 16
  },

  "data": {
    "url": "https://raw.githubusercontent.com/Yancheng-Lu/fit3179-australian-movies/refs/heads/main/data/movies_combined_1980_2025.csv"
  },

  "transform": [
    {
      "calculate": "toNumber(datum.year)",
      "as": "year_num"
    },

    {
      "calculate": "toNumber(datum.is_australian)",
      "as": "australian_flag"
    },

    {
      "calculate": "toNumber(datum.budget)",
      "as": "budget_num"
    },

    {
      "calculate": "toNumber(datum.gross)",
      "as": "gross_num"
    },

    {
      "filter": "datum.australian_flag === 1 && datum.year_num >= 1980 && datum.year_num <= 2025 && datum.budget_num > 0 && datum.gross_num > 0"
    },

    {
      "calculate": "datum.gross_num - datum.budget_num",
      "as": "gross_budget_gap"
    },

    {
      "calculate": "datum.gross_budget_gap >= 0 ? 'Overperformer' : 'Expensive Miss'",
      "as": "performance"
    },

    {
      "calculate": "abs(datum.gross_budget_gap)",
      "as": "gap_size"
    },

    {
      "window": [
        {
          "op": "row_number",
          "as": "rank"
        }
      ],

      "sort": [
        {
          "field": "gap_size",
          "order": "descending"
        }
      ],

      "groupby": [
        "performance"
      ]
    },

    {
      "filter": "datum.rank <= 6"
    },

    {
      "calculate": "datum.performance === 'Overperformer' ? datum.rank : datum.rank + 7",
      "as": "row_position"
    }
  ],

  "layer": [

    {
      "data": {
        "values": [
          {
            "row_position": 7
          }
        ]
      },

      "mark": {
        "type": "rule",
        "stroke": "#9CA7B0",
        "strokeWidth": 1.5,
        "strokeDash": [
          6,
          5
        ]
      },

      "encoding": {
        "y": {
          "field": "row_position",
          "type": "quantitative",

          "scale": {
            "domain": [
              0,
              14
            ],
            "reverse": true
          },

          "axis": null
        }
      }
    },

    {
      "transform": [
        {
          "filter": "datum.performance === 'Overperformer'"
        }
      ],

      "mark": {
        "type": "rule",
        "strokeWidth": 4,
        "color": "#BFC7CD"
      },

      "encoding": {
        "y": {
          "field": "row_position",
          "type": "quantitative",

          "scale": {
            "domain": [
              0,
              14
            ],
            "reverse": true
          },

          "axis": null
        },

        "x": {
          "field": "budget_num",
          "type": "quantitative",

          "title": "Reported Budget and Box-office Gross (USD)",

          "axis": {
            "format": "$~s",
            "grid": true,
            "gridColor": "#EBEEF0",
            "gridOpacity": 0.9,
            "domainColor": "#B8C0C8",
            "tickColor": "#B8C0C8",
            "labelColor": "#53606B",
            "titleColor": "#53606B"
          }
        },

        "x2": {
          "field": "gross_num"
        },

        "tooltip": [
          {
            "field": "name",
            "type": "nominal",
            "title": "Film"
          },

          {
            "field": "year_num",
            "type": "quantitative",
            "title": "Year",
            "format": "d"
          },

          {
            "field": "genre",
            "type": "nominal",
            "title": "Genre"
          },

          {
            "field": "budget_num",
            "type": "quantitative",
            "title": "Budget",
            "format": "$,.0f"
          },

          {
            "field": "gross_num",
            "type": "quantitative",
            "title": "Gross",
            "format": "$,.0f"
          },

          {
            "field": "gross_budget_gap",
            "type": "quantitative",
            "title": "Gross–Budget Gap",
            "format": "$,.0f"
          }
        ]
      }
    },

    {
      "transform": [
        {
          "filter": "datum.performance === 'Expensive Miss'"
        }
      ],

      "mark": {
        "type": "rule",
        "strokeWidth": 4,
        "color": "#BFC7CD"
      },

      "encoding": {
        "y": {
          "field": "row_position",
          "type": "quantitative",

          "scale": {
            "domain": [
              0,
              14
            ],
            "reverse": true
          },

          "axis": null
        },

        "x": {
          "field": "gross_num",
          "type": "quantitative"
        },

        "x2": {
          "field": "budget_num"
        },

        "tooltip": [
          {
            "field": "name",
            "type": "nominal",
            "title": "Film"
          },

          {
            "field": "year_num",
            "type": "quantitative",
            "title": "Year",
            "format": "d"
          },

          {
            "field": "genre",
            "type": "nominal",
            "title": "Genre"
          },

          {
            "field": "budget_num",
            "type": "quantitative",
            "title": "Budget",
            "format": "$,.0f"
          },

          {
            "field": "gross_num",
            "type": "quantitative",
            "title": "Gross",
            "format": "$,.0f"
          },

          {
            "field": "gross_budget_gap",
            "type": "quantitative",
            "title": "Gross–Budget Gap",
            "format": "$,.0f"
          }
        ]
      }
    },

    {
      "mark": {
        "type": "point",
        "filled": true,
        "size": 115,
        "color": "#D95F59",
        "stroke": "white",
        "strokeWidth": 1.5
      },

      "encoding": {
        "y": {
          "field": "row_position",
          "type": "quantitative",

          "scale": {
            "domain": [
              0,
              14
            ],
            "reverse": true
          },

          "axis": null
        },

        "x": {
          "field": "budget_num",
          "type": "quantitative"
        },

        "tooltip": [
          {
            "field": "name",
            "type": "nominal",
            "title": "Film"
          },

          {
            "field": "year_num",
            "type": "quantitative",
            "title": "Year",
            "format": "d"
          },

          {
            "field": "genre",
            "type": "nominal",
            "title": "Genre"
          },

          {
            "field": "budget_num",
            "type": "quantitative",
            "title": "Budget",
            "format": "$,.0f"
          },

          {
            "field": "gross_num",
            "type": "quantitative",
            "title": "Gross",
            "format": "$,.0f"
          },

          {
            "field": "gross_budget_gap",
            "type": "quantitative",
            "title": "Gross–Budget Gap",
            "format": "$,.0f"
          }
        ]
      }
    },

    {
      "mark": {
        "type": "point",
        "filled": true,
        "size": 115,
        "color": "#3A7CA5",
        "stroke": "white",
        "strokeWidth": 1.5
      },

      "encoding": {
        "y": {
          "field": "row_position",
          "type": "quantitative",

          "scale": {
            "domain": [
              0,
              14
            ],
            "reverse": true
          },

          "axis": null
        },

        "x": {
          "field": "gross_num",
          "type": "quantitative"
        },

        "tooltip": [
          {
            "field": "name",
            "type": "nominal",
            "title": "Film"
          },

          {
            "field": "year_num",
            "type": "quantitative",
            "title": "Year",
            "format": "d"
          },

          {
            "field": "genre",
            "type": "nominal",
            "title": "Genre"
          },

          {
            "field": "budget_num",
            "type": "quantitative",
            "title": "Budget",
            "format": "$,.0f"
          },

          {
            "field": "gross_num",
            "type": "quantitative",
            "title": "Gross",
            "format": "$,.0f"
          },

          {
            "field": "gross_budget_gap",
            "type": "quantitative",
            "title": "Gross–Budget Gap",
            "format": "$,.0f"
          }
        ]
      }
    },

    {
      "mark": {
        "type": "text",
        "align": "right",
        "baseline": "middle",
        "dx": -10,
        "fontSize": 11,
        "fontWeight": "bold",
        "color": "#2F3B45"
      },

      "encoding": {
        "x": {
          "datum": 0,
          "type": "quantitative"
        },

        "y": {
          "field": "row_position",
          "type": "quantitative",

          "scale": {
            "domain": [
              0,
              14
            ],
            "reverse": true
          }
        },

        "text": {
          "field": "name"
        }
      }
    },

    {
      "transform": [
        {
          "filter": "datum.performance === 'Overperformer'"
        }
      ],

      "mark": {
        "type": "text",
        "align": "left",
        "baseline": "middle",
        "dx": 9,
        "fontSize": 10,
        "fontWeight": "bold",
        "color": "#3A7CA5"
      },

      "encoding": {
        "x": {
          "field": "gross_num",
          "type": "quantitative"
        },

        "y": {
          "field": "row_position",
          "type": "quantitative",

          "scale": {
            "domain": [
              0,
              14
            ],
            "reverse": true
          }
        },

        "text": {
          "field": "gross_budget_gap",
          "type": "quantitative",
          "format": "+$~s"
        }
      }
    },

    {
      "transform": [
        {
          "filter": "datum.performance === 'Expensive Miss'"
        }
      ],

      "mark": {
        "type": "text",
        "align": "left",
        "baseline": "middle",
        "dx": 9,
        "fontSize": 10,
        "fontWeight": "bold",
        "color": "#D95F59"
      },

      "encoding": {
        "x": {
          "field": "budget_num",
          "type": "quantitative"
        },

        "y": {
          "field": "row_position",
          "type": "quantitative",

          "scale": {
            "domain": [
              0,
              14
            ],
            "reverse": true
          }
        },

        "text": {
          "field": "gross_budget_gap",
          "type": "quantitative",
          "format": "+$~s"
        }
      }
    },

    {
      "data": {
        "values": [
          {
            "row_position": 0.7,
            "label": "BLOCKBUSTERS / OVERPERFORMERS"
          }
        ]
      },

      "mark": {
        "type": "text",
        "align": "left",
        "fontSize": 11,
        "fontWeight": "bold",
        "color": "#3A7CA5"
      },

      "encoding": {
        "x": {
          "value": 5
        },

        "y": {
          "field": "row_position",
          "type": "quantitative",

          "scale": {
            "domain": [
              0,
              14
            ],
            "reverse": true
          }
        },

        "text": {
          "field": "label"
        }
      }
    },

    {
      "data": {
        "values": [
          {
            "row_position": 7.4,
            "label": "EXPENSIVE MISSES"
          }
        ]
      },

      "mark": {
        "type": "text",
        "align": "left",
        "fontSize": 11,
        "fontWeight": "bold",
        "color": "#D95F59"
      },

      "encoding": {
        "x": {
          "value": 5
        },

        "y": {
          "field": "row_position",
          "type": "quantitative",

          "scale": {
            "domain": [
              0,
              14
            ],
            "reverse": true
          }
        },

        "text": {
          "field": "label"
        }
      }
    },

    {
      "data": {
        "values": [
          {
            "label": "Budget"
          }
        ]
      },

      "mark": {
        "type": "point",
        "filled": true,
        "size": 100,
        "color": "#D95F59"
      },

      "encoding": {
        "x": {
          "value": 470
        },

        "y": {
          "value": 18
        }
      }
    },

    {
      "data": {
        "values": [
          {
            "label": "Budget"
          }
        ]
      },

      "mark": {
        "type": "text",
        "align": "left",
        "dx": 10,
        "fontSize": 11,
        "color": "#53606B"
      },

      "encoding": {
        "x": {
          "value": 470
        },

        "y": {
          "value": 18
        },

        "text": {
          "field": "label"
        }
      }
    },

    {
      "data": {
        "values": [
          {
            "label": "Gross"
          }
        ]
      },

      "mark": {
        "type": "point",
        "filled": true,
        "size": 100,
        "color": "#3A7CA5"
      },

      "encoding": {
        "x": {
          "value": 560
        },

        "y": {
          "value": 18
        }
      }
    },

    {
      "data": {
        "values": [
          {
            "label": "Gross"
          }
        ]
      },

      "mark": {
        "type": "text",
        "align": "left",
        "dx": 10,
        "fontSize": 11,
        "color": "#53606B"
      },

      "encoding": {
        "x": {
          "value": 560
        },

        "y": {
          "value": 18
        },

        "text": {
          "field": "label"
        }
      }
    }
  ],

  "config": {
    "view": {
      "stroke": null
    }
  }
}