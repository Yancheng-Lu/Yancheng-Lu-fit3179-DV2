{
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "Genre box-and-whisker plot of valid audience scores for unique Australian-linked films, 1980–2025. Boxes show Q1–Q3, median rules show Q2, whiskers end at observed values within 1.5 IQR, dots show outliers. Primary genre is used.",
  "width": 740,
  "height": 440,
  "padding": {
    "left": 12,
    "top": 12,
    "right": 22,
    "bottom": 12
  },
  "background": "white",
  "signals": [
    {
      "name": "minFilms",
      "value": 5,
      "bind": {
        "input": "range",
        "min": 2,
        "max": 20,
        "step": 1,
        "name": "Minimum rated films per genre: "
      }
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
          "gross": "number",
          "is_australian": "number"
        }
      },
      "transform": [
        {
          "type": "filter",
          "expr": "datum.is_australian === 1 && datum.year >= 1980 && datum.year <= 2025"
        },
        {
          "type": "formula",
          "as": "film_id",
          "expr": "isValid(datum.tmdb_id) && trim(toString(datum.tmdb_id)) !== '' && toNumber(datum.tmdb_id) > 0 ? 'tmdb:' + toString(toNumber(datum.tmdb_id)) : 'legacy:' + lower(trim(datum.name || '')) + '|' + toString(datum.year) + '|' + lower(trim(datum.director || ''))"
        },
        {
          "type": "aggregate",
          "groupby": [
            "film_id"
          ],
          "ops": [
            "argmax"
          ],
          "fields": [
            "year"
          ],
          "as": [
            "film"
          ]
        },
        {
          "type": "formula",
          "as": "name",
          "expr": "datum.film.name"
        },
        {
          "type": "formula",
          "as": "year",
          "expr": "datum.film.year"
        },
        {
          "type": "formula",
          "as": "genre",
          "expr": "datum.film.genre"
        },
        {
          "type": "formula",
          "as": "genres",
          "expr": "datum.film.genres"
        },
        {
          "type": "formula",
          "as": "score",
          "expr": "datum.film.score"
        },
        {
          "type": "formula",
          "as": "gross",
          "expr": "datum.film.gross"
        }
      ]
    },
    {
      "name": "ratedFilms",
      "source": "movies",
      "transform": [
        {
          "type": "filter",
          "expr": "isValid(datum.score) && isFinite(datum.score) && datum.score > 0 && datum.score <= 10 && isValid(datum.genre) && trim(datum.genre) !== ''"
        },
        {
          "type": "formula",
          "as": "genre",
          "expr": "trim(datum.genre)"
        }
      ]
    },
    {
      "name": "quartiles",
      "source": "ratedFilms",
      "transform": [
        {
          "type": "aggregate",
          "groupby": [
            "genre"
          ],
          "ops": [
            "q1",
            "median",
            "q3",
            "count"
          ],
          "fields": [
            "score",
            "score",
            "score",
            null
          ],
          "as": [
            "q1",
            "median",
            "q3",
            "film_count"
          ]
        },
        {
          "type": "filter",
          "expr": "datum.film_count >= minFilms"
        },
        {
          "type": "formula",
          "as": "lowerFence",
          "expr": "datum.q1-1.5*(datum.q3-datum.q1)"
        },
        {
          "type": "formula",
          "as": "upperFence",
          "expr": "datum.q3+1.5*(datum.q3-datum.q1)"
        }
      ]
    },
    {
      "name": "classifiedFilms",
      "source": "ratedFilms",
      "transform": [
        {
          "type": "lookup",
          "from": "quartiles",
          "key": "genre",
          "fields": [
            "genre"
          ],
          "as": [
            "summary"
          ]
        },
        {
          "type": "filter",
          "expr": "datum.summary != null"
        }
      ]
    },
    {
      "name": "whiskers",
      "source": "classifiedFilms",
      "transform": [
        {
          "type": "filter",
          "expr": "datum.score >= datum.summary.lowerFence && datum.score <= datum.summary.upperFence"
        },
        {
          "type": "aggregate",
          "groupby": [
            "genre"
          ],
          "ops": [
            "min",
            "max"
          ],
          "fields": [
            "score",
            "score"
          ],
          "as": [
            "low",
            "high"
          ]
        },
        {
          "type": "lookup",
          "from": "quartiles",
          "key": "genre",
          "fields": [
            "genre"
          ],
          "values": [
            "q1",
            "median",
            "q3",
            "film_count"
          ],
          "as": [
            "q1",
            "median",
            "q3",
            "film_count"
          ]
        }
      ]
    },
    {
      "name": "outliers",
      "source": "classifiedFilms",
      "transform": [
        {
          "type": "filter",
          "expr": "datum.score < datum.summary.lowerFence || datum.score > datum.summary.upperFence"
        }
      ]
    }
  ],
  "scales": [
    {
      "name": "score",
      "type": "linear",
      "domain": [
        0,
        10
      ],
      "range": "width",
      "nice": false,
      "zero": true
    },
    {
      "name": "genre",
      "type": "band",
      "domain": {
        "data": "quartiles",
        "field": "genre",
        "sort": {
          "op": "max",
          "field": "median",
          "order": "descending"
        }
      },
      "range": "height",
      "padding": 0.3
    }
  ],
  "axes": [
    {
      "labelFont": "Arial",
      "labelFontSize": 11,
      "labelColor": "#4f6170",
      "titleFont": "Arial",
      "titleColor": "#233d51",
      "titleFontSize": 12,
      "domainColor": "#becbd5",
      "tickColor": "#becbd5",
      "scale": "score",
      "orient": "bottom",
      "title": "Audience score (0–10)",
      "grid": true,
      "gridColor": "#e8eef2",
      "tickCount": 6
    },
    {
      "labelFont": "Arial",
      "labelFontSize": 11,
      "labelColor": "#4f6170",
      "titleFont": "Arial",
      "titleColor": "#233d51",
      "titleFontSize": 12,
      "domainColor": "#becbd5",
      "tickColor": "#becbd5",
      "scale": "genre",
      "orient": "left",
      "domain": false,
      "ticks": false,
      "labelPadding": 8
    }
  ],
  "marks": [
    {
      "type": "rule",
      "from": {
        "data": "whiskers"
      },
      "encode": {
        "update": {
          "x": {
            "scale": "score",
            "field": "low"
          },
          "x2": {
            "scale": "score",
            "field": "high"
          },
          "y": {
            "signal": "scale('genre',datum.genre)+bandwidth('genre')/2"
          },
          "stroke": {
            "value": "#517895"
          },
          "strokeWidth": {
            "value": 1.5
          },
          "tooltip": {
            "signal": "{'Primary genre':datum.genre,'Rated films':datum.film_count,'Median':format(datum.median,'.2f'),'Q1':format(datum.q1,'.2f'),'Q3':format(datum.q3,'.2f'),'Lower whisker':format(datum.low,'.2f'),'Upper whisker':format(datum.high,'.2f')}"
          }
        }
      }
    },
    {
      "type": "rule",
      "from": {
        "data": "whiskers"
      },
      "encode": {
        "update": {
          "x": {
            "scale": "score",
            "field": "low"
          },
          "y": {
            "signal": "scale('genre',datum.genre)+bandwidth('genre')*0.2"
          },
          "y2": {
            "signal": "scale('genre',datum.genre)+bandwidth('genre')*0.8"
          },
          "stroke": {
            "value": "#517895"
          },
          "tooltip": {
            "signal": "{'Primary genre':datum.genre,'Rated films':datum.film_count,'Median':format(datum.median,'.2f'),'Q1':format(datum.q1,'.2f'),'Q3':format(datum.q3,'.2f'),'Lower whisker':format(datum.low,'.2f'),'Upper whisker':format(datum.high,'.2f')}"
          }
        }
      }
    },
    {
      "type": "rule",
      "from": {
        "data": "whiskers"
      },
      "encode": {
        "update": {
          "x": {
            "scale": "score",
            "field": "high"
          },
          "y": {
            "signal": "scale('genre',datum.genre)+bandwidth('genre')*0.2"
          },
          "y2": {
            "signal": "scale('genre',datum.genre)+bandwidth('genre')*0.8"
          },
          "stroke": {
            "value": "#517895"
          },
          "tooltip": {
            "signal": "{'Primary genre':datum.genre,'Rated films':datum.film_count,'Median':format(datum.median,'.2f'),'Q1':format(datum.q1,'.2f'),'Q3':format(datum.q3,'.2f'),'Lower whisker':format(datum.low,'.2f'),'Upper whisker':format(datum.high,'.2f')}"
          }
        }
      }
    },
    {
      "type": "rect",
      "from": {
        "data": "whiskers"
      },
      "encode": {
        "update": {
          "x": {
            "scale": "score",
            "field": "q1"
          },
          "x2": {
            "scale": "score",
            "field": "q3"
          },
          "y": {
            "scale": "genre",
            "field": "genre"
          },
          "height": {
            "signal": "bandwidth('genre')"
          },
          "fill": {
            "value": "#89aec8"
          },
          "stroke": {
            "value": "#315e80"
          },
          "cornerRadius": {
            "value": 2
          },
          "tooltip": {
            "signal": "{'Primary genre':datum.genre,'Rated films':datum.film_count,'Median':format(datum.median,'.2f'),'Q1':format(datum.q1,'.2f'),'Q3':format(datum.q3,'.2f'),'Lower whisker':format(datum.low,'.2f'),'Upper whisker':format(datum.high,'.2f')}"
          }
        }
      }
    },
    {
      "type": "rule",
      "from": {
        "data": "whiskers"
      },
      "encode": {
        "update": {
          "x": {
            "scale": "score",
            "field": "median"
          },
          "y": {
            "scale": "genre",
            "field": "genre"
          },
          "y2": {
            "signal": "scale('genre',datum.genre)+bandwidth('genre')"
          },
          "stroke": {
            "value": "#123f6b"
          },
          "strokeWidth": {
            "value": 3
          },
          "tooltip": {
            "signal": "{'Primary genre':datum.genre,'Rated films':datum.film_count,'Median':format(datum.median,'.2f'),'Q1':format(datum.q1,'.2f'),'Q3':format(datum.q3,'.2f'),'Lower whisker':format(datum.low,'.2f'),'Upper whisker':format(datum.high,'.2f')}"
          }
        }
      }
    },
    {
      "type": "symbol",
      "from": {
        "data": "outliers"
      },
      "encode": {
        "update": {
          "x": {
            "scale": "score",
            "field": "score"
          },
          "y": {
            "signal": "scale('genre',datum.genre)+bandwidth('genre')/2"
          },
          "size": {
            "value": 38
          },
          "fill": {
            "value": "#d48b66"
          },
          "fillOpacity": {
            "value": 0.75
          },
          "stroke": {
            "value": "white"
          },
          "tooltip": {
            "signal": "{'Film':datum.name,'Primary genre':datum.genre,'Score':format(datum.score,'.2f'),'Year':datum.year}"
          }
        }
      }
    }
  ]
}
