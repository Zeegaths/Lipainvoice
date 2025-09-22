import QRCode from 'qrcode';

// Generate Bitcoin payment QR code data
export const generateBitcoinPaymentQR = (address: string, amount: number, label?: string, message?: string): string => {
    let uri = `bitcoin:${address}?amount=${amount}`;

    if (label) {
        uri += `&label=${encodeURIComponent(label)}`;
    }

    if (message) {
        uri += `&message=${encodeURIComponent(message)}`;
    }

    return uri;
};

// Generate invoice sharing QR code data
export const generateInvoiceQR = (invoiceId: bigint): string => {
    const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'https://mpigd-gqaaa-aaaaj-qnsoq-cai.icp0.io';
    return `${baseUrl}/?invoice=${invoiceId}`;
};

// Generate QR code as data URL (base64)
export const generateQRCodeDataURL = async (data: string, options?: any): Promise<string> => {
    try {
        const defaultOptions = {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M' as const
        };

        const qrOptions = { ...defaultOptions, ...options };
        return (QRCode.toDataURL(data, qrOptions) as unknown) as Promise<string>;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
};

// Generate QR code as buffer (for file download)
export const generateQRCodeBuffer = async (data: string, options?: any): Promise<Buffer> => {
    try {
        const defaultOptions = {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M' as const
        };

        const qrOptions = { ...defaultOptions, ...options };
        return (QRCode.toBuffer(data, qrOptions) as unknown) as Promise<Buffer>;
    } catch (error) {
        console.error('Error generating QR code buffer:', error);
        throw new Error('Failed to generate QR code buffer');
    }
};

// Download QR code as image file
export const downloadQRCode = async (data: string, filename: string = 'qrcode.png', options?: any): Promise<void> => {
    try {
        const buffer = await generateQRCodeBuffer(data, options);
        const blob = new Blob([new Uint8Array(buffer)], { type: 'image/png' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading QR code:', error);
        throw new Error('Failed to download QR code');
    }
};

// Copy text to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        // Fallback for older browsers
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (fallbackError) {
            console.error('Fallback copy failed:', fallbackError);
            return false;
        }
    }
};

// Share data using Web Share API (if supported)
export const shareContent = async (data: {
    title?: string;
    text?: string;
    url?: string;
}): Promise<boolean> => {
    if (navigator.share) {
        try {
            await navigator.share(data);
            return true;
        } catch (error) {
            console.error('Error sharing content:', error);
            return false;
        }
    }
    return false;
};

// Generate shareable invoice data
export const generateInvoiceShareData = (invoiceId: bigint, clientName: string, amount: number, currency: string = 'BTC') => {
    const invoiceUrl = generateInvoiceQR(invoiceId);
    const shareText = `Invoice from ${clientName}: ${amount} ${currency} - ${invoiceUrl}`;

    return {
        title: `Invoice #${invoiceId.toString()}`,
        text: shareText,
        url: invoiceUrl
    };
};
