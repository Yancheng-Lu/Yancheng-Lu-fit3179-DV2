{
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "Hierarchical treemap of the highest-grossing unique Australian-linked films with positive reported worldwide gross, 1980–2025. Genre groups contain film rectangles sized by gross; orange indicates at least USD 300 million.",
  "width": 820,
  "height": 550,
  "padding": 16,
  "background": "white",
  "signals": [
    {
      "name": "topN",
      "value": 30,
      "bind": {
        "input": "range",
        "min": 15,
        "max": 30,
        "step": 5,
        "name": "Top films by worldwide gross: "
      }
    },
    {
      "name": "hoverGenre",
      "value": null,
      "on": [
        {
          "events": "@filmTiles:mouseover",
          "update": "datum.genre"
        },
        {
          "events": "@filmTiles:mouseout",
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
      "name": "topFilms",
      "source": "movies",
      "transform": [
        {
          "type": "filter",
          "expr": "isValid(datum.gross) && isFinite(datum.gross) && datum.gross > 0"
        },
        {
          "type": "formula",
          "as": "genre",
          "expr": "isValid(datum.genre) && trim(datum.genre) !== '' ? trim(datum.genre) : 'Unknown'"
        },
        {
          "type": "window",
          "sort": {
            "field": [
              "gross",
              "film_id"
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
            "rank"
          ]
        },
        {
          "type": "filter",
          "expr": "datum.rank <= topN"
        }
      ]
    },
    {
      "name": "treeRoot",
      "values": [
        {
          "id": "root",
          "parent": null,
          "amount": 0
        }
      ]
    },
    {
      "name": "genreHierarchy",
      "source": "topFilms",
      "transform": [
        {
          "type": "aggregate",
          "groupby": [
            "genre"
          ],
          "ops": [
            "sum",
            "count"
          ],
          "fields": [
            "gross",
            null
          ],
          "as": [
            "genre_gross",
            "film_count"
          ]
        },
        {
          "type": "formula",
          "as": "id",
          "expr": "'genre:'+datum.genre"
        },
        {
          "type": "formula",
          "as": "parent",
          "expr": "'root'"
        },
        {
          "type": "formula",
          "as": "amount",
          "expr": "0"
        }
      ]
    },
    {
      "name": "filmHierarchy",
      "source": "topFilms",
      "transform": [
        {
          "type": "formula",
          "as": "id",
          "expr": "'film:'+datum.film_id"
        },
        {
          "type": "formula",
          "as": "parent",
          "expr": "'genre:'+datum.genre"
        },
        {
          "type": "formula",
          "as": "amount",
          "expr": "datum.gross"
        }
      ]
    },
    {
      "name": "tree",
      "source": [
        "treeRoot",
        "genreHierarchy",
        "filmHierarchy"
      ],
      "transform": [
        {
          "type": "stratify",
          "key": "id",
          "parentKey": "parent"
        },
        {
          "type": "treemap",
          "field": "amount",
          "sort": {
            "field": "value",
            "order": "descending"
          },
          "method": "squarify",
          "ratio": 1.3,
          "size": [
            {
              "signal": "width"
            },
            {
              "signal": "height"
            }
          ],
          "round": true,
          "paddingOuter": 3,
          "paddingInner": 2,
          "paddingTop": 32
        }
      ]
    },
    {
      "name": "genreGroups",
      "source": "tree",
      "transform": [
        {
          "type": "filter",
          "expr": "datum.depth === 1"
        }
      ]
    },
    {
      "name": "filmLeaves",
      "source": "tree",
      "transform": [
        {
          "type": "filter",
          "expr": "datum.depth === 2"
        },
        {
          "type": "formula",
          "as": "label_font",
          "expr": "min(10,max(4,sqrt(max(1,datum.x1-datum.x0-10)*max(1,datum.y1-datum.y0-24)/max(1,length(datum.name)*0.8))))"
        },
        {
          "type": "formula",
          "as": "label_chars",
          "expr": "max(1,floor((datum.x1-datum.x0-10)/(datum.label_font*0.64)))"
        },
        {
          "type": "formula",
          "as": "label_lines",
          "expr": "split(trim(replace(datum.name, regexp('.{1,' + datum.label_chars + '}(?: |$)|[^ ]{1,' + datum.label_chars + '}', 'g'), '$&\\n')), '\\n')"
        },
        {
          "type": "formula",
          "as": "fit_font",
          "expr": "min(datum.label_font,max(2,(datum.y1-datum.y0-20)/max(1,length(datum.label_lines))/1.15))"
        }
      ]
    }
  ],
  "scales": [
    {
      "name": "grossColor",
      "type": "log",
      "domain": {
        "data": "topFilms",
        "field": "gross"
      },
      "range": {
        "scheme": "blues",
        "extent": [
          0.25,
          0.8
        ]
      },
      "zero": false
    },
    {
      "name": "grossTierLegend",
      "type": "ordinal",
      "domain": [
        "US$300M or more",
        "Below US$300M"
      ],
      "range": [
        "#c77b55",
        "#77aecb"
      ]
    }
  ],
  "marks": [
    {
      "type": "rect",
      "from": {
        "data": "genreGroups"
      },
      "encode": {
        "update": {
          "x": {
            "field": "x0"
          },
          "y": {
            "field": "y0"
          },
          "x2": {
            "field": "x1"
          },
          "y2": {
            "field": "y1"
          },
          "fill": {
            "value": "#e7eef3"
          },
          "stroke": {
            "value": "#c0cfda"
          },
          "cornerRadius": {
            "value": 3
          }
        }
      }
    },
    {
      "name": "filmTiles",
      "type": "rect",
      "from": {
        "data": "filmLeaves"
      },
      "encode": {
        "update": {
          "x": {
            "field": "x0"
          },
          "y": {
            "field": "y0"
          },
          "x2": {
            "field": "x1"
          },
          "y2": {
            "field": "y1"
          },
          "fill": {
            "signal": "datum.gross >= 300000000 ? '#c77b55' : scale('grossColor',datum.gross)"
          },
          "fillOpacity": {
            "signal": "hoverGenre === null || hoverGenre === datum.genre ? 1 : 0.35"
          },
          "stroke": {
            "value": "white"
          },
          "strokeWidth": {
            "value": 1
          },
          "cursor": {
            "value": "pointer"
          },
          "tooltip": {
            "signal": "{'Film':datum.name,'Primary genre':datum.genre,'Year':datum.year,'Worldwide gross':format(datum.gross,'$,.0f'),'Rank':datum.rank}"
          }
        }
      }
    },
    {
      "type": "text",
      "from": {
        "data": "genreGroups"
      },
      "interactive": false,
      "encode": {
        "update": {
          "x": {
            "signal": "datum.x0+7"
          },
          "y": {
            "signal": "datum.y0+11"
          },
          "text": {
            "field": "genre"
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
            "signal": "min(11,max(4,(datum.x1-datum.x0-12)/max(1,length(datum.genre)*0.65)))"
          },
          "fill": {
            "value": "#173b55"
          }
        }
      }
    },
    {
      "type": "text",
      "from": {
        "data": "filmLeaves"
      },
      "interactive": false,
      "encode": {
        "update": {
          "x": {
            "signal": "datum.x0+6"
          },
          "y": {
            "signal": "datum.y0+5"
          },
          "text": {
            "field": "label_lines"
          },
          "baseline": {
            "value": "top"
          },
          "font": {
            "value": "Arial"
          },
          "fontWeight": {
            "value": "bold"
          },
          "fontSize": {
            "field": "fit_font"
          },
          "fill": {
            "signal": "datum.gross >= 180000000 ? 'white' : '#173b55'"
          },
          "lineHeight": {
            "signal": "datum.fit_font*1.15"
          }
        }
      },
      "name": "filmNameLabels"
    },
    {
      "type": "text",
      "from": {
        "data": "filmLeaves"
      },
      "interactive": false,
      "encode": {
        "update": {
          "x": {
            "signal": "datum.x0+6"
          },
          "y": {
            "signal": "datum.y0+7+length(datum.label_lines)*datum.fit_font*1.15"
          },
          "text": {
            "signal": "format(datum.gross/1000000,'$.1f')+'M'"
          },
          "baseline": {
            "value": "top"
          },
          "font": {
            "value": "Arial"
          },
          "fontSize": {
            "signal": "min(10,max(3,(datum.x1-datum.x0-10)/7))"
          },
          "fill": {
            "signal": "datum.gross >= 180000000 ? 'white' : '#173b55'"
          }
        }
      },
      "name": "filmGrossLabels"
    },
    {
      "name": "genreCountLabels",
      "type": "text",
      "from": {
        "data": "genreGroups"
      },
      "interactive": false,
      "encode": {
        "update": {
          "x": {
            "signal": "datum.x0+7"
          },
          "y": {
            "signal": "datum.y0+24"
          },
          "text": {
            "signal": "datum.film_count+' films'"
          },
          "font": {
            "value": "Arial"
          },
          "fontSize": {
            "signal": "min(9,max(4,(datum.x1-datum.x0-12)/7))"
          },
          "fill": {
            "value": "#173b55"
          },
          "baseline": {
            "value": "middle"
          }
        }
      }
    }
  ],
  "legends": [
    {
      "fill": "grossTierLegend",
      "title": "Worldwide gross",
      "orient": "right",
      "direction": "vertical",
      "symbolType": "square",
      "symbolSize": 150,
      "titleFont": "Arial",
      "titleFontSize": 12,
      "titleColor": "#173b55",
      "labelFont": "Arial",
      "labelFontSize": 11,
      "labelColor": "#324d60",
      "labelLimit": 165,
      "rowPadding": 12,
      "offset": 14
    }
  ]
}
