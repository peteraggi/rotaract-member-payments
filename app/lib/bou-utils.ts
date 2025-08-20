
const EMONEY_ISSUER_CODE = "618";// e-Money issuer code for scintl
const MESSAGE_CATEGORY = "01";

export function generateReferenceNumber(transactionId: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${EMONEY_ISSUER_CODE}${MESSAGE_CATEGORY}${year}${month}${day}${transactionId.padStart(9, '0')}`;
}

export function generateSystemUniqueId(): string {
    return crypto.randomUUID();
}

export function getCurrentTimestamp(): number {
    return Date.now();
}

export function getAccountCategoryCode(): string {
    return "801"; // Example code, adjust based on Appendix V
}

export function mapGenderToCode(gender: string | undefined): number {
    if (!gender) return 3; // Unknown

    switch (gender.toLowerCase()) {
        case 'male': return 0;
        case 'female': return 1;
        default: return 3;
    }
}

export function validateNIN(nin: string): boolean {
  const ninRegex = /^(CM|CF)[A-Z0-9]{11,14}$/i;
    if (!ninRegex.test(nin)) return false;
  
  return true;
}

export function safeBigIntToJSON(data: any) {
  return JSON.parse(JSON.stringify(data, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export const ADMINS = [
  {
    email: 'markkimbz@gmail.com',
    name: 'Mark Kimbugwe',
    phone: '0703634786',
    role: 'requester'
  },
  {
    email: 'alebarkm@gmail.com',
    name: 'Alebar Kanyonza',
    phone: '+256778107764',
    role: 'approver'
  }
];