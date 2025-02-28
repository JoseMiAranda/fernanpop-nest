export const getMimeType = (hex: string): string | undefined => {
    switch (hex) {
        case '89504E47':
            return 'image/png';
        case 'FFD8FFE0':
        case 'FFD8FFE1':
        case 'FFD8FFE2':
        case 'FFD8FFDB':
            return 'image/jpeg';
        default:
            return undefined;
    }
};