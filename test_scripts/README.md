# Test Scripts

Aquí pongo ejemplos de uso de los scripts, los cuales se pueden correr vía `npx ts-node`. Por ahora, para que funcione, se debe desactivar el atributo `module` de `tsconfig.json`.

## `TestWumpus.ts`

Este script es para jugar con diferentes instancias del `Wumpus World`. Si quieres probar la instancia del libro de IA de Peter Norvig, puedes hacerlo modificando el código como sigue: `let wumpusWorld = generateWumpusWorld(true)`.

## `GenerateSentencesNgram.ts`

Este script genero oraciones utilizando un modelo de NGramas. El corpus que utilicé en el artículo no lo subí al repo, pero puedes armar un CORPUS personalizado y probar.