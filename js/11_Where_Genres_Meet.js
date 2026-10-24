{
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "Force-directed genre co-occurrence network of unique Australian-linked films, 1980–2025. Node area encodes film count; link width encodes unique films sharing both genre tags.",
  "width": 800,
  "height": 400,
  "padding": 6,
  "background": "white",
  "signals": [
    {
      "name": "minLinks",
      "value": 5,
      "bind": {
        "input": "range",
        "min": 1,
        "max": 20,
        "step": 1,
        "name": "Minimum shared films: "
      }
    },
    {
      "name": "hoverGenre",
      "value": null,
      "on": [
        {
          "events": "@genreNodes:mouseover",
          "update": "datum.genre"
        },
        {
          "events": "@genreNodes:mouseout",
          "update": "null"
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
      "name": "taggedFilms",
      "source": "movies",
      "transform": [
        {
          "type": "formula",
          "as": "tags",
          "expr": "split(replace(datum.genres || datum.genre || '', /Sci-Fi/g, 'Science Fiction'), '|')"
        },
        {
          "type": "formula",
          "as": "indices",
          "expr": "sequence(0,length(datum.tags))"
        }
      ]
    },
    {
      "name": "genreMembership",
      "source": "taggedFilms",
      "transform": [
        {
          "type": "flatten",
          "fields": [
            "tags"
          ],
          "as": [
            "genre"
          ]
        },
        {
          "type": "formula",
          "as": "genre",
          "expr": "trim(datum.genre)"
        },
        {
          "type": "filter",
          "expr": "datum.genre !== ''"
        },
        {
          "type": "aggregate",
          "groupby": [
            "film_id",
            "genre"
          ]
        }
      ]
    },
    {
      "name": "genreSummary",
      "source": "genreMembership",
      "transform": [
        {
          "type": "aggregate",
          "groupby": [
            "genre"
          ],
          "ops": [
            "count"
          ],
          "fields": [
            null
          ],
          "as": [
            "film_count"
          ]
        },
        {
          "type": "collect",
          "sort": {
            "field": "genre"
          }
        },
        {
          "type": "window",
          "ops": [
            "row_number"
          ],
          "as": [
            "row"
          ]
        },
        {
          "type": "formula",
          "as": "index",
          "expr": "datum.row-1"
        },
        {
          "type": "formula",
          "as": "targetX",
          "expr": "width/2"
        },
        {
          "type": "formula",
          "as": "targetY",
          "expr": "height/2"
        }
      ]
    },
    {
      "name": "links",
      "source": "taggedFilms",
      "transform": [
        {
          "type": "flatten",
          "fields": [
            "tags",
            "indices"
          ],
          "as": [
            "a",
            "i"
          ]
        },
        {
          "type": "flatten",
          "fields": [
            "tags",
            "indices"
          ],
          "as": [
            "b",
            "j"
          ]
        },
        {
          "type": "filter",
          "expr": "datum.i < datum.j && trim(datum.a) !== trim(datum.b)"
        },
        {
          "type": "formula",
          "as": "source_genre",
          "expr": "trim(datum.a) < trim(datum.b) ? trim(datum.a) : trim(datum.b)"
        },
        {
          "type": "formula",
          "as": "target_genre",
          "expr": "trim(datum.a) < trim(datum.b) ? trim(datum.b) : trim(datum.a)"
        },
        {
          "type": "aggregate",
          "groupby": [
            "film_id",
            "source_genre",
            "target_genre"
          ]
        },
        {
          "type": "aggregate",
          "groupby": [
            "source_genre",
            "target_genre"
          ],
          "ops": [
            "count"
          ],
          "fields": [
            null
          ],
          "as": [
            "shared_films"
          ]
        },
        {
          "type": "filter",
          "expr": "datum.shared_films >= minLinks"
        },
        {
          "type": "lookup",
          "from": "genreSummary",
          "key": "genre",
          "fields": [
            "source_genre",
            "target_genre"
          ],
          "values": [
            "index"
          ],
          "as": [
            "source",
            "target"
          ]
        }
      ]
    },
    {
      "name": "nodes",
      "source": "genreSummary",
      "transform": [
        {
          "type": "force",
          "iterations": 300,
          "static": true,
          "signal": "networkForce",
          "forces": [
            {
              "force": "center",
              "x": {
                "signal": "width/2"
              },
              "y": {
                "signal": "height/2"
              }
            },
            {
              "force": "collide",
              "radius": {
                "expr": "sqrt(datum.film_count)*2+14"
              }
            },
            {
              "force": "nbody",
              "strength": -220
            },
            {
              "force": "link",
              "links": "links",
              "distance": 140,
              "strength": 0.25
            },
            {
              "force": "x",
              "x": "targetX",
              "strength": 0.08
            },
            {
              "force": "y",
              "y": "targetY",
              "strength": 0.12
            }
          ]
        }
      ]
    },
    {
      "name": "linkPaths",
      "source": "links",
      "transform": [
        {
          "type": "formula",
          "as": "path",
          "expr": "networkForce ? 'M' + scale('layoutX',datum.source.x) + ',' + scale('layoutY',datum.source.y) + 'L' + scale('layoutX',datum.target.x) + ',' + scale('layoutY',datum.target.y) : ''"
        }
      ]
    },
    {
      "name": "strongestPair",
      "source": "links",
      "transform": [
        {
          "type": "window",
          "sort": {
            "field": [
              "shared_films",
              "source_genre",
              "target_genre"
            ],
            "order": [
              "descending",
              "ascending",
              "ascending"
            ]
          },
          "ops": [
            "row_number"
          ],
          "as": [
            "annotation_rank"
          ]
        },
        {
          "type": "filter",
          "expr": "datum.annotation_rank === 1"
        }
      ]
    },
    {
      "name": "leadingGenre",
      "source": "genreSummary",
      "transform": [
        {
          "type": "window",
          "sort": {
            "field": [
              "film_count",
              "genre"
            ],
            "order": [
              "descending",
              "ascending"
            ]
          },
          "ops": [
            "row_number"
          ],
          "as": [
            "annotation_rank"
          ]
        },
        {
          "type": "filter",
          "expr": "datum.annotation_rank === 1"
        }
      ]
    }
  ],
  "scales": [
    {
      "name": "nodeArea",
      "type": "linear",
      "domain": {
        "data": "genreSummary",
        "field": "film_count"
      },
      "range": [
        220,
        5000
      ],
      "zero": true
    },
    {
      "name": "linkWidth",
      "type": "sqrt",
      "domain": {
        "data": "links",
        "field": "shared_films"
      },
      "range": [
        0.7,
        7
      ],
      "zero": true
    },
    {
      "name": "layoutX",
      "type": "linear",
      "domain": {
        "data": "nodes",
        "field": "x"
      },
      "range": [
        48,
        {
          "signal": "width-48"
        }
      ],
      "zero": false,
      "nice": false
    },
    {
      "name": "layoutY",
      "type": "linear",
      "domain": {
        "data": "nodes",
        "field": "y"
      },
      "range": [
        90,
        {
          "signal": "height-30"
        }
      ],
      "zero": false,
      "nice": false
    }
  ],
  "marks": [
    {
      "name": "genreLinks",
      "type": "path",
      "from": {
        "data": "linkPaths"
      },
      "encode": {
        "update": {
          "stroke": {
            "signal": "hoverGenre === datum.source_genre || hoverGenre === datum.target_genre ? '#cc805d' : '#7095af'"
          },
          "strokeWidth": {
            "scale": "linkWidth",
            "field": "shared_films"
          },
          "strokeOpacity": {
            "signal": "hoverGenre === null ? 0.32 : (hoverGenre === datum.source_genre || hoverGenre === datum.target_genre ? 0.9 : 0.06)"
          },
          "tooltip": {
            "signal": "{'Genres':datum.source_genre+' + '+datum.target_genre,'Shared films':datum.shared_films}"
          },
          "path": {
            "field": "path"
          }
        }
      }
    },
    {
      "name": "genreNodes",
      "type": "symbol",
      "from": {
        "data": "nodes"
      },
      "encode": {
        "update": {
          "x": {
            "signal": "networkForce ? scale('layoutX',datum.x) : scale('layoutX',datum.x)"
          },
          "y": {
            "signal": "networkForce ? scale('layoutY',datum.y) : scale('layoutY',datum.y)"
          },
          "size": {
            "scale": "nodeArea",
            "field": "film_count"
          },
          "fill": {
            "signal": "hoverGenre === datum.genre ? '#c67d58' : '#285778'"
          },
          "stroke": {
            "value": "white"
          },
          "strokeWidth": {
            "value": 2
          },
          "cursor": {
            "value": "pointer"
          },
          "tooltip": {
            "signal": "{'Genre':datum.genre,'Films':datum.film_count}"
          }
        },
        "enter": {
          "x": {
            "signal": "networkForce ? scale('layoutX',datum.x) : scale('layoutX',datum.x)"
          },
          "y": {
            "signal": "networkForce ? scale('layoutY',datum.y) : scale('layoutY',datum.y)"
          },
          "size": {
            "scale": "nodeArea",
            "field": "film_count"
          },
          "fill": {
            "signal": "hoverGenre === datum.genre ? '#c67d58' : '#285778'"
          },
          "stroke": {
            "value": "white"
          },
          "strokeWidth": {
            "value": 2
          },
          "cursor": {
            "value": "pointer"
          },
          "tooltip": {
            "signal": "{'Genre':datum.genre,'Films':datum.film_count}"
          }
        }
      }
    },
    {
      "type": "text",
      "from": {
        "data": "nodes"
      },
      "interactive": false,
      "encode": {
        "update": {
          "x": {
            "signal": "networkForce ? scale('layoutX',datum.x) : scale('layoutX',datum.x)"
          },
          "y": {
            "signal": "networkForce ? scale('layoutY',datum.y) : scale('layoutY',datum.y)"
          },
          "dy": {
            "value": 0
          },
          "text": {
            "field": "genre"
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
          "fontWeight": {
            "value": "bold"
          },
          "fontSize": {
            "value": 11
          },
          "fill": {
            "value": "white"
          },
          "stroke": {
            "value": "white"
          },
          "strokeWidth": {
            "value": 3
          },
          "strokeJoin": {
            "value": "round"
          }
        }
      },
      "name": "genreLabelHalo"
    },
    {
      "type": "text",
      "from": {
        "data": "nodes"
      },
      "interactive": false,
      "encode": {
        "update": {
          "x": {
            "signal": "networkForce ? scale('layoutX',datum.x) : scale('layoutX',datum.x)"
          },
          "y": {
            "signal": "networkForce ? scale('layoutY',datum.y) : scale('layoutY',datum.y)"
          },
          "dy": {
            "value": 0
          },
          "text": {
            "field": "genre"
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
          "fontWeight": {
            "value": "bold"
          },
          "fontSize": {
            "value": 11
          },
          "fill": {
            "value": "#142d42"
          }
        }
      },
      "name": "genreLabels"
    },
    {
      "name": "annotation-pair-background",
      "type": "rect",
      "interactive": false,
      "encode": {
        "update": {
          "x": {
            "value": 0
          },
          "y": {
            "value": 0
          },
          "width": {
            "value": 400
          },
          "height": {
            "value": 50
          },
          "fill": {
            "value": "#f1f5f8"
          },
          "stroke": {
            "value": "#dce5ec"
          },
          "cornerRadius": {
            "value": 5
          }
        }
      }
    },
    {
      "name": "annotation-pair-heading",
      "type": "text",
      "interactive": false,
      "encode": {
        "update": {
          "x": {
            "value": 12
          },
          "y": {
            "value": 15
          },
          "text": {
            "value": "STRONGEST GENRE CONNECTION"
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
            "value": "#5a6d7b"
          }
        }
      }
    },
    {
      "name": "annotation-pair-value",
      "type": "text",
      "from": {
        "data": "strongestPair"
      },
      "interactive": false,
      "encode": {
        "update": {
          "x": {
            "value": 12
          },
          "y": {
            "value": 35
          },
          "text": {
            "signal": "datum.source_genre + ' + ' + datum.target_genre + ' · ' + datum.shared_films + ' shared films'"
          },
          "font": {
            "value": "Arial"
          },
          "fontSize": {
            "value": 12
          },
          "fontWeight": {
            "value": "bold"
          },
          "fill": {
            "value": "#a65233"
          },
          "limit": {
            "value": 376
          }
        }
      }
    },
    {
      "name": "annotation-genre-background",
      "type": "rect",
      "interactive": false,
      "encode": {
        "update": {
          "x": {
            "value": 414
          },
          "y": {
            "value": 0
          },
          "width": {
            "value": 386
          },
          "height": {
            "value": 50
          },
          "fill": {
            "value": "#f1f5f8"
          },
          "stroke": {
            "value": "#dce5ec"
          },
          "cornerRadius": {
            "value": 5
          }
        }
      }
    },
    {
      "name": "annotation-genre-heading",
      "type": "text",
      "interactive": false,
      "encode": {
        "update": {
          "x": {
            "value": 426
          },
          "y": {
            "value": 15
          },
          "text": {
            "value": "MOST REPRESENTED GENRE"
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
            "value": "#5a6d7b"
          }
        }
      }
    },
    {
      "name": "annotation-genre-value",
      "type": "text",
      "from": {
        "data": "leadingGenre"
      },
      "interactive": false,
      "encode": {
        "update": {
          "x": {
            "value": 426
          },
          "y": {
            "value": 35
          },
          "text": {
            "signal": "datum.genre + ' · ' + datum.film_count + ' films with this tag'"
          },
          "font": {
            "value": "Arial"
          },
          "fontSize": {
            "value": 12
          },
          "fontWeight": {
            "value": "bold"
          },
          "fill": {
            "value": "#173f60"
          },
          "limit": {
            "value": 362
          }
        }
      }
    }
  ]
}
