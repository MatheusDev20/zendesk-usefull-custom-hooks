export function convertPathParams(path: string, params: object): string {
    return Object.entries(params).reduce(
      (acc, [key, value]) => acc.replace(`{${key}}`, value),
      path
    );
  }

export function convertQueryParams(path: string, params: object): string {
    return (
      `${path}?` +
      Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')
    );
  }