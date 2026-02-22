// Author name → homepage URL mapping
// Keys are lowercase for case-insensitive matching
export const authorLinks: Record<string, string> = {
  'litian gong': 'https://gonglitian.github.io/',
  'jiachen li': 'https://jiachenli94.github.io/',
  'erdem bıyık': 'https://ebiyik.github.io/',
  'zhan ling': 'https://lz1oceani.github.io/',
  'yuchen zhou': 'https://www.yuchenzhou.org/',
  'hao su': 'https://cseweb.ucsd.edu/~haosu/',
  'amin banayeeanzade': 'https://aminbana.github.io/',
  'zhaoyang li': 'https://zhaoyangli-1.github.io/',
  'fatemeh bahrani': 'https://nfbahrani.github.io/',
  'yutai zhou': 'https://github.com/yutaizhou',
};

export function getAuthorUrl(name: string): string | undefined {
  return authorLinks[name.toLowerCase()];
}
