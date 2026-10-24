{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",

  "width": 700,
  "height": 380,

  "background": "white",


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
      "filter": "datum.australian_flag === 1 && datum.year_num >= 1980 && datum.year_num <= 2025 && datum.genre != null && datum.genre !== ''"
    },

    {
      "calculate": "datum.year_num < 1990 ? '1980s' : datum.year_num < 2000 ? '1990s' : datum.year_num < 2010 ? '2000s' : datum.year_num < 2020 ? '2010s' : '2020s'",
      "as": "decade"
    },

    {
      "aggregate": [
        {
          "op": "count",
          "field": "name",
          "as": "film_count"
        }
      ],
      "groupby": [
        "decade",
        "genre"
      ]
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
          "field": "film_count",
          "order": "descending"
        },
        {
          "field": "genre",
          "order": "ascending"
        }
      ],

      "groupby": [
        "decade"
      ]
    },

    {
      "filter": "datum.rank <= 5"
    },

    {
      "joinaggregate": [
        {
          "op": "max",
          "field": "film_count",
          "as": "max_count"
        }
      ]
    }
  ],

  "layer": [

    {
      "mark": {
        "type": "circle",
        "opacity": 0.9,
        "stroke": "white",
        "strokeWidth": 1.5
      },

      "encoding": {

        "x": {
          "field": "decade",
          "type": "ordinal",
          "title": null,

          "sort": [
            "1980s",
            "1990s",
            "2000s",
            "2010s",
            "2020s"
          ],

          "axis": {
            "labelAngle": 0,
            "labelFontSize": 12,
            "labelColor": "#4D4944",
            "labelPadding": 10,
            "tickSize": 0,
            "domainColor": "#C9C1B6"
          }
        },

        "y": {
          "field": "genre",
          "type": "nominal",
          "title": null,

          "sort": {
            "field": "film_count",
            "op": "sum",
            "order": "descending"
          },

          "axis": {
            "labelFontSize": 12,
            "labelColor": "#4D4944",
            "labelPadding": 10,
            "tickSize": 0,
            "domain": false
          }
        },

        "size": {
          "field": "film_count",
          "type": "quantitative",
          "title": "Number of Films",

          "scale": {
            "range": [
              250,
              1600
            ]
          },

          "legend": {
            "orient": "bottom",
            "direction": "horizontal",
            "title": "Number of Films",
            "titleFontSize": 11,
            "labelFontSize": 10
          }
        },

        "color": {
          "field": "rank",
          "type": "ordinal",
          "title": "Rank",

          "scale": {
            "domain": [
              1,
              2,
              3,
              4,
              5
            ],

            "range": [
              "#1F4E79",
              "#3E6F96",
              "#6792AD",
              "#97B6C8",
              "#C9D8DF"
            ]
          },

          "legend": {
            "orient": "bottom",
            "direction": "horizontal",
            "title": "Genre Rank",
            "titleFontSize": 11,
            "labelFontSize": 10
          }
        },

        "tooltip": [
          {
            "field": "genre",
            "type": "nominal",
            "title": "Genre"
          },

          {
            "field": "decade",
            "type": "ordinal",
            "title": "Decade"
          },

          {
            "field": "rank",
            "type": "quantitative",
            "title": "Rank"
          },

          {
            "field": "film_count",
            "type": "quantitative",
            "title": "Number of Films"
          }
        ]
      }
    },

    {
      "mark": {
        "type": "text",
        "fontSize": 12,
        "fontWeight": "bold"
      },

      "encoding": {

        "x": {
          "field": "decade",
          "type": "ordinal",
          "sort": [
            "1980s",
            "1990s",
            "2000s",
            "2010s",
            "2020s"
          ]
        },

        "y": {
          "field": "genre",
          "type": "nominal",

          "sort": {
            "field": "film_count",
            "op": "sum",
            "order": "descending"
          }
        },

        "text": {
          "field": "rank",
          "type": "quantitative",
          "format": "d"
        },

        "color": {
          "condition": {
            "test": "datum.rank <= 2",
            "value": "white"
          },
          "value": "#32424D"
        }
      }
    }
  ],

  "config": {
    "view": {
      "stroke": null
    },

    "axis": {
      "grid": false
    },

    "legend": {
      "layout": {
        "bottom": {
          "margin": 40
        }
      },
      "labelColor": "#55514C",
      "titleColor": "#55514C"
    }
  }
}
