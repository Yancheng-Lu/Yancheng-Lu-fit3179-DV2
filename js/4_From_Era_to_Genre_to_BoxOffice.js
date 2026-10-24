{
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "width": 1110,
  "height": 575,
  "padding": {
    "top": 10,
    "left": 8,
    "right": 8,
    "bottom": 10
  },
  "background": "white",
  "signals": [
    {
      "name": "hoverGenre",
      "value": null,
      "on": [
        {
          "events": "@eraGenreFlows:mouseover",
          "update": "datum.genre_group"
        },
        {
          "events": "@eraGenreFlows:mouseout",
          "update": "null"
        },
        {
          "events": "@genreBoxFlows:mouseover",
          "update": "datum.genre_group"
        },
        {
          "events": "@genreBoxFlows:mouseout",
          "update": "null"
        },
        {
          "events": "@genreNodes:mouseover",
          "update": "datum.genre_group"
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
          "gross": "number",
          "is_australian": "number"
        }
      },
      "transform": [
        {
          "type": "filter",
          "expr": "datum.is_australian === 1 && datum.year >= 1980 && datum.year <= 2025 && datum.gross > 0"
        },
        {
          "type": "formula",
          "as": "decade",
          "expr": "datum.year < 1990 ? '1980s' : datum.year < 2000 ? '1990s' : datum.year < 2010 ? '2000s' : datum.year < 2020 ? '2010s' : '2020s'"
        },
        {
          "type": "formula",
          "as": "genre_group",
          "expr": "indexof(['Action','Adventure','Comedy','Drama','Horror'], datum.genre) >= 0 ? datum.genre : 'Other'"
        },
        {
          "type": "formula",
          "as": "box_office_tier",
          "expr": "datum.gross < 10000000 ? 'Under $10M' : datum.gross < 50000000 ? '$10–50M' : datum.gross < 150000000 ? '$50–150M' : '$150M+'"
        }
      ]
    },
    {
      "name": "nodes_era",
      "source": "movies",
      "transform": [
        {
          "type": "aggregate",
          "groupby": [
            "decade"
          ],
          "ops": [
            "count"
          ],
          "fields": [
            "name"
          ],
          "as": [
            "value"
          ]
        },
        {
          "type": "formula",
          "as": "order",
          "expr": "datum.decade === '1980s' ? 0 : datum.decade === '1990s' ? 1 : datum.decade === '2000s' ? 2 : datum.decade === '2010s' ? 3 : 4"
        },
        {
          "type": "stack",
          "field": "value",
          "sort": {
            "field": "order",
            "order": "ascending"
          },
          "offset": "normalize",
          "as": [
            "y0",
            "y1"
          ]
        }
      ]
    },
    {
      "name": "nodes_genre",
      "source": "movies",
      "transform": [
        {
          "type": "aggregate",
          "groupby": [
            "genre_group"
          ],
          "ops": [
            "count"
          ],
          "fields": [
            "name"
          ],
          "as": [
            "value"
          ]
        },
        {
          "type": "formula",
          "as": "order",
          "expr": "datum.genre_group === 'Comedy' ? 0 : datum.genre_group === 'Drama' ? 1 : datum.genre_group === 'Adventure' ? 2 : datum.genre_group === 'Horror' ? 3 : datum.genre_group === 'Action' ? 4 : 5"
        },
        {
          "type": "stack",
          "field": "value",
          "sort": {
            "field": "order",
            "order": "ascending"
          },
          "offset": "normalize",
          "as": [
            "y0",
            "y1"
          ]
        }
      ]
    },
    {
      "name": "nodes_box",
      "source": "movies",
      "transform": [
        {
          "type": "aggregate",
          "groupby": [
            "box_office_tier"
          ],
          "ops": [
            "count"
          ],
          "fields": [
            "name"
          ],
          "as": [
            "value"
          ]
        },
        {
          "type": "formula",
          "as": "order",
          "expr": "datum.box_office_tier === 'Under $10M' ? 0 : datum.box_office_tier === '$10–50M' ? 1 : datum.box_office_tier === '$50–150M' ? 2 : 3"
        },
        {
          "type": "stack",
          "field": "value",
          "sort": {
            "field": "order",
            "order": "ascending"
          },
          "offset": "normalize",
          "as": [
            "y0",
            "y1"
          ]
        }
      ]
    },
    {
      "name": "links_era_genre_base",
      "source": "movies",
      "transform": [
        {
          "type": "aggregate",
          "groupby": [
            "decade",
            "genre_group"
          ],
          "ops": [
            "count"
          ],
          "fields": [
            "name"
          ],
          "as": [
            "value"
          ]
        },
        {
          "type": "formula",
          "as": "decade_order",
          "expr": "datum.decade === '1980s' ? 0 : datum.decade === '1990s' ? 1 : datum.decade === '2000s' ? 2 : datum.decade === '2010s' ? 3 : 4"
        },
        {
          "type": "formula",
          "as": "genre_order",
          "expr": "datum.genre_group === 'Comedy' ? 0 : datum.genre_group === 'Drama' ? 1 : datum.genre_group === 'Adventure' ? 2 : datum.genre_group === 'Horror' ? 3 : datum.genre_group === 'Action' ? 4 : 5"
        },
        {
          "type": "formula",
          "as": "link_key",
          "expr": "datum.decade + '|' + datum.genre_group"
        }
      ]
    },
    {
      "name": "links_era_genre_target",
      "source": "links_era_genre_base",
      "transform": [
        {
          "type": "stack",
          "groupby": [
            "genre_group"
          ],
          "field": "value",
          "sort": {
            "field": "decade_order",
            "order": "ascending"
          },
          "offset": "normalize",
          "as": [
            "local0",
            "local1"
          ]
        },
        {
          "type": "lookup",
          "from": "nodes_genre",
          "key": "genre_group",
          "fields": [
            "genre_group"
          ],
          "as": [
            "node"
          ]
        },
        {
          "type": "formula",
          "as": "target_y0",
          "expr": "datum.node.y0 + datum.local0 * (datum.node.y1 - datum.node.y0)"
        },
        {
          "type": "formula",
          "as": "target_y1",
          "expr": "datum.node.y0 + datum.local1 * (datum.node.y1 - datum.node.y0)"
        }
      ]
    },
    {
      "name": "links_era_genre",
      "source": "links_era_genre_base",
      "transform": [
        {
          "type": "stack",
          "groupby": [
            "decade"
          ],
          "field": "value",
          "sort": {
            "field": "genre_order",
            "order": "ascending"
          },
          "offset": "normalize",
          "as": [
            "local0",
            "local1"
          ]
        },
        {
          "type": "lookup",
          "from": "nodes_era",
          "key": "decade",
          "fields": [
            "decade"
          ],
          "as": [
            "node"
          ]
        },
        {
          "type": "lookup",
          "from": "links_era_genre_target",
          "key": "link_key",
          "fields": [
            "link_key"
          ],
          "as": [
            "target"
          ]
        },
        {
          "type": "formula",
          "as": "source_y0",
          "expr": "datum.node.y0 + datum.local0 * (datum.node.y1 - datum.node.y0)"
        },
        {
          "type": "formula",
          "as": "source_y1",
          "expr": "datum.node.y0 + datum.local1 * (datum.node.y1 - datum.node.y0)"
        }
      ]
    },
    {
      "name": "links_genre_box_base",
      "source": "movies",
      "transform": [
        {
          "type": "aggregate",
          "groupby": [
            "genre_group",
            "box_office_tier"
          ],
          "ops": [
            "count"
          ],
          "fields": [
            "name"
          ],
          "as": [
            "value"
          ]
        },
        {
          "type": "formula",
          "as": "genre_order",
          "expr": "datum.genre_group === 'Comedy' ? 0 : datum.genre_group === 'Drama' ? 1 : datum.genre_group === 'Adventure' ? 2 : datum.genre_group === 'Horror' ? 3 : datum.genre_group === 'Action' ? 4 : 5"
        },
        {
          "type": "formula",
          "as": "box_order",
          "expr": "datum.box_office_tier === 'Under $10M' ? 0 : datum.box_office_tier === '$10–50M' ? 1 : datum.box_office_tier === '$50–150M' ? 2 : 3"
        },
        {
          "type": "formula",
          "as": "link_key",
          "expr": "datum.genre_group + '|' + datum.box_office_tier"
        }
      ]
    },
    {
      "name": "links_genre_box_target",
      "source": "links_genre_box_base",
      "transform": [
        {
          "type": "stack",
          "groupby": [
            "box_office_tier"
          ],
          "field": "value",
          "sort": {
            "field": "genre_order",
            "order": "ascending"
          },
          "offset": "normalize",
          "as": [
            "local0",
            "local1"
          ]
        },
        {
          "type": "lookup",
          "from": "nodes_box",
          "key": "box_office_tier",
          "fields": [
            "box_office_tier"
          ],
          "as": [
            "node"
          ]
        },
        {
          "type": "formula",
          "as": "target_y0",
          "expr": "datum.node.y0 + datum.local0 * (datum.node.y1 - datum.node.y0)"
        },
        {
          "type": "formula",
          "as": "target_y1",
          "expr": "datum.node.y0 + datum.local1 * (datum.node.y1 - datum.node.y0)"
        }
      ]
    },
    {
      "name": "links_genre_box",
      "source": "links_genre_box_base",
      "transform": [
        {
          "type": "stack",
          "groupby": [
            "genre_group"
          ],
          "field": "value",
          "sort": {
            "field": "box_order",
            "order": "ascending"
          },
          "offset": "normalize",
          "as": [
            "local0",
            "local1"
          ]
        },
        {
          "type": "lookup",
          "from": "nodes_genre",
          "key": "genre_group",
          "fields": [
            "genre_group"
          ],
          "as": [
            "node"
          ]
        },
        {
          "type": "lookup",
          "from": "links_genre_box_target",
          "key": "link_key",
          "fields": [
            "link_key"
          ],
          "as": [
            "target"
          ]
        },
        {
          "type": "formula",
          "as": "source_y0",
          "expr": "datum.node.y0 + datum.local0 * (datum.node.y1 - datum.node.y0)"
        },
        {
          "type": "formula",
          "as": "source_y1",
          "expr": "datum.node.y0 + datum.local1 * (datum.node.y1 - datum.node.y0)"
        }
      ]
    }
  ],
  "scales": [
    {
      "name": "y",
      "type": "linear",
      "domain": [
        0,
        1
      ],
      "range": [
        42,
        560
      ]
    },
    {
      "name": "genre_color",
      "type": "ordinal",
      "domain": [
        "Comedy",
        "Drama",
        "Adventure",
        "Horror",
        "Action",
        "Other"
      ],
      "range": [
        "#E07774",
        "#65AAA5",
        "#E7A456",
        "#A98CB5",
        "#456F9D",
        "#92A9BE"
      ]
    }
  ],
  "marks": [
    {
      "name": "eraGenreFlows",
      "type": "path",
      "from": {
        "data": "links_era_genre"
      },
      "encode": {
        "update": {
          "path": {
            "signal": "'M89,' + scale('y', datum.source_y0) + ' C202,' + scale('y', datum.source_y0) + ' 308,' + scale('y', datum.target.target_y0) + ' 420,' + scale('y', datum.target.target_y0) + ' L420,' + scale('y', datum.target.target_y1) + ' C308,' + scale('y', datum.target.target_y1) + ' 202,' + scale('y', datum.source_y1) + ' 89,' + scale('y', datum.source_y1) + ' Z'"
          },
          "fill": {
            "scale": "genre_color",
            "field": "genre_group"
          },
          "fillOpacity": {
            "signal": "hoverGenre === null ? (datum.value >= 3 ? 0.38 : 0.12) : (datum.genre_group === hoverGenre ? 0.80 : 0.025)"
          },
          "cursor": {
            "value": "pointer"
          },
          "tooltip": {
            "signal": "{'Era': datum.decade, 'Genre': datum.genre_group, 'Films': datum.value}"
          }
        },
        "hover": {
          "fillOpacity": {
            "value": 0.9
          }
        }
      }
    },
    {
      "name": "genreBoxFlows",
      "type": "path",
      "from": {
        "data": "links_genre_box"
      },
      "encode": {
        "update": {
          "path": {
            "signal": "'M607,' + scale('y', datum.source_y0) + ' C739,' + scale('y', datum.source_y0) + ' 854,' + scale('y', datum.target.target_y0) + ' 986,' + scale('y', datum.target.target_y0) + ' L986,' + scale('y', datum.target.target_y1) + ' C854,' + scale('y', datum.target.target_y1) + ' 739,' + scale('y', datum.source_y1) + ' 607,' + scale('y', datum.source_y1) + ' Z'"
          },
          "fill": {
            "scale": "genre_color",
            "field": "genre_group"
          },
          "fillOpacity": {
            "signal": "hoverGenre === null ? (datum.value >= 3 ? 0.38 : 0.12) : (datum.genre_group === hoverGenre ? 0.80 : 0.025)"
          },
          "cursor": {
            "value": "pointer"
          },
          "tooltip": {
            "signal": "{'Genre': datum.genre_group, 'Box-office tier': datum.box_office_tier, 'Films': datum.value}"
          }
        },
        "hover": {
          "fillOpacity": {
            "value": 0.9
          }
        }
      }
    },
    {
      "type": "rect",
      "from": {
        "data": "nodes_era"
      },
      "encode": {
        "update": {
          "x": {
            "value": 65
          },
          "x2": {
            "value": 89
          },
          "y": {
            "signal": "scale('y', datum.y0) + 1"
          },
          "y2": {
            "signal": "scale('y', datum.y1) - 1"
          },
          "fill": {
            "value": "#556579"
          },
          "cornerRadius": {
            "value": 2
          },
          "tooltip": {
            "signal": "datum.decade + ': ' + datum.value + ' films'"
          }
        }
      }
    },
    {
      "name": "genreNodes",
      "type": "rect",
      "from": {
        "data": "nodes_genre"
      },
      "encode": {
        "update": {
          "x": {
            "value": 420
          },
          "x2": {
            "value": 607
          },
          "y": {
            "signal": "scale('y', datum.y0) + 1"
          },
          "y2": {
            "signal": "scale('y', datum.y1) - 1"
          },
          "fill": {
            "scale": "genre_color",
            "field": "genre_group"
          },
          "cornerRadius": {
            "value": 3
          },
          "fillOpacity": {
            "signal": "hoverGenre === null || hoverGenre === datum.genre_group ? 1 : 0.25"
          },
          "cursor": {
            "value": "pointer"
          },
          "tooltip": {
            "signal": "{'Genre': datum.genre_group, 'Films': datum.value}"
          }
        }
      }
    },
    {
      "type": "rect",
      "from": {
        "data": "nodes_box"
      },
      "encode": {
        "update": {
          "x": {
            "value": 986
          },
          "x2": {
            "value": 1014
          },
          "y": {
            "signal": "scale('y', datum.y0) + 1"
          },
          "y2": {
            "signal": "scale('y', datum.y1) - 1"
          },
          "fill": {
            "value": "#556579"
          },
          "cornerRadius": {
            "value": 2
          },
          "tooltip": {
            "signal": "datum.box_office_tier + ': ' + datum.value + ' films'"
          }
        }
      }
    },
    {
      "type": "text",
      "from": {
        "data": "nodes_era"
      },
      "encode": {
        "update": {
          "x": {
            "value": 51
          },
          "y": {
            "signal": "scale('y', (datum.y0 + datum.y1) / 2)"
          },
          "text": {
            "field": "decade"
          },
          "align": {
            "value": "right"
          },
          "baseline": {
            "value": "middle"
          },
          "fontSize": {
            "value": 13
          },
          "fill": {
            "value": "#263649"
          }
        }
      }
    },
    {
      "type": "text",
      "interactive": false,
      "from": {
        "data": "nodes_genre"
      },
      "encode": {
        "update": {
          "x": {
            "value": 514
          },
          "y": {
            "signal": "scale('y', (datum.y0 + datum.y1) / 2)"
          },
          "text": {
            "field": "genre_group"
          },
          "align": {
            "value": "center"
          },
          "baseline": {
            "value": "middle"
          },
          "fontSize": {
            "value": 13
          },
          "fontWeight": {
            "value": "bold"
          },
          "fill": {
            "signal": "datum.genre_group === 'Action' || datum.genre_group === 'Horror' ? '#FFFFFF' : '#163247'"
          }
        }
      }
    },
    {
      "type": "text",
      "from": {
        "data": "nodes_box"
      },
      "encode": {
        "update": {
          "x": {
            "value": 1031
          },
          "y": {
            "signal": "scale('y', (datum.y0 + datum.y1) / 2)"
          },
          "text": {
            "field": "box_office_tier"
          },
          "align": {
            "value": "left"
          },
          "baseline": {
            "value": "middle"
          },
          "fontSize": {
            "value": 13
          },
          "fill": {
            "value": "#263649"
          }
        }
      }
    },
    {
      "type": "text",
      "encode": {
        "update": {
          "x": {
            "value": 78
          },
          "y": {
            "value": 16
          },
          "text": {
            "value": "ERA"
          },
          "align": {
            "value": "center"
          },
          "fontSize": {
            "value": 14
          },
          "fontWeight": {
            "value": "bold"
          },
          "fill": {
            "value": "#6F7E8D"
          }
        }
      }
    },
    {
      "type": "text",
      "encode": {
        "update": {
          "x": {
            "value": 514
          },
          "y": {
            "value": 16
          },
          "text": {
            "value": "GENRE"
          },
          "align": {
            "value": "center"
          },
          "fontSize": {
            "value": 14
          },
          "fontWeight": {
            "value": "bold"
          },
          "fill": {
            "value": "#6F7E8D"
          }
        }
      }
    },
    {
      "type": "text",
      "encode": {
        "update": {
          "x": {
            "value": 1000
          },
          "y": {
            "value": 16
          },
          "text": {
            "value": "BOX OFFICE"
          },
          "align": {
            "value": "center"
          },
          "fontSize": {
            "value": 14
          },
          "fontWeight": {
            "value": "bold"
          },
          "fill": {
            "value": "#6F7E8D"
          }
        }
      }
    }
  ],
  "config": {
    "background": "white"
  }
}
