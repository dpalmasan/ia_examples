# Blog Inteligencia Artificial

## Introducción

En este repositorio, comparto conocimiento de diferentes áreas de la inteligencia artificial. Lo hago en español y con algunos ejemplos de implementaciones, principalmente utilizando `typescript` como lenguaje principal. ¿Por qué no lo hago en otros lenguajes como `python`, `Julia` o `R`? (que son los que generalmente se utilizan en Ciencia de Datos y que comúnmente lo asocian con inteligencia artificial). Tengo dos razones principales para hacer esto:

1. Tengo bastante experiencia en `python` tanto como desarrollador y en proyectos de investigación, y no quiero sólo cerrarme a este lenguaje. Por lo que utilizar `TypeScript` me saca un poco de la rutina.
2. Porque espero que el público objetivo sea un mundo de desarrolladores, no sólo personas que hayan tocado `python` alguna vez. Y creo que muchos desarrolladores habrán tocado alguna vez `javascript`.

## Artículos de Linkedin relacionados

* [Inteligencia Artificial conceptos básicos, un poco de opiniones y aprendiendo TypeScript](https://www.linkedin.com/pulse/inteligencia-artificial-conceptos-b%C3%A1sicos-un-poco-de-y-palma-s%C3%A1nchez/)


## Conceptos de Inteligencia Artificial

### Problema de Búsqueda desde estado inicial a estado objetivo

En los siguientes scripts de la carpeta `src`:

* `SearchProblem.ts`
* `Utils.ts`
* `PuzzleProblem.ts`

Se ejemplifica de forma general un problema de búsqueda a partir de estados, el que consiste en encontrar la secuencia de acciones que nos lleva al camino más corto (o con menor costo, dada una métrica de costo) desde un estado inicial a un estado objetivo. Se tiene una implementación del clásico algortimo `A*`, y un problema típico de ejemplo, como lo es resolver el puzzle de las 8 piezas. También pueden ver un [demo](https://dpalmasan.github.io/blog-ia-dpalma/) hecho en `ReactJs`, utilizando estas implementaciones.

### Utilizando Lógica Proposicional para implementar Agente "Inteligente"

En los siguientes scripts:

* `PropositionalLogic.ts`
* `KB.ts`
* `WumpusWorld.ts`

Se implementa un agente "inteligente" capaz de razonar utilizando información encapsulada en lógica proposicional. Como ejemplo, se implementa el clásico [Mundo del Wumpos](https://en.wikipedia.org/wiki/Vaumpus_world).



