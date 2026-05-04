# Analyse perf — table des modifications réseau (toggle Switch)

## Résumé

Après les premiers correctifs (étapes 1, 2 et stabilisation de `handleCellClick`), le `Switch` répond visuellement de manière fluide. Reste un effet de "rechargement complet" de la table à chaque clic, qui dure 100-500 ms selon la taille de la liste.

## Cause racine

À chaque toggle, deux mises à jour de la liste s'enchaînent :

1. **Optimistic update local** dans `SwitchCell.toggleModificationActive` :
   ```ts
   setModifications((oldModifications) =>
       updateModificationFieldInTree(modificationUuid, { activated: checked }, oldModifications)
   );
   ```
   `updateModificationFieldInTree` (`commons-ui/.../utils.ts:117`) ne crée des objets neufs que sur le chemin du nœud touché → ciblé, peu coûteux.

2. **Refetch global déclenché par notification serveur** :
   - `setModificationMetadata` côté client envoie un `PUT` au serveur.
   - Le serveur émet une notification WS `MODIFICATIONS_UPDATE_FINISHED`.
   - `handleEvent` (`network-modification-node-editor.tsx:836-846`) appelle `dofetchNetworkModifications()` ET `dofetchExcludedNetworkModifications()`.
   - `dofetchNetworkModifications` (`network-modification-node-editor.tsx:722`) re-fetche **toute la liste** et fait `setModifications(liveModifications)`.
   - L'effet `useEffect([modifications])` dans `NetworkModificationsTable` (`commons-ui/.../network-modifications-table.tsx:98-116`) appelle :
     ```ts
     formatToComposedModification(modifications) // commons-ui/.../utils.ts:15
     // -> modifications.map(m => ({ ...m, subModifications: [] }))
     ```
     Cette fonction recrée **un nouvel objet pour chaque modification de la liste**.
   - `mergeSubModificationsIntoTree` réemballe ensuite tous les nœuds qui ont des sous-modifications déjà chargées.
   - Résultat : tous les `row.original` ont des références neuves → react-table régénère son `coreRowModel` → **toutes les lignes virtualisées re-render**.

## Impact mesuré (qualitatif)

- Optimistic update : 1 re-render ciblé sur la ligne touchée.
- Refetch + reformat : 1 re-render de toutes les lignes visibles + reconstruction des modèles react-table.
- Total : la table se "fige" visuellement pendant le reformat (proportionnel au nombre total de modifications, pas seulement aux lignes visibles, car `formatToComposedModification` itère sur tout).

## Pistes de correction (par impact décroissant)

### A. Supprimer l'optimistic update du `SwitchCell` (retenu)

L'idée : ne garder qu'**une seule source de vérité**, la notification serveur. La mise à jour optimistic locale est supprimée ; le `Switch` reste en `disabled` pendant l'aller-retour HTTP + la notif, puis se met à jour quand le refetch arrive.

**Avantages** :
- Élimine la double mise à jour (1 re-render au lieu de 2).
- Élimine aussi la branche de rollback en cas d'erreur (le serveur n'aura simplement pas changé l'état).
- Simplifie le code.

**Inconvénient** :
- Délai visible entre le clic et le changement d'état du `Switch` (durée du PUT + propagation WS, typiquement 100-500 ms). Acceptable selon le contexte.

**Modifications nécessaires** dans `gridstudy-app/.../renderers/switch-cell.tsx` :
- Supprimer le bloc `setModifications((oldModifications) => updateModificationFieldInTree(...))` (mise à jour optimistic).
- Supprimer le `.catch` qui faisait le rollback.
- Garder `setIsLoading(true/false)` pour griser le `Switch` pendant l'attente serveur.
- Garder le `snackWithFallback` en cas d'erreur.
- À terme, on peut aussi retirer la prop `setModifications` du `SwitchCell` si plus aucun cell-renderer ne l'utilise.

### B. Refetch ciblé au lieu du refetch total (à creuser plus tard)

Si l'API permet de re-fetcher une seule modification par uuid, remplacer `dofetchNetworkModifications` (sur ce chemin) par un fetch ciblé du ou des uuids présents dans `eventData.headers.modifications`. Le merge se ferait via `updateModificationFieldInTree`. Évite la reconstruction de toute la liste.

### C. Préserver les références dans `formatToComposedModification`

Modifier la fonction pour réutiliser l'objet précédent quand les champs n'ont pas changé. Couplé à un `React.memo(ModificationRow)`, seules les lignes effectivement modifiées re-rendraient — y compris après un refetch venant d'un autre utilisateur/onglet.

```ts
export const formatToComposedModification = (
    modifications: NetworkModificationMetadata[],
    prev?: ComposedModificationMetadata[]
): ComposedModificationMetadata[] => {
    const prevByUuid = prev ? new Map(prev.map((m) => [m.uuid, m])) : null;
    return modifications.map((m) => {
        const prevMod = prevByUuid?.get(m.uuid);
        if (prevMod && shallowEqualBaseFields(prevMod, m)) return prevMod;
        return { ...m, subModifications: prevMod?.subModifications ?? [] };
    });
};
```

### D. Debouncer/grouper les refetches

Si plusieurs toggles s'enchaînent rapidement, plusieurs notifs arrivent → plusieurs refetches en cascade. Un `debounce` propre (via `useMemo`) sur `dofetchNetworkModifications` (~200 ms) évite de re-fetcher plusieurs fois.

### E. Conditionner `dofetchExcludedNetworkModifications`

Ligne 844 : à chaque notif `MODIFICATIONS_UPDATE_FINISHED`, on re-fetche aussi les exclusions. À voir si pertinent dans tous les cas — sinon ne le faire que pour les events qui modifient les exclusions.

## Décision

On part sur **A** : supprimer l'optimistic update du `SwitchCell`. La source de vérité unique est la notification serveur. Les pistes C et D restent disponibles si la perception du délai après refetch reste gênante.
