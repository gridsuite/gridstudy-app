# How to add plugins

Add a plugin component or object in the corresponding group represented as folders.

plugins/myPluginGroup/myNewPlugin.js

```js
const MyNewPlugin = {
    ...
};
export default MyNewPlugin;
```

Edit index.js to export your new plugin in the corresponding group

```js
import MyNewPlugin from './myPluginGroup/myNewPlugin';
...
export const MyPluginGroupPlugins = [
    {
        id: 'MyNewPlugin', // must be unique in a group
        Component: MyNewPlugin,
    },
];
```

Defining and adding a group a group of plugins needs to add some code in the target component

```js
// Plugins
import { MyPluginGroupPlugins } from '../plugins';
//...

const MyPluggableComponent = () => {
    //...
    return (
        <>
            {/*...*/}
            {MyPluginGroupPlugins.map((plugin) => {
                return <plugin.Component key={plugin.id} />;
            })}
            {/*...*/}
        </>
    );
};
```

# How to overwrite translations

Add your private translations to the following directory to complete or overwrite existing translations

-   src/plugins/translations

import your file and export an object messages_plugins for the translation in french or english
in src/plugins/translations/index.js

```diff
import messages_plugins_fr from '../translations/fr.json';
+import my_plugins_fr from '../translations/my_plugins_fr.json';

import messages_plugins_en from '../translations/en.json';
+import my_plugins_en from '../translations/my_plugins_en.json';

const messages_plugins = {
    fr: {
        ...messages_plugins_fr,
+       ...my_plugins_fr,
    },
    en: {
        ...messages_plugins_en,
+       ...my_plugins_en,
    },
};

export default messages_plugins;

```
