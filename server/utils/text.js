// Makes user input safe to use inside a RegExp (so "C++" doesn't break a search)
export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
