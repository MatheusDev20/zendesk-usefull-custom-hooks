"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useInternalZafClient = exports.CustomObjectsProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const CustomObjectsContext = (0, react_1.createContext)(null);
const CustomObjectsProvider = ({ client, children, }) => {
    return ((0, jsx_runtime_1.jsx)(CustomObjectsContext.Provider, { value: client, children: children }));
};
exports.CustomObjectsProvider = CustomObjectsProvider;
const useInternalZafClient = () => {
    const ctx = (0, react_1.useContext)(CustomObjectsContext);
    if (!ctx)
        throw new Error('useInternalZafClient must be used within CustomObjectsProvider');
    return ctx;
};
exports.useInternalZafClient = useInternalZafClient;
//# sourceMappingURL=context.js.map