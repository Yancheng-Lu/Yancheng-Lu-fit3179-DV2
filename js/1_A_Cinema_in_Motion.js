{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",

  "description": "Australian-linked films by year with an interactive genre filter and dynamic peak annotation.",

  "width": 720,
  "height": 380,
  "background": "white",

  "title": {
    "text": "A Cinema in Motion",
    "anchor": "start",
    "font": "Georgia",
    "fontSize": 22,
    "color": "#1F2D3D",
    "subtitleFont": "Arial",
    "subtitleFontSize": 12,
    "subtitleColor": "#687684",
    "offset": 16
  },

  "data": {
    "url": "https://raw.githubusercontent.com/Yancheng-Lu/fit3179-australian-movies/refs/heads/main/data/movies_combined_1980_2025.csv"
  },

  "params": [
    {
      "name": "selectedGenre",
      "value": "All Genres",
      "bind": {
        "input": "select",
        "name": "Filter by genre: ",
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
      "calculate": "toNumber(datum.is_australian)",
      "as": "australian_flag"
    },
    {
      "filter": "datum.australian_flag === 1 && datum.year_num >= 1980 && datum.year_num <= 2025"
    },
    {
      "calculate": "datum.genres != null && datum.genres !== '' ? datum.genres : (datum.genre != null ? datum.genre : '')",
      "as": "genre_tags"
    },
    {
      "filter": "selectedGenre === 'All Genres' || indexof(split(datum.genre_tags, '|'), selectedGenre) >= 0"
    },
    {
      "aggregate": [
        {
          "op": "count",
          "field": "name",
          "as": "film_count"
        }
      ],
      "groupby": ["year_num"]
    },
    {
      "impute": "film_count",
      "key": "year_num",
      "keyvals": {
        "start": 1980,
        "stop": 2026,
        "step": 1
      },
      "value": 0
    },
    {
      "joinaggregate": [
        {
          "op": "max",
          "field": "film_count",
          "as": "max_films"
        }
      ]
    },
    {
      "calculate": "datum.film_count === datum.max_films ? datum.year_num : null",
      "as": "peak_candidate"
    },
    {
      "joinaggregate": [
        {
          "op": "min",
          "field": "peak_candidate",
          "as": "peak_year"
        }
      ]
    },
    {
      "calculate": "datum.year_num === datum.peak_year ? 1 : 0",
      "as": "is_peak"
    }
  ],

  "encoding": {
    "x": {
      "field": "year_num",
      "type": "quantitative",
      "title": "Year",
      "scale": {
        "domain": [1980, 2025]
      },
      "axis": {
        "format": "d",
        "values": [1980, 1990, 2000, 2010, 2020, 2025],
        "labelAngle": 0,
        "tickSize": 4
      }
    },

    "y": {
      "field": "film_count",
      "type": "quantitative",
      "title": "Number of Films",
      "scale": {
        "domain": [0, 38]
      }
    },

    "tooltip": [
      {
        "field": "year_num",
        "type": "quantitative",
        "title": "Year",
        "format": "d"
      },
      {
        "field": "film_count",
        "type": "quantitative",
        "title": "Number of Films"
      }
    ]
  },

  "layer": [
    {
      "mark": {
        "type": "line",
        "stroke": "#1F4E79",
        "strokeWidth": 3,
        "interpolate": "linear"
      }
    },

    {
      "mark": {
        "type": "point",
        "filled": true,
        "size": 38,
        "color": "#1F4E79",
        "opacity": 0.8
      }
    },

    {
      "transform": [
        {
          "filter": "datum.is_peak === 1"
        }
      ],
      "mark": {
        "type": "point",
        "filled": true,
        "size": 180,
        "color": "#D95F0E",
        "stroke": "white",
        "strokeWidth": 2
      }
    },

    {
      "transform": [
        {
          "filter": "datum.is_peak === 1"
        },
        {
          "calculate": "'PEAK YEAR — ' + format(datum.year_num, '.0f')",
          "as": "label"
        }
      ],
      "mark": {
        "type": "text",
        "align": "right",
        "baseline": "bottom",
        "dx": -10,
        "dy": -42,
        "fontSize": 12,
        "fontWeight": "bold",
        "color": "#D95F0E"
      },
      "encoding": {
        "text": {
          "field": "label"
        }
      }
    },

    {
      "transform": [
        {
          "filter": "datum.is_peak === 1"
        },
        {
          "calculate": "format(datum.film_count, '.0f') + ' films in dataset'",
          "as": "label"
        }
      ],
      "mark": {
        "type": "text",
        "align": "right",
        "baseline": "bottom",
        "dx": -10,
        "dy": -25,
        "fontSize": 11,
        "color": "#444444"
      },
      "encoding": {
        "text": {
          "field": "label"
        }
      }
    }
  ],

  "config": {
    "axis": {
      "labelFont": "Arial",
      "titleFont": "Arial",
      "labelFontSize": 11,
      "titleFontSize": 12,
      "grid": true,
      "gridColor": "#E6E6E6",
      "domainColor": "#BDBDBD",
      "tickColor": "#BDBDBD"
    },

    "view": {
      "stroke": null
    }
  }
}