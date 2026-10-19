
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",

  "background": "white",

  "width": 680,
  "height": 440,

  "title": {
    "text": "Changing Genres, Changing Fortunes",
    "anchor": "start",
    "font": "Georgia",
    "fontSize": 23,
    "fontWeight": "bold",
    "color": "#1F2D3D",
    "subtitleFont": "Arial",
    "subtitleFontSize": 12,
    "subtitleColor": "#5C6B7A",
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
      "calculate": "toNumber(datum.gross)",
      "as": "gross_num"
    },
    {
      "calculate": "toNumber(datum.is_australian)",
      "as": "australian_flag"
    },
    {
      "filter": "datum.australian_flag === 1 && datum.year_num >= 1980 && datum.year_num <= 2025 && datum.gross_num > 0 && isValid(datum.genre) && trim(datum.genre) !== ''"
    },

    {
      "joinaggregate": [
        {
          "op": "count",
          "field": "name",
          "as": "genre_total"
        }
      ],
      "groupby": [
        "genre"
      ]
    },

    {
      "filter": "datum.genre_total >= 6"
    },

    {
      "calculate": "datum.year_num < 1990 ? '1980s' : datum.year_num < 2000 ? '1990s' : datum.year_num < 2010 ? '2000s' : datum.year_num < 2020 ? '2010s' : '2020s'",
      "as": "decade"
    },

    {
      "aggregate": [
        {
          "op": "median",
          "field": "gross_num",
          "as": "median_gross"
        },
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
      "impute": "film_count",
      "key": "decade",
      "groupby": [
        "genre"
      ],
      "keyvals": [
        "1980s",
        "1990s",
        "2000s",
        "2010s",
        "2020s"
      ],
      "value": 0
    },

    {
      "calculate": "datum.film_count === 0 ? 'No reported gross' : datum.film_count === 1 ? 'Only one film' : format(datum.film_count, ',') + ' films'",
      "as": "sample_note"
    },

    {
      "calculate": "datum.film_count === 0 || !isValid(datum.median_gross) ? 'N/A' : datum.film_count === 1 ? (datum.median_gross >= 1000000 ? '$' + format(datum.median_gross / 1000000, '.1f') + 'M*' : '$' + format(datum.median_gross / 1000, '.0f') + 'K*') : (datum.median_gross >= 1000000 ? '$' + format(datum.median_gross / 1000000, '.1f') + 'M' : '$' + format(datum.median_gross / 1000, '.0f') + 'K')",
      "as": "tile_label"
    }
  ],

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
        "orient": "top",
        "labelAngle": 0,
        "labelFontSize": 13,
        "labelFontWeight": "bold",
        "labelColor": "#283F56",
        "labelPadding": 12,
        "ticks": false,
        "domain": false
      }
    },

    "y": {
      "field": "genre",
      "type": "nominal",
      "title": null,
      "sort": [
        "Action",
        "Drama",
        "Comedy",
        "Horror",
        "Adventure",
        "Animation",
        "Biography",
        "Crime",
        "Thriller"
      ],
      "axis": {
        "labelFontSize": 12,
        "labelColor": "#31465B",
        "labelPadding": 10,
        "ticks": false,
        "domain": false
      }
    }
  },

  "layer": [
    {
      "mark": {
        "type": "rect",
        "cornerRadius": 5,
        "stroke": "white",
        "strokeWidth": 4
      },

      "encoding": {
        "color": {
          "condition": {
            "test": "datum.film_count === 0",
            "value": "#F0F3F6"
          },
          "field": "median_gross",
          "type": "quantitative",
          "title": "Median gross (USD)",
          "scale": {
            "type": "log",
            "scheme": "blues"
          },
          "legend": {
            "orient": "right",
            "titleFont": "Arial",
            "labelFont": "Arial",
            "labelFontSize": 11,
            "titleFontSize": 11,
            "gradientLength": 210,
            "gradientThickness": 12,
            "format": "$~s"
          }
        },

        "opacity": {
          "condition": {
            "test": "datum.film_count === 1",
            "value": 0.56
          },
          "value": 1
        },

        "tooltip": [
          {
            "field": "decade",
            "type": "ordinal",
            "title": "Decade"
          },
          {
            "field": "genre",
            "type": "nominal",
            "title": "Genre"
          },
          {
            "field": "median_gross",
            "type": "quantitative",
            "title": "Median Gross (USD)",
            "format": "$,.0f"
          },
          {
            "field": "film_count",
            "type": "quantitative",
            "title": "Films in Decade"
          },
          {
            "field": "sample_note",
            "type": "nominal",
            "title": "Sample Note"
          }
        ]
      }
    },

    {
      "mark": {
        "type": "text",
        "font": "Arial",
        "fontSize": 12,
        "fontWeight": "bold",
        "baseline": "middle",
        "align": "center"
      },

      "encoding": {
        "text": {
          "field": "tile_label",
          "type": "nominal"
        },

        "color": {
          "condition": [
            {
              "test": "datum.film_count === 0",
              "value": "#8996A3"
            },
            {
              "test": "datum.median_gross >= 18000000",
              "value": "#FFFFFF"
            }
          ],
          "value": "#193C5B"
        },

        "tooltip": [
          {
            "field": "decade",
            "type": "ordinal",
            "title": "Decade"
          },
          {
            "field": "genre",
            "type": "nominal",
            "title": "Genre"
          },
          {
            "field": "median_gross",
            "type": "quantitative",
            "title": "Median Gross (USD)",
            "format": "$,.0f"
          },
          {
            "field": "film_count",
            "type": "quantitative",
            "title": "Number of Films"
          },
          {
            "field": "sample_note",
            "type": "nominal",
            "title": "Sample Note"
          }
        ]
      }
    }
  ],

  "config": {
    "view": {
      "stroke": null
    },

    "axis": {
      "grid": false,
      "labelFont": "Arial",
      "titleFont": "Arial"
    },

    "legend": {
      "labelColor": "#526577",
      "titleColor": "#31465B"
    }
  }
}
