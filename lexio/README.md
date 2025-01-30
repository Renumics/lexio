# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

## Python package

The Python package can be automatically generated from the frontend library. It contains API types for the lexio frontend library. Follow these steps to release the package:

1. Update the frontend library with the latest changes.
2. If needed, update the [types-to-include.json](scripts%2Ftypes-to-include.json) file to modify the exported types.
3. Run `npm run build-python-package` to generate the Python package, run tests and build the package in the `python/lexio` folder.
4. Commit the changes and push them to the repository.

> Note: We use the version from the frontend library's `package.json` file as the version for the Python package.

Since we are creating the `lexio` python package automatically we run several test with 'pytest' to ensure the package is working as expected. The tests are located in the [tests](tests)[tests](..%2Fpython%2Flexio%2Ftests) folder.
If you add new types which are exported to the python package, you should also add tests for them.
