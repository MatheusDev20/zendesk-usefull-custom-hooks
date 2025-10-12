function convertPathParams(path, params) {
    return Object.entries(params).reduce((acc, [key, value]) => acc.replace(`{${key}}`, value), path);
}
function convertQueryParams(path, params) {
    return (`${path}?` +
        Object.entries(params)
            .map(([key, value]) => `${key}=${value}`)
            .join('&'));
}
//# sourceMappingURL=utils.js.map