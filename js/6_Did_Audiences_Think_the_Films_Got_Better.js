
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",

  "width": 700,
  "height": 300,

  "background": "white",


  "data": {
    "url": "https://raw.githubusercontent.com/Yancheng-Lu/fit3179-australian-movies/refs/heads/main/data/movies_combined_1980_2025.csv"
  },

  "params": [
    {
      "name": "selectedGenre",
      "value": "All Genres",
      "bind": {
        "input": "select",
        "name": "Genre: ",
        "options": [
          "All Genres",
          "Action",
          "Adventure",
          "Animation",
          "Biography",
          "Comedy",
          "Crime",
          "Documentary",
          "Drama",
          "Family",
          "Fantasy",
          "Foreign",
          "History",
          "Horror",
          "Music",
          "Mystery",
          "Romance",
          "Sci-Fi",
          "Science Fiction",
          "TV Movie",
          "Thriller",
          "War",
          "Western"
        ]
      }
    }
  ],

  "transform": [
    {
      "calculate": "toNumber(datum.year)",
      "as": "year_num"
    },
    {
      "calculate": "toNumber(datum.score)",
      "as": "score_num"
    },
    {
      "calculate": "toNumber(datum.is_australian)",
      "as": "australian_flag"
    },
    {
      "filter": "datum.australian_flag === 1 && datum.year_num >= 1980 && datum.year_num <= 2025 && datum.score_num > 0"
    },
    {
      "calculate": "datum.genres != null && datum.genres !== '' ? datum.genres : (datum.genre != null ? datum.genre : '')",
      "as": "genre_tags"
    },
    {
      "filter": "selectedGenre === 'All Genres' || indexof(split(datum.genre_tags, '|'), selectedGenre) >= 0"
    },
    {
      "calculate": "datum.year_num < 1990 ? '1980s' : datum.year_num < 2000 ? '1990s' : datum.year_num < 2010 ? '2000s' : datum.year_num < 2020 ? '2010s' : '2020s'",
      "as": "decade"
    },
    {
      "calculate": "datum.score_num < 6 ? 'Low Rated' : datum.score_num < 7 ? 'Moderate' : 'Highly Rated'",
      "as": "rating_group"
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
        "rating_group"
      ]
    },
    {
      "joinaggregate": [
        {
          "op": "sum",
          "field": "film_count",
          "as": "total_films"
        }
      ],
      "groupby": [
        "decade"
      ]
    },
    {
      "calculate": "datum.film_count / datum.total_films * 100",
      "as": "percentage"
    },
    {
      "calculate": "datum.rating_group === 'Low Rated' ? 1 : datum.rating_group === 'Moderate' ? 2 : 3",
      "as": "rating_order"
    },
    {
      "window": [
        {
          "op": "sum",
          "field": "percentage",
          "as": "cumulative_pct"
        }
      ],
      "groupby": [
        "decade"
      ],
      "sort": [
        {
          "field": "rating_order",
          "order": "ascending"
        }
      ],
      "frame": [
        null,
        0
      ]
    },
    {
      "calculate": "datum.cumulative_pct - datum.percentage",
      "as": "start_pct"
    },
    {
      "calculate": "datum.cumulative_pct",
      "as": "end_pct"
    },
    {
      "calculate": "datum.start_pct + datum.percentage / 2",
      "as": "center_pct"
    },
    {
      "calculate": "format(datum.percentage, '.1f') + '%'",
      "as": "percentage_label"
    }
  ],

  "encoding": {
    "y": {
      "field": "decade",
      "type": "ordinal",
      "title": "Decade",
      "sort": [
        "1980s",
        "1990s",
        "2000s",
        "2010s",
        "2020s"
      ],
      "axis": {
        "labelFontSize": 12,
        "titleFontSize": 12,
        "labelPadding": 8
      }
    }
  },

  "layer": [
    {
      "mark": {
        "type": "bar",
        "size": 36,
        "stroke": "white",
        "strokeWidth": 1
      },

      "encoding": {
        "x": {
          "field": "start_pct",
          "type": "quantitative",
          "title": "Percentage of Films",
          "scale": {
            "domain": [
              0,
              100
            ]
          },
          "axis": {
            "values": [
              0,
              20,
              40,
              60,
              80,
              100
            ],
            "labelExpr": "datum.value + '%'",
            "labelFontSize": 11,
            "titleFontSize": 12
          }
        },

        "x2": {
          "field": "end_pct"
        },

        "color": {
          "field": "rating_group",
          "type": "nominal",
          "title": "Audience Rating",

          "sort": [
            "Low Rated",
            "Moderate",
            "Highly Rated"
          ],

          "scale": {
            "domain": [
              "Low Rated",
              "Moderate",
              "Highly Rated"
            ],

            "range": [
              "#DCEAF3",
              "#77A6C6",
              "#123F6B"
            ]
          },

          "legend": {
            "orient": "bottom",
            "direction": "horizontal",
            "title": null,
            "labelFontSize": 11,
            "symbolType": "square",
            "symbolSize": 140
          }
        },

        "tooltip": [
          {
            "field": "decade",
            "type": "ordinal",
            "title": "Decade"
          },
          {
            "field": "rating_group",
            "type": "nominal",
            "title": "Rating Group"
          },
          {
            "field": "film_count",
            "type": "quantitative",
            "title": "Number of Films",
            "format": ","
          },
          {
            "field": "percentage",
            "type": "quantitative",
            "title": "Percentage",
            "format": ".1f"
          },
          {
            "field": "total_films",
            "type": "quantitative",
            "title": "Total Films in Decade"
          }
        ]
      }
    },

    {
      "mark": {
        "type": "text",
        "font": "Arial",
        "fontSize": 11,
        "fontWeight": "bold",
        "align": "center",
        "baseline": "middle"
      },

      "encoding": {
        "x": {
          "field": "center_pct",
          "type": "quantitative",
          "scale": {
            "domain": [
              0,
              100
            ]
          }
        },

        "text": {
          "field": "percentage_label",
          "type": "nominal"
        },

        "color": {
          "condition": {
            "test": "datum.rating_group !== 'Highly Rated'",
            "value": "#163247"
          },
          "value": "#FFFFFF"
        },

        "tooltip": [
          {
            "field": "decade",
            "type": "ordinal",
            "title": "Decade"
          },
          {
            "field": "rating_group",
            "type": "nominal",
            "title": "Rating Group"
          },
          {
            "field": "percentage",
            "type": "quantitative",
            "title": "Percentage",
            "format": ".1f"
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
      "labelFont": "Arial",
      "titleFont": "Arial",
      "grid": true,
      "gridColor": "#E6E6E6",
      "domainColor": "#BDBDBD",
      "tickColor": "#BDBDBD"
    },

    "legend": {
      "labelFont": "Arial",
      "titleFont": "Arial"
    }
  }
}
